# Vercel Deployment Setup

## Important: Configure Root Directory in Vercel Dashboard

When deploying to Vercel, you **MUST** set the Root Directory to `frontend` in the Vercel dashboard:

### Steps:

1. Go to your project in Vercel dashboard
2. Click on **Settings**
3. Go to **General** → **Root Directory**
4. Click **Edit**
5. Set Root Directory to: `frontend`
6. Click **Save**

### Alternative: Using vercel.json

If you prefer to configure via `vercel.json`, the file is already set up. However, you still need to configure the Root Directory in Vercel dashboard OR use the Vercel CLI with the correct settings.

## Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
REACT_APP_API_URL=https://your-backend.onrender.com
```

Replace `your-backend.onrender.com` with your actual Render backend URL.

## Build Settings (Auto-detected)

Vercel should auto-detect:
- **Framework Preset:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

## After Deployment

1. Copy your Vercel frontend URL
2. Update your Render backend's `FRONTEND_URL` environment variable with the Vercel URL
3. Redeploy the backend (or it will auto-redeploy)

