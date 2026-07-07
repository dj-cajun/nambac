import ReactDOM from 'react-dom/client';
import './index.css';
import { registerServiceWorker } from './lib/pushNotifications';

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
    </HelmetProvider>
  </React.StrictMode>
);
