import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faFile } from '@fortawesome/free-solid-svg-icons';
import './Settings.css';

export default function Settings({ topics, modelSettings, onSave, onClose }) {
  const [newTopics, setNewTopics] = useState(topics.map(topic => ({ ...topic, pdfs: topic.pdfs || [] })));
  const [newModelSettings, setNewModelSettings] = useState(modelSettings);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (newTopic.trim() && !newTopics.some(topic => topic.name === newTopic.trim())) {
      setNewTopics([...newTopics, { name: newTopic.trim(), pdfs: [] }]);
      setNewTopic('');
    }
  };

  const handleDeleteTopic = (index) => {
    const topicElement = document.querySelector(`.topic-item:nth-child(${index + 1})`);
    topicElement.classList.add('deleting');
    setTimeout(() => {
      setNewTopics(newTopics.filter((_, i) => i !== index));
    }, 300);
  };

  const handleModelSettingChange = (key, value) => {
    setNewModelSettings({ ...newModelSettings, [key]: parseFloat(value) });
  };

  const handleFileUpload = (topicIndex, event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedTopics = [...newTopics];
        updatedTopics[topicIndex].pdfs.push({
          name: file.name,
          content: new Uint8Array(e.target.result),  // Store as Uint8Array
        });
        setNewTopics(updatedTopics);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDeletePdf = (topicIndex, pdfIndex) => {
    const updatedTopics = [...newTopics];
    updatedTopics[topicIndex].pdfs.splice(pdfIndex, 1);
    setNewTopics(updatedTopics);
  };

  const handleSave = () => {
    onSave(newTopics, newModelSettings);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-content">
        <h2 className="settings-title">Settings</h2>
        <div className="settings-section">
          <h3>Topics</h3>
          <form onSubmit={handleAddTopic} className="add-topic-form">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter a new topic"
              className="topic-input"
            />
            <button type="submit" className="add-topic-button">
              <FontAwesomeIcon icon={faPlus} className="icon" />
              Add
            </button>
          </form>
          <ul className="topics-list">
            {newTopics.map((topic, index) => (
              <li key={index} className="topic-item">
                <span className="topic-text">{topic.name}</span>
                <div className="topic-actions">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(index, e)}
                    style={{ display: 'none' }}
                    id={`pdf-upload-${index}`}
                  />
                  <label htmlFor={`pdf-upload-${index}`} className="upload-pdf-button">
                    <FontAwesomeIcon icon={faFile} className="icon" />
                    Upload PDF
                  </label>
                  <button onClick={() => handleDeleteTopic(index)} className="delete-topic-button">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                {topic.pdfs.length > 0 && (
                  <ul className="pdf-list">
                    {topic.pdfs.map((pdf, pdfIndex) => (
                      <li key={pdfIndex} className="pdf-item">
                        <span className="pdf-name">{pdf.name}</span>
                        <button onClick={() => handleDeletePdf(index, pdfIndex)} className="delete-pdf-button">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="settings-section">
          <h3>Model Settings</h3>
          <div className="model-setting">
            <label htmlFor="temperature">Temperature</label>
            <input
              id="temperature"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={newModelSettings.temperature}
              onChange={(e) => handleModelSettingChange('temperature', e.target.value)}
              className="setting-input"
            />
          </div>
          <h4>Token Size per Detail Level</h4>
          <div className="token-settings">
            {Object.entries(newModelSettings.tokens).map(([level, value]) => (
              <div key={level} className="model-setting">
                <label htmlFor={`tokens-${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</label>
                <input
                  id={`tokens-${level}`}
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => handleModelSettingChange(`tokens.${level}`, e.target.value)}
                  className="setting-input"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="settings-actions">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}
