import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { X, Shield, Users, ChefHat, Clock, Check, Ban, Loader2, TrendingUp } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

type Tab = 'stats' | 'users' | 'review';

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalRecipes: number;
    pendingRecipes: number;
    todayRecipes: number;
    categoryStats: { name: string; count: number }[];
  } | null>(null);
  const [users, setUsers] = useState<{
    list: { id: string; username: string; email: string; role: string; recipeCount: number; createdAt: string }[];
    total: number;
  } | null>(null);
  const [pending, setPending] = useState<{
    list: { id: string; name: string; description: string; coverImage: string; category: string; difficulty: string; authorId: string; authorName: string; status: string; createdAt: string }[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'stats') {
        const res = await adminApi.getStats();
        if (res.code === 0) setStats(res.data);
      } else if (tab === 'users') {
        const res = await adminApi.getUsers();
        if (res.code === 0) setUsers(res.data);
      } else if (tab === 'review') {
        const res = await adminApi.getPending();
        if (res.code === 0) setPending(res.data);
      }
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveRecipe(id);
      loadData();
    } catch (err) {
      console.error('审核失败:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.rejectRecipe(id);
      loadData();
    } catch (err) {
      console.error('拒绝失败:', err);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateUserRole(userId, newRole);
      loadData();
    } catch (err) {
      console.error('更新失败:', err);
    }
  };

  const difficultyMap: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-orange-500" />
            <h3 className="text-[16px] font-semibold text-gray-900">管理后台</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          {[
            { key: 'stats' as Tab, label: '数据概览', icon: TrendingUp },
            { key: 'users' as Tab, label: '用户管理', icon: Users },
            { key: 'review' as Tab, label: '菜谱审核', icon: ChefHat },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : tab === 'stats' && stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '总用户数', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-500' },
                  { label: '总菜谱数', value: stats.totalRecipes, icon: ChefHat, color: 'bg-green-50 text-green-500' },
                  { label: '待审核', value: stats.pendingRecipes, icon: Clock, color: 'bg-orange-50 text-orange-500' },
                  { label: '今日新增', value: stats.todayRecipes, icon: TrendingUp, color: 'bg-purple-50 text-purple-500' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                    <div className={`inline-flex p-2 rounded-lg ${item.color} mb-2`}>
                      <item.icon size={18} />
                    </div>
                    <div className="text-[22px] font-bold text-gray-900">{item.value}</div>
                    <div className="text-[12px] text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
              {/* 分类统计 */}
              {stats.categoryStats.length > 0 && (
                <div>
                  <h4 className="text-[14px] font-medium text-gray-700 mb-2">分类统计</h4>
                  <div className="space-y-2">
                    {stats.categoryStats.map(c => {
                      const maxCount = Math.max(...stats.categoryStats.map(s => s.count));
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <span className="text-[13px] text-gray-600 w-16 flex-shrink-0">{c.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-orange-400 h-2 rounded-full transition-all"
                              style={{ width: `${maxCount > 0 ? (c.count / maxCount) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[12px] text-gray-500 w-8 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : tab === 'users' && users ? (
            <div className="space-y-2">
              {users.list.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-gray-900 truncate">{u.username}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </div>
                    <div className="text-[12px] text-gray-400 truncate">{u.email} · {u.recipeCount} 道菜谱</div>
                  </div>
                  <button
                    onClick={() => handleToggleRole(u.id, u.role)}
                    className={`px-2.5 py-1 text-[12px] rounded-lg border transition-colors ${
                      u.role === 'admin'
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {u.role === 'admin' ? '设为用户' : '设为管理员'}
                  </button>
                </div>
              ))}
              {users.list.length === 0 && (
                <div className="text-center py-8 text-[14px] text-gray-400">暂无用户数据</div>
              )}
            </div>
          ) : tab === 'review' && pending ? (
            <div className="space-y-2">
              {pending.list.map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    {r.coverImage ? (
                      <img src={r.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <ChefHat size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-medium text-gray-900">{r.name}</span>
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded-full">{r.category}</span>
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded-full">{difficultyMap[r.difficulty] || r.difficulty}</span>
                      </div>
                      <div className="text-[12px] text-gray-400 mt-0.5">
                        作者: {r.authorName} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </div>
                      {r.description && (
                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="通过"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="拒绝"
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pending.list.length === 0 && (
                <div className="text-center py-8 text-[14px] text-gray-400">
                  <Check size={32} className="text-green-300 mx-auto mb-2" />
                  没有待审核的菜谱
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
