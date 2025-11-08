# 🚀 Automatic Deployment Setup Guide

This guide will help you set up automatic deployments so you don't have to manually redeploy every time you make changes.

## ✅ Quick Setup (Recommended - 5 minutes)

Both **Vercel** (frontend) and **Render** (backend) support automatic deployments from GitHub. You just need to connect your repository and enable auto-deploy.

---

## 📦 Step 1: Enable Auto-Deploy in Vercel (Frontend)

### If you haven't connected your repo yet:

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
   - Select your `DoItToday-project` repository
   - Click "Import"
4. **Configure Project Settings:**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `frontend` (IMPORTANT!)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - Make sure to add it for **Production**, **Preview**, and **Development**
6. **Click "Deploy"**

### Enable Auto-Deploy (if not already enabled):

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Git**
3. Make sure **"Auto-deploy from Git"** is **enabled**
4. Select branch: **`main`** (or your default branch)
5. **Save**

✅ **Done!** Now every time you push to GitHub, Vercel will automatically deploy your frontend.

---

## ⚙️ Step 2: Enable Auto-Deploy in Render (Backend)

### If you haven't connected your repo yet:

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
   - Click "Connect account" if needed
   - Select your `DoItToday-project` repository
   - Click "Connect"
4. **Configure Service Settings:**
   - **Name:** `doittoday-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty (or `backend` if needed)
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
5. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     FRONTEND_URL=https://your-app.vercel.app
     ```
6. **Click "Create Web Service"**

### Enable Auto-Deploy (if not already enabled):

1. Go to your service in Render dashboard
2. Click **Settings** → **Build & Deploy**
3. Under **"Auto-Deploy"**, make sure it's set to:
   - **Auto-Deploy:** `Yes`
   - **Branch:** `main` (or your default branch)
4. **Save Changes**

✅ **Done!** Now every time you push to GitHub, Render will automatically deploy your backend.

---

## 🎯 Step 3: Verify Auto-Deploy is Working

1. **Make a small change** to your code (e.g., add a comment)
2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. **Check Vercel Dashboard:**
   - You should see a new deployment starting automatically
   - Wait for it to complete (usually 1-2 minutes)
4. **Check Render Dashboard:**
   - You should see a new deployment starting automatically
   - Wait for it to complete (usually 2-3 minutes)

✅ If both show automatic deployments, you're all set!

---

## 🔄 How It Works Now

### Workflow:
1. **Make changes** to your code locally
2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to GitHub:**
   ```bash
   git push origin main
   ```
4. **Automatic Deployment:**
   - ✅ Vercel detects the push and automatically builds & deploys frontend
   - ✅ Render detects the push and automatically builds & deploys backend
   - ✅ Your changes go live automatically (usually within 2-5 minutes)

**No manual deployment needed!** 🎉

---

## 🛠️ Alternative: GitHub Actions (Advanced)

If you want more control over the deployment process, you can use GitHub Actions. I've created a workflow file for you:

**File:** `.github/workflows/deploy.yml`

This workflow will:
- Build and test your code
- Deploy to Vercel (if you set up Vercel CLI)
- Deploy to Render (if you set up Render API)

**To use GitHub Actions:**
1. Make sure your repo is connected to Vercel and Render (as above)
2. The workflow file is optional - the auto-deploy from Vercel/Render is usually enough

---

## 📝 Important Notes

### Environment Variables:
- **Never commit `.env` files** to GitHub
- Always add environment variables in the platform dashboards:
  - Vercel: Settings → Environment Variables
  - Render: Environment tab

### Branch Strategy:
- Auto-deploy typically works on your **main/master** branch
- You can configure it to deploy from other branches too
- Preview deployments are usually created for pull requests

### Deployment Time:
- **Vercel:** Usually 1-2 minutes
- **Render:** Usually 2-3 minutes (free tier may take longer on first request after spin-down)

### Free Tier Limitations:
- **Vercel:** Unlimited deployments ✅
- **Render:** Free tier spins down after 15 minutes of inactivity
  - First request after spin-down takes ~30 seconds
  - Consider upgrading if you need 24/7 uptime

---

## 🆘 Troubleshooting

### Issue: Auto-deploy not working

**Solution:**
1. Check if your GitHub repo is connected:
   - Vercel: Settings → Git → Check repository
   - Render: Settings → Build & Deploy → Check repository
2. Make sure auto-deploy is enabled:
   - Vercel: Settings → Git → Auto-deploy should be ON
   - Render: Settings → Build & Deploy → Auto-Deploy should be "Yes"
3. Check the branch name matches (usually `main` or `master`)

### Issue: Build fails on auto-deploy

**Solution:**
1. Check build logs in the platform dashboard
2. Common issues:
   - Missing environment variables
   - Build command errors
   - Dependency installation failures
3. Fix the issue and push again

### Issue: Changes not showing up

**Solution:**
1. Wait a few minutes (deployments take time)
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache
4. Check deployment status in dashboard

---

## ✅ Checklist

- [ ] GitHub repository is connected to Vercel
- [ ] GitHub repository is connected to Render
- [ ] Auto-deploy is enabled in Vercel
- [ ] Auto-deploy is enabled in Render
- [ ] Environment variables are set in both platforms
- [ ] Tested auto-deploy by pushing a small change
- [ ] Verified deployments are working automatically

---

## 🎉 You're Done!

Now you can:
- ✅ Make changes locally
- ✅ Commit and push to GitHub
- ✅ Changes automatically deploy to production
- ✅ No manual deployment needed!

**Happy coding!** 🚀

