# MindPulse - AI-Enhanced Personal Productivity Tool

A personal productivity tool for students, featuring natural language task parsing, AI-generated note summaries, and smart reminders powered by AI Agent.

## Features

- **AI Task Parsing**: Input natural language descriptions, AI auto-fills task forms
- **Smart Note Management**: Multi-format note upload, AI auto-generates summaries and tag recommendations
- **Smart Reminders**: Task-based intelligent reminders with multiple recurrence frequencies
- **Real-time Notifications**: WebSocket-based real-time message push

## Tech Stack

- **Framework**: Vue 3.5+ (Composition API + `<script setup>`)
- **Type System**: TypeScript 5.0+ (strict mode)
- **UI Library**: Element Plus 2.13+
- **HTTP Client**: Axios 1.14+
- **Realtime**: STOMP over SockJS
- **Router**: Vue Router 4.6+
- **State Management**: Pinia 3.0+
- **Build Tool**: Vite 8.0+
- **i18n**: vue-i18n 9 (Chinese/English)
- **Theme**: CSS custom properties (light/dark theme toggle)

## Project Structure

```
src/
├── api/                    # API modules
│   ├── authApi.ts          # Authentication API
│   ├── noteApi.ts          # Note API
│   ├── reminderApi.ts      # Reminder API
│   ├── taskApi.ts          # Task API
│   ├── pomodoroApi.ts      # Pomodoro API
│   ├── dashboardApi.ts     # Dashboard API
│   ├── adminApi.ts         # Admin API
│   └── index.ts            # Axios configuration
├── components/             # Shared components
│   ├── AIInput.vue         # AI input component
│   └── Layout.vue          # Main layout
├── i18n/                   # Internationalization
│   ├── index.ts            # i18n instance
│   └── locales/            # Translation files
│       ├── zh-CN.ts        # Chinese
│       └── en.ts           # English
├── router/                 # Route configuration
│   └── index.ts            # Route definitions
├── stores/                 # Pinia state management
│   ├── user.ts             # User state
│   ├── task.ts             # Task state
│   ├── note.ts             # Note state
│   ├── pomodoro.ts         # Pomodoro state
│   ├── dashboard.ts        # Dashboard state
│   └── admin.ts            # Admin state
├── types/                  # TypeScript type definitions
│   ├── auth.ts             # Auth types
│   ├── note.ts             # Note types
│   ├── reminder.ts         # Reminder types
│   ├── task.ts             # Task types
│   ├── pomodoro.ts         # Pomodoro types
│   ├── dashboard.ts        # Dashboard types
│   └── admin.ts            # Admin types
├── utils/                  # Utilities
│   └── websocket.ts        # WebSocket connection manager
├── views/                  # Page components
│   ├── LoginView.vue       # Login page
│   ├── RegisterView.vue    # Registration page
│   ├── TasksView.vue       # Task management
│   ├── NotesView.vue       # Note management
│   ├── RemindersView.vue   # Smart reminders
│   ├── PomodoroView.vue    # Pomodoro timer
│   ├── DashboardView.vue   # Data dashboard
│   └── AdminView.vue       # Admin panel
├── App.vue                 # Root component
├── main.ts                 # Entry point
└── style.css               # Global styles + CSS variables
```

## Core Features

### Task Management
- Task list (filter: all/pending/completed/archived)
- Task create/edit forms
- AI task parsing (natural language auto-fills form)
- Task priority labels
- Task status management

### Note Management
- Note list (card or list view)
- Note upload (PDF, image, text)
- Note tag system
- AI summary generation
- Note search and related recommendations

### Smart Reminders
- Reminder settings (time, frequency)
- Notification history
- Desktop notifications (WebSocket real-time)

### Pomodoro Timer
- Focus/short break/long break sessions
- SVG ring progress display
- Study statistics (daily/weekly/monthly)
- Session history

### Data Dashboard
- Summary cards (total tasks, completion rate, active days)
- Productivity trend charts
- Category distribution
- GitHub-style study heatmap

### Admin Panel
- Audit log viewer (paginated, filtered)
- User management (role editing)
- Admin statistics

## API Endpoints

> Backend API base: `http://localhost:8090/api`
> Online API docs: `http://localhost:8090/doc.html`
> Offline API docs: `interface.md` in project root

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login, returns JWT token |
| POST | `/api/auth/register` | User registration |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks?status=pending` | Task list (status filter) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Task detail |
| PUT | `/api/tasks/{id}` | Update task |
| PUT | `/api/tasks/{id}/status?status=completed` | Update status (distributed lock, 409=conflict) |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/parse` | AI task parsing (NL → structured, semantic cache) |
| GET | `/api/tasks/cache-stats` | AI cache stats (hit rate, avg response time) |

### Notes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes?keyword=xxx` | Note list (keyword search) |
| POST | `/api/notes` | Sync upload note |
| POST | `/api/notes/async` | **Recommended** — async upload, AI summary via WebSocket |
| GET | `/api/notes/{id}` | Note detail (AI summary, category, status) |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |

### Reminders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reminders` | Reminder list |
| POST | `/api/reminders` | Create reminder (ONCE/DAILY/WEEKLY/CUSTOM) |
| GET | `/api/reminders/{id}` | Reminder detail |
| PUT | `/api/reminders/{id}` | Update reminder |
| DELETE | `/api/reminders/{id}` | Delete reminder |

### WebSocket Real-time Push
| Endpoint | Description |
|----------|-------------|
| Connection | `ws://localhost:8090/ws` (STOMP over SockJS) |
| `/user/queue/reminders` | Personal reminder notifications |
| `/user/queue/note-summary` | Note summary async complete |
| `/topic/reminders` | Global broadcast reminders |

## Installation & Running

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend running at `localhost:8090` (see `interface.md` in project root)

## Development Conventions

- All components use `<script setup lang="ts">` syntax
- Type definitions in `src/types/`, interfaces named with request/response suffix
- API calls through `src/api/` modules, never call axios directly in components
- State management with Pinia (Composition API style), stores handle API calls
- Component styles use scoped CSS, theme colors via CSS custom properties
- Route guards ensure auth state (unauthenticated → `/login`, authenticated → skip login)
- All user actions wrapped in try/catch, feedback via `ElMessage`
- Ensure `npm run build` has no TypeScript errors before committing
