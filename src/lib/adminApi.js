import { apiUrl } from './apiConfig';

function adminHeaders(adminKey) {
  const headers = { 'Content-Type': 'application/json' };
  if (adminKey) headers['X-Admin-Key'] = adminKey;
  return headers;
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function adminFetch(url, adminKey, init = {}) {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { ...adminHeaders(adminKey), ...(init.headers || {}) },
  });
  return parseJson(res);
}

export function createAdminApi(adminKey = '') {
  return {
    async fetchAllQuizzes() {
      const data = await adminFetch(apiUrl('/admin/quizzes'), adminKey);
      return data.quizzes || [];
    },

    async fetchQuizBundle(quizId) {
      return adminFetch(apiUrl(`/admin/quizzes/${quizId}`), adminKey);
    },

    async generateQuizContent(categoryId, customTopic = '') {
      return adminFetch(apiUrl('/admin/generate-quiz-content'), adminKey, {
        method: 'POST',
        body: JSON.stringify({ categoryId, customTopic }),
      });
    },

    async updateQuizStatus(quizId, is_active, status) {
      await adminFetch(apiUrl(`/admin/quizzes/${quizId}`), adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'status', is_active, status }),
      });
    },

    async deleteQuiz(quizId) {
      await adminFetch(apiUrl(`/admin/quizzes/${quizId}`), adminKey, { method: 'DELETE' });
    },

    async saveQuiz(quizId, { quiz, questions, results }) {
      await adminFetch(apiUrl(`/admin/quizzes/${quizId}`), adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ quiz, questions, results }),
      });
    },

    async deleteQuestion(quizId, questionId) {
      await adminFetch(apiUrl(`/admin/quizzes/${quizId}`), adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ deleteQuestionId: questionId }),
      });
    },

    async createQuiz(payload) {
      return adminFetch(apiUrl('/admin/quizzes'), adminKey, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async generateQuizImages(payload) {
      return adminFetch(apiUrl('/admin/generate-quiz-images'), adminKey, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async generateArchetypeQuiz(archetypeId, { generateImages = true } = {}) {
      return adminFetch(apiUrl('/admin/generate-archetype-quiz'), adminKey, {
        method: 'POST',
        body: JSON.stringify({ archetypeId, generateImages }),
      });
    },

    async fetchInquiries() {
      const data = await adminFetch(apiUrl('/admin/brand-inquiries'), adminKey);
      return data.inquiries || [];
    },

    async updateInquiryStatus(id, status) {
      await adminFetch(apiUrl('/admin/brand-inquiries'), adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      });
    },

    async deleteInquiry(id) {
      await adminFetch(apiUrl('/admin/brand-inquiries'), adminKey, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
    },

    async fetchAnalytics() {
      return adminFetch(apiUrl('/admin/analytics'), adminKey);
    },

    async fetchUsers({ search = '', role = 'all', limit, offset } = {}) {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role && role !== 'all') params.set('role', role);
      if (limit) params.set('limit', String(limit));
      if (offset) params.set('offset', String(offset));
      const qs = params.toString();
      return adminFetch(apiUrl(`/admin/users${qs ? `?${qs}` : ''}`), adminKey);
    },

    async updateUser(userId, patch) {
      const data = await adminFetch(apiUrl('/admin/users'), adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ id: userId, ...patch }),
      });
      return data.user;
    },

    async updateUserRole(userId, role) {
      return this.updateUser(userId, { role });
    },
  };
}

export async function uploadQuizImage(file, adminKey = '') {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const data = await adminFetch(apiUrl('/admin/upload'), adminKey, {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, data: base64 }),
  });
  return data.path;
}
