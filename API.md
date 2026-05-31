# 菜谱记录 API 文档

> 版本：v3.0
> 文档日期：2026-05-31
> 状态：**已实现**（Node.js + Express + SQLite）

---

## 目录

1. [接口规范](#接口规范)
2. [数据模型](#数据模型)
3. [认证接口](#认证接口)
4. [用户接口](#用户接口)
5. [菜谱接口](#菜谱接口)
6. [分类接口](#分类接口)
7. [收藏接口](#收藏接口)
8. [收藏夹接口](#收藏夹接口)
9. [搜索接口](#搜索接口)
10. [文件上传接口](#文件上传接口)
11. [管理后台接口](#管理后台接口)
12. [错误码](#错误码)
13. [权限说明](#权限说明)
14. [技术栈](#技术栈)

---

## 接口规范

### 基础 URL

```
http://localhost:3001
```

### 请求格式

- Content-Type: `application/json`（除上传接口使用 `multipart/form-data`）
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

### 认证方式

采用 **双 Token（JWT）** 机制：

| Token | 有效期 | 用途 |
|-------|--------|------|
| accessToken | 7 天 | 请求接口时携带在 Authorization Header |
| refreshToken | 30 天 | 用于刷新 accessToken，过期需重新登录 |

**请求头格式**：
```
Authorization: Bearer <accessToken>
```

**Token 刷新流程**：
1. 请求返回 401 时，前端自动使用 refreshToken 调用 `POST /auth/refresh`
2. 刷新成功获取新 accessToken，自动重试原请求
3. 刷新失败则清除登录状态，跳转登录页

---

## 数据模型

### User（用户）

```typescript
interface User {
  id: string;                    // 唯一 ID（UUID）
  username: string;              // 用户名，2-20 字符
  email: string;                 // 邮箱，唯一
  password: string;             // 密码（bcrypt 加密存储，不返回前端）
  role: 'user' | 'admin';       // 角色：普通用户 / 管理员
  createdAt: string;             // 注册时间（ISO 8601）
  updatedAt: string;             // 更新时间（ISO 8601）
}
```

> ⚠️ **安全注意**：接口返回的 User 对象中不包含 `password` 字段

### Recipe（菜谱）

```typescript
interface Recipe {
  id: string;                    // 唯一 ID（UUID）
  name: string;                  // 菜名，最长 50 字
  description: string;           // 简介
  coverImage: string;            // 封面图片 URL
  category: Category;            // 分类
  tags: string[];                // 标签列表
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  cookTime: number;              // 烹饪时长（分钟）
  servings: number;               // 份量（人份）
  ingredients: Ingredient[];     // 食材清单
  steps: Step[];                 // 步骤列表
  isFavorite: boolean;            // 是否收藏（仅登录用户返回）
  favoriteFolderId: string | null; // 收藏夹 ID（仅收藏时返回）
  userId: string;                // 所属用户 ID
  status: 'pending' | 'approved' | 'rejected'; // 审核状态
  createdAt: string;             // 创建时间（ISO 8601）
  updatedAt: string;             // 更新时间（ISO 8601）
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
  tip?: string;         // 小贴士（可选）
  media?: StepMedia[]; // 步骤媒体（可选）
}
```

### StepMedia（步骤媒体）

```typescript
interface StepMedia {
  type: 'image' | 'video'; // 媒体类型
  url: string;             // 媒体 URL
  caption?: string;        // 说明文字（可选）
}
```

### FavoriteFolder（收藏夹）

```typescript
interface FavoriteFolder {
  id: string;        // 收藏夹 ID
  userId: string;    // 所属用户 ID
  name: string;      // 收藏夹名称
  createdAt: string; // 创建时间（ISO 8601）
}
```

### Category（分类枚举）

```
'家常菜' | '早餐' | '甜点' | '快手菜' | '汤羹' | '凉菜' | '烘焙' | '饮品'
```

---

## 认证接口

### 用户注册

```
POST /auth/register
```

**请求体**

```json
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**字段校验规则**

| 字段 | 必填 | 规则 |
|------|------|------|
| username | ✅ | 2-20 字符 |
| email | ✅ | 合法邮箱格式，唯一 |
| password | ✅ | 6-20 字符 |

**响应示例**

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-xxx",
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    }
  }
}
```

**错误码**：1001（缺少字段）、1002（格式校验失败）、2003（用户名/邮箱已存在）

---

### 用户登录

```
POST /auth/login
```

**请求体**

```json
{
  "account": "zhangsan@example.com",
  "password": "123456"
}
```

> ⚠️ `account` 支持邮箱或用户名登录，也兼容 `email` 字段

**响应示例**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-xxx",
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "admin",
      "createdAt": "2026-05-17T10:00:00Z"
    }
  }
}
```

**错误码**：1001（缺少字段）、2001（账号或密码错误）

---

### 刷新 Token

```
POST /auth/refresh
```

**请求头**

```
Authorization: Bearer <refreshToken>
```

**响应示例**

```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**错误码**：2001（Token 无效/过期/已失效）

---

### 退出登录

```
POST /auth/logout
```

**请求头**

```
Authorization: Bearer <token>
```

**说明**：清除服务端所有 refresh token，前端也需清除本地存储。

**响应示例**

```json
{
  "code": 0,
  "message": "已退出登录",
  "data": null
}
```

---

## 用户接口

### 获取当前用户信息

```
GET /user/me
```

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid-xxx",
    "username": "张三",
    "email": "zhangsan@example.com",
    "role": "user",
    "createdAt": "2026-05-17T10:00:00Z"
  }
}
```

---

### 修改用户资料

```
PUT /user/profile
```

**请求头**

```
Authorization: Bearer <token>
```

**请求体**

```json
{
  "username": "新用户名"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "资料更新成功",
  "data": {
    "id": "uuid-xxx",
    "username": "新用户名",
    "email": "zhangsan@example.com",
    "role": "user",
    "createdAt": "2026-05-17T10:00:00Z"
  }
}
```

**错误码**：1001（缺少字段）、1002（格式校验）、2003（用户名已被占用）

---

### 修改密码

```
PUT /user/password
```

**请求头**

```
Authorization: Bearer <token>
```

**请求体**

```json
{
  "oldPassword": "123456",
  "newPassword": "abcdef"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

**错误码**：1001（缺少字段）、1002（旧密码错误/新密码格式不合法）、1003（用户不存在）

---

### 获取我的收藏列表

```
GET /user/favorites
```

**请求头**

```
Authorization: Bearer <token>
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "recipe-uuid",
        "name": "番茄炒鸡蛋",
        "description": "家常经典...",
        "coverImage": "https://...",
        "category": "家常菜",
        "tags": ["快手", "下饭"],
        "difficulty": "easy",
        "cookTime": 15,
        "servings": 2,
        "ingredients": [...],
        "steps": [...],
        "isFavorite": true,
        "userId": "user-xxx",
        "status": "approved",
        "createdAt": "2026-05-10T10:00:00Z",
        "updatedAt": "2026-05-10T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 50
  }
}
```

---

## 菜谱接口

### 获取菜谱列表

```
GET /recipes
```

**请求头（可选）**

```
Authorization: Bearer <token>
```

**说明**：
- 游客：仅返回 `status = 'approved'` 的菜谱
- 登录用户：返回 `approved` 的菜谱 + 自己的全部菜谱（含 pending/rejected）
- 管理员：返回所有菜谱（含待审核）

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量，最大 50 |
| category | string | 否 | - | 按分类筛选 |
| difficulty | string | 否 | - | 按难度筛选：easy/medium/hard |
| isFavorite | boolean | 否 | - | "true" 仅返回收藏 |
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
        "ingredients": [
          { "name": "番茄", "amount": "2", "unit": "个" },
          { "name": "鸡蛋", "amount": "3", "unit": "个" }
        ],
        "steps": [
          {
            "order": 1,
            "description": "番茄洗净切块...",
            "tip": "可以去皮",
            "media": [
              { "type": "image", "url": "https://...", "caption": "切好的番茄" }
            ]
          }
        ],
        "isFavorite": true,
        "favoriteFolderId": "default",
        "userId": "user-xxx",
        "status": "approved",
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
      {
        "order": 1,
        "description": "番茄洗净切块...",
        "tip": "可以去皮",
        "media": [
          { "type": "image", "url": "https://...", "caption": "切好的番茄" }
        ]
      },
      { "order": 2, "description": "热锅倒油...", "tip": null, "media": [] }
    ],
    "isFavorite": true,
    "favoriteFolderId": null,
    "userId": "user-xxx",
    "status": "approved",
    "createdAt": "2026-05-10T10:00:00Z",
    "updatedAt": "2026-05-10T10:00:00Z"
  }
}
```

**错误码**：1003（菜谱不存在）

---

### 创建菜谱

```
POST /recipes
```

**请求头**

```
Authorization: Bearer <token>
```

**说明**：需要登录，普通用户和管理员都可以创建。创建后 `status` 默认为 `pending`。

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
    {
      "order": 1,
      "description": "步骤描述",
      "tip": "小贴士（可选）",
      "media": [
        { "type": "image", "url": "https://...", "caption": "说明（可选）" }
      ]
    }
  ]
}
```

**字段校验规则**

| 字段 | 必填 | 规则 |
|------|------|------|
| name | ✅ | 1-50 字 |
| description | 否 | 最长 200 字，默认空字符串 |
| coverImage | 否 | 合法 URL，默认空字符串 |
| category | ✅ | 枚举值之一 |
| tags | 否 | 字符串数组，默认 [] |
| difficulty | ✅ | easy/medium/hard |
| cookTime | ✅ | 正整数（分钟） |
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
    "name": "菜名",
    "status": "pending",
    ...
  }
}
```

**错误码**：1002（校验失败）

---

### 更新菜谱（全量）

```
PUT /recipes/:id
```

**请求头**

```
Authorization: Bearer <token>
```

**权限规则**：
- 菜谱作者：可以更新自己的菜谱 ✅
- 管理员：可以更新任意菜谱 ✅
- 其他用户：返回 403 无权限 ❌

**请求体**：同创建菜谱（全量更新，未传字段会被清空）。

**响应示例**

```json
{
  "code": 0,
  "message": "updated",
  "data": { ... }
}
```

**错误码**：1002（校验失败）、1003（不存在）、2002（无权限）

---

### 部分更新菜谱

```
PATCH /recipes/:id
```

**请求头**

```
Authorization: Bearer <token>
```

**权限规则**：同上。

**请求体**：仅传需要修改的字段。

常用场景：
- 更新封面图：`{ "coverImage": "https://..." }`
- 修改分类：`{ "category": "快手菜" }`

可更新字段：`name`、`description`、`coverImage`、`category`、`tags`、`difficulty`、`cookTime`、`servings`

> ⚠️ 不支持通过 PATCH 更新食材和步骤，请使用 PUT 全量更新。

**错误码**：1001（无可更新字段）、1003（不存在）、2002（无权限）

---

### 删除菜谱

```
DELETE /recipes/:id
```

**请求头**

```
Authorization: Bearer <token>
```

**权限规则**：
- 菜谱作者：可以删除自己的菜谱 ✅
- 管理员：可以删除任意菜谱 ✅
- 其他用户：返回 403 无权限 ❌

> ⚠️ 删除菜谱时会级联删除关联的食材、步骤、步骤媒体和收藏记录。

**响应**

```json
{
  "code": 0,
  "message": "deleted",
  "data": null
}
```

**错误码**：1003（不存在）、2002（无权限）

---

### 收藏菜谱

```
POST /recipes/:id/favorite
```

**请求头**

```
Authorization: Bearer <token>
```

**请求体**

```json
{
  "folderId": "folder-uuid"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| folderId | 否 | 目标收藏夹 ID，不传则使用默认收藏夹 |

> ⚠️ 重复收藏同一菜谱会更新收藏夹归属（INSERT OR REPLACE）。

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": { "isFavorite": true, "folderId": "folder-uuid" }
}
```

**错误码**：1003（菜谱不存在）

---

### 取消收藏

```
DELETE /recipes/:id/favorite
```

**请求头**

```
Authorization: Bearer <token>
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

## 收藏夹接口

### 获取收藏夹列表

```
GET /user/folders
```

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "id": "default", "name": "默认收藏", "createdAt": "2026-05-17T10:00:00Z" },
    { "id": "folder-uuid", "name": "周末菜谱", "createdAt": "2026-05-20T10:00:00Z" }
  ]
}
```

---

### 创建收藏夹

```
POST /user/folders
```

**请求头**

```
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "收藏夹名称"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "folder-uuid",
    "name": "收藏夹名称",
    "createdAt": "2026-05-31T10:00:00Z"
  }
}
```

**错误码**：1001（名称为空）

---

### 删除收藏夹

```
DELETE /user/folders/:id
```

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 收藏夹 ID |

**说明**：删除前会将该收藏夹下的所有收藏移动到默认收藏夹。默认收藏夹不可删除。

**错误码**：1003（收藏夹不存在）、1002（默认收藏夹不可删除）

---

### 重命名收藏夹

```
PATCH /user/folders/:id
```

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 收藏夹 ID |

**请求体**

```json
{
  "name": "新名称"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "重命名成功",
  "data": { "id": "folder-uuid", "name": "新名称" }
}
```

**错误码**：1001（名称为空）、1003（收藏夹不存在）

---

## 搜索接口

### 全文搜索

```
GET /recipes/search
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | ✅ | 搜索关键词（菜名/简介/标签/食材名） |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

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

