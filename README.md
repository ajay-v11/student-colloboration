# StudyHub - Student Collaboration Platform

A web-based platform for students to connect, collaborate, and learn together.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcrypt)

## Prerequisites

- Node.js 18+
- PostgreSQL database running locally

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is running. Create a database:

```bash
psql -U postgres
CREATE DATABASE mahita;
\q
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Update .env with your database credentials if needed
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mahita?schema=public"

# Push schema to database (creates tables)
npx prisma db push

# Start the server
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

## Testing Phase 1 (Authentication)

1. Open http://localhost:5173
2. Click "Get Started" or "Register"
3. Fill in the registration form and submit
4. You should be redirected to the dashboard
5. Refresh the page - you should stay logged in
6. Click logout - you should be redirected to login
7. Try logging in with wrong password - should show error
8. Login with correct credentials - should work

## Project Structure

```
mahita/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (Auth)
│   │   └── lib/            # Utilities, API client
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── lib/            # Prisma client
│   └── prisma/
│       └── schema.prisma   # Database schema
```
