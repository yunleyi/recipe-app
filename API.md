# 菜谱记录 API 文档

> 版本：v2.0
> 文档日期：2026-05-17
> 状态：**待开发**（当前前端使用 localStorage 模拟，后端接入后替换 `src/lib/recipeData.ts` 中的数据层）

---

## 目录

1. [接口规范](#接口规范)
2. [数据模型](#数据模型)
3. [认证接口](#认证接口)
4. [用户接口](#用户接口)
5. [菜谱接口](#菜谱接口)
6. [分类接口](#分类接口)
7. [收藏接口](#收藏接口)
8. [搜索接口](#搜索接口)
9. [文件上传接口](#文件上传接口)
10. [错误码](#错误码)
11. [权限说明](#权限说明)
12. [技术栈建议](#技术栈建议)

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

### 认证方式

采用 **JWT Token** 进行身份认证。

- 用户登录/注册后获取 Token
- Token 有效期建议 7 天
- Token 过期后需要刷新或重新登录

**请求头格式**：
```
Authorization: Bearer <token>
```

---

## 数据模型

### User（用户）

```typescript
interface User {
  id: string;                    // 唯一 ID（UUID）
  username: string;              // 用户名，登录用，3-20字符
  email: string;                 // 邮箱，唯一
  password: string;             // 密码（加密存储，不返回前端）
  role: 'user' | 'admin';       // 角色：普通用户 / 管理员
  createdAt: string;             // 注册时间（ISO 8601）
  updatedAt: string;             // 更新时间（ISO 8601）
}
```

> ⚠️ **安全注意**：接口返回的 User 对象中不应包含 `password` 字段

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
  servings: number;               // 份量（人份）
  ingredients: Ingredient[];     // 食材清单
  steps: Step[];                 // 步骤列表
  isFavorite: boolean;            // 是否收藏
  userId: string;                // 所属用户 ID
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
| username | ✅ | 3-20 字符，支持中文、字母、数字 |
| email | ✅ | 合法邮箱格式，唯一 |
| password | ✅ | 6-20 字符 |

**响应示例**

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-xxx",
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    }
  }
}
```

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

> ⚠️ account 支持邮箱或用户名登录

**响应示例**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-xxx",
      "username": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    }
  }
}
```

---

### 刷新 Token

```
POST /auth/refresh
```

**请求头**

```
Authorization: Bearer <refresh_token>
```

**响应示例**

```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 退出登录

```
POST /auth/logout
```

**请求头**

```
Authorization: Bearer <token>
```

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
- 游客：返回所有菜谱（不显示个人操作按钮）
- 登录用户：返回所有菜谱，当前用户的菜谱显示编辑按钮

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
        "userId": "user-xxx",
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
      { "order": 1, "description": "番茄洗净切块...", "tip": "可以去皮" },
      { "order": 2, "description": "热锅倒油...", "tip": null }
    ],
    "isFavorite": true,
    "userId": "user-xxx",
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

**请求头**

```
Authorization: Bearer <token>
```

**说明**：需要登录，普通用户和管理员都可以创建。

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

**请求头**

```
Authorization: Bearer <token>
```

**权限规则**：
- 菜谱作者：可以更新自己的菜谱 ✅
- 管理员：可以更新任意菜谱 ✅
- 其他用户：返回 403 无权限 ❌

**请求体**：同创建菜谱（全量更新）。

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

**请求头**

```
Authorization: Bearer <token>
```

**说明**：需要登录。

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": { "isFavorite": true }
}
```

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

### 获取我的收藏列表

```
GET /user/favorites
```

**请求头**

```
Authorization: Bearer <token>
```

**说明**：返回当前用户收藏的所有菜谱。

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
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

**说明**：搜索范围包括菜名、简介、标签、食材名。

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

**请求头**

```
Authorization: Bearer <token>
```

**说明**：需要登录。

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
| 游客 | 不需要登录，只能浏览 | 随意浏览的用户 |
| user | 普通注册用户，只能管理自己的菜谱 | 大多数用户 |
| admin | 管理员，可以管理所有内容 | 应用管理者 |

### 权限矩阵

| 操作 | 游客 | 普通用户 | 管理员 |
|------|------|----------|--------|
| 浏览菜谱列表 | ✅ | ✅ | ✅ |
| 查看菜谱详情 | ✅ | ✅ | ✅ |
| 搜索菜谱 | ✅ | ✅ | ✅ |
| 创建菜谱 | ❌ | ✅（自己的） | ✅ |
| 编辑菜谱 | ❌ | ✅（自己的） | ✅ |
| 删除菜谱 | ❌ | ✅（自己的） | ✅（所有） |
| 收藏/取消收藏 | ❌ | ✅ | ✅ |
| 上传图片 | ❌ | ✅ | ✅ |
| 修改密码 | ❌ | ✅ | ✅ |

### JWT Token 结构建议

```json
{
  "sub": "user-uuid-xxx",
  "role": "user",
  "exp": 1747500000
}
```

---

## 技术栈建议

### 推荐方案：Python + FastAPI

适合：上手快、自动生成文档、个人项目

| 组件 | 选型 | 备注 |
|------|------|------|
| 框架 | FastAPI | 自动生成 OpenAPI 文档 |
| ORM | SQLAlchemy | 数据库操作 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | 轻量够用 |
| 认证 | python-jose + passlib | JWT + 密码加密 |
| 验证 | Pydantic v2 | 自动校验请求数据 |
| 部署 | 腾讯云 SCF / 阿里云函数计算 | 按量付费，适合个人项目 |

### 备选方案：Node.js + Express

| 组件 | 选型 | 备注 |
|------|------|------|
| 框架 | Express / NestJS | NestJS 更适合大型项目 |
| ORM | Prisma | 类型安全 |
| 数据库 | MySQL / PostgreSQL | — |
| 认证 | jsonwebtoken + bcrypt | JWT + 密码加密 |

### 前端对接方式

前端 `src/lib/recipeData.ts` 目前暴露以下函数，接入后端时：

| 当前函数 | 对应 API |
|----------|----------|
| 登录/注册 | `POST /auth/login` / `POST /auth/register` |
| 获取 Token | 登录成功后返回 |
| 加载菜谱 | `GET /recipes`（自动带上 Token） |
| 创建菜谱 | `POST /recipes` |
| 更新菜谱 | `PUT /recipes/:id` |
| 删除菜谱 | `DELETE /recipes/:id` |
| 收藏/取消 | `POST/DELETE /recipes/:id/favorite` |
| 搜索 | `GET /recipes/search?q=...` |
| 上传图片 | `POST /upload/image` |

---

*文档维护：菜谱记录前端项目组*
