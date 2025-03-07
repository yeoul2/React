import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import "./index.css";  // ✅ Tailwind 스타일 적용

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(
  <>
    <App />
  </>
);