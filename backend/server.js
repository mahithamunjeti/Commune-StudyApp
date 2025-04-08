require("dotenv").config(); // Load environment variables
const cors = require("cors");
const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// Create HTTP Server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Token verification middleware (only for protected routes)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).send({ message: "No token provided, please login" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Failed to authenticate token" });
    }
    req.user = decoded;
    next();
  });
};

// MongoDB Connection
MongoClient.connect(process.env.DB_URL)
  .then((client) => {
    const studyDBobj = client.db("studyappdb");
    app.set("db", studyDBobj); // ✅ Add this line to fix the db.collection issue

    const usersCollection = studyDBobj.collection("users");
    const roomsCollection = studyDBobj.collection("rooms");
    const tasksCollection = studyDBobj.collection("tasks");
    const goalsCollection = studyDBobj.collection("goals");

    app.set("tasksCollection", tasksCollection);
    app.set("goalsCollection", goalsCollection);
    app.set("usersCollection", usersCollection);
    app.set("roomsCollection", roomsCollection);

    console.log("✅ DB connection success");

    // Routes that don't need token
    const userApp = require("./APIs/user-api");
    const adminApp = require("./APIs/admin-api");
    const roomApi = require('./APIs/room-api');
    app.use("/room", roomApi);


    app.use("/user-api", userApp);
    app.use("/admin-api", adminApp);

    // Protected routes
    const taskGoalRoutes = require("./APIs/task-goal-api");
    app.use("/task-goal-api", verifyToken, taskGoalRoutes);

    const friendApi = require("./APIs/friend-api");
    app.use("/friends", verifyToken, (req, res, next) => {
      req.friendRequestsCollection = studyDBobj.collection("friendRequests");
      req.friendsCollection = studyDBobj.collection("friends");
      req.usersCollection = studyDBobj.collection("users");
      next();
    }, friendApi);

    // Global error handler
    app.use((err, req, res, next) => {
      res.status(500).send({ status: "error", message: err.message });
    });

    // Start server
    const port = process.env.PORT || 4000;
    server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ Error connecting to DB:", err);
  });
