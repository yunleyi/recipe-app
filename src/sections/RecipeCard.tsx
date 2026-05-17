import { Clock, Users, Heart, ChefHat } from 'lucide-react';
import type { Recipe } from '@/types/recipe';
import { getDifficultyInfo } from '@/lib/recipeData';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  onFavorite: (id: string) => void;
}

export function RecipeCard({ recipe, onClick, onFavorite }: RecipeCardProps) {
  const diff = getDifficultyInfo(recipe.difficulty);

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      onClick={() => onClick(recipe)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={recipe.coverImage}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&q=80';
          }}
        />
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform z-10"
          onClick={e => {
            e.stopPropagation();
            onFavorite(recipe.id);
          }}
        >
          <Heart
            size={15}
            className={recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}
        >
          {diff.label}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-1">
            {recipe.name}
          </h3>
        </div>
        <p className="text-gray-500 text-[13px] line-clamp-2 mb-3 leading-relaxed">
          {recipe.description}
        </p>

        <div className="flex items-center gap-3 text-[12px] text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {recipe.cookTime} 分钟
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {recipe.servings} 人份
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <ChefHat size={12} />
            {recipe.category}
          </span>
        </div>
      </div>
    </div>
  );
}
