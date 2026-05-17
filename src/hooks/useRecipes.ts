import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeFormData } from '@/types/recipe';
import { loadRecipes, saveRecipes, generateId } from '@/lib/recipeData';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setRecipes(loadRecipes());
  }, []);

  const persist = useCallback((updated: Recipe[]) => {
    setRecipes(updated);
    saveRecipes(updated);
  }, []);

  const addRecipe = useCallback(
    (data: RecipeFormData): Recipe => {
      const now = new Date().toISOString();
      const recipe: Recipe = {
        ...data,
        id: generateId(),
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };
      persist([recipe, ...recipes]);
      return recipe;
    },
    [recipes, persist]
  );

  const updateRecipe = useCallback(
    (id: string, data: Partial<RecipeFormData>): void => {
      const updated = recipes.map(r =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      );
      persist(updated);
    },
    [recipes, persist]
  );

  const deleteRecipe = useCallback(
    (id: string): void => {
      persist(recipes.filter(r => r.id !== id));
    },
    [recipes, persist]
  );

  const toggleFavorite = useCallback(
    (id: string): void => {
      const updated = recipes.map(r =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      );
      persist(updated);
    },
    [recipes, persist]
  );

  return { recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite };
}
