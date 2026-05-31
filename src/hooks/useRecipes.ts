import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeFormData } from '@/types/recipe';
import { recipesApi } from '@/lib/api';
import { useAuth } from './useAuth';

export function useRecipes() {
  const { isLoggedIn } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // 从后端加载所有菜谱
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await recipesApi.list({ pageSize: 200 });
      if (result.code === 0) {
        setRecipes(result.data.list as Recipe[]);
      }
    } catch (err) {
      console.error('加载菜谱失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes, isLoggedIn]); // 登录状态变化时重新加载（以获取 isFavorite 状态）

  const addRecipe = useCallback(
    async (data: RecipeFormData): Promise<Recipe> => {
      const result = await recipesApi.create(data);
      if (result.code !== 0) throw new Error(result.message);
      const newRecipe = result.data as Recipe;
      setRecipes(prev => [newRecipe, ...prev]);
      return newRecipe;
    },
    []
  );

  const updateRecipe = useCallback(
    async (id: string, data: Partial<RecipeFormData>): Promise<void> => {
      // 先乐观更新本地状态
      setRecipes(prev =>
        prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)
      );
      try {
        // 获取完整的菜谱数据再更新
        const current = recipes.find(r => r.id === id);
        if (current) {
          const merged = { ...current, ...data };
          const result = await recipesApi.update(id, merged);
          if (result.code === 0) {
            setRecipes(prev =>
              prev.map(r => r.id === id ? (result.data as Recipe) : r)
            );
          }
        }
      } catch (err) {
        console.error('更新菜谱失败:', err);
        fetchRecipes(); // 失败时重新加载
      }
    },
    [recipes, fetchRecipes]
  );

  const deleteRecipe = useCallback(
    async (id: string): Promise<void> => {
      // 乐观更新
      setRecipes(prev => prev.filter(r => r.id !== id));
      try {
        const result = await recipesApi.delete(id);
        if (result.code !== 0) {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('删除菜谱失败:', err);
        fetchRecipes(); // 失败时重新加载
      }
    },
    [fetchRecipes]
  );

  const toggleFavorite = useCallback(
    async (id: string, folderId?: string): Promise<void> => {
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;

      // 乐观更新 UI
      const newFav = !recipe.isFavorite;
      setRecipes(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, isFavorite: newFav, favoriteFolderId: newFav ? (folderId || 'default') : undefined }
            : r
        )
      );

      try {
        if (newFav) {
          await recipesApi.favorite(id, folderId);
        } else {
          await recipesApi.unfavorite(id);
        }
      } catch (err) {
        console.error('收藏操作失败:', err);
        // 回滚
        setRecipes(prev =>
          prev.map(r => r.id === id ? { ...r, isFavorite: recipe.isFavorite, favoriteFolderId: recipe.favoriteFolderId } : r)
        );
      }
    },
    [recipes]
  );

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, toggleFavorite, refetch: fetchRecipes };
}
