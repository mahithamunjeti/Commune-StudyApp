import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CollabRooms.css";
import logo from '../commune-logo.png'; // Update the path and filename to match your actual image

const CollabRooms = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [myRooms, setMyRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("myRooms");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { username } = useParams();

  const fetchFriends = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:4000/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data.payload);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }, [token]);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:4000/friends/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(res.data.payload);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [token]);

  const fetchMyRooms = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:4000/room/my-rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRooms(res.data.payload);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, [token]);

  const sendRequest = async () => {
    try {
      await axios.post(
        "http://localhost:4000/friends/send-request",
        { friendEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Friend request sent!");
      setFriendEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      await axios.post(
        "http://localhost:4000/friends/respond",
        { requestId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      console.error("Error responding to request:", err);
    }
  };

  const toggleSelectFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const createRoom = async () => {
    if (!roomName || selectedFriends.length === 0) {
      alert("Please enter a room name and select at least one friend.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/room/create-room",
        {
          roomName,
          roomDesc,
          selectedFriends,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Room created successfully!");
      setRoomName("");
      setRoomDesc("");
      setSelectedFriends([]);
      fetchMyRooms();
      setActiveTab("myRooms");
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Failed to create room. Please try again.");
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
  
    try {
      await axios.delete(`http://localhost:4000/room/delete-room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("Room deleted successfully");
      fetchMyRooms(); // Refresh room list
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
    }
  };
  
  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchMyRooms();
  }, [fetchFriends, fetchPendingRequests, fetchMyRooms]);

  return (
    <div className="collab-container">
      <div className="animated-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <header className="collab-header">
        <div className="logo-container" onClick={() => navigate(`/dashboard/${username}`)}>
          <img src={logo} alt="Commune Logo" className="logo-image" />
          <h1 className="app-title">commune</h1>
        </div>
      </header>

      <div className="collab-content">
        <div className="sidebar">
          <div className="sidebar-nav">
            <div 
              className={`sidebar-tab ${activeTab === 'myRooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('myRooms')}
            >
              My Rooms
            </div>
            <div 
              className={`sidebar-tab ${activeTab === 'createRoom' ? 'active' : ''}`}
              onClick={() => setActiveTab('createRoom')}
            >
              Create Room
            </div>
            <div 
              className={`sidebar-tab ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </div>
          </div>
          
          <div className="friends-section">
            <h3>Friends List</h3>
            <div className="friends-list">
              {friends.length === 0 ? (
                <p className="empty-state">No friends added yet.</p>
              ) : (
                friends.map((f) => (
                  <div 
                    key={f._id} 
                    className={`friend-item ${selectedFriends.includes(f._id) ? 'selected' : ''}`}
                    onClick={() => toggleSelectFriend(f._id)}
                  >
                    <div className="friend-avatar">
                      {f.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="friend-info">
                      <span className="friend-name">{f.username}</span>
                      <span className="friend-email">{f.email}</span>
                    </div>
                    {selectedFriends.includes(f._id) && <span className="check-icon">✓</span>}
                  </div>
                ))
              )}
            </div>
            
            {/* <div className="add-friend-section">
              <h3>Add Friend</h3>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter friend's email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                />
                <button className="primary-button" onClick={sendRequest}>
                  Send
                </button>
              </div>
            </div> */}
            
            {/* {pendingRequests.length > 0 && (
              <div className="pending-requests">
                <h3>Pending Requests</h3>
                {pendingRequests.map((req) => (
                  <div key={req.requestId} className="request-item">
                    <div className="request-info">
                      <span className="request-name">{req.from}</span>
                      <span className="request-email">{req.email}</span>
                    </div>
                    <div className="request-actions">
                      <button
                        className="accept-button"
                        onClick={() => respondToRequest(req.requestId, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => respondToRequest(req.requestId, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'myRooms' && (
            <div className="rooms-grid">
              <h2>My Community</h2>
              
              {myRooms.length === 0 ? (
                <div className="empty-rooms">
                  <div className="empty-icon">🏠</div>
                  <h3>No rooms yet</h3>
                  <p>Create a room to start collaborating with friends</p>
                  <button 
                    className="primary-button create-first-room" 
                    onClick={() => setActiveTab('createRoom')}
                  >
                    Create Your First Room
                  </button>
                </div>
              ) : (
                <div className="rooms-list">
                  {myRooms.map((room) => (
                    <div key={room._id} className="room-card">
                      <div 
                        className="room-card-content"
                        onClick={() => navigate(`/room/${room._id}/${username}`)}
                      >
                        <div className="room-header">
                          <h3 className="room-name">{room.roomName}</h3>
                          <span className="members-count">{room.members?.length || 0} members</span>
                        </div>
                        
                        <p className="room-description">{room.roomDesc}</p>
                        
                        <div className="room-meta">
                          <div className="created-by">
                            <span className="meta-label">Created by:</span>
                            <span className="meta-value">{room.createdBy?.username || "Unknown"}</span>
                          </div>
                          <div className="created-date">
                            <span className="meta-label">Created:</span>
                            <span className="meta-value">
                              {new Date(room.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="members-preview">
                          {room.members && room.members.slice(0, 3).map((member, idx) => (
                            <div key={idx} className="member-avatar" title={member.username}>
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {room.members && room.members.length > 3 && (
                            <div className="member-avatar more-members">
                              +{room.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoom(room._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'createRoom' && (
            <div className="create-room-section">
              <h2>Create a New Room</h2>
              <p className="section-description">
                Create a collaborative space to track goals and maintain streaks with friends.
              </p>
              
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  placeholder="Enter a name for your room"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roomDesc">Description</label>
                <textarea
                  id="roomDesc"
                  placeholder="What is this room about?"
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Select Friends to Invite</label>
                <div className="selected-friends-count">
                  {selectedFriends.length} friends selected
                </div>
                
                <div className="friends-selection">
                  {friends.length === 0 ? (
                    <p className="no-friends-message">
                      You haven't added any friends yet. Add friends to invite them to your room.
                    </p>
                  ) : (
                    <div className="selected-friends-list">
                      {friends.map((friend) => (
                        <div
                          key={friend._id}
                          className={`friend-selection-item ${
                            selectedFriends.includes(friend._id) ? "selected" : ""
                          }`}
                          onClick={() => toggleSelectFriend(friend._id)}
                        >
                          <div className="friend-selection-avatar">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="friend-selection-name">{friend.username}</div>
                          {selectedFriends.includes(friend._id) && (
                            <div className="friend-selected-icon">✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setRoomName("");
                    setRoomDesc("");
                    setSelectedFriends([]);
                    setActiveTab("myRooms");
                  }}
                >
                  Cancel
                </button>
                <button className="primary-button" onClick={createRoom}>
                  Create Room
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'friends' && (
            <div className="friends-management">
              <h2>Friend Management</h2>
              
              <div className="friends-tabs">
                <div className="friends-tab active">All Friends ({friends.length})</div>
                {/* <div className="friends-tab">Pending ({pendingRequests.length})</div> */}
              </div>
              
              <div className="add-new-friend">
                <h3>Add New Friend</h3>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Enter friend's email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                  />
                  <button className="primary-button" onClick={sendRequest}>
                    Send Request
                  </button>
                </div>
              </div>
              
              <div className="friends-detailed-list">
                {friends.length === 0 ? (
                  <div className="empty-friends">
                    <div className="empty-icon">👥</div>
                    <h3>No friends yet</h3>
                    <p>Add friends to collaborate on goals together</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend._id} className="friend-detail-card">
                      <div className="friend-detail-avatar">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-detail-info">
                        <h4 className="friend-detail-name">{friend.username}</h4>
                        <p className="friend-detail-email">{friend.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {pendingRequests.length > 0 && (
                <div className="pending-section">
                  <h3>Pending Requests</h3>
                  <div className="pending-list">
                    {pendingRequests.map((req) => (
                      <div key={req.requestId} className="pending-item">
                        <div className="pending-avatar">
                          {req.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="pending-info">
                          <div className="pending-name">{req.from}</div>
                          <div className="pending-email">{req.email}</div>
                        </div>
                        <div className="pending-actions">
                          <button
                            className="accept-button"
                            onClick={() => respondToRequest(req.requestId, "accept")}
                          >
                            Accept
                          </button>
                          <button
                            className="reject-button"
                            onClick={() => respondToRequest(req.requestId, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollabRooms;