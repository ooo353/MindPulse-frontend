# MindPulse - AI增强型个人生产力工具

面向学生群体的个人生产力工具，通过AI Agent实现自然语言任务解析、笔记摘要生成和智能提醒。

## 项目特性

- **AI任务解析**：用户输入自然语言描述，AI自动解析并填充任务表单
- **智能笔记管理**：支持多种格式笔记上传，AI自动生成摘要和推荐标签
- **智能提醒系统**：基于任务的智能提醒，支持多种重复频率
- **实时通知**：通过WebSocket实现实时消息推送

## 技术栈

- **前端框架**：Vue 3.5+ (Composition API + `<script setup>`)
- **类型系统**：TypeScript 5.0+ (strict 模式)
- **UI组件库**：Element Plus 2.13+
- **HTTP客户端**：Axios 1.14+
- **实时通信**：STOMP over SockJS
- **路由管理**：Vue Router 4.6+
- **状态管理**：Pinia 3.0+
- **构建工具**：Vite 8.0+
- **主题系统**：CSS 自定义属性（明暗主题切换）

## 项目结构

```
src/
├── api/                    # API接口封装
│   ├── authApi.ts          # 认证相关API
│   ├── noteApi.ts          # 笔记相关API
│   ├── reminderApi.ts      # 提醒相关API
│   ├── taskApi.ts          # 任务相关API
│   └── index.ts            # Axios配置
├── components/             # 公共组件
│   ├── AIInput.vue         # AI输入框组件
│   └── Layout.vue          # 主布局组件
├── router/                 # 路由配置
│   └── index.ts            # 路由定义
├── stores/                 # Pinia状态管理
│   ├── user.ts             # 用户状态
│   ├── task.ts             # 任务状态
│   └── note.ts             # 笔记状态
├── types/                  # TypeScript类型定义
│   ├── auth.ts             # 认证类型
│   ├── note.ts             # 笔记类型
│   ├── reminder.ts         # 提醒类型
│   └── task.ts             # 任务类型
├── utils/                  # 工具函数
│   └── websocket.ts        # WebSocket连接管理
├── views/                  # 页面组件
│   ├── LoginView.vue       # 登录页面
│   ├── RegisterView.vue    # 注册页面
│   ├── TasksView.vue       # 任务管理页面
│   ├── NotesView.vue       # 笔记管理页面
│   └── RemindersView.vue   # 智能提醒页面
├── App.vue                 # 根组件
├── main.ts                 # 应用入口
└── style.css               # 全局样式 + CSS 变量（明暗主题）
```

## 核心功能

### 任务管理
- 任务列表（支持筛选：全部/待完成/已完成/已归档）
- 任务创建/编辑表单
- AI任务解析（自然语言输入自动填充表单）
- 任务日历视图
- 任务优先级标识
- 任务状态管理

### 笔记管理
- 笔记列表（卡片或列表视图）
- 笔记上传组件（支持PDF、图片、文本）
- 笔记分类标签系统
- AI摘要生成
- 笔记搜索与关联推荐

### 智能提醒
- 提醒设置界面（设置提醒时间、频率）
- 通知历史记录列表
- 桌面通知系统（WebSocket实时接收）

## API 接口

> 后端 API 基础地址：`http://localhost:8090/api`  
> 在线 API 文档：`http://localhost:8090/doc.html`  
> 离线 API 文档：根目录 `interface.md`

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录，返回 JWT 令牌 |
| POST | `/api/auth/register` | 用户注册 |

### 任务管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks?status=pending` | 任务列表（支持状态过滤） |
| POST | `/api/tasks` | 创建任务 |
| GET | `/api/tasks/{id}` | 任务详情 |
| PUT | `/api/tasks/{id}` | 更新任务 |
| PUT | `/api/tasks/{id}/status?status=completed` | 更新任务状态（分布式锁保护，409=并发冲突） |
| DELETE | `/api/tasks/{id}` | 删除任务 |
| POST | `/api/tasks/parse` | AI 任务解析（自然语言 → 结构化任务，支持语义缓存） |
| GET | `/api/tasks/cache-stats` | AI 解析缓存统计（命中率、平均响应时间） |

### 笔记管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notes?keyword=xxx` | 笔记列表（支持关键字搜索） |
| POST | `/api/notes` | 同步上传笔记 |
| POST | `/api/notes/async` | **推荐** — 异步上传，AI 摘要通过 WebSocket 推送 |
| GET | `/api/notes/{id}` | 笔记详情（含 AI 生成的摘要、分类、状态） |
| PUT | `/api/notes/{id}` | 更新笔记 |
| DELETE | `/api/notes/{id}` | 删除笔记 |

### 智能提醒
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reminders` | 提醒列表 |
| POST | `/api/reminders` | 创建提醒（ONCE/DAILY/WEEKLY/CUSTOM） |
| GET | `/api/reminders/{id}` | 提醒详情 |
| PUT | `/api/reminders/{id}` | 更新提醒 |
| DELETE | `/api/reminders/{id}` | 删除提醒 |

### WebSocket 实时推送
| 项目 | 说明 |
|------|------|
| 连接地址 | `ws://localhost:8090/ws` (STOMP over SockJS) |
| `/user/queue/reminders` | 个人提醒通知（任务到期 + 自定义提醒） |
| `/user/queue/note-summary` | 笔记摘要异步处理完成通知 |
| `/topic/reminders` | 全局广播提醒 |

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 后端服务运行在 `localhost:8090`（详见根目录 `interface.md`）

## 开发规范

- 所有组件使用 `<script setup lang="ts">` 语法
- 类型定义统一放在 `src/types/` 目录，接口以请求/响应后缀命名
- API 调用统一通过 `src/api/` 目录下的模块，不直接在组件中调用 axios
- 状态管理使用 Pinia（组合式 API 风格），store 负责 API 调用
- 组件样式使用 scoped CSS，主题色通过 CSS 自定义属性引用
- 路由守卫确保认证状态（未登录 → `/login`，已登录 → 跳过登录页）
- 所有用户操作使用 try/catch 包裹，通过 `ElMessage` 反馈结果
- 提交前确保 `npm run build` 无 TypeScript 错误