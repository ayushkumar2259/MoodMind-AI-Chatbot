import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";
import { startListening, speakText } from "../utils";


const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { message: input });
      const botReply = res.data.reply || "❌ Empty response";
      const botMsg = {
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null,
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(botReply);
    } catch {
      const errorMsg = {
        sender: "bot",
        text: "❌ Something went wrong.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleFeedback = (index, value) => {
    const updated = [...messages];
    updated[index].feedback = value;
    setMessages(updated);
  };

  const suggestHelp = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("sad") || lower.includes("depressed")) return "You're not alone. Want to talk to a therapist?";
    if (lower.includes("anxious") || lower.includes("scared")) return "Try deep breathing or grounding exercises.";
    return null;
  };

  return (
    <div className="chatbot-container">
      <h2>🧠 MoodMind Chat</h2>
      <div className="chat-window" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            <div className="message-text">
              {msg.text}
              {msg.sender === "bot" && msg.feedback == null && (
                <div className="feedback">
                  <button onClick={() => handleFeedback(i, "👍")}>👍</button>
                  <button onClick={() => handleFeedback(i, "👎")}>👎</button>
                </div>
              )}
              {msg.feedback && <div>Feedback: {msg.feedback}</div>}
            </div>
            <div className="message-time">{msg.time}</div>
            {msg.sender === "user" && suggestHelp(msg.text) && (
              <div className="suggestion">💡 {suggestHelp(msg.text)}</div>
            )}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={() => startListening(setInput)}>🎙️</button>
      </div>
    </div>
  );
};

export default Chatbot;
