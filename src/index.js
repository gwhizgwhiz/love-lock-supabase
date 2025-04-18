import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Keep this here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>   {/* Wrap the entire app with BrowserRouter here */}
    <App />
  </BrowserRouter>
);
