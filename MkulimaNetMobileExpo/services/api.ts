import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend base URL
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com/api';

// ─── Token helpers ─────────────────────────────────────────────────────────────

/** Fallback: read JWT token stored after username/password login */
async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

// ─── Core HTTP helper ──────────────────────────────────────────────────────────

/**
 * Make an authenticated HTTP request.
 * @param endpoint  - e.g. '/feed'
 * @param options   - standard fetch RequestInit
 * @param clerkToken - Clerk session token from useAuth().getToken()
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  clerkToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Prefer Clerk token, fall back to stored JWT
  const token = clerkToken ?? (await getStoredToken());
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── API factory ───────────────────────────────────────────────────────────────
// Each exported *Api object takes an optional clerkToken so the
// tabs can simply do:  feedApi(token).getFeed()

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (emailOrUsername: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    }),

  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) =>
    request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: (token?: string | null) => request<{ user: any }>('/auth/me', {}, token),
};

// ─── Feed ──────────────────────────────────────────────────────────────────────

export const feedApi = {
  getFeed: (token?: string | null, feedType: 'forYou' | 'following' = 'forYou', limit = 20, offset = 0) =>
    request<any[]>(`/feed?feedType=${feedType}&limit=${limit}&offset=${offset}`, {}, token),

  getTimeline: (token?: string | null) =>
    request<any[]>('/feed/timeline', {}, token),

  reactToPost: (postId: string, type: string, token?: string | null) =>
    request<any>(`/feed/${postId}/react`, { method: 'POST', body: JSON.stringify({ type }) }, token),

  savePost: (postId: string, token?: string | null) =>
    request<{ saved: boolean }>(`/feed/${postId}/save`, { method: 'POST' }, token),
};

// ─── Posts ─────────────────────────────────────────────────────────────────────

export const postsApi = {
  getPosts: (token?: string | null, page = 1, limit = 20) =>
    request<{ posts: any[]; hasMore: boolean }>(`/posts/feed?page=${page}&limit=${limit}`, {}, token),

  createPost: (data: { content: string; media?: string[]; postType?: string }, token?: string | null) =>
    request<any>('/posts', { method: 'POST', body: JSON.stringify(data) }, token),

  likePost: (postId: string, token?: string | null) =>
    request<any>(`/posts/${postId}/like`, { method: 'POST' }, token),

  reactToPost: (postId: string, type: string, token?: string | null) =>
    request<any>(`/posts/${postId}/react`, { method: 'POST', body: JSON.stringify({ type }) }, token),

  savePost: (postId: string, token?: string | null) =>
    request<any>(`/posts/${postId}/save`, { method: 'POST' }, token),

  addComment: (postId: string, content: string, token?: string | null) =>
    request<any>(`/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content }) }, token),

  deleteComment: (postId: string, commentId: string, token?: string | null) =>
    request<any>(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }, token),
};

// ─── Jobs ──────────────────────────────────────────────────────────────────────

export const jobsApi = {
  getJobs: (
    token?: string | null,
    params?: {
      page?: number;
      limit?: number;
      location?: string;
      type?: string;
      category?: string;
      minSalary?: number;
      maxSalary?: number;
      signal?: AbortSignal;
    }
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined && v !== 'signal')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ jobs: any[]; pagination: any }>(`/jobs${qs ? '?' + qs : ''}`, { 
      signal: params?.signal 
    }, token);
  },

  getJob: (id: string, token?: string | null) =>
    request<any>(`/jobs/${id}`, {}, token),

  searchJobs: (q: string, token?: string | null, filters?: Record<string, string>) => {
    const qs = new URLSearchParams({ q, ...filters }).toString();
    return request<{ jobs: any[]; pagination: any }>(`/jobs/search?${qs}`, {}, token);
  },

  applyToJob: (jobId: string, data: { message?: string; cvUrl?: string }, token?: string | null) =>
    request<any>(`/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }, token),

  getMyApplications: (token?: string | null) =>
    request<any[]>('/jobs/applications/user', {}, token),

  getJobApplications: (jobId: string, token?: string | null) =>
    request<any[]>(`/jobs/applications/${jobId}`, {}, token),

  postJob: (
    data: {
      title: string;
      companyName: string;
      location: any;
      jobType: string;
      category: string;
      salary?: any;
      requiredSkills?: string[];
      experienceRequired?: string;
      description: string;
      deadline: string;
    },
    token?: string | null
  ) =>
    request<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }, token),

  getDashboardStats: (token?: string | null) =>
    request<any>('/jobs/dashboard/stats', {}, token),
};

// ─── Marketplace / Products ───────────────────────────────────────────────────

export const productsApi = {
  getProducts: (
    token?: string | null,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sortBy?: string;
    }
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ products: any[]; pagination: any }>(`/products${qs ? '?' + qs : ''}`, {}, token);
  },

  getProduct: (id: string, token?: string | null) =>
    request<any>(`/products/${id}`, {}, token),

  createProduct: (
    data: {
      name: string;
      description: string;
      category: string;
      price: number;
      quantity?: number;
      unit?: string;
      condition?: string;
      location?: any;
      images?: string[];
    },
    token?: string | null
  ) =>
    request<any>('/products', { method: 'POST', body: JSON.stringify(data) }, token),

  updateProduct: (id: string, data: any, token?: string | null) =>
    request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  deleteProduct: (id: string, token?: string | null) =>
    request<any>(`/products/${id}`, { method: 'DELETE' }, token),

  getMyProducts: (token?: string | null) =>
    request<any[]>('/products/seller/my-listings', {}, token),
};

// ─── Wallet ────────────────────────────────────────────────────────────────────

export const walletApi = {
  getWallet: (token?: string | null) =>
    request<{ wallet: any; recentTransactions: any[] }>('/wallet', {}, token),

  getBalance: (token?: string | null) =>
    request<{ balance: number; availableBalance: number; pendingBalance: number; currency: string }>(
      '/wallet/balance',
      {},
      token
    ),

  getTransactions: (token?: string | null, page = 1, limit = 20) =>
    request<{ transactions: any[]; pagination: any }>(
      `/wallet/transactions?page=${page}&limit=${limit}`,
      {},
      token
    ),

  deposit: (amount: number, paymentMethod: 'mpesa' | 'card' | 'bank', token?: string | null, phoneNumber?: string) =>
    request<{ success: boolean; transaction: any }>(
      '/wallet/deposit',
      { method: 'POST', body: JSON.stringify({ amount, paymentMethod, phoneNumber }) },
      token
    ),

  withdraw: (amount: number, destination: string, pin: string, token?: string | null) =>
    request<{ success: boolean; transaction: any }>(
      '/wallet/withdraw',
      { method: 'POST', body: JSON.stringify({ amount, destination, pin }) },
      token
    ),

  transfer: (amount: number, recipientAccount: string, pin: string, token?: string | null, description?: string) =>
    request<{ success: boolean; transaction: any }>(
      '/wallet/transfer',
      { method: 'POST', body: JSON.stringify({ amount, recipientAccount, pin, description }) },
      token
    ),

  setPin: (pin: string, token?: string | null) =>
    request<{ success: boolean }>(
      '/wallet/pin',
      { method: 'POST', body: JSON.stringify({ pin }) },
      token
    ),
};

// ─── Messages ──────────────────────────────────────────────────────────────────

export const messagesApi = {
  getConversations: (token?: string | null) =>
    request<any[]>('/messages/conversations', {}, token),

  getMessages: (conversationId: string, token?: string | null, page = 1) =>
    request<{ messages: any[]; pagination: any }>(`/messages/${conversationId}?page=${page}`, {}, token),

  sendMessage: (conversationId: string, content: string, token?: string | null, type = 'text') =>
    request<any>(
      `/messages/${conversationId}`,
      { method: 'POST', body: JSON.stringify({ content, type }) },
      token
    ),

  startConversation: (recipientId: string, message: string, token?: string | null) =>
    request<any>(
      '/messages/start',
      { method: 'POST', body: JSON.stringify({ recipientId, message }) },
      token
    ),
};

// ─── Profile ───────────────────────────────────────────────────────────────────

export const profileApi = {
  getProfile: (token?: string | null, userId?: string) =>
    request<any>(userId ? `/profile/${userId}` : '/profile/me', {}, token),

  updateProfile: (
    data: {
      firstName?: string;
      lastName?: string;
      farmName?: string;
      bio?: string;
      location?: any;
      profilePicture?: string;
      phone?: string;
    },
    token?: string | null
  ) =>
    request<any>('/profile/update', { method: 'PUT', body: JSON.stringify(data) }, token),
};

// ─── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  getNotifications: (token?: string | null) =>
    request<any[]>('/notifications', {}, token),

  markRead: (notificationId: string, token?: string | null) =>
    request<any>(`/notifications/${notificationId}/read`, { method: 'PUT' }, token),

  markAllRead: (token?: string | null) =>
    request<any>('/notifications/read-all', { method: 'PUT' }, token),
};

// ─── Follow ────────────────────────────────────────────────────────────────────

export const followApi = {
  follow: (userId: string, token?: string | null) =>
    request<any>(`/follow/${userId}`, { method: 'POST' }, token),

  unfollow: (userId: string, token?: string | null) =>
    request<any>(`/follow/${userId}`, { method: 'DELETE' }, token),

  getFollowers: (userId: string, token?: string | null) =>
    request<any[]>(`/follow/${userId}/followers`, {}, token),

  getFollowing: (userId: string, token?: string | null) =>
    request<any[]>(`/follow/${userId}/following`, {}, token),
};

export default {
  auth: authApi,
  feed: feedApi,
  posts: postsApi,
  jobs: jobsApi,
  products: productsApi,
  wallet: walletApi,
  messages: messagesApi,
  profile: profileApi,
  notifications: notificationsApi,
  follow: followApi,
};
