import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/recipe';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'recipe_app_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isLoggedIn: false,
    isAdmin: false,
  });

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAuth({
          user: data.user,
          token: data.token,
          isLoggedIn: true,
          isAdmin: data.user?.role === 'admin',
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // 监听 token 过期事件（来自 api.ts 自动刷新失败时）
    const handleAuthExpired = () => {
      localStorage.removeItem(STORAGE_KEY);
      setAuth({
        user: null,
        token: null,
        isLoggedIn: false,
        isAdmin: false,
      });
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (account: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!account || !password) {
      return { success: false, message: '请填写账号和密码' };
    }

    try {
      const result = await authApi.login(account, password);
      if (result.code !== 0) {
        return { success: false, message: result.message || '登录失败' };
      }

      const { token, refreshToken, user: userData } = result.data;
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role as 'user' | 'admin',
        createdAt: new Date().toISOString(),
      };

      const authData = { user, token, refreshToken };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      setAuth({
        user,
        token,
        isLoggedIn: true,
        isAdmin: user.role === 'admin',
      });

      return { success: true, message: '登录成功' };
    } catch (err) {
      console.error('登录失败:', err);
      return { success: false, message: '网络错误，请检查服务是否启动' };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !email || !password) {
      return { success: false, message: '请填写所有字段' };
    }
    if (username.length < 2 || username.length > 20) {
      return { success: false, message: '用户名 2-20 个字符' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: '请输入有效的邮箱' };
    }
    if (password.length < 6) {
      return { success: false, message: '密码至少 6 位' };
    }

    try {
      const result = await authApi.register(username, email, password);
      if (result.code !== 0) {
        return { success: false, message: result.message || '注册失败' };
      }

      const { token, refreshToken, user: userData } = result.data;
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role as 'user' | 'admin',
        createdAt: new Date().toISOString(),
      };

      const authData = { user, token, refreshToken };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      setAuth({
        user,
        token,
        isLoggedIn: true,
        isAdmin: false,
      });

      return { success: true, message: '注册成功' };
    } catch (err) {
      console.error('注册失败:', err);
      return { success: false, message: '网络错误，请检查服务是否启动' };
    }
  };

  const logout = () => {
    // 通知后端清除 refresh token
    authApi.logout().catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    setAuth({
      user: null,
      token: null,
      isLoggedIn: false,
      isAdmin: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
