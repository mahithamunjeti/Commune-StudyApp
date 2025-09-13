const express = require("express");
const roomApi = express.Router();
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// Middleware to inject collections
roomApi.use((req, res, next) => {
  const db = req.app.get("db");
  req.roomCollection = db.collection("rooms");
  req.usersCollection = db.collection("users");
  next();
});

roomApi.use(verifyToken);

// Create Room
roomApi.post("/create-room", async (req, res) => {
  const { roomName, roomDesc, selectedFriends } = req.body;
  const creatorId = req.user._id;

  try {
    const newRoom = {
      name: roomName,
      description: roomDesc,
      creator: new ObjectId(creatorId),
      members: [new ObjectId(creatorId), ...selectedFriends.map(id => new ObjectId(id))],
      createdAt: new Date(),
      messages: []
    };

    await req.roomCollection.insertOne(newRoom);
    res.status(201).send({ message: "Room created successfully!" });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).send({ message: "Error creating room" });
  }
});

// Get Rooms where the user is a member
roomApi.get("/my-rooms", async (req, res) => {
  const userId = new ObjectId(req.user._id);

  try {
    const rooms = await req.roomCollection.find({ members: userId }).toArray();

    const detailedRooms = await Promise.all(
      rooms.map(async (room) => {
        const creator = await req.usersCollection.findOne({ _id: room.creator });
        const members = await req.usersCollection.find({ _id: { $in: room.members } }).toArray();

        return {
          _id: room._id,
          roomName: room.name,
          roomDesc: room.description,
          createdAt: room.createdAt,
          createdBy: {
            username: creator?.username || "Unknown",
            email: creator?.email || "",
          },
          members: members.map((m) => ({
            username: m.username,
            email: m.email,
          })),
        };
      })
    );

    res.status(200).send({ success: true, payload: detailedRooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).send({ message: "Error fetching rooms" });
  }
});

// Delete a goal from a room
roomApi.delete("/delete-goal/:roomId/:goalId", async (req, res) => {
  const roomId = new ObjectId(req.params.roomId);
  const goalId = new ObjectId(req.params.goalId);

  try {
    const result = await req.roomCollection.updateOne(
      { _id: roomId },
      { $pull: { goals: { _id: goalId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "Goal not found or already deleted" });
    }

    res.status(200).send({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).send({ message: "Failed to delete goal" });
  }
});


roomApi.delete("/delete-room/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const result = await req.roomCollection.deleteOne({
      _id: new ObjectId(roomId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Room not found or already deleted" });
    }

    res.status(200).send({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).send({ message: "Failed to delete room" });
  }
});


// Toggle room goal completion (mark/unmark)
roomApi.patch("/complete-goal/:roomId/:goalId", async (req, res) => {
  const userId = new ObjectId(req.user._id);
  const { roomId, goalId } = req.params;

  try {
    const room = await req.roomCollection.findOne({ _id: new ObjectId(roomId) });
    if (!room) return res.status(404).send({ message: "Room not found" });

    const goalIndex = room.goals.findIndex(g => g._id.toString() === goalId);
    if (goalIndex === -1) return res.status(404).send({ message: "Goal not found in room" });

    const goal = room.goals[goalIndex];
    goal.completedBy = goal.completedBy.map(id => id.toString());
    const userIdStr = userId.toString();

    // Check if user has already completed this goal
    const userHasCompleted = goal.completedBy.some(id => id === userIdStr);
    
    console.log(`Goal completion toggle: goalId=${goalId}, userId=${userIdStr}, userHasCompleted=${userHasCompleted}`);
    console.log(`Current completedBy:`, goal.completedBy);
    console.log(`Room members:`, room.members.map(m => m.toString()));
    
    if (userHasCompleted) {
      // User wants to undo completion
      goal.completedBy = goal.completedBy.filter(id => id !== userIdStr);
      
      // Check if all members had completed before this undo
      const wasAllCompleted = room.members.every(memberId =>
        goal.completedBy.some(id => id === memberId.toString())
      );
      
      console.log(`Undoing completion. Was all completed before undo: ${wasAllCompleted}`);
      
      // If all members had completed before this undo, decrease group streak
      if (wasAllCompleted) {
        goal.groupStreak = Math.max(0, goal.groupStreak - 1);
        goal.completed = false;
        console.log(`Decreased group streak to: ${goal.groupStreak}`);
      }
    } else {
      // User wants to mark as complete
      goal.completedBy.push(userId);

      // Check if all members have now completed
      const allCompleted = room.members.every(memberId =>
        goal.completedBy.some(id => id === memberId.toString())
      );

      console.log(`Marking complete. All members now completed: ${allCompleted}`);
      console.log(`Updated completedBy:`, goal.completedBy);

      // Increase streak if all members complete
      if (allCompleted) {
        goal.groupStreak += 1;
        goal.completed = true;
        console.log(`Increased group streak to: ${goal.groupStreak}`);
      }
    }

    const updateQuery = {};
    updateQuery[`goals.${goalIndex}`] = goal;

    await req.roomCollection.updateOne(
      { _id: new ObjectId(roomId) },
      { $set: updateQuery }
    );

    res.status(200).send({
      message: userHasCompleted ? "Goal completion undone" : "Goal completion updated",
      goal,
      userCompleted: !userHasCompleted, // New completion state
    });

  } catch (err) {
    console.error("Error toggling goal completion:", err);
    res.status(500).send({ message: "Error toggling goal completion" });
  }
});

// Add a goal to a room
roomApi.post("/add-goal/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { title, description, deadline } = req.body;
  const createdBy = new ObjectId(req.user._id);

  try {
    const goal = {
      _id: new ObjectId(),
      title,
      description,
      deadline: new Date(deadline),
      createdBy,
      createdAt: new Date(),
      completed: false,
      completedBy: [],
      groupStreak: 0
    };

    const updateResult = await req.roomCollection.updateOne(
      { _id: new ObjectId(roomId), members: createdBy },
      { $push: { goals: goal } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(403).send({ message: "You are not a member of this room or room not found." });
    }

    res.status(201).send({ message: "Goal added to room", goal });
  } catch (err) {
    console.error("Error adding goal:", err);
    res.status(500).send({ message: "Failed to add goal to room" });
  }
});

// Get full room details including goals
roomApi.get("/room-details/:roomId", async (req, res) => {
  const userId = new ObjectId(req.user._id);
  const roomId = new ObjectId(req.params.roomId);

  try {
    const room = await req.roomCollection.findOne({ _id: roomId, members: userId });
    if (!room) {
      return res.status(403).send({ message: "Not authorized or room not found" });
    }

    const creator = await req.usersCollection.findOne({ _id: room.creator });
    const members = await req.usersCollection.find({ _id: { $in: room.members } }).toArray();

    res.send({
      roomId: room._id,
      roomName: room.name,
      roomDesc: room.description,
      createdAt: room.createdAt,
      createdBy: {
        username: creator?.username || "Unknown",
        email: creator?.email || "",
      },
      members: members.map(m => ({
        _id: m._id,
        username: m.username,
        email: m.email
      })),
      goals: room.goals || []
    });
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).send({ message: "Failed to fetch room details" });
  }
});

// Get only the goals of a specific room
roomApi.get("/room-goals/:roomId", async (req, res) => {
  const userId = new ObjectId(req.user._id);
  const roomId = new ObjectId(req.params.roomId);

  try {
    const room = await req.roomCollection.findOne(
      { _id: roomId, members: userId },
      { projection: { goals: 1 } }
    );

    if (!room) {
      return res.status(403).send({ message: "Not authorized or room not found" });
    }

    res.send({ success: true, goals: room.goals || [] });
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).send({ message: "Failed to fetch goals" });
  }
});

