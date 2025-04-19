import React from 'react';
import ReactDOM from 'react-dom/client';
import App       from './App';
import './App.css';                    // keep your global styles
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
