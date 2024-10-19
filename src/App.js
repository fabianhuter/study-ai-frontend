import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import QuestionForm from './QuestionForm';
import Settings from './Settings';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbu2D3pT8GwpiDfD63KYGMWz10SgcQ8gA",
  authDomain: "dhbw-login.firebaseapp.com",
  projectId: "dhbw-login",
  storageBucket: "dhbw-login.appspot.com",
  messagingSenderId: "353012437550",
  appId: "1:353012437550:web:ab567bf4e2825b55aa05bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [topics, setTopics] = useState([
    { name: 'linear-algebra', pdfs: [] },
    { name: 'science', pdfs: [] },
    { name: 'technology', pdfs: [] },
    { name: 'history', pdfs: [] }
  ]);
  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    tokens: {
      short: 200,
      medium: 1024,
      detailed: 2048
    }
  });
  const [typingAnswer, setTypingAnswer] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (answer && !isLoading) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < answer.length) {
          setTypingAnswer(answer.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 10);
      return () => clearInterval(typingInterval);
    }
  }, [answer, isLoading]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setAnswer('');
    setTypingAnswer('');
    try {
      const selectedTopic = topics.find(topic => topic.name === formData.topic);
      const pdfContents = selectedTopic ? selectedTopic.pdfs.map(pdf => Array.from(pdf.content)) : [];
      
      const response = await axios.post('http://localhost:5000/api/submit-question', {
        ...formData,
        modelSettings,
        pdfContents
      });
      setAnswer(response.data.message);
    } catch (error) {
      console.error('Error submitting question:', error);
      setAnswer('An error occurred while processing your question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = (newTopics, newModelSettings) => {
    setTopics(newTopics);
    setModelSettings(newModelSettings);
    setShowSettings(false);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="App">
      <button className="settings-button" onClick={() => setShowSettings(true)} aria-label="Settings">
        <FontAwesomeIcon icon={faCog} />
      </button>
      <QuestionForm 
        onSubmit={handleSubmit} 
        topics={topics.map(topic => topic.name)} 
        onLogin={handleLogin}
        user={user}
      />
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        typingAnswer && (
          <div className="answer">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {typingAnswer}
            </ReactMarkdown>
          </div>
        )
      )}
      {showSettings && (
        <Settings
          topics={topics}
          modelSettings={modelSettings}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