**错误码**：1001（缺少搜索关键词）

---

## 文件上传接口

### 上传图片

```
POST /upload/image
```

**请求头**

```
Authorization: Bearer <token>
```

**请求格式**：`multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | 图片文件，支持 jpg/jpeg/png/webp，最大 5 MB |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "http://localhost:3001/uploads/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 204800
  }
}
```

**错误码**：1004（文件超 5MB → 413）、1005（不支持的类型 → 415）、1001（未选择文件 → 400）

---

## 管理后台接口

> 以下接口仅限管理员（`role: 'admin'`）访问。

### 获取统计信息

```
GET /admin/stats
```

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalUsers": 150,
    "totalRecipes": 520,
    "pendingRecipes": 8,
    "todayRecipes": 12,
    "categoryStats": [
      { "name": "家常菜", "count": 120 },
      { "name": "早餐", "count": 45 },
      ...
    ]
  }
}
```

---

### 获取用户列表

```
GET /admin/users
```

**请求头**

```
Authorization: Bearer <token>
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "user-uuid",
        "username": "张三",
        "email": "zhangsan@example.com",
        "role": "user",
        "recipeCount": 5,
        "createdAt": "2026-05-10T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 获取待审核菜谱

```
GET /admin/pending
```

**请求头**

```
Authorization: Bearer <token>
```

