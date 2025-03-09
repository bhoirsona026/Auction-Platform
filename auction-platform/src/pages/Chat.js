import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chat = ({ user }) => {
  const { receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/${user._id}/${receiverId}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [receiverId]);

  // ✅ Listen for incoming messages
  useEffect(() => {
    socket.on(`message-${user._id}`, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off(`message-${user._id}`);
    };
  }, []);

  // ✅ Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = { senderId: user._id, receiverId, text: newMessage };
    try {
      const response = await axios.post("http://localhost:5000/api/messages", messageData);
      setMessages((prev) => [...prev, response.data]);

      socket.emit("sendMessage", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h2>Chat with User {receiverId}</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.senderId === user._id ? "right" : "left" }}>
            <strong>{msg.senderId === user._id ? "You" : "User"}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
