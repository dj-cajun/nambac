/**
 * API Configuration
 * Data layer: Turso via /api routes (Vercel + local dev server)
 */

export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production' || import.meta.env.PROD;

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
