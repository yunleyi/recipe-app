# 菜谱记录 API 文档

> 版本：v1.0  
> 文档日期：2026-05-17  
> 状态：**待接入**（当前前端使用 localStorage 模拟，后端接入后替换 `src/lib/recipeData.ts` 中的数据层）

---

## 目录

1. [接口规范](#接口规范)
2. [数据模型](#数据模型)
3. [菜谱接口](#菜谱接口)
4. [分类接口](#分类接口)
5. [收藏接口](#收藏接口)
6. [搜索接口](#搜索接口)
7. [文件上传接口](#文件上传接口)
8. [错误码](#错误码)
9. [技术栈建议](#技术栈建议)

---

## 接口规范

### 基础 URL

```
https://api.your-domain.com/v1
```

### 请求格式

- Content-Type: `application/json`
- 字符编码: `UTF-8`

### 统一响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0 = 成功，非 0 = 错误 |
| message | string | 成功/错误描述 |
| data | any | 实际响应数据 |

### 分页结构

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 认证（预留）

后期可通过 `Authorization: Bearer <token>` 头部传递 JWT Token，当前阶段可不做认证。

---

## 数据模型

### Recipe（菜谱）

```typescript
interface Recipe {
  id: string;                    // 唯一 ID（UUID）
  name: string;                  // 菜名，最长 50 字
  description: string;           // 简介，最长 200 字
  coverImage: string;            // 封面图片 URL
  category: Category;            // 分类
  tags: string[];                // 标签列表
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  cookTime: number;              // 烹饪时长（分钟）
  servings: number;              // 份量（人份）
  ingredients: Ingredient[];     // 食材清单
  steps: Step[];                 // 步骤列表
  isFavorite: boolean;           // 是否收藏
  createdAt: string;             // ISO 8601 时间
  updatedAt: string;             // ISO 8601 时间
}
```

### Ingredient（食材）

```typescript
interface Ingredient {
  name: string;     // 食材名称
  amount: string;   // 用量（如 "2"、"适量"）
  unit: string;     // 单位（如 "个"、"g"、"ml"）
}
```

### Step（步骤）

```typescript
interface Step {
  order: number;       // 步骤序号（从 1 开始）
  description: string; // 步骤描述
  tip?: string;        // 小贴士（可选）
}
```

### Category（分类枚举）

```
'家常菜' | '早餐' | '甜点' | '快手菜' | '汤羹' | '凉菜' | '烘焙' | '饮品'
```

---

## 菜谱接口

### 获取菜谱列表

```
GET /recipes
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量，最大 50 |
| category | string | 否 | - | 按分类筛选 |
| difficulty | string | 否 | - | 按难度筛选：easy/medium/hard |
| isFavorite | boolean | 否 | - | true 仅返回收藏 |
| orderBy | string | 否 | createdAt | 排序字段：createdAt/updatedAt/name/cookTime |
| order | string | 否 | desc | 排序方向：asc/desc |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "abc123",
        "name": "番茄炒鸡蛋",
        "description": "家常经典...",
        "coverImage": "https://...",
        "category": "家常菜",
        "tags": ["快手", "下饭"],
        "difficulty": "easy",
        "cookTime": 15,
        "servings": 2,
        "isFavorite": true,
        "createdAt": "2026-05-10T10:00:00Z",
        "updatedAt": "2026-05-10T10:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

> ⚠️ 列表接口**不返回** `ingredients` 和 `steps` 字段（减少传输量），详情接口才返回完整数据。

---

### 获取菜谱详情

```
GET /recipes/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 菜谱 ID |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "abc123",
    "name": "番茄炒鸡蛋",
    "description": "家常经典，简单快手",
    "coverImage": "https://...",
    "category": "家常菜",
    "tags": ["快手", "下饭", "家常"],
    "difficulty": "easy",
    "cookTime": 15,
    "servings": 2,
    "ingredients": [
      { "name": "番茄", "amount": "2", "unit": "个" },
      { "name": "鸡蛋", "amount": "3", "unit": "个" }
    ],
    "steps": [
      { "order": 1, "description": "番茄洗净切块...", "tip": "可以去皮" },
      { "order": 2, "description": "热锅倒油...", "tip": null }
    ],
    "isFavorite": true,
    "createdAt": "2026-05-10T10:00:00Z",
    "updatedAt": "2026-05-10T10:00:00Z"
  }
}
```

---

### 创建菜谱

```
POST /recipes
```

**请求体**

```json
{
  "name": "菜名",
  "description": "简介",
  "coverImage": "https://...",
  "category": "家常菜",
  "tags": ["标签1", "标签2"],
  "difficulty": "easy",
  "cookTime": 30,
  "servings": 2,
  "ingredients": [
    { "name": "食材名", "amount": "2", "unit": "个" }
  ],
  "steps": [
    { "order": 1, "description": "步骤描述", "tip": "小贴士（可选）" }
  ]
}
```

**字段校验规则**

| 字段 | 必填 | 规则 |
|------|------|------|
| name | ✅ | 1-50 字 |
| description | ✅ | 1-200 字 |
| coverImage | 否 | 合法 URL 或留空 |
| category | ✅ | 枚举值之一 |
| difficulty | ✅ | easy/medium/hard |
| cookTime | ✅ | 正整数，分钟 |
| servings | ✅ | 正整数 |
| ingredients | ✅ | 至少 1 条，name 不能为空 |
| steps | ✅ | 至少 1 步，description 不能为空 |

**响应示例**

```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "new-uuid",
    ...
  }
}
```

---

### 更新菜谱

```
PUT /recipes/:id
```

**请求体**：同创建菜谱（全量更新），所有字段均必传。

**响应**：返回更新后的完整菜谱对象。

---

### 部分更新菜谱

```
PATCH /recipes/:id
```

**请求体**：仅传需要修改的字段（支持局部更新）。

常用场景：
- 更新封面图：`{ "coverImage": "https://..." }`
- 修改分类：`{ "category": "快手菜" }`

---

### 删除菜谱

```
DELETE /recipes/:id
```

**响应**

```json
{
  "code": 0,
  "message": "deleted",
  "data": null
}
```

---

## 分类接口

### 获取所有分类及统计

```
GET /categories
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "name": "家常菜", "count": 12 },
    { "name": "早餐",   "count": 5  },
    { "name": "甜点",   "count": 8  },
    { "name": "快手菜", "count": 10 },
    { "name": "汤羹",   "count": 3  },
    { "name": "凉菜",   "count": 4  },
    { "name": "烘焙",   "count": 6  },
    { "name": "饮品",   "count": 2  }
  ]
}
```

---

## 收藏接口

### 收藏菜谱

```
POST /recipes/:id/favorite
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": { "isFavorite": true }
}
```

### 取消收藏

```
DELETE /recipes/:id/favorite
```

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": { "isFavorite": false }
}
```

---

## 搜索接口

### 全文搜索

```
GET /recipes/search
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | ✅ | 搜索关键词（菜名/食材/标签），最小 1 字 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**说明**：搜索范围包括菜名、简介、标签、食材名。建议后端使用全文索引（如 MySQL FULLTEXT / Elasticsearch）提升搜索质量。

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "keyword": "番茄"
  }
}
```

---

## 文件上传接口

### 上传封面图片

```
POST /upload/image
```

**请求格式**：`multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | 图片文件，支持 jpg/png/webp，最大 5 MB |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "https://cdn.your-domain.com/images/abc123.jpg",
    "width": 800,
    "height": 600,
    "size": 204800
  }
}
```

---

## 错误码

| code | HTTP 状态 | 说明 |
|------|-----------|------|
| 0 | 200 | 成功 |
| 1001 | 400 | 参数缺失或格式错误 |
| 1002 | 400 | 字段校验不通过 |
| 1003 | 404 | 菜谱不存在 |
| 1004 | 413 | 上传文件过大 |
| 1005 | 415 | 不支持的文件类型 |
| 5001 | 500 | 服务器内部错误 |

**错误响应示例**

```json
{
  "code": 1002,
  "message": "参数错误：name 不能为空",
  "data": null
}
```

---

## 技术栈建议

以下是几种可选的后端技术栈，供后期选型参考：

### 方案 A：Node.js + Express + MySQL

适合：熟悉 JS/TS 全栈开发、中小型项目

| 组件 | 选型 | 备注 |
|------|------|------|
| 运行时 | Node.js 20+ | — |
| 框架 | Express / Fastify | Fastify 性能更好 |
| ORM | Prisma / Sequelize | Prisma 类型支持好 |
| 数据库 | MySQL 8 / PostgreSQL | 推荐 PostgreSQL |
| 文件存储 | 腾讯云 COS / 阿里云 OSS | — |
| 搜索 | MySQL FULLTEXT | 数据量大时换 ES |

### 方案 B：Python + FastAPI + PostgreSQL

适合：熟悉 Python、需要快速开发 REST API

| 组件 | 选型 | 备注 |
|------|------|------|
| 框架 | FastAPI | 自动生成 OpenAPI 文档 |
| ORM | SQLAlchemy / Tortoise-ORM | — |
| 数据库 | PostgreSQL | — |
| 验证 | Pydantic v2 | — |

### 方案 C：Go + Gin + MySQL

适合：高并发、追求性能

| 组件 | 选型 | 备注 |
|------|------|------|
| 框架 | Gin / Echo | — |
| ORM | GORM | — |
| 数据库 | MySQL 8 | — |

### 前端对接方式

前端 `src/lib/recipeData.ts` 目前暴露以下函数，接入后端时，将这些函数替换为对应 API 调用即可：

| 当前函数 | 对应 API |
|----------|----------|
| `loadRecipes()` | `GET /recipes` |
| `saveRecipes()` | 自动由增删改接口处理 |
| 添加菜谱 | `POST /recipes` |
| 更新菜谱 | `PUT /recipes/:id` |
| 删除菜谱 | `DELETE /recipes/:id` |
| 收藏/取消 | `POST/DELETE /recipes/:id/favorite` |
| 搜索 | `GET /recipes/search?q=...` |

---

*文档维护：菜谱记录前端项目组*
