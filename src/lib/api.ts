/**
 * API 请求封装层
 * 所有后端请求都通过这里发起，自动处理 token 注入和错误处理
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AUTH_KEY = 'recipe_app_auth';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.token || null;
    }
  } catch {}
  return null;
}

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  return json as ApiResponse<T>;
}

// ────────────────────────────────────────────────
// 认证 API
// ────────────────────────────────────────────────
export const authApi = {
  login: (account: string, password: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; username: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ account, password }) }
    ),

  register: (username: string, email: string, password: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; username: string; email: string; role: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ username, email, password }) }
    ),

  logout: () => request('/auth/logout', { method: 'POST' }),

  refresh: (refreshToken: string) =>
    request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
};

// ────────────────────────────────────────────────
// 用户 API
// ────────────────────────────────────────────────
export const userApi = {
  getMe: () => request<{ id: string; username: string; email: string; role: string; createdAt: string }>('/user/me'),

  updateProfile: (username: string) =>
    request('/user/profile', { method: 'PUT', body: JSON.stringify({ username }) }),

  updatePassword: (oldPassword: string, newPassword: string) =>
    request('/user/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

  getFavorites: (page = 1, pageSize = 50) =>
    request<{ list: unknown[]; total: number }>(`/user/favorites?page=${page}&pageSize=${pageSize}`),

  getFolders: () =>
    request<{ id: string; name: string; createdAt: string }[]>('/user/folders'),

  createFolder: (name: string) =>
    request<{ id: string; name: string; createdAt: string }>('/user/folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteFolder: (id: string) =>
    request(`/user/folders/${id}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// 菜谱 API
// ────────────────────────────────────────────────
interface RecipeListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  difficulty?: string;
  isFavorite?: boolean;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export const recipesApi = {
  list: (params: RecipeListParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.category) q.set('category', params.category);
    if (params.difficulty) q.set('difficulty', params.difficulty);
    if (params.isFavorite) q.set('isFavorite', 'true');
    if (params.orderBy) q.set('orderBy', params.orderBy);
    if (params.order) q.set('order', params.order);
    return request<{ list: unknown[]; total: number; page: number; pageSize: number }>(
      `/recipes?${q.toString()}`
    );
  },

  get: (id: string) => request<unknown>(`/recipes/${id}`),

  search: (q: string, page = 1, pageSize = 20) =>
    request<{ list: unknown[]; total: number; keyword: string }>(
      `/recipes/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
    ),

  create: (data: unknown) =>
    request<unknown>('/recipes', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: unknown) =>
    request<unknown>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  patch: (id: string, data: unknown) =>
    request<unknown>(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/recipes/${id}`, { method: 'DELETE' }),

  favorite: (id: string, folderId?: string) =>
    request<{ isFavorite: boolean; folderId: string }>(`/recipes/${id}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ folderId }),
    }),

  unfavorite: (id: string) =>
    request<{ isFavorite: boolean }>(`/recipes/${id}/favorite`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// 分类 API
// ────────────────────────────────────────────────
export const categoriesApi = {
  list: () => request<{ name: string; count: number }[]>('/categories'),
};

// ────────────────────────────────────────────────
// 上传 API
// ────────────────────────────────────────────────
export const uploadApi = {
  image: async (file: File): Promise<ApiResponse<{ url: string; filename: string; size: number }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return response.json();
  },
};

export default request;
