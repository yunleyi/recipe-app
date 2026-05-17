import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitch: () => void;
}

export function AuthModal({ mode, onClose, onSwitch }: AuthModalProps) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      result = await register(form.username, form.email, form.password);
    }

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? '登录账号' : '注册账号'}
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {mode === 'login' ? '欢迎回来，继续探索美食' : '创建账号，开始你的美食之旅'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">用户名</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="给自己起个名字"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">邮箱</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="至少 6 位"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-[14px] font-medium transition-colors"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitch}
              className="text-[13px] text-gray-500 hover:text-orange-500 transition-colors"
            >
              {mode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
