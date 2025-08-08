// src/components/RagChatWidget.jsx
import React, { useState } from 'react';
import RagChat from './RagChat'; // 先ほど実装した RAG チャットコンポーネント

const RagChatWidget = () => {
  const [open, setOpen] = useState(false);

  const toggleWidget = () => setOpen(!open);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
    }}>
      {open ? (
        <div style={{
          width: '320px',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: '#007aff',
            color: 'white',
            padding: '0.5em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>RAG Chat</span>
            <button onClick={toggleWidget} style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2em',
              cursor: 'pointer'
            }}>×</button>
          </div>
          <div style={{ padding: '0.5em', height: 'calc(100% - 40px)' }}>
            <RagChat />
          </div>
        </div>
      ) : (
        <button onClick={toggleWidget} style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007aff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}>
          Chat
        </button>
      )}
    </div>
  );
};

export default RagChatWidget;