// Get messages of a room
roomApi.get("/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await req.roomCollection.findOne({ _id: new ObjectId(roomId) });
    if (!room) return res.status(404).send({ message: "Room not found" });

    res.send(room.messages || []);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send({ message: "Failed to fetch messages" });
  }
});

// Post a message to a room
roomApi.post("/:roomId/message", async (req, res) => {
  const { roomId } = req.params;
  const { sender, text, timestamp } = req.body;

  if (!sender || !text || !timestamp) {
    return res.status(400).send({ message: "Missing required fields" });
  }

  try {
    await req.roomCollection.updateOne(
      { _id: new ObjectId(roomId) },
      { $push: { messages: { sender, text, timestamp } } }
    );

    res.send({ message: "Message sent" });
  } catch (err) {
    console.error("Error posting message:", err);
    res.status(500).send({ message: "Failed to post message" });
  }
});

roomApi.post("/room/:roomId/chat", async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  const senderId = new ObjectId(req.user._id);

  try {
    const chatEntry = {
      _id: new ObjectId(),
      message,
      sender: senderId,
      timestamp: new Date(),
    };

    const result = await req.roomCollection.updateOne(
      { _id: new ObjectId(roomId), members: senderId },
      { $push: { messages: chatEntry } }
    );

    if (result.modifiedCount === 0) {
      return res.status(403).send({ message: "Unauthorized or room not found" });
    }

    // Return the created message with sender details
    const sender = await req.usersCollection.findOne({ _id: senderId });
    
    res.status(201).send({ 
      success: true, 
      message: {
        ...chatEntry,
        senderName: sender?.username || "Unknown"
      } 
    });
  } catch (err) {
    console.error("Error sending chat:", err);
    res.status(500).send({ message: "Failed to send chat" });
  }
});

roomApi.get("/room/:roomId/chat", async (req, res) => {
  const { roomId } = req.params;
  const userId = new ObjectId(req.user._id);
  const { since } = req.query; // Optional query param for checking only new messages

  try {
    const room = await req.roomCollection.findOne(
      { _id: new ObjectId(roomId), members: userId },
      { projection: { messages: 1 } }
    );

    if (!room) {
      return res.status(403).send({ message: "Not authorized or room not found" });
    }

    let messages = room.messages || [];
    
    // Filter messages by timestamp if 'since' parameter is provided
    if (since) {
      const sinceDate = new Date(since);
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate);
    }

    // Join with user data to show usernames
    const messagesWithUser = await Promise.all(
      messages.map(async (msg) => {
        const sender = await req.usersCollection.findOne({ _id: msg.sender });
        return {
          ...msg,
          senderName: sender?.username || "Unknown",
        };
      })
    );

    res.send({ success: true, messages: messagesWithUser });
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).send({ message: "Failed to get chat" });
  }
});

module.exports = roomApi;
