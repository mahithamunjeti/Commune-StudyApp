import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const RoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoom(res.data.payload);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    fetchRoom();
  }, [roomId, token]);

  if (!room) return <div>Loading room data...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{room.roomName}</h2>
      <p>{room.roomDesc}</p>
      <p><strong>Created by:</strong> {room.createdBy?.username}</p>
      <p><strong>Created at:</strong> {new Date(room.createdAt).toLocaleString()}</p>
      <p>
        <strong>Members:</strong>{" "}
        {room.members.map((m) => m.username).join(", ")}
      </p>
      {/* Later: chat, shared goals, etc. */}
    </div>
  );
};

export default RoomPage;
