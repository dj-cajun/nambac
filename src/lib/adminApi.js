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

export function createAdminApi(adminKey = '') {
  const headers = () => adminHeaders(adminKey);

  return {
    async fetchAllQuizzes() {
      const data = await parseJson(await fetch(apiUrl('/admin/quizzes'), { headers: headers() }));
      return data.quizzes || [];
    },

    async fetchQuizBundle(quizId) {
      return parseJson(await fetch(apiUrl(`/admin/quizzes/${quizId}`), { headers: headers() }));
    },

    async updateQuizStatus(quizId, is_active, status) {
      await parseJson(await fetch(apiUrl(`/admin/quizzes/${quizId}`), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ action: 'status', is_active, status }),
      }));
    },

    async deleteQuiz(quizId) {
      await parseJson(await fetch(apiUrl(`/admin/quizzes/${quizId}`), {
        method: 'DELETE',
        headers: headers(),
      }));
    },

    async saveQuiz(quizId, { quiz, questions, results }) {
      await parseJson(await fetch(apiUrl(`/admin/quizzes/${quizId}`), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ quiz, questions, results }),
      }));
    },

    async deleteQuestion(quizId, questionId) {
      await parseJson(await fetch(apiUrl(`/admin/quizzes/${quizId}`), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ deleteQuestionId: questionId }),
      }));
    },

    async createQuiz(payload) {
      return parseJson(await fetch(apiUrl('/admin/quizzes'), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      }));
    },

    async fetchInquiries() {
      const data = await parseJson(await fetch(apiUrl('/admin/brand-inquiries'), { headers: headers() }));
      return data.inquiries || [];
    },

    async updateInquiryStatus(id, status) {
      await parseJson(await fetch(apiUrl('/admin/brand-inquiries'), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ id, status }),
      }));
    },

    async deleteInquiry(id) {
      await parseJson(await fetch(apiUrl('/admin/brand-inquiries'), {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      }));
    },

    async fetchAnalytics() {
      return parseJson(await fetch(apiUrl('/admin/analytics'), { headers: headers() }));
    },
  };
}

/** Upload image file to public/images (local dev API only) */
export async function uploadQuizImage(file, adminKey = '') {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const data = await parseJson(await fetch(apiUrl('/admin/upload'), {
    method: 'POST',
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ filename: file.name, data: base64 }),
  }));
  return data.path;
}
