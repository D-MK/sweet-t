# Sweet-T - Claude Code Context

## Project Overview
Sweet-T is a lightweight glucose tracking SPA for diabetes management. It runs entirely client-side and is deployed on GitHub Pages with zero backend infrastructure.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/postcss`, NOT the old `tailwindcss` PostCSS plugin)
- **UI Components**: Radix UI primitives + Tailwind (shadcn/ui pattern)
- **Auth**: Firebase Auth (client-side only - Google OAuth, GitHub OAuth, email/password)
- **Database**: Turso (edge-distributed SQLite via `@libsql/client`)
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## Key Architecture Decisions
- **No backend server** - everything runs in the browser. Firebase handles auth, Turso handles data.
- **No react-router-dom** - navigation is tab-based via local state in App.tsx.
- **Tailwind v4** - uses `@import "tailwindcss"` in CSS, NOT the old `@tailwind base/components/utilities` directives.
- **verbatimModuleSyntax** is enabled in tsconfig - all type imports MUST use `import type { ... }`.
- **noUnusedLocals / noUnusedParameters** is strict - prefix unused params with underscore `_`.
- **Path aliases**: `@/*` maps to `./src/*` (configured in both tsconfig.app.json and vite.config.ts).

## Important Files
- `todo.json` - Project progress tracker. Update this when completing tasks.
- `migrations/001_initial_schema.sql` - Turso database schema.
- `src/lib/firebase.ts` - Firebase configuration and OAuth providers.
- `src/services/turso.ts` - Turso database client (throws if env vars missing).
- `src/lib/utils.ts` - Core utilities including `calculateInsulin()`, date formatters, `cn()` for Tailwind classes.
- `src/types/database.ts` - TypeScript interfaces for all database tables.
- `.env.example` - Required environment variables template.

## Core Formula
Insulin calculator: `((glucose_mg_dL * 18) - 80) / 40`

## Conventions
- Components go in `src/components/{Feature}/ComponentName.tsx`
- Zustand stores go in `src/stores/{feature}Store.ts`
- Service/data access files go in `src/services/{feature}Service.ts`
- Types go in `src/types/`
- Utilities go in `src/lib/utils.ts`
- Keep components focused - one component per file.
- Use Tailwind utility classes directly, avoid CSS files where possible.
- Mobile-first design: start with mobile layout, add responsive breakpoints up.

## Database Service Layer
Service files currently have placeholder implementations that store data in Zustand only (no Turso integration yet). When Turso is configured, replace placeholders with actual `db.execute()` calls. The service functions already have the correct signatures and types.

## Build & Run
```bash
npm run dev          # Development server at localhost:5173
npm run build        # Production build (tsc + vite)
npm run build:gh-pages  # Build with /sweet-t/ base path for GitHub Pages
npm run preview      # Preview production build
```

## Common Pitfalls
- Turso client (`services/turso.ts`) throws on import if env vars are missing. The App wraps this in a try/catch.
- Firebase config (`lib/firebase.ts`) also throws if env vars are missing.
- Tailwind v4 does NOT support the old `@tailwind` directives or `tailwind.config.js` plugins array in the same way. Use `@import "tailwindcss"` and `@tailwindcss/postcss`.
- When adding new utility classes that reference CSS variables (like `bg-background`), they must be defined in index.css or Tailwind's theme.
