# Sweet-T

A lightweight glucose tracking SPA (Single Page Application) for diabetes management. Built with React, Vite, Firebase Auth, and Turso database - deployable on GitHub Pages.

## Features

- **Insulin Calculator** - Quick glucose-to-insulin dose calculations using the formula: `((x * 18) - 80) / 40`
- **Glucose Tracking** - Log and track blood glucose readings with timestamps
- **Food Tracking** - Track carbohydrate/bread unit intake
- **Insulin Dosing** - Log insulin doses and types
- **Firebase Authentication** - Secure sign-in with Google, GitHub, or email
- **Lightweight** - No backend required, deployable on GitHub Pages
- **Mobile-Friendly** - Responsive design optimized for phones and tablets

## Tech Stack

- **Frontend**: React 18.2 + TypeScript + Vite 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Authentication**: Firebase Auth
- **Database**: Turso (edge-distributed SQLite)
- **State Management**: Zustand
- **Visualization**: Recharts
- **Deployment**: GitHub Pages

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Turso account

### Installation

1. **Clone and install**
   ```bash
   cd sweet-t
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in Firebase and Turso credentials in `.env`

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Firebase project creation
- Google/GitHub OAuth setup
- Turso database creation
- Environment variable configuration
- GitHub Pages deployment

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Login/signup components
│   ├── Calculator/        # Insulin calculator
│   ├── Glucose/           # Glucose tracking (coming soon)
│   ├── Food/              # Food tracking (coming soon)
│   ├── Insulin/           # Insulin tracking (coming soon)
│   ├── Profile/           # Settings (coming soon)
│   └── common/            # Shared components
├── stores/                # Zustand state management
├── services/              # API/database services
├── types/                 # TypeScript type definitions
├── lib/                   # Utilities and Firebase config
└── App.tsx                # Main app component
```

## Key Formula

The insulin calculator uses this formula to compute recommended insulin dose:

```
insulin_units = ((glucose_mg_dL × 18) - 80) ÷ 40
```

Supports both mg/dL and mmol/L units with automatic conversion.

## Database Schema

- `users` - User accounts (Firebase handles auth)
- `glucose_readings` - Blood glucose measurements
- `food_entries` - Carbohydrate/bread unit tracking
- `insulin_doses` - Insulin administration records
- `user_settings` - User preferences and targets

## Authentication

Supports three authentication methods:
- **Google OAuth** - Quick sign-in with Google account
- **GitHub OAuth** - Sign-in with GitHub account
- **Email/Password** - Email-based authentication

All authentication is handled client-side through Firebase.

## Development Status

### Completed ✅
- Project setup (Vite, React, TypeScript)
- Firebase authentication (Google, GitHub, email)
- Insulin calculator component
- Database schema and Turso configuration
- Zustand state management setup
- Tab-based navigation
- Lightweight build (~120KB gzipped)

### Coming Soon
- Glucose reading tracker with charts
- Food tracker with presets
- Insulin dose logger
- User settings and preferences
- Data visualization and trends
- Export data to CSV
- Dark mode support

## Deployment

### GitHub Pages

```bash
npm run build:gh-pages
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then enable GitHub Pages in repository settings.

### Other Platforms

The build output in `dist/` can be deployed to any static hosting:
- Netlify
- Vercel
- AWS S3
- CloudFlare Pages

## License

MIT

---

**Created**: February 2026
**Status**: MVP (Minimal Viable Product) - Core calculator and auth working
