/** Load Zalo Social Share SDK once and re-scan widgets after React renders. */

const SDK_SRC = 'https://sp.zalo.me/plugins/sdk.js';
let sdkPromise = null;

export function ensureZaloSdk() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.ZaloSocialSDK) return Promise.resolve(true);

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => reject(new Error('Zalo SDK failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Zalo SDK failed'));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

/** Ask the SDK to (re)bind `.zalo-share-button` elements in the DOM. */
export function reloadZaloShareButtons() {
  if (typeof window === 'undefined') return;
  const sdk = window.ZaloSocialSDK;
  if (sdk?.reload) {
    sdk.reload();
    return;
  }
  if (sdk?.init) {
    sdk.init();
  }
}
