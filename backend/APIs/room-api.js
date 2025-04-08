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

module.exports = roomApi;
