
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TrialGate } from './trial-gate';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TrialGate>
      <App />
    </TrialGate>
  </React.StrictMode>
);
