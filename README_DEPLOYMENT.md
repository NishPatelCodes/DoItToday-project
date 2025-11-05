# 🚀 Vercel Deployment Instructions

## Quick Fix for Vercel Build Error

If you're getting the error `cd: frontend: No such file or directory`, follow these steps:

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to your Vercel project settings
2. Navigate to **Settings** → **General**
3. Under **Root Directory**, click **Edit**
4. Select `frontend` as the root directory
5. Save and redeploy

### Option 2: Use vercel.json in Frontend Directory

The `frontend/vercel.json` file is already created. Vercel will automatically detect it if you set the root directory to `frontend`.

### Option 3: Manual Configuration

If the above doesn't work, configure in Vercel dashboard:

1. Go to **Settings** → **General**
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Set **Install Command**: `npm install`
6. Set **Framework Preset**: Vite

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

- `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com`)

### After Deployment

Once deployed, update your backend CORS settings to include your Vercel URL:
- Example: `https://your-app.vercel.app`