**请求参数（Query String）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "recipe-uuid",
        "name": "新菜谱",
        "description": "描述...",
        "coverImage": "https://...",
        "category": "家常菜",
        "difficulty": "easy",
        "authorId": "user-uuid",
        "authorName": "张三",
        "status": "pending",
        "createdAt": "2026-05-31T10:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 审核通过

```
POST /admin/recipes/:id/approve
```

**请求头**

```
Authorization: Bearer <token>
```

**说明**：将菜谱 status 设为 `approved`。

**响应**

```json
{
  "code": 0,
  "message": "审核通过",
  "data": null
}
```

**错误码**：1003（菜谱不存在）

---

### 审核拒绝

```
POST /admin/recipes/:id/reject
```

**请求头**

```
Authorization: Bearer <token>
```

**说明**：将菜谱 status 设为 `rejected`。

**响应**

```json
{
  "code": 0,
  "message": "已拒绝",
  "data": null
}
```

**错误码**：1003（菜谱不存在）

---

### 修改用户角色

```
PATCH /admin/users/:id/role
```

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 用户 ID |

**请求体**

```json
{
  "role": "admin"
}
```

> ⚠️ 不能修改自己的角色。

**响应**

```json
{
  "code": 0,
  "message": "角色更新成功",
  "data": null
}
```

