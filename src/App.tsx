import { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteFolders } from '@/hooks/useFavoriteFolders';
import { RecipeCard } from '@/sections/RecipeCard';
import { RecipeDetail } from '@/sections/RecipeDetail';
import { RecipeDetailPage } from '@/sections/RecipeDetailPage';
import { RecipeForm } from '@/sections/RecipeForm';
import { AuthModal } from '@/sections/AuthModal';
import type { Recipe, RecipeFormData, Category } from '@/types/recipe';
import { CATEGORIES } from '@/lib/recipeData';
import {
  Search, Plus, BookOpen, Heart, ChefHat, LayoutGrid, User, LogOut, Shield,
  FolderHeart, BookMarked, X, Check, FolderPlus, Settings, SlidersHorizontal,
  UserCircle, Palette, Tag, Globe,
} from 'lucide-react';

type Page = 'recipes' | 'favorites';
type MobileTab = 'home' | 'my';

export default function App() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite } = useRecipes();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { folders, addFolder, deleteFolder } = useFavoriteFolders();

  const [page, setPage] = useState<Page>('recipes');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [mobileViewRecipe, setMobileViewRecipe] = useState<Recipe | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState<string | null>(null); // 正在选择收藏夹的菜谱ID
  const [myPageTab, setMyPageTab] = useState<'recipes' | 'favorites'>('recipes');
  const [selectedFolder, setSelectedFolder] = useState<string>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'general' | 'common' | 'category'>('profile');

  // 设置相关状态
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('zh-CN');
  const [gridColumns, setGridColumns] = useState<'2' | '3' | '4'>('3');
  const [avatarColor, setAvatarColor] = useState('bg-orange-100');

  // 分类显示设置
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);

  // 头像颜色选项
  const avatarColors = [
    { name: 'bg-orange-100', text: 'text-orange-600' },
    { name: 'bg-blue-100', text: 'text-blue-600' },
    { name: 'bg-green-100', text: 'text-green-600' },
    { name: 'bg-purple-100', text: 'text-purple-600' },
    { name: 'bg-pink-100', text: 'text-pink-600' },
    { name: 'bg-yellow-100', text: 'text-yellow-600' },
  ];

  // 加载保存的设置
  useMemo(() => {
    const saved = localStorage.getItem('user_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
        if (settings.compactMode !== undefined) setCompactMode(settings.compactMode);
        if (settings.autoSave !== undefined) setAutoSave(settings.autoSave);
        if (settings.gridColumns !== undefined) setGridColumns(settings.gridColumns);
        if (settings.hiddenCategories !== undefined) setHiddenCategories(settings.hiddenCategories);
        if (settings.displayName !== undefined) setDisplayName(settings.displayName);
        if (settings.avatarColor !== undefined) setAvatarColor(settings.avatarColor);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // 网格列数辅助函数
  const getGridClass = (baseGap: string = 'gap-4') => {
    const cols = { '2': { sm: 'sm:grid-cols-2', lg: 'lg:grid-cols-3' }, '3': { sm: 'sm:grid-cols-3', lg: 'lg:grid-cols-4' }, '4': { sm: 'sm:grid-cols-4', lg: 'lg:grid-cols-5' } };
    const c = cols[gridColumns];
    return `grid grid-cols-2 ${c.sm} ${c.lg} ${baseGap}`;
  };

  // 搜索提交
  const handleSearch = () => {
    // 搜索已经在 input 的 onChange 中实时过滤，这里可以加个确认动作
    // 或者用于移动端回车搜索
  };

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

  // 收藏到指定收藏夹
  const handleFavorite = (id: string, folderId: string) => {
    toggleFavorite(id, folderId);
    setShowFolderPicker(null);
  };

  // 创建新收藏夹
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  // 获取当前用户创建的菜谱
  const userRecipes = useMemo(() => {
    if (!user) return [];
    return recipes.filter(r => r.userId === user.id);
  }, [recipes, user]);

  // 获取指定收藏夹的菜谱
  const folderRecipes = useMemo(() => {
    return recipes.filter(r => r.isFavorite && (r.favoriteFolderId || 'default') === selectedFolder);
  }, [recipes, selectedFolder]);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''} ${compactMode ? 'compact-mode' : ''}`}>

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

            {/* 搜索框 - 桌面端始终显示，移动端仅首页显示 */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-[14px] outline-none text-gray-700 placeholder:text-gray-400"
                placeholder="搜索菜名、食材、标签…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 text-[12px]">✕</button>
              )}
              <button
                onClick={handleSearch}
                className="flex-shrink-0 px-2 py-1 bg-orange-500 text-white rounded-lg text-[12px] hover:bg-orange-600 transition-colors"
              >
                搜索
              </button>
            </div>

            {/* 移动端搜索框 - 仅首页显示 */}
            {mobileTab === 'home' && (
              <div className="flex-1 md:hidden flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent text-[14px] outline-none text-gray-700 placeholder:text-gray-400"
                  placeholder="搜索菜名、食材、标签…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 text-[12px]">✕</button>
                )}
                <button
                  onClick={handleSearch}
                  className="flex-shrink-0 px-2 py-1 bg-orange-500 text-white rounded-lg text-[12px] hover:bg-orange-600 transition-colors"
                >
                  搜索
                </button>
              </div>
            )}

            {/* 桌面端按钮 - 始终显示 */}
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

            {/* 「我的」页面移动端右上角：设置按钮 */}
            <div className="md:hidden flex items-center gap-2 flex-shrink-0 ml-auto">
              {mobileTab === 'my' && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 分类横向滚动 - 桌面端始终显示，移动端仅首页显示 */}
          <div className={`${mobileTab === 'home' ? 'flex' : 'hidden'} md:flex max-w-5xl mx-auto px-4 pb-3 items-center gap-2 overflow-x-auto scrollbar-hide`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {CATEGORIES.filter(cat => !hiddenCategories.includes(cat)).map(cat => {
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
                <div className={getGridClass()}>
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
              {/* 上部分：用户信息 */}
              <div className="bg-white rounded-2xl p-5 mb-4">
                {isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center`}>
                      <User size={24} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[16px] font-semibold text-gray-900">{displayName || user?.username}</h2>
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

              {/* 下部分：选项卡切换（菜谱 / 收藏） */}
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* 选项卡头部 */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setMyPageTab('recipes')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium transition-colors ${
                      myPageTab === 'recipes'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <BookMarked size={16} />
                    菜谱
                    <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                      myPageTab === 'recipes' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {userRecipes.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setMyPageTab('favorites')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium transition-colors ${
                      myPageTab === 'favorites'
                        ? 'text-red-500 border-b-2 border-red-400'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Heart size={16} className={myPageTab === 'favorites' ? 'fill-red-400' : ''} />
                    收藏
                    <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                      myPageTab === 'favorites' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {favoriteCount}
                    </span>
                  </button>
                </div>

                {/* 选项卡内容 */}
                <div className="p-4">
                  {myPageTab === 'recipes' ? (
                    /* 菜谱列表 */
                    isLoggedIn ? (
                      userRecipes.length > 0 ? (
                        <div className={`${getGridClass('gap-3')} ${compactMode ? 'compact-card' : ''}`}>
                          {userRecipes.map(recipe => (
                            <RecipeCard
                              key={recipe.id}
                              recipe={recipe}
                              onClick={handleCardClick}
                              onFavorite={() => toggleFavorite(recipe.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-4xl mb-3">📝</div>
                          <p className="text-[14px] text-gray-400 mb-3">还没有创建任何菜谱</p>
                          <button
                            onClick={() => setShowForm(true)}
                            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-[14px] hover:bg-orange-600"
                          >
                            + 创建菜谱
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="py-12 text-center">
                        <div className="text-4xl mb-3">🔐</div>
                        <p className="text-[14px] text-gray-400">登录后查看您创建的菜谱</p>
                      </div>
                    )
                  ) : (
                    /* 收藏列表 */
                    <div>
                      {/* 收藏夹选择 */}
                      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                        {folders.map(folder => (
                          <button
                            key={folder.id}
                            onClick={() => setSelectedFolder(folder.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                              selectedFolder === folder.id
                                ? 'bg-red-50 text-red-500 border border-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <FolderHeart size={14} className={selectedFolder === folder.id ? 'fill-red-400' : ''} />
                            {folder.name}
                            <span className="text-[11px] opacity-60">
                              ({recipes.filter(r => r.isFavorite && (r.favoriteFolderId || 'default') === folder.id).length})
                            </span>
                            {folder.id !== 'default' && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`确定删除收藏夹「${folder.name}」？`)) {
                                    deleteFolder(folder.id);
                                    if (selectedFolder === folder.id) {
                                      setSelectedFolder('default');
                                    }
                                  }
                                }}
                                className="ml-1 text-gray-400 hover:text-red-500"
                              >
                                <X size={12} />
                              </span>
                            )}
                          </button>
                        ))}
                        {showNewFolderInput ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input
                              type="text"
                              value={newFolderName}
                              onChange={e => setNewFolderName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                              placeholder="收藏夹名称"
                              className="w-24 px-2 py-1 text-[13px] border border-gray-200 rounded-full outline-none focus:border-orange-400"
                              autoFocus
                            />
                            <button onClick={handleCreateFolder} className="text-orange-500"><Check size={16} /></button>
                            <button onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }} className="text-gray-400"><X size={16} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowNewFolderInput(true)}
                            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <FolderPlus size={14} />
                            新建
                          </button>
                        )}
                      </div>

                      {/* 当前收藏夹的菜谱 */}
                      {folderRecipes.length > 0 ? (
                        <div className={`${getGridClass('gap-3')} ${compactMode ? 'compact-card' : ''}`}>
                          {folderRecipes.map(recipe => (
                            <div key={recipe.id} className="relative">
                              <RecipeCard
                                recipe={recipe}
                                onClick={handleCardClick}
                                onFavorite={() => toggleFavorite(recipe.id)}
                              />
                              {/* 点击更改收藏夹 */}
                              <button
                                onClick={() => setShowFolderPicker(recipe.id)}
                                className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 shadow-sm"
                                title="更改收藏夹"
                              >
                                <FolderHeart size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-4xl mb-3">🤍</div>
                          <p className="text-[14px] text-gray-400">该收藏夹还没有菜谱</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

      {/* 收藏夹选择弹窗 */}
      {showFolderPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowFolderPicker(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">选择收藏夹</h3>
              <button onClick={() => setShowFolderPicker(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleFavorite(showFolderPicker, folder.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    recipes.find(r => r.id === showFolderPicker)?.favoriteFolderId === folder.id ||
                    (!recipes.find(r => r.id === showFolderPicker)?.favoriteFolderId && folder.id === 'default')
                      ? 'bg-red-50 text-red-500'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FolderHeart size={18} className={
                    recipes.find(r => r.id === showFolderPicker)?.favoriteFolderId === folder.id ||
                    (!recipes.find(r => r.id === showFolderPicker)?.favoriteFolderId && folder.id === 'default')
                      ? 'fill-red-400'
                      : ''
                  } />
                  <span className="text-[14px]">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* 头部 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-orange-500" />
                设置
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* 选项卡 */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {[
                { key: 'profile', label: '个人', icon: UserCircle },
                { key: 'general', label: '常规', icon: Palette },
                { key: 'common', label: '通用', icon: Globe },
                { key: 'category', label: '分类', icon: Tag },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key as typeof settingsTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-[13px] font-medium transition-colors ${
                    settingsTab === tab.key
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* 个人设置 */}
              {settingsTab === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">显示名称</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400"
                      placeholder="输入显示名称"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">邮箱地址</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400"
                      placeholder="输入邮箱地址"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">头像颜色</label>
                    <div className="flex gap-2">
                      {avatarColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setAvatarColor(color.name)}
                          className={`w-8 h-8 rounded-full ${color.name} border-2 ${avatarColor === color.name ? 'border-orange-500 scale-110' : 'border-transparent'} transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 常规设置 */}
              {settingsTab === 'general' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">深色模式</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">开启后界面变为深色主题</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-orange-500' : 'bg-gray-200'} relative`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">紧凑模式</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">减少卡片间距，显示更多内容</p>
                    </div>
                    <button
                      onClick={() => setCompactMode(!compactMode)}
                      className={`w-12 h-6 rounded-full transition-colors ${compactMode ? 'bg-orange-500' : 'bg-gray-200'} relative`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${compactMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">自动保存</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">编辑时自动保存草稿</p>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-12 h-6 rounded-full transition-colors ${autoSave ? 'bg-orange-500' : 'bg-gray-200'} relative`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSave ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* 通用设置 */}
              {settingsTab === 'common' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">消息通知</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">接收收藏更新等通知</p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-orange-500' : 'bg-gray-200'} relative`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">界面语言</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-orange-400 bg-white"
                    >
                      <option value="zh-CN">简体中文</option>
                      <option value="zh-TW">繁體中文</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">网格列数</label>
                    <div className="flex gap-2">
                      {(['2', '3', '4'] as const).map(col => (
                        <button
                          key={col}
                          onClick={() => setGridColumns(col)}
                          className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                            gridColumns === col
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {col} 列
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 分类设置 */}
              {settingsTab === 'category' && (
                <div className="space-y-3">
                  <p className="text-[13px] text-gray-500 mb-3">选择要在首页显示的分类，隐藏的分类将不出现在筛选栏</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          if (hiddenCategories.includes(cat)) {
                            setHiddenCategories(hiddenCategories.filter(c => c !== cat));
                          } else {
                            setHiddenCategories([...hiddenCategories, cat]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                          hiddenCategories.includes(cat)
                            ? 'bg-gray-100 text-gray-400 line-through'
                            : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          hiddenCategories.includes(cat) ? 'border-gray-300' : 'border-orange-500 bg-orange-500'
                        }`}>
                          {hiddenCategories.includes(cat) ? '' : <Check size={10} className="text-white" />}
                        </span>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {hiddenCategories.length > 0 && (
                    <button
                      onClick={() => setHiddenCategories([])}
                      className="w-full py-2 text-[13px] text-orange-500 hover:text-orange-600"
                    >
                      显示全部分类
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[14px] text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 保存设置到 localStorage
                  localStorage.setItem('user_settings', JSON.stringify({
                    displayName, email, darkMode, compactMode, autoSave,
                    notifications, language, gridColumns, hiddenCategories, avatarColor
                  }));
                  // 更新用户显示名称
                  if (user && displayName !== user.username) {
                    const updatedUser = { ...user, username: displayName };
                    localStorage.setItem('current_user', JSON.stringify(updatedUser));
                    // 刷新页面以应用更改
                    window.location.reload();
                  }
                  setShowSettings(false);
                }}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[14px] font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
