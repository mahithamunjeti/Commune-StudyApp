import React, { useState, useEffect, useMemo } from "react";
import "./SetMyGoals.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


const SetMyGoals = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("tasks");
  const [filter, setFilter] = useState("all");

  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);

  const [taskInput, setTaskInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = activeTab === "tasks" 
          ? "http://localhost:4000/task-goal-api/tasks"
          : "http://localhost:4000/task-goal-api/goals";
          
        const res = await axios.get(url, { headers: authHeader });
        const data = res.data.payload.filter(Boolean);

        activeTab === "tasks" ? setTasks(data) : setGoals(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [activeTab, authHeader]);

  const handleAdd = async () => {
    const input = activeTab === "tasks" ? taskInput : goalInput;
    if (!input.trim()) return;

    const newItem = {
      title: input.trim(),
      dueDate,
      description,
    };

    try {
      const url = activeTab === "tasks" 
        ? "http://localhost:4000/task-goal-api/task"
        : "http://localhost:4000/task-goal-api/goal";
        
      const res = await axios.post(url, newItem, { headers: authHeader });

      if (activeTab === "tasks") {
        setTasks([...tasks, res.data.task]);
        setTaskInput("");
      } else {
        setGoals([...goals, res.data.goal]);
        setGoalInput("");
      }

      setDueDate("");
      setDescription("");
      setShowForm(false);
    } catch (error) {
      console.error("Add error:", error.response?.status, error.response?.data || error.message);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const url = activeTab === "tasks"
        ? `http://localhost:4000/task-goal-api/task/${id}/complete`
        : `http://localhost:4000/task-goal-api/goal/${id}/tick`;

      await axios.put(url, {}, { headers: authHeader });

      if (activeTab === "tasks") {
        setTasks(tasks.map((item) =>
          item && item._id === id ? { ...item, completed: !item.completed } : item
        ));
      } else {
        setGoals(goals.map((item) =>
          item && item._id === id ? { ...item, completed: !item.completed } : item
        ));
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const toggleStarred = async (id) => {
    try {
      const url = activeTab === "tasks"
        ? `http://localhost:4000/task-goal-api/task/${id}/star`
        : `http://localhost:4000/task-goal-api/goal/${id}/star`;
  
      await axios.put(url, {}, { headers: authHeader });
  
      if (activeTab === "tasks") {
        setTasks(tasks.map((item) =>
          item && item._id === id ? { ...item, starred: !item.starred } : item
        ));
      } else {
        setGoals(goals.map((item) =>
          item && item._id === id ? { ...item, starred: !item.starred } : item
        ));
      }
    } catch (error) {
      console.error("Star error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const url = activeTab === "tasks"
        ? `http://localhost:4000/task-goal-api/task/${id}`
        : `http://localhost:4000/task-goal-api/goal/${id}`;

      await axios.delete(url, { headers: authHeader });

      if (activeTab === "tasks") {
        setTasks(tasks.filter((item) => item && item._id !== id));
      } else {
        setGoals(goals.filter((item) => item && item._id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const currentList = activeTab === "tasks" ? tasks : goals;

  const filteredList = (currentList || [])
    .filter(Boolean)
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "starred") return item?.starred;
      if (activeTab === "tasks" && filter === "completed") return item?.completed;
      return true;
    });

  const inputValue = activeTab === "tasks" ? taskInput : goalInput;
  const setInputValue = activeTab === "tasks" ? setTaskInput : setGoalInput;

  return (
    <div>
    <header className="timer-header">
  <div className="logo-container" onClick={() => navigate(`/dashboard/${username}`)}>
    <img src="logo.png" alt="App Logo" className="logo-image" />
    <h1 className="app-title">StudyApp</h1>
  </div>
</header>
    <div className="set-my-goals-container">
      <div className="sidebar">
        <button
          onClick={() => {
            setActiveTab("tasks");
            setFilter("all");
          }}
          className={activeTab === "tasks" ? "active" : ""}
        >
          Tasks
        </button>
        <button
          onClick={() => {
            setActiveTab("goals");
            setFilter("all");
          }}
          className={activeTab === "goals" ? "active" : ""}
        >
          Goals
        </button>
      </div>

      <div className="content-area">
        <div className="content-header">
          <h2>{activeTab === "tasks" ? "My Tasks" : "My Goals"}</h2>
          <div className="subtabs">
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "subtab-active" : ""}
            >
              All
            </button>
            <button
              onClick={() => setFilter("starred")}
              className={filter === "starred" ? "subtab-active" : ""}
            >
              Starred
            </button>
            {activeTab === "tasks" && (
              <button
                onClick={() => setFilter("completed")}
                className={filter === "completed" ? "subtab-active" : ""}
              >
                Completed
              </button>
            )}
          </div>
        </div>

        <div className="input-section">
          {!showForm ? (
            <button onClick={() => setShowForm(true)}>
              + Add {activeTab.slice(0, -1)}
            </button>
          ) : (
            <div className="form-container">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter ${activeTab.slice(0, -1)} name`}
              />
              {activeTab === "tasks" && (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              )}
              <input
                type="text"
                placeholder="Optional Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="form-buttons">
                <button onClick={handleAdd}>Save</button>
                <button className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <ul className="task-list">
          {filteredList.map((item) => (
            <li key={item?._id} className="task-item">
              <div className="left-content">
                <input
                  type="checkbox"
                  checked={item?.completedToday || item?.completed || false}
                  onChange={() => toggleComplete(item._id)}
                />
                <div>
                  <span className={item?.completedToday || item?.completed ? "completed" : ""}>
                    {item?.title}
                  </span>

                  {activeTab === "tasks" && item?.dueDate && (
                    <p className="meta">Due: {item.dueDate}</p>
                  )}

                  {item?.description && (
                    <p className="meta">{item.description}</p>
                  )}

                  {activeTab === "goals" && item?.streak >= 0 && (
                    <p className="meta">🔥{item.streak}</p>
                  )}
                </div>
              </div>

              <div className="actions">
                <button onClick={() => toggleStarred(item._id)}>
                  {item?.starred ? "⭐" : "☆"}
                </button>
                <button onClick={() => handleDelete(item._id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
};

export default SetMyGoals;