**错误码**：1001（无效角色）、1003（用户不存在）、1002（不能修改自己）

---

## 错误码

| code | HTTP 状态 | 说明 |
|------|-----------|------|
| 0 | 200 | 成功 |
| 1001 | 400 | 参数缺失或格式错误 |
| 1002 | 400 | 字段校验不通过 |
| 1003 | 404 | 资源不存在 |
| 1004 | 413 | 上传文件过大 |
| 1005 | 415 | 不支持的文件类型 |
| 2001 | 401 | 未登录或 Token 过期 |
| 2002 | 403 | 无权限操作 |
| 2003 | 409 | 用户名或邮箱已被注册 |
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

## 权限说明

### 角色说明

| 角色 | 说明 | 适用场景 |
|------|------|----------|
| 游客 | 不需要登录，只能浏览已审核的菜谱 | 随意浏览的用户 |
| user | 普通注册用户，可创建/管理自己的菜谱 | 大多数用户 |
| admin | 管理员，可管理所有内容和用户 | 应用管理者 |

### 权限矩阵

| 操作 | 游客 | 普通用户 | 管理员 |
|------|------|----------|--------|
| 浏览菜谱列表 | ✅（仅 approved） | ✅（approved + 自己的） | ✅（全部） |
| 查看菜谱详情 | ✅ | ✅ | ✅ |
| 搜索菜谱 | ✅ | ✅ | ✅ |
| 创建菜谱 | ❌ | ✅ | ✅ |
| 编辑菜谱 | ❌ | ✅（自己的） | ✅（所有） |
| 删除菜谱 | ❌ | ✅（自己的） | ✅（所有） |
| 收藏/取消收藏 | ❌ | ✅ | ✅ |
| 管理收藏夹 | ❌ | ✅ | ✅ |
| 上传图片 | ❌ | ✅ | ✅ |
| 修改密码/资料 | ❌ | ✅ | ✅ |
| 查看统计数据 | ❌ | ❌ | ✅ |
| 审核菜谱 | ❌ | ❌ | ✅ |
| 管理用户角色 | ❌ | ❌ | ✅ |

