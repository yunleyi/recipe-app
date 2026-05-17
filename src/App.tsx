import { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import { RecipeCard } from '@/sections/RecipeCard';
import { RecipeDetail } from '@/sections/RecipeDetail';
import { RecipeDetailPage } from '@/sections/RecipeDetailPage';
import { RecipeForm } from '@/sections/RecipeForm';
import { AuthModal } from '@/sections/AuthModal';
import type { Recipe, RecipeFormData, Category } from '@/types/recipe';
import { CATEGORIES } from '@/lib/recipeData';
import {
  Search, Plus, BookOpen, Heart, ChefHat, LayoutGrid, User, LogOut, Shield, ChevronRight,
} from 'lucide-react';

type Page = 'recipes' | 'favorites';
type MobileTab = 'home' | 'my';

export default function App() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite } = useRecipes();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const [page, setPage] = useState<Page>('recipes');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const [mobileViewRecipe, setMobileViewRecipe] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    let list = page === 'favorites' ? recipes.filter(r => r.isFavorite) : recipes;
    if (selectedCategory !== 'all') list = list.filter(r => r.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)) ||
          r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [recipes, page, selectedCategory, search]);

  const handleSave = (data: RecipeFormData) => {
    if (editRecipe) {
      updateRecipe(editRecipe.id, data);
      setViewRecipe({ ...editRecipe, ...data, updatedAt: new Date().toISOString() });
      setEditRecipe(null);
    } else {
      const r = addRecipe(data);
      setShowForm(false);
      setViewRecipe(r);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteRecipe(deleteConfirm);
      setDeleteConfirm(null);
      setViewRecipe(null);
      setMobileViewRecipe(null);
    }
  };

  // 点击菜谱卡片：移动端打开全屏页面，桌面端打开弹窗
  const handleCardClick = (recipe: Recipe) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setMobileViewRecipe(recipe);
    } else {
      setViewRecipe(recipe);
    }
  };

  // 点击收藏（来自移动端全屏页面）
  const handleMobileFavorite = () => {
    if (mobileViewRecipe) {
      toggleFavorite(mobileViewRecipe.id);
    }
  };

  // 点击编辑（来自移动端全屏页面）
  const handleMobileEdit = () => {
    if (mobileViewRecipe) {
      setEditRecipe(mobileViewRecipe);
      setMobileViewRecipe(null);
    }
  };

  // 点击删除（来自移动端全屏页面）
  const handleMobileDelete = () => {
    if (mobileViewRecipe) {
      setDeleteConfirm(mobileViewRecipe.id);
      setMobileViewRecipe(null);
    }
  };

  const favoriteCount = recipes.filter(r => r.isFavorite).length;

  return (
    <div className="min-h-screen bg-[#faf9f7] flex">

      {/* ── 左侧边栏 ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-[180px] bg-white border-r border-gray-100 flex flex-col z-30 hidden md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen size={15} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-gray-900">我的菜谱</span>
        </div>

        {/* 导航 - 全部菜谱 + 我的收藏 放在底部 */}
        <nav className="mt-auto px-3 py-4 space-y-1">
          <button
            onClick={() => { setPage('recipes'); setSelectedCategory('all'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
              page === 'recipes' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <LayoutGrid size={16} />
            全部菜谱
            <span className={`ml-auto text-[12px] rounded-full px-1.5 py-0.5 ${page === 'recipes' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
              {recipes.length}
            </span>
          </button>

          <button
            onClick={() => setPage('favorites')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
              page === 'favorites' ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Heart size={16} className={page === 'favorites' ? 'fill-red-400' : ''} />
            我的收藏
            {favoriteCount > 0 && (
              <span className={`ml-auto text-[12px] rounded-full px-1.5 py-0.5 ${page === 'favorites' ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-400'}`}>
                {favoriteCount}
              </span>
            )}
          </button>
        </nav>
      </aside>

      {/* ── 右侧主区域 ── */}
      <div className="flex-1 md:ml-[180px] min-w-0 flex flex-col">

        {/* 顶部搜索栏 */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* 移动端 Logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <BookOpen size={13} className="text-white" />
              </div>
            </div>

            {/* 搜索框 - 仅首页显示 */}
            {mobileTab === 'home' && (
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent text-[14px] outline-none text-gray-700 placeholder:text-gray-400"
                  placeholder="搜索菜名、食材、标签…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 text-[12px]">✕</button>
                )}
              </div>
            )}

            {/* 桌面端按钮 */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {isLoggedIn ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-medium transition-colors"
                >
                  <Plus size={15} />
                  <span>新建菜谱</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth('login')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-xl text-[13px] font-medium transition-colors"
                >
                  <User size={15} />
                  <span>登录/注册</span>
                </button>
              )}
            </div>
          </div>

          {/* 分类横向滚动 - 仅桌面端和首页显示 */}
          {mobileTab === 'home' && (
            <div className="max-w-5xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {CATEGORIES.map(cat => {
                const count = recipes.filter(r => r.category === cat && (page === 'favorites' ? r.isFavorite : true)).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                    {count > 0 && <span className={`ml-1 text-[11px] ${selectedCategory === cat ? 'text-orange-100' : 'text-gray-400'}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* 页面内容 */}
        <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full pb-28 md:pb-6">
          {mobileTab === 'home' ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-[18px] font-semibold text-gray-900 flex items-center gap-2">
                    {page === 'favorites' ? (
                      <><Heart size={18} className="text-red-400 fill-red-400" /> 收藏菜谱</>
                    ) : (
                      <><ChefHat size={18} className="text-orange-500" /> {selectedCategory === 'all' ? '全部菜谱' : selectedCategory}</>
                    )}
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {search
                      ? `"${search}" 的搜索结果 · ${filtered.length} 道`
                      : `共 ${filtered.length} 道菜谱`}
                  </p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">{page === 'favorites' ? '🤍' : '🍽️'}</div>
                  <p className="text-gray-400 text-[14px]">
                    {page === 'favorites'
                      ? '还没有收藏任何菜谱，快去收藏吧！'
                      : search
                      ? `没有找到关于「${search}」的菜谱`
                      : '还没有菜谱，快来添加第一道吧！'}
                  </p>
                  {page !== 'favorites' && !search && (
                    <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-[14px] hover:bg-orange-600">
                      + 添加菜谱
                    </button>
                  )}
                  {page === 'favorites' && (
                    <button onClick={() => setPage('recipes')} className="mt-4 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-[14px] hover:bg-gray-50">
                      去浏览菜谱
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={handleCardClick}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 「我的」页面 */
            <div className="pb-32">
              {/* 用户卡片 */}
              <div className="bg-white rounded-2xl p-5 mb-4">
                {isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                      <User size={24} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[16px] font-semibold text-gray-900">{user?.username}</h2>
                        {isAdmin && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-[11px] rounded-full">
                            <Shield size={10} /> 管理员
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-400 mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={14} />
                      退出
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <User size={28} className="text-gray-300" />
                    </div>
                    <p className="text-[14px] text-gray-500 mb-3">登录后享受更多功能</p>
                    <button
                      onClick={() => setShowAuth('login')}
                      className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[14px] font-medium transition-colors"
                    >
                      登录 / 注册
                    </button>
                  </div>
                )}
              </div>

              {/* 收藏列表 - 可折叠 */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFavoritesExpanded(!favoritesExpanded)}
                  className="w-full px-5 py-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Heart size={16} className="text-red-400 fill-red-400" />
                  <h3 className="text-[15px] font-semibold text-gray-900">我的收藏</h3>
                  {favoriteCount > 0 && (
                    <span className="ml-auto text-[12px] text-gray-400">{favoriteCount} 道菜谱</span>
                  )}
                  <ChevronRight size={16} className={`text-gray-300 transition-transform ${favoritesExpanded ? 'rotate-90' : ''}`} />
                </button>

                {favoritesExpanded && (
                  <div className="border-t border-gray-100">
                    {favoriteCount === 0 ? (
                      <div className="py-12 text-center">
                        <div className="text-4xl mb-3">🤍</div>
                        <p className="text-[14px] text-gray-400">还没有收藏任何菜谱</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {recipes.filter(r => r.isFavorite).map(recipe => (
                          <button
                            key={recipe.id}
                            onClick={() => handleCardClick(recipe)}
                            className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                              {recipe.coverImage ? <img src={recipe.coverImage} alt="" className="w-full h-full object-cover" /> : '🍽️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-medium text-gray-900 truncate">{recipe.name}</h4>
                              <p className="text-[12px] text-gray-400 truncate">{recipe.category}</p>
                            </div>
                            <Heart size={14} className="text-red-400 fill-red-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 移动端底部任务栏 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-3 z-40 flex items-center justify-between">
          {/* 左侧：首页 */}
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center gap-0.5 px-6 py-2 ${mobileTab === 'home' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <LayoutGrid size={22} />
            <span className="text-[11px] font-medium">首页</span>
          </button>

          {/* 中间：新建按钮 */}
          {isLoggedIn ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-12 h-12 -mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-colors"
            >
              <Plus size={24} />
            </button>
          ) : (
            <button
              onClick={() => setShowAuth('login')}
              className="w-12 h-12 -mt-6 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus size={24} />
            </button>
          )}

          {/* 右侧：我的 */}
          <button
            onClick={() => setMobileTab('my')}
            className={`flex flex-col items-center gap-0.5 px-6 py-2 ${mobileTab === 'my' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <User size={22} />
            <span className="text-[11px] font-medium">我的</span>
          </button>
        </div>
      </div>

      {/* 移动端全屏详情页 */}
      {mobileViewRecipe && !editRecipe && (
        <div className="md:hidden">
          <RecipeDetailPage
            recipe={recipes.find(r => r.id === mobileViewRecipe.id) ?? mobileViewRecipe}
            onBack={() => setMobileViewRecipe(null)}
            onEdit={handleMobileEdit}
            onDelete={handleMobileDelete}
            onFavorite={handleMobileFavorite}
          />
        </div>
      )}

      {/* Recipe Detail Modal - 桌面端 */}
      {viewRecipe && !editRecipe && !mobileViewRecipe && (
        <div className="hidden md:block">
          <RecipeDetail
            recipe={recipes.find(r => r.id === viewRecipe.id) ?? viewRecipe}
            onClose={() => setViewRecipe(null)}
            onEdit={() => setEditRecipe(viewRecipe)}
            onDelete={() => setDeleteConfirm(viewRecipe.id)}
            onFavorite={() => toggleFavorite(viewRecipe.id)}
          />
        </div>
      )}

      {/* Edit Form */}
      {editRecipe && (
        <RecipeForm initial={editRecipe} onSave={handleSave} onCancel={() => setEditRecipe(null)} />
      )}

      {/* New Recipe Form */}
      {showForm && !editRecipe && (
        <RecipeForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-xs w-full text-center">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">删除菜谱</h3>
            <p className="text-[13px] text-gray-500 mb-5">删除后无法恢复，确定要删除这道菜谱吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[14px] text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-medium">删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          mode={showAuth}
          onClose={() => setShowAuth(null)}
          onSwitch={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')}
        />
      )}
    </div>
  );
}
