# 🗂️ Forge Kanban

A production-ready Trello-style Kanban board application built for the **Forge 2 Edition 2 Qualifier**.

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org)

---

## ✨ Features

### Authentication
- ✅ Register / Login / Logout
- ✅ Laravel Sanctum token-based auth
- ✅ Protected routes (frontend & backend)
- ✅ Persistent sessions via localStorage

### Boards
- ✅ Create, update, delete boards
- ✅ Custom board colors
- ✅ User-owned boards (authorization)

### Columns
- ✅ Create, rename, delete columns
- ✅ Drag & drop reordering
- ✅ Task count badge

### Tasks
- ✅ Create, edit, delete tasks
- ✅ Priority levels (Low / Medium / High)
- ✅ Due dates
- ✅ Descriptions
- ✅ Drag & drop between columns
- ✅ Position persistence

### UI/UX
- ✅ Dark mode design
- ✅ Smooth animations
- ✅ Responsive layout
- ✅ Loading & empty states
- ✅ Modal dialogs with confirm
- ✅ Inline editing

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| PHP  | 8.2+    |
| Composer | 2.x |
| Node.js  | 18+  |
| npm  | 9+      |

### 1. Clone & Setup

```bash
git clone https://github.com/your-user/forge2-kanban.git
cd forge2-kanban
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Run migrations + seed demo data
php artisan migrate --seed

# Start the API server
php artisan serve
```

Backend runs at: **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Demo Credentials

After seeding, use:

| Field    | Value                   |
|----------|-------------------------|
| Email    | demo@forgekanban.com    |
| Password | password                |

---

## 📁 Project Structure

```
forge2-kanban/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── BoardController.php
│   │   │   ├── ColumnController.php
│   │   │   └── TaskController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Board.php
│   │   │   ├── Column.php
│   │   │   └── Task.php
│   │   └── Policies/
│   │       └── BoardPolicy.php
│   ├── database/
│   │   ├── migrations/        # All DB schema
│   │   ├── factories/         # Test factories
│   │   └── seeders/           # Demo data
│   ├── routes/api.php          # API route definitions
│   └── tests/Feature/         # PHPUnit tests
│
└── frontend/                   # React + TypeScript + Vite
    └── src/
        ├── api/               # Axios services
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── boards.ts
        │   ├── columns.ts
        │   └── tasks.ts
        ├── components/        # Reusable UI
        │   ├── KanbanColumn.tsx
        │   ├── TaskCard.tsx
        │   ├── TaskModal.tsx
        │   ├── Sidebar.tsx
        │   └── ProtectedRoute.tsx
        ├── context/
        │   └── AuthContext.tsx
        ├── layouts/
        │   └── AppLayout.tsx
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── BoardsPage.tsx
        │   └── BoardDetailPage.tsx
        └── types/
            └── index.ts
```

---

## 🗃️ Database Schema

```
users
  id, name, email, password, timestamps

boards
  id, user_id (FK→users), name, description, color, timestamps

columns
  id, board_id (FK→boards cascade), name, position, timestamps

tasks
  id, column_id (FK→columns cascade), title, description,
  position, due_date, priority (enum), timestamps
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint       | Description        |
|--------|---------------|---------------------|
| POST   | /api/register | Register new user   |
| POST   | /api/login    | Login               |
| POST   | /api/logout   | Logout (auth)       |
| GET    | /api/user     | Get current user    |

### Boards (all require auth)
| Method | Endpoint              | Description   |
|--------|-----------------------|---------------|
| GET    | /api/boards           | List boards   |
| POST   | /api/boards           | Create board  |
| GET    | /api/boards/:id       | Get board     |
| PUT    | /api/boards/:id       | Update board  |
| DELETE | /api/boards/:id       | Delete board  |

### Columns
| Method | Endpoint                       | Description      |
|--------|-------------------------------|------------------|
| POST   | /api/boards/:id/columns        | Create column    |
| PUT    | /api/columns/:id               | Rename column    |
| DELETE | /api/columns/:id               | Delete column    |
| PATCH  | /api/columns/:id/reorder       | Reorder column   |

### Tasks
| Method | Endpoint                        | Description    |
|--------|---------------------------------|----------------|
| POST   | /api/columns/:id/tasks          | Create task    |
| GET    | /api/tasks/:id                  | Get task       |
| PUT    | /api/tasks/:id                  | Update task    |
| DELETE | /api/tasks/:id                  | Delete task    |
| PATCH  | /api/tasks/:id/move             | Move task      |

---

## 🧪 Running Tests

```bash
cd backend
php artisan test
```

Test coverage:
- `AuthTest` — register, login, logout, unauthorized access
- `BoardTest` — CRUD, authorization (403 on other user's board)
- `ColumnTest` — create, rename, delete
- `TaskTest` — create, update, move, delete

---

## 🔒 Security

- **Sanctum** token-based authentication
- **Policies** enforce board ownership (403 on unauthorized access)
- **Validation** on all inputs (request validation)
- **Cascade deletes**: board → columns → tasks
- **CORS** configured for local development

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME=ForgeKanban
APP_KEY=base64:...        # Generated by php artisan key:generate
APP_DEBUG=false           # Set false in production
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Frontend (`frontend/.env`)

```env
# Not required — API is proxied via Vite config
# If deploying separately:
VITE_API_URL=https://api.yourdomain.com
```

---

## 🚢 Deployment

### Backend (Laravel)

```bash
# Install production dependencies
composer install --no-dev --optimize-autoloader

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set up DB
php artisan migrate --force

# Serve via Nginx/Apache or Laravel Forge
```

### Frontend (React)

```bash
npm run build
# Serve dist/ with any static host (Vercel, Netlify, Nginx)
```

---

## 📝 License

MIT — built for Forge 2 Qualifier by a senior software engineer.
