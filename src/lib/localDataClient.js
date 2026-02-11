/**
 * Local Data Client - 로컬 JSON API와 통신하는 클라이언트
 * Supabase 대신 로컬 백엔드 API 사용
 */

import { API_BASE_URL } from './apiConfig';

class LocalDataClient {
  /**
   * API 요청 공통 메서드
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ========== Quizzes ==========

  /**
   * 모든 퀴즈 목록 조회
   */
  async getAllQuizzes() {
    const data = await this.request('/quizzes');
    return data.quizzes || [];
  }

  /**
   * 특정 퀴즈 조회
   */
  async getQuiz(quizId) {
    return await this.request(`/quizzes/${quizId}`);
  }

  /**
   * 퀴즈 생성 (AI로 퀴즈 생성)
   */
  async createQuiz(topic) {
    return await this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  /**
   * 퀴즈 수정
   */
  async updateQuiz(quizId, updates) {
    return await this.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * 퀴즈 삭제
   */
  async deleteQuiz(quizId) {
    return await this.request(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // ========== Questions ==========

  /**
   * 퀴즈별 질문 조회
   */
  async getQuestions(quizId) {
    const data = await this.request(`/quizzes/${quizId}/questions`);
    return data.questions || [];
  }

  /**
   * 질문 수정
   */
  async updateQuestion(questionId, updates) {
    return await this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * 질문 삭제
   */
  async deleteQuestion(questionId) {
    return await this.request(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // ========== Results ==========

  /**
   * 퀴즈별 결과 유형 조회
   */
  async getResults(quizId) {
    const data = await this.request(`/quizzes/${quizId}/results`);
    return data.results || [];
  }

  // ========== Mock 지원 (백엔드 없을 때) ==========

  /**
   * 로컬 데이터 사용 여부 확인
   */
  isUsingLocalData() {
    return process.env.USE_LOCAL_DATA === 'true' || !process.env.VITE_SUPABASE_URL;
  }
}

export const localDataClient = new LocalDataClient();

/**
 * 기존 Supabase와 호환되는 형태로 내보내기
 * 기존 코드를 최소한으로 수정하기 위함
 */
export const supabase = {
  from: (table) => ({
    select: () => {
      // 퀴즈 테이블
      if (table === 'quizzes') {
        return {
          eq: () => {
            return {
              single: async () => {
                // 단일 퀴즈 조회는 구현 필요
                return { data: null, error: new Error('Not implemented for local') };
              },
              order: () => {
                return {
                  data: localDataClient.getAllQuizzes().then(data => ({ data, error: null })),
                  error: null,
                };
              },
            };
          },
          order: () => {
            return {
              then: async (callback) => {
                const data = await localDataClient.getAllQuizzes();
                callback({ data, error: null });
              },
            };
          },
        };
      }

      // 질문 테이블
      if (table === 'questions') {
        return {
          eq: (field, value) => {
            return {
              order: () => {
                return {
                  then: async (callback) => {
                    const quizId = value;
                    const data = await localDataClient.getQuestions(quizId);
                    callback({ data, error: null });
                  },
                };
              },
            };
          },
        };
      }

      // 결과 테이블
      if (table === 'quiz_results') {
        return {
          eq: (field, value) => {
            return {
              order: () => {
                return {
                  then: async (callback) => {
                    const quizId = value;
                    const data = await localDataClient.getResults(quizId);
                    callback({ data, error: null });
                  },
                };
              },
            };
          },
        };
      }

      return { data: [], error: null };
    },

    insert: (data) => {
      return {
        select: () => {
          return {
            single: async () => {
              // 퀴즈 삽입
              if (Array.isArray(data) && data.length > 0) {
                const quiz = data[0];
                if (quiz.title && !quiz.id) {
                  const result = await localDataClient.createQuiz(quiz.description || quiz.title);
                  return { data: result.quiz, error: null };
                }
              }
              return { data: null, error: new Error('Insert not implemented') };
            },
          };
        },
      };
    },

    update: (updates) => {
      return {
        eq: (field, value) => {
          return {
            then: async (callback) => {
              if (field === 'id') {
                // 질문 수정
                const result = await localDataClient.updateQuestion(value, updates);
                callback({ data: result, error: null });
              }
            },
          };
        },
      };
    },
  }),

  auth: {
    signInWithOAuth: () => {
      return Promise.resolve({ error: { message: 'Auth not implemented for local mode' } });
    },
  },
};

export default localDataClient;
