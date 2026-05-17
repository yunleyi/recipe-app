# 🍳 菜谱管理应用

基于 React + TypeScript + Vite 构建的个人菜谱管理与分享应用。

## ✨ 功能特性

- 📖 **菜谱浏览** — 卡片形式展示所有菜谱，支持分类筛选
- 🔍 **详情查看** — 查看菜谱封面、食材清单、详细步骤、小贴士
- 🖼️ **图片灯箱** — 点击图片放大查看，支持缩放、拖动，点击背景关闭
- ⭐ **收藏功能** — 收藏喜欢的菜谱，快速访问
- ✏️ **编辑管理** — 新建、编辑、删除菜谱

## 🛠️ 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Lucide React（图标库）
- shadcn/ui 组件库

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
recipe-app/
├── src/
│   ├── components/ui/      # UI 组件库
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具函数和常量
│   ├── sections/          # 页面主要区域组件
│   │   ├── RecipeCard.tsx    # 菜谱卡片
│   │   ├── RecipeDetail.tsx  # 菜谱详情/灯箱
│   │   └── RecipeForm.tsx    # 新建/编辑表单
│   ├── types/             # TypeScript 类型定义
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 入口文件
├── public/               # 静态资源
└── index.html            # HTML 模板
```

## 📝 版本记录

| 版本 | 说明 |
|------|------|
| v1.0 | 基础功能完整版（浏览、详情、灯箱、收藏、编辑） |

## 📄 许可证

MIT
