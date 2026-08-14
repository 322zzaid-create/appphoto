# apex

Discover and download stunning wallpapers for your phone, desktop, and tablet.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **State:** Zustand + TanStack React Query
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **PWA:** Service Worker + Web App Manifest

## Getting Started

1. Copy the environment file and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
