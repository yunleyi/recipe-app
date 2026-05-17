import React, { useState } from 'react';
import type { Recipe, RecipeFormData, Ingredient, Step, StepMedia, Category, Difficulty } from '@/types/recipe';
import { CATEGORIES, DIFFICULTIES } from '@/lib/recipeData';
import { X, Plus, Trash2, Image, Video } from 'lucide-react';

interface RecipeFormProps {
  initial?: Recipe;
  onSave: (data: RecipeFormData) => void;
  onCancel: () => void;
}

const emptyForm = (): RecipeFormData => ({
  name: '',
  description: '',
  coverImage: '',
  category: '家常菜',
  tags: [],
  difficulty: 'easy',
  cookTime: 30,
  servings: 2,
  ingredients: [{ name: '', amount: '', unit: '' }],
  steps: [{ order: 1, description: '', tip: '', media: [] }],
});

// 媒体 URL 输入弹窗
function MediaUrlInput({
  type,
  onConfirm,
  onClose,
}: {
  type: 'image' | 'video';
  onConfirm: (url: string, caption: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-5 mx-4 w-full max-w-sm">
        <h4 className="text-[15px] font-semibold text-gray-900 mb-4">
          插入{type === 'image' ? '图片' : '视频'}
        </h4>
        <div className="space-y-3">
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-orange-100"
            placeholder={type === 'image' ? '图片 URL（如 https://...）' : '视频 URL（如 https://...mp4）'}
            value={url}
            onChange={e => setUrl(e.target.value)}
            autoFocus
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="图注说明（可选）"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          {url && type === 'image' && (
            <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={url}
                alt="preview"
                className="w-full max-h-40 object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-500 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!url.trim()}
            onClick={() => { if (url.trim()) { onConfirm(url.trim(), caption.trim()); onClose(); } }}
            className="flex-1 py-2.5 bg-orange-500 disabled:opacity-40 text-white rounded-xl text-[13px] font-medium"
          >
            插入
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecipeForm({ initial, onSave, onCancel }: RecipeFormProps) {
  const [form, setForm] = useState<RecipeFormData>(
    initial ? { ...initial, steps: initial.steps.map(s => ({ ...s, media: s.media ?? [] })) } : emptyForm()
  );
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mediaInput, setMediaInput] = useState<{ stepIdx: number; type: 'image' | 'video' } | null>(null);

  const set = (key: keyof RecipeFormData, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '请输入菜名';
    if (!form.description.trim()) e.description = '请输入简介';
    if (form.ingredients.every(i => !i.name.trim())) e.ingredients = '请至少填写一种食材';
    if (form.steps.every(s => !s.description.trim())) e.steps = '请至少填写一个步骤';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      ingredients: form.ingredients.filter(i => i.name.trim()),
      steps: form.steps
        .filter(s => s.description.trim())
        .map((s, i) => ({ ...s, order: i + 1 })),
    });
  };

  /* ---- Ingredient helpers ---- */
  const addIngredient = () =>
    set('ingredients', [...form.ingredients, { name: '', amount: '', unit: '' }]);
  const updateIngredient = (idx: number, key: keyof Ingredient, val: string) => {
    const copy = [...form.ingredients];
    copy[idx] = { ...copy[idx], [key]: val };
    set('ingredients', copy);
  };
  const removeIngredient = (idx: number) =>
    set('ingredients', form.ingredients.filter((_, i) => i !== idx));

  /* ---- Step helpers ---- */
  const addStep = () =>
    set('steps', [...form.steps, { order: form.steps.length + 1, description: '', tip: '', media: [] }]);
  const updateStep = (idx: number, key: keyof Step, val: unknown) => {
    const copy = [...form.steps];
    copy[idx] = { ...copy[idx], [key]: val } as Step;
    set('steps', copy);
  };
  const removeStep = (idx: number) =>
    set('steps', form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })));

  /* ---- Step media helpers ---- */
  const addMedia = (stepIdx: number, media: StepMedia) => {
    const copy = [...form.steps];
    copy[stepIdx] = { ...copy[stepIdx], media: [...(copy[stepIdx].media ?? []), media] };
    set('steps', copy);
  };
  const removeMedia = (stepIdx: number, mediaIdx: number) => {
    const copy = [...form.steps];
    copy[stepIdx] = { ...copy[stepIdx], media: (copy[stepIdx].media ?? []).filter((_, i) => i !== mediaIdx) };
    set('steps', copy);
  };

  /* ---- Tag helpers ---- */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { set('tags', [...form.tags, t]); setTagInput(''); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {initial ? '编辑菜谱' : '新建菜谱'}
          </h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* 基本信息 */}
          <section>
            <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-3">基本信息</h3>
            <div className="space-y-3">
              <div>
                <input
                  className={`w-full border rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-orange-200 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="菜谱名称 *"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name}</p>}
              </div>
              <div>
                <textarea
                  className={`w-full border rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-orange-200 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="一句话描述这道菜 *"
                  rows={2}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
                {errors.description && <p className="text-red-500 text-[12px] mt-1">{errors.description}</p>}
              </div>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="封面图片 URL（留空使用默认图）"
                value={form.coverImage}
                onChange={e => set('coverImage', e.target.value)}
              />
            </div>
          </section>

          {/* 属性 */}
          <section>
            <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-3">属性</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-gray-500 mb-1 block">分类</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none" value={form.category} onChange={e => set('category', e.target.value as Category)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-gray-500 mb-1 block">难度</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none" value={form.difficulty} onChange={e => set('difficulty', e.target.value as Difficulty)}>
                  {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-gray-500 mb-1 block">烹饪时间（分钟）</label>
                <input type="number" min={1} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none" value={form.cookTime} onChange={e => set('cookTime', Number(e.target.value))} />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 mb-1 block">份量（人份）</label>
                <input type="number" min={1} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none" value={form.servings} onChange={e => set('servings', Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[12px] text-gray-500 mb-1 block">标签</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-orange-50 text-orange-600 text-[12px] px-2 py-0.5 rounded-full">
                    {t}
                    <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none" placeholder="输入标签后回车" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[13px] text-gray-600">添加</button>
              </div>
            </div>
          </section>

          {/* 食材 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">食材清单</h3>
              <button type="button" onClick={addIngredient} className="flex items-center gap-1 text-[12px] text-orange-500 hover:text-orange-600"><Plus size={13} /> 添加食材</button>
            </div>
            {errors.ingredients && <p className="text-red-500 text-[12px] mb-2">{errors.ingredients}</p>}
            <div className="space-y-2">
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-orange-100" placeholder="食材名称" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} />
                  <input className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none text-center" placeholder="用量" value={ing.amount} onChange={e => updateIngredient(idx, 'amount', e.target.value)} />
                  <input className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none text-center" placeholder="单位" value={ing.unit} onChange={e => updateIngredient(idx, 'unit', e.target.value)} />
                  {form.ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(idx)} className="text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 步骤 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">烹饪步骤</h3>
              <button type="button" onClick={addStep} className="flex items-center gap-1 text-[12px] text-orange-500 hover:text-orange-600"><Plus size={13} /> 添加步骤</button>
            </div>
            {errors.steps && <p className="text-red-500 text-[12px] mb-2">{errors.steps}</p>}

            <div className="space-y-4">
              {form.steps.map((step, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-[12px] font-medium flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">步骤 {idx + 1}</span>
                    {form.steps.length > 1 && (
                      <button type="button" onClick={() => removeStep(idx)} className="ml-auto text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                      placeholder={`描述步骤 ${idx + 1} *`}
                      rows={2}
                      value={step.description}
                      onChange={e => updateStep(idx, 'description', e.target.value)}
                    />
                    <input
                      className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2 text-[12px] outline-none text-gray-400 placeholder:text-gray-300"
                      placeholder="小贴士（可选）"
                      value={step.tip ?? ''}
                      onChange={e => updateStep(idx, 'tip', e.target.value)}
                    />

                    {/* 已插入的媒体预览 */}
                    {(step.media ?? []).length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {(step.media ?? []).map((m, mi) => (
                          <div key={mi} className="relative rounded-xl overflow-hidden border border-gray-100 bg-white group">
                            {m.type === 'image' ? (
                              <img src={m.url} alt={m.caption || ''} className="w-full h-24 object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&q=60'; }} />
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-gray-900">
                                <Video size={20} className="text-white/60" />
                                <span className="ml-1 text-[11px] text-white/60">视频</span>
                              </div>
                            )}
                            {m.caption && <p className="text-[11px] text-gray-400 px-2 py-1 truncate">{m.caption}</p>}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx, mi)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 插入媒体按钮 */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMediaInput({ stepIdx: idx, type: 'image' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200 bg-white"
                      >
                        <Image size={12} /> 插入图片
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaInput({ stepIdx: idx, type: 'video' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200 bg-white"
                      >
                        <Video size={12} /> 插入视频
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[14px] text-gray-600 hover:bg-gray-50">取消</button>
          <button type="submit" className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[14px] font-medium transition-colors">{initial ? '保存修改' : '创建菜谱'}</button>
        </div>
      </form>

      {/* 媒体 URL 输入弹窗 */}
      {mediaInput && (
        <MediaUrlInput
          type={mediaInput.type}
          onConfirm={(url, caption) => addMedia(mediaInput.stepIdx, { type: mediaInput.type, url, caption })}
          onClose={() => setMediaInput(null)}
        />
      )}
    </div>
  );
}
