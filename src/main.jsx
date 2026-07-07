import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { registerServiceWorker } from './lib/pushNotifications';

import { restoreCookieConsent, hasAdConsent } from './lib/cookieConsent';
import { loadAdSenseScript } from './lib/adsConfig';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

registerServiceWorker();
restoreCookieConsent();
if (hasAdConsent()) loadAdSenseScript();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
    </HelmetProvider>
  </React.StrictMode>
);
