import type { Recipe, Category, Difficulty } from '@/types/recipe';

const STORAGE_KEY = 'recipe_book_data_v2';

const sampleImages = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80',
  'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80',
];

const initialRecipes: Recipe[] = [
  {
    id: '1',
    name: '番茄炒鸡蛋',
    description: '家常菜里的经典，简单快手，营养美味，是每个人都会做的入门菜。',
    coverImage: sampleImages[0],
    category: '家常菜',
    tags: ['快手', '下饭', '家常'],
    difficulty: 'easy',
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: '番茄', amount: '2', unit: '个' },
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '食盐', amount: '适量', unit: '' },
      { name: '白糖', amount: '少许', unit: '' },
      { name: '食用油', amount: '适量', unit: '' },
    ],
    steps: [
      {
        order: 1,
        description: '番茄洗净切块，鸡蛋打散备用。',
        tip: '番茄可以去皮，口感更好',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=600&q=80', caption: '番茄切块备用' },
        ],
      },
      { order: 2, description: '热锅倒油，油热后倒入鸡蛋液，炒成嫩蛋花盛出。' },
      {
        order: 3,
        description: '锅中留少量油，下番茄翻炒出汁，加盐和少许白糖。',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80', caption: '翻炒番茄至出汁' },
        ],
      },
      { order: 4, description: '倒入鸡蛋翻炒均匀，出锅装盘。', tip: '最后放盐可保留番茄酸甜口感' },
    ],
    isFavorite: true,
    userId: 'demo_user',
    createdAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
  },
  {
    id: '2',
    name: '蒜蓉蒸虾',
    description: '鲜甜弹牙的大虾，配上香浓蒜蓉，简单蒸制即可，保留最原汁原味的鲜美。',
    coverImage: sampleImages[1],
    category: '家常菜',
    tags: ['海鲜', '蒸制', '宴客'],
    difficulty: 'medium',
    cookTime: 20,
    servings: 3,
    ingredients: [
      { name: '大虾', amount: '500', unit: 'g' },
      { name: '大蒜', amount: '1', unit: '头' },
      { name: '生抽', amount: '2', unit: '勺' },
      { name: '香油', amount: '少许', unit: '' },
      { name: '小葱', amount: '2', unit: '根' },
    ],
    steps: [
      { order: 1, description: '虾洗净，从背部剪开去虾线，摆盘备用。' },
      { order: 2, description: '大蒜剁成蒜蓉，热油炒香一半蒜蓉，另一半生蒜备用。' },
      { order: 3, description: '将生熟蒜蓉混合，加生抽、香油调成酱汁，铺在虾上。' },
      { order: 4, description: '蒸锅水开后放入虾，大火蒸 6-8 分钟，出锅撒葱花。', tip: '不要蒸太久，否则虾肉变老' },
    ],
    isFavorite: false,
    userId: 'demo_user',
    createdAt: '2026-05-12T14:00:00Z',
    updatedAt: '2026-05-12T14:00:00Z',
  },
  {
    id: '3',
    name: '牛油果吐司',
    description: '营养丰富的早餐选择，牛油果绵滑，搭配全麦吐司，简单五分钟搞定。',
    coverImage: sampleImages[2],
    category: '早餐',
    tags: ['健康', '快手', '西式'],
    difficulty: 'easy',
    cookTime: 5,
    servings: 1,
    ingredients: [
      { name: '牛油果', amount: '1', unit: '个' },
      { name: '全麦吐司', amount: '2', unit: '片' },
      { name: '柠檬汁', amount: '少许', unit: '' },
      { name: '盐', amount: '少许', unit: '' },
      { name: '黑胡椒', amount: '少许', unit: '' },
    ],
    steps: [
      { order: 1, description: '牛油果对半切开，取出果核，用勺子挖出果肉。' },
      { order: 2, description: '果肉放入碗中，加柠檬汁、盐、黑胡椒，用叉子碾压成泥。', tip: '保留少许颗粒感口感更好' },
      { order: 3, description: '吐司放入烤箱或面包机烤至金黄，将牛油果泥均匀涂抹上去即可。' },
    ],
    isFavorite: true,
    userId: 'demo_user',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T08:00:00Z',
  },
  {
    id: '4',
    name: '芒果班戟',
    description: '外皮软糯，内馅有芒果和鲜奶油，颜值与美味并存的港式甜品经典。',
    coverImage: sampleImages[3],
    category: '甜点',
    tags: ['港式', '甜品', '冷藏'],
    difficulty: 'hard',
    cookTime: 60,
    servings: 6,
    ingredients: [
      { name: '芒果', amount: '2', unit: '个' },
      { name: '淡奶油', amount: '200', unit: 'ml' },
      { name: '低筋面粉', amount: '50', unit: 'g' },
      { name: '牛奶', amount: '180', unit: 'ml' },
      { name: '鸡蛋', amount: '1', unit: '个' },
      { name: '白糖', amount: '30', unit: 'g' },
      { name: '黄油', amount: '10', unit: 'g' },
    ],
    steps: [
      { order: 1, description: '将面粉、糖、蛋、牛奶、融化黄油混合成面糊，过筛静置 30 分钟。' },
      { order: 2, description: '平底锅小火，倒入适量面糊摊成薄饼，冷却备用。' },
      { order: 3, description: '淡奶油加糖打至 8 分发，备用。' },
      { order: 4, description: '芒果去皮切成厚片备用。' },
      { order: 5, description: '取一张班戟皮，铺上奶油，放入芒果片，折叠包裹成方形。', tip: '折叠时接口朝下冷藏定型效果更好' },
      { order: 6, description: '放入冰箱冷藏 1 小时后食用，口感最佳。' },
    ],
    isFavorite: false,
    userId: 'demo_user',
    createdAt: '2026-05-15T16:00:00Z',
    updatedAt: '2026-05-15T16:00:00Z',
  },
  {
    id: '5',
    name: '紫菜蛋花汤',
    description: '快速简单的清淡汤品，富含矿物质，老少皆宜，几分钟就能端上桌。',
    coverImage: sampleImages[4],
    category: '汤羹',
    tags: ['快手', '清淡', '下饭'],
    difficulty: 'easy',
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: '干紫菜', amount: '5', unit: 'g' },
      { name: '鸡蛋', amount: '2', unit: '个' },
      { name: '盐', amount: '适量', unit: '' },
      { name: '香油', amount: '少许', unit: '' },
      { name: '葱花', amount: '少许', unit: '' },
    ],
    steps: [
      { order: 1, description: '紫菜用清水泡发，撕成小片备用。鸡蛋打散。' },
      { order: 2, description: '锅中加水烧开，放入紫菜，再次沸腾后淋入蛋液，轻轻搅拌。' },
      { order: 3, description: '加盐调味，滴入香油，撒葱花出锅。' },
    ],
    isFavorite: false,
    userId: 'demo_user',
    createdAt: '2026-05-16T12:00:00Z',
    updatedAt: '2026-05-16T12:00:00Z',
  },
  {
    id: '6',
    name: '蜂蜜柠檬茶',
    description: '清新酸甜，富含维C，既是美味饮品也是护嗓良方，热饮冷饮皆宜。',
    coverImage: sampleImages[5],
    category: '饮品',
    tags: ['健康', '冷热两饮', '护嗓'],
    difficulty: 'easy',
    cookTime: 5,
    servings: 1,
    ingredients: [
      { name: '柠檬', amount: '1', unit: '个' },
      { name: '蜂蜜', amount: '2', unit: '勺' },
      { name: '温水', amount: '300', unit: 'ml' },
    ],
    steps: [
      { order: 1, description: '柠檬洗净切片，取 2-3 片放入杯中。' },
      { order: 2, description: '加入蜂蜜，倒入温水（不超过 60°C，过高会破坏蜂蜜营养），搅拌均匀即可。', tip: '可以提前腌制柠檬蜂蜜片，随取随用' },
    ],
    isFavorite: true,
    userId: 'demo_user',
    createdAt: '2026-05-17T09:00:00Z',
    updatedAt: '2026-05-17T09:00:00Z',
  },
];

export function loadRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // 忽略 localStorage 解析异常
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecipes));
  return initialRecipes;
}

export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const CATEGORIES: Category[] = [
  '家常菜', '早餐', '甜点', '快手菜', '汤羹', '凉菜', '烘焙', '饮品',
];

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: '简单', color: 'text-green-600 bg-green-50' },
  { value: 'medium', label: '适中', color: 'text-amber-600 bg-amber-50' },
  { value: 'hard', label: '复杂', color: 'text-red-600 bg-red-50' },
];

export function getDifficultyInfo(d: Difficulty) {
  return DIFFICULTIES.find(x => x.value === d) ?? DIFFICULTIES[0];
}
