import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './app';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#0f172a',
            color: '#fff',
            fontSize: '13.5px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
