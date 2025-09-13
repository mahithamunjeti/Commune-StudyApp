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
taskGoalApi.post("/task", verifyToken, async (req, res) => {
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

taskGoalApi.get('/tasks', verifyToken, async (req, res) => {
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

taskGoalApi.put("/task/:id/complete", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { completed } = req.body;
    
    const task = await req.tasksCollection.findOne({
      _id: new ObjectId(taskId),
      userId: new ObjectId(req.user._id),
    });

    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    const result = await req.tasksCollection.updateOne(
      { _id: new ObjectId(taskId), userId: new ObjectId(req.user._id) },
      { $set: { completed: completed } }
    );
    
    res.send({ 
      message: completed ? "Task marked complete" : "Task marked incomplete", 
      payload: result,
      update: { completed: completed }
    });
  } catch (err) {
    res.status(500).send({ message: "Error updating task", error: err.message });
  }
});

taskGoalApi.delete("/task/:id", verifyToken, async (req, res) => {
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

taskGoalApi.post("/goal", verifyToken, async (req, res) => {
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

// Helper function to check if a date is today
const isToday = (date) => {
  const today = new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0] === today;
};

// Helper function to check if a date is yesterday
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date).toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
};

taskGoalApi.put("/goal/:id/tick", verifyToken, async (req, res) => {
  try {
    const goalId = req.params.id;
    const { markComplete } = req.body; // This should be true or false from frontend
    const today = new Date().toISOString().split("T")[0];

    console.log(`Goal tick request: goalId=${goalId}, markComplete=${markComplete}, today=${today}`);

    const goal = await req.goalsCollection.findOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(req.user._id),
    });

    if (!goal) {
      return res.status(404).send({ message: "Goal not found" });
    }

    console.log(`Current goal state: streak=${goal.streak}, lastCompletedDate=${goal.lastCompletedDate}, completedToday=${goal.completedToday}`);

    let update = {};
    let newStreak = goal.streak || 0;

    if (markComplete) {
      // If the goal is not already marked for today
      if (goal.lastCompletedDate !== today) {
        // Check if the goal was completed yesterday to continue streak
        if (goal.lastCompletedDate && isYesterday(goal.lastCompletedDate)) {
          newStreak = newStreak + 1;
          console.log(`Continuing streak: was completed yesterday, new streak = ${newStreak}`);
        } else {
          // If not yesterday, start a new streak at 1
          newStreak = 1;
          console.log(`Starting new streak: was not completed yesterday, new streak = ${newStreak}`);
        }

        update = {
          lastCompletedDate: today,
          completedToday: true,
          streak: newStreak,
        };
      } else {
        console.log(`Already marked complete today`);
        return res.send({ message: "Already marked complete today" });
      }
    } else {
      // UN-TICKING: If already marked complete today, allow undo
      if (goal.completedToday && goal.lastCompletedDate === today) {
        // Decrease streak but don't go below 0 and break continuity
        newStreak = Math.max(0, newStreak - 1);
        console.log(`Unticking: decreasing streak to ${newStreak} and clearing lastCompletedDate to break continuity`);

        update = {
          completedToday: false,
          streak: newStreak,
          lastCompletedDate: null,
        };
      } else {
        console.log(`Nothing to untick today`);
        return res.send({ message: "Nothing to untick today" });
      }
    }

    console.log(`Final update:`, update);

    await req.goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      { $set: update }
    );

    res.send({ 
      message: "Goal updated", 
      update,
      newStreak: newStreak
    });
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).send({ message: "Error updating goal", error: err.message });
  }
});

taskGoalApi.get("/goals", verifyToken, async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    const today = new Date().toISOString().split("T")[0];

    console.log(`Fetching goals for user ${userId}, today is ${today}`);

    const goals = await req.goalsCollection.find({ userId }).toArray();

    const updates = [];

    for (let goal of goals) {
      console.log(`Goal ${goal._id}: completedToday=${goal.completedToday}, lastCompletedDate=${goal.lastCompletedDate}, streak=${goal.streak}`);

      // Reset completedToday if it's not done today
      if (goal.completedToday && goal.lastCompletedDate !== today) {
        console.log(`Resetting completedToday for goal ${goal._id} because lastCompletedDate is not today`);
        updates.push(
          req.goalsCollection.updateOne(
            { _id: goal._id },
            { $set: { completedToday: false } }
          )
        );
        goal.completedToday = false; // Also fix in the response
      }

      // Duolingo-style: if lastCompletedDate is neither today nor yesterday, streak should be 0
      const last = goal.lastCompletedDate;
      if (last && last !== today && !isYesterday(last) && (goal.streak || 0) !== 0) {
        console.log(`Gap detected for goal ${goal._id}. Resetting streak to 0.`);
        updates.push(
          req.goalsCollection.updateOne(
            { _id: goal._id },
            { $set: { streak: 0 } }
          )
        );
        goal.streak = 0; // reflect in response
      }
    }

    if (updates.length > 0) {
      console.log(`Applying ${updates.length} updates for goals maintenance`);
      await Promise.all(updates); // Apply updates concurrently
    }

    console.log(`Returning ${goals.length} goals`);
    res.send({ message: "Goals fetched", payload: goals });
  } catch (err) {
    console.error("Error fetching goals:", err);
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
