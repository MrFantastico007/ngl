import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global Error Handler for Debugging Blank Screen
window.onerror = (message, source, lineno, colno, error) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `<h3>JS Error Detected:</h3><p>${message}</p><small>${source}:${lineno}</small>`;
  document.body.appendChild(errorDiv);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<h1 style="color:white; padding: 20px;">Error: #root element not found in index.html</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    document.body.innerHTML = `<h1 style="color:white; padding: 20px;">React Mount Error: ${err.message}</h1>`;
  }
}
