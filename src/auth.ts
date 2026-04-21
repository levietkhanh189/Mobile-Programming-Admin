export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER';
};

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getUser = (): AdminUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
};

export const setAuth = (token: string, user: AdminUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthed = (): boolean => !!getToken();
