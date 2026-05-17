export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface StepMedia {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Step {
  order: number;
  description: string;
  tip?: string;
  media?: StepMedia[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Role = 'user' | 'admin';
export type Category =
  | '家常菜'
  | '早餐'
  | '甜点'
  | '快手菜'
  | '汤羹'
  | '凉菜'
  | '烘焙'
  | '饮品';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

// 收藏夹
export interface FavoriteFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: Category;
  tags: string[];
  difficulty: Difficulty;
  cookTime: number; // minutes
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  isFavorite: boolean;
  favoriteFolderId?: string; // 收藏夹ID，不填则为默认收藏夹
  userId: string; // 所属用户 ID
  createdAt: string;
  updatedAt: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isFavorite'>;
