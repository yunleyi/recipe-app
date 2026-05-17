import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/recipe';

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
  }, []);

  // 模拟登录（后续对接真实 API）
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 简单的客户端验证
    if (!email || !password) {
      return { success: false, message: '请填写邮箱和密码' };
    }
    if (!email.includes('@')) {
      return { success: false, message: '请输入有效的邮箱' };
    }
    if (password.length < 6) {
      return { success: false, message: '密码至少 6 位' };
    }

    // 模拟登录成功
    const user: User = {
      id: 'user_' + Date.now(),
      username: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    const token = 'mock_token_' + Date.now();

    const authData = { user, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    setAuth({
      user,
      token,
      isLoggedIn: true,
      isAdmin: user.role === 'admin',
    });

    return { success: true, message: '登录成功' };
  };

  // 模拟注册
  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 验证
    if (!username || !email || !password) {
      return { success: false, message: '请填写所有字段' };
    }
    if (username.length < 2 || username.length > 20) {
      return { success: false, message: '用户名 2-20 个字符' };
    }
    if (!email.includes('@')) {
      return { success: false, message: '请输入有效的邮箱' };
    }
    if (password.length < 6) {
      return { success: false, message: '密码至少 6 位' };
    }

    // 模拟注册成功，自动登录
    const user: User = {
      id: 'user_' + Date.now(),
      username,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    const token = 'mock_token_' + Date.now();

    const authData = { user, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    setAuth({
      user,
      token,
      isLoggedIn: true,
      isAdmin: false,
    });

    return { success: true, message: '注册成功' };
  };

  // 登出
  const logout = () => {
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
