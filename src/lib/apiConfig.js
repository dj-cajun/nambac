/**
 * API Configuration - 환경변수 기반 API URL 관리
 * 개발: http://localhost:8000/api
 * 프로덕션: https://nambac.xyz/api
 */

// Base URL setup handles different environments (local vs cPanel vs Vercel)
export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production' || import.meta.env.PROD;

// Now using Supabase for API, this old API_BASE_URL is mostly deprecated,
// but kept here temporarily if any legacy code still references it before full migration.
export const API_BASE_URL = IS_PRODUCTION 
  ? 'https://nambac.xyz/api' 
  : 'http://localhost:8000/api';

/**
 * Returns the correct full URL for an image path.
 * In the serverless migration, all images are stored in Supabase Storage bucket 'quiz-images'.
 * Existing paths in DB are like `/images/filename.png`. We extract the filename and append it to Supabase URL.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Extract filename from legacy paths like "/images/logo.png" or "backend/data/images/foo.png"
  const filename = path.split('/').pop();
  
  // Create Supabase Public URL for the 'quiz-images' bucket
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uisuyexwijpaylkxlvfc.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/quiz-images/${filename}`;
};

/**
 * API 엔드포인트 헬퍼
 */
export const apiUrl = (endpoint) => {
    // endpoint가 /로 시작하면 그대로, 아니면 / 추가
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
