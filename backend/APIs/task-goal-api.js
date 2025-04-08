const express = require("express");
const taskGoalApi = express.Router();
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");

// GET DB collections from app context
taskGoalApi.use((req, res, next) => {
  req.tasksCollection = req.app.get("tasksCollection");
  req.goalsCollection = req.app.get("goalsCollection");
  next();
});

// PROTECT all routes
taskGoalApi.post("/task", verifyToken,async (req, res) => {
  const taskData = req.body;
  taskData.userId = new ObjectId(req.user._id);
  taskData.completed = false;
  try {
    const result = await req.tasksCollection.insertOne(taskData);
    res.send({ message: "Task added", payload: result });
  } catch (err) {
    res.status(500).send({ message: "Error adding task", error: err.message });
  }
});
taskGoalApi.get('/tasks',verifyToken, async (req, res) => {
  const tasksCollection = req.app.get('tasksCollection');
  const userId = req.user._id;

  try {
    const tasks = await tasksCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.send({ message: "Tasks fetched", payload: tasks });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

taskGoalApi.put("/task/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await req.tasksCollection.updateOne(
      { _id: new ObjectId(taskId), userId: new ObjectId(req.user._id) },
      { $set: { completed: true } }
    );
    res.send({ message: "Task marked complete", payload: result });
  } catch (err) {
    res.status(500).send({ message: "Error updating task", error: err.message });
  }
});
taskGoalApi.delete("/task/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await req.tasksCollection.deleteOne({
      _id: new ObjectId(taskId),
      userId: new ObjectId(req.user._id),
    });
    res.send({ message: "Task deleted", payload: result });
  } catch (err) {
    res.status(500).send({ message: "Error deleting task", error: err.message });
  }
});
taskGoalApi.post("/goal", async (req, res) => {
  const goalData = req.body;
  goalData.userId = new ObjectId(req.user._id);
  goalData.streak = 0;
  goalData.lastCompletedDate = null;
  goalData.completedToday = false;
  try {
    const result = await req.goalsCollection.insertOne(goalData);
    res.send({ message: "Goal added", payload: result });
  } catch (err) {
    res.status(500).send({ message: "Error adding goal", error: err.message });
  }
});
const isToday = (date) => {
  const today = new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0] === today;
};

taskGoalApi.put("/goal/:id/tick", async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await req.goalsCollection.findOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(req.user._id),
    });

    const today = new Date().toISOString().split("T")[0];

    if (goal && goal.lastCompletedDate !== today) {
      const updatedStreak =
        goal.lastCompletedDate &&
        new Date(goal.lastCompletedDate).getDate() ===
          new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
          ? goal.streak + 1
          : 1;

      await req.goalsCollection.updateOne(
        { _id: new ObjectId(goalId) },
        {
          $set: {
            lastCompletedDate: today,
            streak: updatedStreak,
            completedToday: true,
          },
        }
      );

      res.send({ message: "Goal ticked", newStreak: updatedStreak });
    } else {
      res.send({ message: "Already ticked today" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error ticking goal", error: err.message });
  }
});
taskGoalApi.get("/goals", async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    const today = new Date().toISOString().split("T")[0];

    const goals = await req.goalsCollection.find({ userId }).toArray();

    const updates = [];

    for (let goal of goals) {
      if (goal.completedToday && goal.lastCompletedDate !== today) {
        // Reset completedToday to false if it's not done today
        updates.push(
          req.goalsCollection.updateOne(
            { _id: goal._id },
            { $set: { completedToday: false } }
          )
        );
        goal.completedToday = false; // Also fix in the response
      }
    }

    await Promise.all(updates); // Apply updates concurrently

    res.send({ message: "Goals fetched", payload: goals });
  } catch (err) {
    res.status(500).send({ message: "Error fetching goals", error: err.message });
  }
});


taskGoalApi.put("/task/:id/star", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await req.tasksCollection.findOne({
      _id: new ObjectId(taskId),
      userId: new ObjectId(req.user._id),
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const newStarred = !task.starred;

    await req.tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { starred: newStarred } }
    );

    res.json({ message: "Task star toggled", starred: newStarred });
  } catch (err) {
    console.error("Star Task Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


taskGoalApi.put("/goal/:id/star", verifyToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await req.goalsCollection.findOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(req.user._id),
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const newStarred = !goal.starred;

    await req.goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      { $set: { starred: newStarred } }
    );

    res.json({ message: "Goal star toggled", starred: newStarred });
  } catch (err) {
    console.error("Star Goal Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

taskGoalApi.delete("/goal/:id", verifyToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const result = await req.goalsCollection.deleteOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(req.user._id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Goal not found or unauthorized" });
    }

    res.send({ message: "Goal deleted", payload: result });
  } catch (err) {
    res.status(500).send({ message: "Error deleting goal", error: err.message });
  }
});


module.exports = taskGoalApi;
