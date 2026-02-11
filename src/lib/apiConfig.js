/**
 * API Configuration - 환경변수 기반 API URL 관리
 * 개발: http://localhost:8000/api
 * 프로덕션: https://nambac.xyz/api
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * 이미지 URL 변환 헬퍼
 * 상대 경로를 절대 경로로 변환
 */
export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // API_BASE_URL에서 /api 제거하고 이미지 경로 추가
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
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
