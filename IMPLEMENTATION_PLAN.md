# Implementation Plan - Student Collaboration Platform

## Tech Stack

- **Frontend**: React 18 + Vite + React Router + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Real-time**: Socket.io
- **File Uploads**: Multer + local storage (or Cloudinary for demo)
- **Validation**: Zod (backend) + React Hook Form (frontend)

---

## Phase 1: Frontend Infrastructure & Design System (Frontend First)

**Duration**: 3-4 days

### Goal
Establish the visual language, global styles, and reusable component library before building pages.

### Deliverables

1.  **Frontend Setup**: Vite + React + Tailwind CSS v4.
2.  **Design System Implementation**:
    *   `index.css` configured with the provided OKLCH variables.
    *   Fonts setup (Geist/Inter).
3.  **UI Component Library** (Reusable, Polished, Rounded):
    *   `Button` (variants: default, secondary, ghost, outline, destructive)
    *   `Input` / `Textarea` / `Label`
    *   `Card` (Header, Content, Footer)
    *   `Badge` / `Tag`
    *   `Avatar`
    *   `Dialog` / `Modal` (using accessible primitives like Radix UI or headless UI if needed, or pure custom)
    *   `Dropdown`
4.  **Layouts**:
    *   `RootLayout`: Providers (Theme, Toast, Auth placeholder).
    *   `AuthLayout`: For Login/Register pages (Clean, centered).
    *   `DashboardLayout`: Sidebar/Navbar structure with responsive design.

### Tasks
- [ ] Initialize `client` with Vite.
- [ ] Install Tailwind v4 and configure `index.css` with the specific OKLCH color palette.
- [ ] Create `components/ui` directory.
- [ ] Build `Button` component with hover effects and focus rings.
- [ ] Build `Input` and `Label` components.
- [ ] Build `Card` system for consistent content containers.
- [ ] Build `Sidebar` and `Navbar` components (responsive).
- [ ] Set up React Router with dummy routes.

---

## Phase 2: Frontend Pages & Mock Flows (Frontend First)

**Duration**: 4-5 days

### Goal
Build all application pages with static/mock data to verify UX and Design before backend integration.

### Deliverables

1.  **Auth Pages**: Login, Register (Beautiful forms).
2.  **Dashboard**: Overview page with stats cards and activity feed (Mock data).
3.  **Profile**: View and Edit pages.
4.  **Feature Pages**:
    *   Study Groups List & Detail View.
    *   Projects List & Detail View.
    *   Internships List.
    *   Chat Interface (UI only).

### Tasks
- [ ] Build `/login` and `/register` pages using UI components.
- [ ] Build `/dashboard` with mock stats and activity charts.
- [ ] Build `/profile` page with tabs for "About", "Skills", "Posts".
- [ ] Build `/groups` grid view with search filters (UI only).
- [ ] Build `/groups/:id` detail view with member list and chat placeholder.
- [ ] Build `/projects` listing with filter tabs.
- [ ] Build `/messages` layout (Sidebar with conversations, Main chat area).
- [ ] Verify responsiveness on all pages.

---

## Phase 3: Backend Setup & Auth Integration

**Duration**: 3-4 days

### Goal
Set up the server and connect real authentication.

### Deliverables
1.  Express Server setup.
2.  PostgreSQL + Prisma setup.
3.  Auth API (Register, Login, Me).
4.  Frontend Auth Context connected to API.

### Tasks
- [ ] Initialize `server` directory.
- [ ] Set up Prisma with User model.
- [ ] Create Auth endpoints (`/register`, `/login`, `/me`).
- [ ] Replace Frontend Mock Auth with real API calls.
- [ ] Implement Protected Routes in React.

---

## Phase 4: Core Features Backend & Integration

**Duration**: 5-6 days

### Goal
Implement CRUD APIs for Groups, Projects, and Internships and connect them to the Frontend.

### Tasks
- [ ] **Profiles**: Connect Profile View/Edit to API.
- [ ] **Study Groups**:
    *   Create Group/Member Prisma models.
    *   Implement CRUD APIs.
    *   Connect Frontend Group List & Detail pages.
    *   Implement Join/Leave logic.
- [ ] **Projects**:
    *   Create Project models.
    *   Implement CRUD APIs.
    *   Connect Frontend Project pages.
- [ ] **Internships**:
    *   Create Internship models.
    *   Implement APIs & Frontend connection.

---

## Phase 5: Real-time Features (Socket.io)

**Duration**: 4-5 days

### Goal
Activate the Chat and Notification UIs with real-time data.

### Tasks
- [ ] Set up Socket.io server.
- [ ] Implement `Message` model in Prisma.
- [ ] Activate Chat UI in Study Groups (Real-time send/receive).
- [ ] Activate Private Messaging (DM) system.
- [ ] Implement Real-time Notifications.

---

## Phase 6: Polish & Final Review

**Duration**: 3 days

### Goal
Final testing, bug fixes, and aesthetic tweaks.

### Tasks
- [ ] Global Search implementation.
- [ ] Empty states and Loading skeletons (replace generic loaders).
- [ ] Final accessibility check.
- [ ] Mobile responsiveness refinement.
- [ ] Deployment preparation.

---

## Phase 7: (Optional) Advanced Features
... (Remaining items from original plan)


---

## Folder Structure

```
mahita/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (Auth, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities, API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.io handlers
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── PRD.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Auth | 4-5 days | Week 1 |
| Phase 2: Profiles | 2-3 days | Week 1-2 |
| Phase 3: Groups CRUD | 4-5 days | Week 2 |
| Phase 4: Group Chat | 4-5 days | Week 3 |
| Phase 5: Projects | 4-5 days | Week 3-4 |
| Phase 6: Internships | 3-4 days | Week 4 |
| Phase 7: Private Messages | 3-4 days | Week 5 |
| Phase 8: Notifications | 3-4 days | Week 5 |
| Phase 9: Polish | 3-4 days | Week 6 |

**Total: ~6 weeks for full implementation**

---

## Running the Project Locally

```bash
# Terminal 1 - Database
# Make sure PostgreSQL is running

# Terminal 2 - Backend
cd server
npm install
npx prisma migrate dev
npm run dev    # Runs on http://localhost:5000

# Terminal 3 - Frontend
cd client
npm install
npm run dev    # Runs on http://localhost:5173
```
