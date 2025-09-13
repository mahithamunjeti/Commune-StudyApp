import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageCircle, Code, Trash2, Plus, CheckCircle, Users } from "lucide-react";
import ChatModal from "./ChatModal";
import "./RoomPage.css";
import logo from '../commune-logo.png'; // Update the path and filename to match your actual image


const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchGoals = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:4000/room/room-goals/${roomId}`, {
        headers: { Authorization:` Bearer ${token} `},
      });
      setGoals(res.data.goals || []);
      console.log("✅ Room goals fetched:", res.data.goals);
    } catch (err) {
      console.error("❌ Error loading room goals:", err);
    }
  }, [roomId, token]);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:4000/room-details/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoom(res.data);
      console.log("✅ Room details fetched:", res.data);
    } catch (err) {
      console.error("❌ Error loading room:", err);
    }
  }, [roomId, token]);

  useEffect(() => {
    fetchRoom();
    fetchGoals();
  }, [fetchRoom, fetchGoals]);

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;

    try {
      await axios.post(
        `http://localhost:4000/room/add-goal/${roomId}`,
        {
          title: newGoalTitle,
          description: newGoalDesc,
          deadline: new Date(),
        },
        {
          headers: { Authorization:` Bearer ${token}` },
        }
      );
      setNewGoalTitle("");
      setNewGoalDesc("");
      fetchGoals();
      setShowAddGoal(false);
    } catch (err) {
      console.error("❌ Failed to add goal:", err);
      alert("Error adding goal");
    }
  };

  const handleMarkComplete = async (goalId) => {
    try {
      await axios.patch(
        `http://localhost:4000/room/complete-goal/${roomId}/${goalId}`,
        {},
        {
          headers: { Authorization:` Bearer ${token} `},
        }
      );
      fetchGoals();
    } catch (err) {
      console.error("❌ Failed to mark complete:", err);
      alert("Error completing goal");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
  
    try {
      await axios.delete(`http://localhost:4000/room/delete-goal/${roomId}/${goalId}`, {
        headers: { Authorization: `Bearer ${token} `},
      });
      fetchGoals();
    } catch (err) {
      console.error("❌ Failed to delete goal:", err);
      alert("Error deleting goal");
    }
  };

  const hasCompleted = (goal) => {
    return currentUser && goal.completedBy?.some((id) => id === currentUser._id);
  };

  const everyoneDone = (goal) => {
    const memberIds = room?.members?.map((m) => m._id) || [];
    const completedIds = goal.completedBy || [];
    return memberIds.length > 0 && memberIds.every((id) => completedIds.includes(id));
  };

  const handleChatToggle = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <div className="room-page-container">
      {/* Header with clickable logo */}
      <header className="room-header">
        <div
          className="logo-container"
          onClick={() => navigate(`/dashboard/${currentUser?.username}`)}
        >
          <img src={logo} alt="Commune Logo" className="logo-image" />
          <h1 className="app-title">commune</h1>
        </div>
        
        {room && (
          <div className="room-info">
            <h2 className="room-name">{room.name}</h2>
            <div className="room-members">
              <Users size={16} />
              <span>{room.members?.length || 0} members</span>
            </div>
          </div>
        )}
      </header>

      <div className="room-content">
        {/* Background blobs */}
        <div className="room-bg">
          <div className="room-blob room-blob-1"></div>
          <div className="room-blob room-blob-2"></div>
          <div className="room-blob room-blob-3"></div>
        </div>
        
        <div className="room-main-area">
          <div className="room-sidebar">
            <div className="sidebar-header">
              <h3>Room Goals</h3>
              <button 
                className="add-goal-toggle" 
                onClick={() => setShowAddGoal(!showAddGoal)}
                title={showAddGoal ? "Hide form" : "Add new goal"}
              >Add
                <Plus size={20} />
              </button>
            </div>
            
            {/* Add Goal Form */}
            {showAddGoal && (
              <div className="add-goal-form">
                <input
                  type="text"
                  placeholder="Goal Title"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
                <textarea
                  placeholder="Goal Description"
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  rows={3}
                />
                <div className="form-actions">
                  <button onClick={handleAddGoal} className="add-btn">Add Goal</button>
                  <button onClick={() => setShowAddGoal(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Main content - Room goals displayed here */}
          <div className="goals-grid">
            {goals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>No goals yet</h3>
                  <p>Create your first goal to get started!</p>
                  <button onClick={() => setShowAddGoal(true)} className="create-first-goal">
                    Create First Goal
                  </button>
                </div>
              </div>
            ) : (
              <div className="goals-list">
                {goals.map((goal) => (
                  <div key={goal._id} className="goal-card">
                    <div className="goal-header">
                      <h3>{goal.title}</h3>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="delete-goal-btn"
                        title="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="goal-description">{goal.description}</p>
                    
                    <div className="goal-stats">
                      <div className="stat">
                        <span className="stat-label">Group Streak</span>
                        <span className="stat-value">{goal.groupStreak || 0} 🔥</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Completed by</span>
                        <span className="stat-value">{goal.completedBy?.length || 0} members</span>
                      </div>
                    </div>
                    
                    <div className="goal-status">
                      {hasCompleted(goal) && (
                        <div className="status-badge completed">
                          <CheckCircle size={14} />
                          <span>Completed</span>
                        </div>
                      )}
                      
                      {everyoneDone(goal) && (
                        <div className="status-badge everyone-done">
                          <span>🌟 Everyone completed this!</span>
                        </div>
                      )}
                    </div>
                    
                    {!hasCompleted(goal) && (
                      <button 
                        onClick={() => handleMarkComplete(goal._id)}
                        className="complete-button"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating action buttons */}
        <button
          onClick={handleChatToggle}
          className="floating-btn chat-btn"
          title="Chat with room members"
        >💬
          <MessageCircle size={22} />
        </button>

        <button
          onClick={() => navigate(`/room/${roomId}/playground`)}
          className="floating-btn playground-btn"
          title="Go to Code Playground"
        >👩🏻‍💻
          <Code size={22} />
        </button>
      </div>

      {/* Chat Modal */}
      {showChat && <ChatModal roomId={roomId} onClose={handleChatToggle} />}
    </div>
  );
};

export default RoomPage;