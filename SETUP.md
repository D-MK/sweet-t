# Sweet-T Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Turso account (https://turso.tech)
- Firebase account (https://firebase.google.com)

## 1. Firebase Setup

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: `sweet-t`
4. Enable Google Analytics (optional)
5. Create project

### Enable OAuth Providers

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** (default provider)
3. Enable **GitHub** (optional):
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App
   - Name: Sweet-T
   - Authorization callback URL: `https://<your-firebase-project>.firebaseapp.com/__/auth/handler`
   - Copy Client ID and Client Secret
   - In Firebase, paste these credentials
4. Enable **Email/Password** (optional)

### Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web app (or create one if needed)
4. Copy the config object with these keys:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 2. Turso Setup

### Create Turso Database

1. Sign up at [Turso](https://turso.tech)
2. Create a new database: `sweet-t`
3. Copy the connection URL and auth token

### Run Database Migrations

1. Copy the Turso credentials from your account
2. Update `.env` with your Turso credentials
3. Run migrations using Turso CLI:
   ```bash
   turso db shell sweet-t < migrations/001_initial_schema.sql
   ```

## 3. Environment Variables

Copy `.env.example` to `.env` and fill in all variables:

```bash
cp .env.example .env
```

Required variables:

```env
# Turso Database
VITE_TURSO_URL=libsql://sweet-t-<your-username>.turso.io
VITE_TURSO_AUTH_TOKEN=<your-turso-token>

# Firebase Config
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>

# Application
VITE_APP_NAME=Sweet-T
VITE_APP_URL=http://localhost:5173
```

## 4. Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

## 5. Deployment to GitHub Pages

### Build
```bash
npm run build
```

### Push to GitHub
```bash
git add .
git commit -m "Initial Sweet-T setup"
git push origin main
```

### Enable GitHub Pages

1. Go to GitHub repo → Settings → Pages
2. Under "Build and deployment"
   - Source: GitHub Actions
   - Create workflow file for Vite deployment

### Environment Variables in GitHub Pages

Add your Firebase credentials as repository secrets:
1. Settings → Secrets and variables → Actions
2. Add all `VITE_*` variables as secrets
3. Update build workflow to use these secrets

## 6. First Run Checklist

- [ ] Firebase authentication working (test Google/GitHub login)
- [ ] Turso database connected (check dashboard)
- [ ] User can sign up / sign in
- [ ] User settings created in database
- [ ] App builds without errors
- [ ] Responsive design works on mobile

## Troubleshooting

### Firebase not connecting
- Check API key is valid
- Ensure auth domain is correct
- Check browser console for error messages

### Turso connection failed
- Verify connection string and token
- Check network connectivity
- Ensure token hasn't expired

### GitHub Pages deployment
- Check Actions tab for workflow errors
- Verify environment secrets are set
- Check GitHub Pages settings

## Architecture Notes

- **Authentication**: Firebase (client-side)
- **Database**: Turso/libSQL (edge-distributed SQLite)
- **Frontend**: React 18 + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Deployment**: GitHub Pages (static)

This setup allows full deployment on GitHub Pages with zero backend infrastructure costs.
