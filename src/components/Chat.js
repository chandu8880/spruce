import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const API_ENDPOINT = 'https://chatbot-api-22796269954.us-central1.run.app/chat';

function Chat({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi! I\'m Spruce. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const replyText = data.reply || data.message || data.response || JSON.stringify(data);

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: replyText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-wrapper">
      <header className="chat-header">
        <div className="chat-header-left">
          <span className="chat-logo-icon">🌿</span>
          <span className="chat-header-title">Spruce</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="avatar">S</div>
            )}
            <div className={`message-bubble ${msg.role}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row assistant">
            <div className="avatar">S</div>
            <div className="message-bubble assistant typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;
