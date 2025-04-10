import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./ChatModal.css";

const ChatModal = ({ roomId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const token = localStorage.getItem("token");
  const sender = localStorage.getItem("username") || "Anonymous";

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:4000/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    }
  }, [roomId, token]); // token is static unless user logs out

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await axios.post(
        `http://localhost:4000/room/${roomId}/message`,
        {
          sender,
          text: newMsg,
          timestamp: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-container">
        <div className="chat-modal-header">
          Room Chat
          <button className="chat-modal-close" onClick={onClose}>✖</button>
        </div>
        <div className="chat-modal-body">
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="chat-message">
                <strong>{msg.sender}</strong>: {msg.text}
                <div className="chat-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="chat-modal-footer">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="chat-input"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;