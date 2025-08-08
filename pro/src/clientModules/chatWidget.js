// src/clientModules/chatWidget.js
import React from 'react';
import ReactDOM from 'react-dom';
import RagChatWidget from '../components/RagChatWidget';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const mountNode = document.createElement('div');
  document.body.appendChild(mountNode);

  ReactDOM.render(<RagChatWidget />, mountNode);
}
