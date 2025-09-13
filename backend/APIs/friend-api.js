const express = require("express");
const friendApi = express.Router();
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// Middleware to inject collections
friendApi.use((req, res, next) => {
  const db = req.app.get("db"); // ✅ Properly access DB
  req.friendRequestsCollection = db.collection("friendRequests");
  req.friendsCollection = db.collection("friends");
  req.usersCollection = db.collection("users");
  next();
});
friendApi.use(verifyToken);

friendApi.post("/send-request", async (req, res) => {
  const { friendEmail } = req.body;
  const usersCollection = req.usersCollection;
  const friendRequestsCollection = req.friendRequestsCollection;

  try {
    const fromUserId = new ObjectId(req.user._id);
    const toUser = await usersCollection.findOne({ email: friendEmail });

    if (!toUser) return res.status(404).send({ message: "User not found" });

    const alreadySent = await friendRequestsCollection.findOne({
      from: fromUserId,
      to: toUser._id,
    });
    if (alreadySent) return res.status(400).send({ message: "Request already sent" });

    await friendRequestsCollection.insertOne({
      from: fromUserId,
      to: new ObjectId(toUser._id),
      status: "pending",
    });
    

    res.send({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).send({ message: "Error sending request", error: err.message });
  }
  // console.log("Sending request from user:", req.user);

});


// Get pending friend requests for current user
friendApi.get("/pending", async (req, res) => {
  const friendRequestsCollection = req.friendRequestsCollection;
  const usersCollection = req.usersCollection;

  try {
    const requests = await friendRequestsCollection.find({
      to: new ObjectId(req.user._id),
      status: "pending",
    }).toArray();

    // Join with user info
    const detailedRequests = await Promise.all(
      requests.map(async (reqDoc) => {
        const fromUser = await usersCollection.findOne({ _id: reqDoc.from });
        return {
          requestId: reqDoc._id,
          from: fromUser.username,
          email: fromUser.email,
        };
      })
    );

    res.send({ message: "Pending requests", payload: detailedRequests });
  } catch (err) {
    res.status(500).send({ message: "Error fetching pending requests", error: err.message });
  }
});

// Accept/Reject friend request
friendApi.post("/respond", async (req, res) => {
  const { requestId, action } = req.body;
  const friendRequestsCollection = req.friendRequestsCollection;
  const friendsCollection = req.friendsCollection;

  try {
    const request = await friendRequestsCollection.findOne({ _id: new ObjectId(requestId) });
    if (!request) return res.status(404).send({ message: "Request not found" });

    if (action === "accept") {
      await friendsCollection.insertMany([
        { userId: request.from, friendId: request.to },
        { userId: request.to, friendId: request.from },
      ]);
    }

    await friendRequestsCollection.deleteOne({ _id: new ObjectId(requestId) });
    res.send({ message: `Request ${action}ed` });
  } catch (err) {
    res.status(500).send({ message: "Error responding to request", error: err.message });
  }
});

// Get user's friend list
friendApi.get("/list", async (req, res) => {
  const friendsCollection = req.friendsCollection;
  const usersCollection = req.usersCollection;

  try {
    const friendLinks = await friendsCollection.find({ userId: new ObjectId(req.user._id) }).toArray();
    const friendIds = friendLinks.map(link => link.friendId);

    const friends = await usersCollection.find({ _id: { $in: friendIds } }).toArray();

    res.send({ message: "Friends list", payload: friends });
  } catch (err) {
    res.status(500).send({ message: "Error fetching friends", error: err.message });
  }
});

// Get list of accepted friends
// friendApi.get("/accepted", async (req, res) => {
//   const userId = new ObjectId(req.user._id);
//   const friendsCollection = req.friendsCollection;
//   const usersCollection = req.usersCollection;

//   try {
//     const friendDocs = await friendsCollection
//       .find({
//         $or: [{ user1: userId }, { user2: userId }],
//       })
//       .toArray();

//     const friendIds = friendDocs.map((doc) =>
//       doc.user1.equals(userId) ? doc.user2 : doc.user1
//     );

//     const friends = await usersCollection
//       .find({ _id: { $in: friendIds } })
//       .project({ username: 1, email: 1 })
//       .toArray();

//     res.send({ message: "Friends fetched", payload: friends });
//   } catch (err) {
//     res.status(500).send({ message: "Error fetching friends", error: err.message });
//   }
// });


module.exports = friendApi;