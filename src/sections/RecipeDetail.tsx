import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Recipe, StepMedia } from '@/types/recipe';
import { getDifficultyInfo } from '@/lib/recipeData';
import {
  X, Clock, Users, ChefHat, Heart, Edit2, Trash2, Lightbulb, ZoomIn, ZoomOut, Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}

interface LightboxProps {
  media: StepMedia;
  onClose: () => void;
}

function MediaLightbox({ media, onClose }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);

  // 打开灯箱时锁定页面滚动
  useEffect(() => {
    savedScrollY.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY.current);
    };
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 0.5);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;
    lastPos.current = {
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    };
    setPosition({ ...lastPos.current });
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + 0.5, 4));
    } else {
      setScale(s => {
        const newScale = Math.max(s - 0.5, 0.5);
        if (newScale <= 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // 背景层：pointer-events: auto，点击关闭
  // 图片/视频/按钮：pointer-events: auto + stopPropagation，阻止关闭
  // 图片周围的空白区域：穿透到背景，触发关闭
  const content = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          title="缩小"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-white/80 text-[13px] bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          title="放大"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors ml-2"
        >
          <X size={20} />
        </button>
      </div>

      {media.type === 'image' ? (
        <div
          className="relative flex items-center justify-center"
          style={{ width: '90vw', height: '90vh' }}
        >
          {/* 图片本身：stopPropagation 阻止关闭，允许拖动 */}
          <img
            src={media.url}
            alt={media.caption || '放大图片'}
            className="max-w-full max-h-full object-contain select-none cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            onClick={e => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
        </div>
      ) : (
        <video
          src={media.url}
          controls
          autoPlay
          className="max-w-[90vw] max-h-[85vh] rounded-lg"
          onClick={e => e.stopPropagation()}
        />
      )}

      {media.caption && (
        <p
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-[14px] bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg max-w-[80%] text-center pointer-events-none"
        >
          {media.caption}
        </p>
      )}

      {/* 操作提示 */}
      <div className="absolute bottom-6 right-4 text-white/50 text-[12px] flex items-center gap-3 pointer-events-none">
        <span>滚轮或按钮缩放</span>
        <span>·</span>
        <span>拖动移动</span>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body 下
  return createPortal(content, document.body);
}

export function RecipeDetail({ recipe, onClose, onEdit, onDelete, onFavorite }: RecipeDetailProps) {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const diff = getDifficultyInfo(recipe.difficulty);
  const [lightbox, setLightbox] = useState<StepMedia | null>(null);

  // 判断是否是菜谱作者或管理员
  const canEdit = isLoggedIn && (recipe.userId === user?.id || isAdmin);
  const canDelete = canEdit;

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6" onClick={handleBackdropClick}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Cover */}
        <div className="relative aspect-[16/7] overflow-hidden bg-gray-100">
          <img
            src={recipe.coverImage}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
            <h1 className="text-white text-2xl font-bold mb-1">{recipe.name}</h1>
            <p className="text-white/80 text-[13px] leading-relaxed">{recipe.description}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 flex-wrap">
          <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${diff.color}`}>
            {diff.label}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <Clock size={13} /> {recipe.cookTime} 分钟
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <Users size={13} /> {recipe.servings} 人份
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <ChefHat size={13} /> {recipe.category}
          </span>
          {recipe.tags.length > 0 && (
            <div className="flex gap-1.5 ml-auto flex-wrap">
              {recipe.tags.map(t => (
                <span key={t} className="text-[11px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-7">

          {/* Ingredients */}
          <section>
            <h2 className="text-[15px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-400 rounded-full inline-block" />
              食材清单
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-[13px] text-gray-700">{ing.name}</span>
                  <span className="text-[12px] text-gray-400 font-medium">{ing.amount}{ing.unit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-400 rounded-full inline-block" />
              烹饪步骤
            </h2>
            <ol className="space-y-5">
              {recipe.steps.map(step => (
                <li key={step.order}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-[13px] font-medium flex items-center justify-center mt-0.5">
                      {step.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-gray-800 leading-relaxed">{step.description}</p>

                      {step.tip && (
                        <div className="mt-2 flex items-start gap-1.5 text-[12px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                          <Lightbulb size={13} className="flex-shrink-0 mt-0.5" />
                          <span>{step.tip}</span>
                        </div>
                      )}

                      {/* 步骤富媒体 */}
                      {(step.media ?? []).length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-3">
                          {(step.media ?? []).map((m, mi) => (
                            <div key={mi} className="rounded-xl overflow-hidden border border-gray-100">
                              {m.type === 'image' ? (
                                <div className="relative group cursor-pointer" onClick={() => setLightbox(m)}>
                                  <img
                                    src={m.url}
                                    alt={m.caption || `步骤${step.order}图${mi + 1}`}
                                    className="w-full max-h-72 object-cover transition-transform group-hover:scale-[1.02]"
                                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'; }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                                      <ZoomIn size={20} className="text-white" />
                                    </div>
                                  </div>
                                  {m.caption && (
                                    <p className="text-[12px] text-gray-400 px-3 py-1.5 bg-gray-50">{m.caption}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="relative">
                                  <video
                                    src={m.url}
                                    controls
                                    preload="metadata"
                                    className="w-full max-h-72 bg-black"
                                  >
                                    <source src={m.url} />
                                    您的浏览器不支持视频播放。
                                  </video>
                                  {m.caption && (
                                    <p className="text-[12px] text-gray-400 px-3 py-1.5 bg-gray-50">{m.caption}</p>
                                  )}
                                </div>
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
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* 收藏按钮 - 需要登录 */}
          {isLoggedIn ? (
            <button
              onClick={onFavorite}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-colors ${
                recipe.isFavorite
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-400'
              }`}
            >
              <Heart size={14} className={recipe.isFavorite ? 'fill-red-500' : ''} />
              {recipe.isFavorite ? '已收藏' : '收藏'}
            </button>
          ) : (
            <button
              onClick={onFavorite}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-400 cursor-not-allowed"
              title="登录后可收藏"
            >
              <Heart size={14} />
              收藏
            </button>
          )}

          {/* 编辑按钮 - 仅作者和管理员可见 */}
          {canEdit && (
            <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-600 hover:bg-gray-100">
              <Edit2 size={14} /> 编辑
            </button>
          )}

          {/* 删除按钮 - 仅作者和管理员可见 */}
          {canDelete && (
            <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 bg-white text-[13px] text-red-400 hover:bg-red-50 ml-auto">
              <Trash2 size={14} /> 删除
            </button>
          )}

          {/* 无权限提示 */}
          {!canEdit && isLoggedIn && (
            <div className="ml-auto flex items-center gap-1.5 text-[12px] text-gray-400">
              <Lock size={12} />
              <span>非作者无权编辑</span>
            </div>
          )}
        </div>
      </div>

      {/* 图片/视频放大灯箱 - 使用 Portal 渲染到 body 下 */}
      {lightbox && (
        <MediaLightbox media={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
