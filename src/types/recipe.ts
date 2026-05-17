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
export type Category =
  | '家常菜'
  | '早餐'
  | '甜点'
  | '快手菜'
  | '汤羹'
  | '凉菜'
  | '烘焙'
  | '饮品';

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
  createdAt: string;
  updatedAt: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>;
