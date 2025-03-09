import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to backend WebSocket

const Messages = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Listen for new messages from the server
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const selectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([
      { sender: "User 1", text: "Hello!" },
      { sender: "Me", text: "Hi, how are you?" },
    ]);
  };

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const messageData = {
        sender: "Me",
        text: newMessage,
      };
      setMessages([...messages, messageData]);
      socket.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="messages-container">
      <div className="conversations">
        <h3>Conversations</h3>
        {conversations.map((chat) => (
          <div key={chat.id} onClick={() => selectChat(chat)}>
            {chat.name}
          </div>
        ))}
      </div>
      <div className="chat-window">
        {selectedChat ? (
          <>
            <h3>Chat with {selectedChat.name}</h3>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </>
        ) : (
          <p>Select a conversation</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
