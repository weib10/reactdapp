import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
import "@web3-react/injected-connector";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
