import React, { useState } from 'react';
import './QuestionForm.css';

function QuestionForm({ onSubmit, topics, onLogin, user }) {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('general');
  const [detailLevel, setDetailLevel] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ question, topic, detailLevel });
  };

  return (
    <div className="question-form">
      <div className="header">
        <h2>DHBW AI Chat</h2>
        {!user ? (
          <button onClick={onLogin} className="login-button">
            Login with Google
          </button>
        ) : (
          <div className="user-info">
            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            <span>{user.displayName}</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Your Question:</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="topic">Topic:</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Detail Level:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="short"
                checked={detailLevel === 'short'}
                onChange={(e) => setDetailLevel(e.target.value)}
              />
              Short
            </label>
            <label>
              <input
                type="radio"
                value="medium"
                checked={detailLevel === 'medium'}
                onChange={(e) => setDetailLevel(e.target.value)}
              />
              Medium
            </label>
            <label>
              <input
                type="radio"
                value="detailed"
                checked={detailLevel === 'detailed'}
                onChange={(e) => setDetailLevel(e.target.value)}
              />
              Detailed
            </label>
          </div>
        </div>
        <button type="submit">Ask Question</button>
      </form>
    </div>
  );
}

export default QuestionForm;
