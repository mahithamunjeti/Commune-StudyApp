import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CollabRooms.css";

const CollabRooms = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [myRooms, setMyRooms] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { username } = useParams()
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
      fetchMyRooms(); // Refresh the room list
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Failed to create room. Please try again.");
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchMyRooms();
  }, [fetchFriends, fetchPendingRequests, fetchMyRooms]);

  return (
    <div>
    <header className="timer-header">
  <div className="logo-container" onClick={() => navigate(`/dashboard/${username}`)}>
    <img src="/logo.png" alt="App Logo" className="logo-image" />
    <h1 className="app-title">StudyApp</h1>
  </div>
</header>

    <div className="collab-container">
      <div className="sidebar">
        <h2>Friends</h2>
        <ul>
          {friends.map((f) => (
            <li
              key={f._id}
              onClick={() => toggleSelectFriend(f._id)}
              style={{
                cursor: "pointer",
                backgroundColor: selectedFriends.includes(f._id)
                  ? "#d4f1f4"
                  : "transparent",
              }}
            >
              {f.username} ({f.email}){" "}
              {selectedFriends.includes(f._id) && <span>✔️</span>}
            </li>
          ))}
        </ul>

        <h3>Add Friend</h3>
        <input
          type="email"
          placeholder="Enter email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
        />
        <button onClick={sendRequest}>Send Request</button>

        <h3>Pending Requests</h3>
        <ul>
          {pendingRequests.map((req) => (
            <li key={req.requestId}>
              {req.from} ({req.email}) &nbsp;
              <button onClick={() => respondToRequest(req.requestId, "accept")}>
                Accept
              </button>
              <button onClick={() => respondToRequest(req.requestId, "reject")}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <h2>Create Collab Room</h2>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <textarea
          placeholder="Room Description"
          value={roomDesc}
          onChange={(e) => setRoomDesc(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>

        <h2>My Rooms</h2>
        {myRooms.length === 0 ? (
          <p>No rooms joined yet.</p>
        ) : (
          <ul>
  {myRooms.map((room) => (
    <li
  key={room._id}
  className="room-card"
  onClick={() => navigate(`/room/${room._id}/${username}`)}
>
  <strong>{room.roomName}</strong> <br />
  {room.roomDesc} <br />
  <small>Created by: {room.createdBy?.username || "Unknown"}</small> <br />
  <small>Created at: {new Date(room.createdAt).toLocaleString()}</small> <br />
  <small>
    Members:{" "}
    {room.members && room.members.length > 0
      ? room.members.map((m) => m.username).join(", ")
      : "No members"}
  </small>
</li>

  ))}
</ul>
        )}
      </div>
    </div>
    </div>
  );
};

export default CollabRooms;

