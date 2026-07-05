import { apiUrl } from './apiConfig';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (err) {
    console.warn('SW registration failed', err);
    return null;
  }
}

export async function subscribeToPush() {
  if (!('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Push not supported');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission denied');

  const reg = await registerServiceWorker();
  if (!reg) throw new Error('Service worker unavailable');

  const keyRes = await fetch(apiUrl('/push/subscribe'));
  const { publicKey } = await keyRes.json();
  if (!publicKey) throw new Error('VAPID public key not configured');

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await fetch(apiUrl('/push/subscribe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON(), locale: 'vi' }),
  });

  localStorage.setItem('nambac_push_subscribed', '1');
  return subscription;
}

export function isPushSubscribed() {
  return localStorage.getItem('nambac_push_subscribed') === '1';
}

export function isPushSupported() {
  return 'PushManager' in window && 'Notification' in window;
}
