# Agent Guide for Mahita Codebase

This repository contains a full-stack web application with a React frontend and an Express/Node.js backend.
This guide outlines the development standards, commands, and patterns for AI agents working in this codebase.

## 1. Project Structure

- **Monorepo-style**:
  - `client/`: Frontend (React + Vite + Tailwind CSS)
  - `server/`: Backend (Node.js + Express + Prisma + PostgreSQL)
- **Database**: PostgreSQL with Prisma ORM (schema in `server/prisma/schema.prisma`).

## 2. Environment Setup & Commands

### Frontend (`/client`)
- **Install**: `npm install`
- **Dev Server**: `npm run dev` (Runs on http://localhost:5173)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

### Backend (`/server`)
- **Install**: `npm install`
- **Dev Server**: `npm run dev` (Runs on http://localhost:5000 using `nodemon` + `tsx`)
- **Database Push**: `npx prisma db push` (Updates DB schema without migration history)
- **Database Studio**: `npx prisma studio` (GUI to view data)

### Testing
- **Status**: Currently, there are no automated tests set up.
- **Manual Testing**: Follow "Testing Phase 1" in root `README.md`.
- **Future**: If adding tests, prefer Vitest for Client and Jest/Supertest for Server.

## 3. Code Style & Conventions

### General
- **Language**: JavaScript (ES Modules).
- **Indentation**: 2 spaces.
- **Semicolons**: Always use semicolons.
- **Quotes**: Single quotes `'` for JS strings, Double quotes `"` for JSX attributes.
- **Formatting**: Follow existing ESLint config in `client/`.

### Frontend (React)
- **Framework**: React 19 + Vite.
- **Styling**: Tailwind CSS v4.
  - Use utility classes directly in `className`.
  - **Design System**: Strict adherence to the provided OKLCH color palette and rounded aesthetics.
- **Components**: Functional components with PascalCase naming.
- **State Management**: React Context (e.g., `AuthContext`) for global state.
- **Icons**: `lucide-react`.
- **Toast**: `react-hot-toast` for notifications.

### Design System & Aesthetics
**CRITICAL**: All UI must be aesthetically pleasing, clean, and polished.
- **Colors**: Use the specific OKLCH variables defined in `client/src/index.css`.
  - Primary: `bg-primary`, `text-primary-foreground`
  - Cards: `bg-card`, `text-card-foreground`, `border-border`
  - Backgrounds: `bg-background`, `text-foreground`
- **Shape**: Use rounded corners (`rounded-lg` or `var(--radius)`).
- **Typography**: Clean, readable sans-serif fonts (`Geist`, `Inter`, etc.).
- **UI Patterns**:
  - **Reuse**: Create small, reusable components (Button, Card, Input) first.
  - **Spacing**: Consistent padding/margin (multiples of 4).
  - **Feedback**: Hover states, active states, and focus rings are mandatory.
  - **Glassmorphism/Modern**: Use subtle borders and shadows (e.g., `shadow-sm`, `border-border`).

### Reference CSS Variables (Add to `client/src/index.css`)
```css
:root {
  --background: oklch(0.9777 0.0041 301.4256);
  --foreground: oklch(0.3651 0.0325 287.0807);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.3651 0.0325 287.0807);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.3651 0.0325 287.0807);
  --primary: oklch(0.6104 0.0767 299.7335);
  --primary-foreground: oklch(0.9777 0.0041 301.4256);
  --secondary: oklch(0.8957 0.0265 300.2416);
  --secondary-foreground: oklch(0.3651 0.0325 287.0807);
  --muted: oklch(0.8906 0.0139 299.7754);
  --muted-foreground: oklch(0.5288 0.0375 290.7895);
  --accent: oklch(0.7889 0.0802 359.9375);
  --accent-foreground: oklch(0.3394 0.0441 1.7583);
  --destructive: oklch(0.6332 0.1578 22.6734);
  --destructive-foreground: oklch(0.9777 0.0041 301.4256);
  --border: oklch(0.8447 0.0226 300.1421);
  --input: oklch(0.9329 0.0124 301.2783);
  --ring: oklch(0.6104 0.0767 299.7335);
  --radius: 0.5rem;
}
.dark {
  --background: oklch(0.2166 0.0215 292.8474);
  --foreground: oklch(0.9053 0.0245 293.5570);
  /* ... mappings for dark mode ... */
}
```

### Backend (Node.js/Express)
- **Module System**: Native ES Modules (`type: "module"` in `package.json`).
- **Imports**: **CRITICAL**: Local imports MUST include the `.js` extension.
  - Correct: `import User from './models/User.js';`
  - Incorrect: `import User from './models/User';`
- **Architecture**: Controller-Service pattern or Route-Handler pattern.
  - Routes: `src/routes/*.js`
  - Middleware: `src/middleware/*.js`
- **Validation**: Use `zod` for request validation.
- **Error Handling**: Use the global error handler middleware. Do not leave unhandled promises.
- **Database**: Use Prisma Client (`prisma.user.findMany()`).

## 4. Workflow Rules

1. **Verify Directory**: Always check if you are in `client/` or `server/` before running commands.
2. **Server Imports**: Did you verify that all server-side local imports have `.js` extensions?
3. **Tailwind**: Use Tailwind v4 syntax. No `tailwind.config.js` is needed for basic usage; configuration is largely automatic or in CSS.
4. **Secrets**: Never commit `.env` files. Use `dotenv` for environment variables.
5. **Linting**: Run `npm run lint` in `client/` before finishing tasks to ensure code quality.

## 5. Agent Behavior
- **Proactive Fixes**: If you see a missing `.js` extension in a server import, fix it.
- **UI/UX**: When adding UI, match the existing clean, minimal aesthetic using Tailwind.
- **Safety**: Do not force push to database unless explicitly asked (`db push` is destructive to data if schema changes incompatible).