### JWT Token 结构

**Access Token**：

```json
{
  "sub": "user-uuid-xxx",
  "role": "user",
  "iat": 1747500000,
  "exp": 1748104800
}
```

**Refresh Token**：

```json
{
  "sub": "user-uuid-xxx",
  "role": "user",
  "iat": 1747500000,
  "exp": 1750092000
}
```

---

## 技术栈

### 当前方案：Node.js + Express + SQLite

| 组件 | 选型 | 备注 |
|------|------|------|
| 运行时 | Node.js v22+ (experimental-sqlite) | 原生 SQLite 支持 |
| 框架 | Express | 轻量 Web 框架 |
| 数据库 | SQLite（WAL 模式） | 零配置，文件数据库 |
| 认证 | jsonwebtoken + bcryptjs | JWT 双 Token + 密码加密 |
| 文件上传 | Multer | multipart/form-data 处理 |
| 前端 | React + Vite + TypeScript | SPA 应用 |

### 前端 API 层对应关系

| 前端 API 对象 | 说明 |
|---------------|------|
| `authApi` | 认证（登录/注册/刷新/退出） |
| `userApi` | 用户（信息/资料/密码/收藏/收藏夹） |
| `recipesApi` | 菜谱（列表/详情/增删改/收藏） |
| `categoriesApi` | 分类统计 |
| `uploadApi` | 文件上传 |
| `adminApi` | 管理后台（统计/用户/审核） |

---

*文档维护：菜谱记录项目组*
