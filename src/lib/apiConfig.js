/**
 * API Configuration
 * Data layer: Turso via /api routes (Vercel + local dev server)
 */

export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production' || import.meta.env.PROD;

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function handlerApiUrl(apiPath, extraQuery = '') {
  const base = `/api/handler?path=${encodeURIComponent(apiPath)}`;
  return extraQuery ? `${base}&${extraQuery}` : base;
}

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const filename = path.split('/').pop();
  if (path.startsWith('/images/') || path.includes('/images/')) {
    return `/images/${filename}`;
  }
  return `/images/${filename}`;
};

export const apiUrl = (endpoint) => {
  const raw = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const [pathPart, query = ''] = raw.split('?');
  const apiPath = pathPart.startsWith('api/') ? pathPart.slice(4) : pathPart;

  if (import.meta.env.PROD) {
    return handlerApiUrl(apiPath, query);
  }

  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
};

export default API_BASE_URL;
