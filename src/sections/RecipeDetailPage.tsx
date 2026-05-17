import type { Recipe } from '@/types/recipe';
import { getDifficultyInfo } from '@/lib/recipeData';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Clock, Users, ChefHat, Heart, Edit2, Trash2, Lightbulb,
} from 'lucide-react';

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}

export function RecipeDetailPage({ recipe, onBack, onEdit, onDelete, onFavorite }: RecipeDetailPageProps) {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const diff = getDifficultyInfo(recipe.difficulty);
  const canEdit = isLoggedIn && (recipe.userId === user?.id || isAdmin);
  const canDelete = canEdit;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-[16px] font-semibold text-gray-900 truncate flex-1">{recipe.name}</h1>
          {canEdit && (
            <button
              onClick={onEdit}
              className="w-10 h-10 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
            >
              <Edit2 size={18} className="text-orange-500" />
            </button>
          )}
        </div>
      </header>

      {/* 内容区域 */}
      <div className="pb-20">
        {/* 封面图 */}
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={recipe.coverImage}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80'; }}
          />
        </div>

        {/* 基本信息 */}
        <div className="px-4 py-4">
          <h2 className="text-[18px] font-bold text-gray-900 mb-1">{recipe.name}</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{recipe.description}</p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${diff.color}`}>
              {diff.label}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-500">
              <Clock size={12} /> {recipe.cookTime} 分钟
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-500">
              <Users size={12} /> {recipe.servings} 人份
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-500">
              <ChefHat size={12} /> {recipe.category}
            </span>
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.tags.map(t => (
                <span key={t} className="text-[11px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* 食材清单 */}
        <div className="px-4 py-4 bg-gray-50">
          <h3 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 rounded-full inline-block" />
            食材清单
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 shadow-sm">
                <span className="text-[13px] text-gray-700">{ing.name}</span>
                <span className="text-[12px] text-gray-400 font-medium">{ing.amount}{ing.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 烹饪步骤 */}
        <div className="px-4 py-5">
          <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 rounded-full inline-block" />
            烹饪步骤
          </h3>
          <ol className="space-y-5">
            {recipe.steps.map(step => (
              <li key={step.order}>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-[13px] font-medium flex items-center justify-center mt-0.5">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-gray-800 leading-relaxed">{step.description}</p>

                    {step.tip && (
                      <div className="mt-2 flex items-start gap-1.5 text-[12px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <Lightbulb size={13} className="flex-shrink-0 mt-0.5" />
                        <span>{step.tip}</span>
                      </div>
                    )}

                    {/* 步骤图片/视频 */}
                    {(step.media ?? []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {(step.media ?? []).map((m, mi) => (
                          <div key={mi} className="rounded-xl overflow-hidden bg-gray-100">
                            {m.type === 'image' ? (
                              <img
                                src={m.url}
                                alt={m.caption || `步骤${step.order}图${mi + 1}`}
                                className="w-full max-h-64 object-cover"
                                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'; }}
                              />
                            ) : (
                              <video
                                src={m.url}
                                controls
                                preload="metadata"
                                className="w-full max-h-64 bg-black"
                              />
                            )}
                            {m.caption && (
                              <p className="text-[12px] text-gray-500 px-3 py-1.5 bg-gray-50">{m.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 z-20">
        {/* 收藏按钮 */}
        {isLoggedIn ? (
          <button
            onClick={onFavorite}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
              recipe.isFavorite
                ? 'bg-red-50 text-red-500 border border-red-200'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Heart size={16} className={recipe.isFavorite ? 'fill-red-500' : ''} />
            {recipe.isFavorite ? '已收藏' : '收藏'}
          </button>
        ) : (
          <button
            onClick={onFavorite}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
            title="登录后可收藏"
          >
            <Heart size={16} />
            收藏
          </button>
        )}

        {/* 删除按钮 */}
        {canDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-red-50 text-red-500 border border-red-200 ml-auto"
          >
            <Trash2 size={16} />
            删除
          </button>
        )}
      </div>
    </div>
  );
}
