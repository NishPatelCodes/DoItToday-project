# ⚡ Quick Auto-Deploy Setup (5 Minutes)

## 🎯 Goal
Set up automatic deployments so you don't have to manually redeploy every time you make changes.

---

## ✅ Step 1: Connect GitHub to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..." → "Project"**
3. **Import your GitHub repository:**
   - Select your `DoItToday-project` repository
   - Click **"Import"**
4. **Configure:**
   - **Root Directory:** `frontend` ⚠️ IMPORTANT!
   - **Framework:** Vite (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
5. **Add Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com/api`
   - Add for **Production**, **Preview**, and **Development**
6. Click **"Deploy"**

✅ **Auto-deploy is enabled by default!** Every push to GitHub will auto-deploy.

---

## ✅ Step 2: Connect GitHub to Render (Backend)

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +" → "Web Service"**
3. **Connect your GitHub repository:**
   - Click **"Connect account"** if needed
   - Select your `DoItToday-project` repository
   - Click **"Connect"**
4. **Configure:**
   - **Name:** `doittoday-backend`
   - **Environment:** `Node`
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Click **"Create Web Service"**

✅ **Auto-deploy is enabled by default!** Every push to GitHub will auto-deploy.

---

## ✅ Step 3: Test Auto-Deploy

1. **Make a small change** (e.g., add a comment in any file)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. **Check dashboards:**
   - Vercel: You should see a new deployment starting automatically
   - Render: You should see a new deployment starting automatically
4. **Wait 2-5 minutes** for deployments to complete
5. **Visit your site** - changes should be live!

✅ **If deployments started automatically, you're done!**

---

## 🎉 How It Works Now

### Your Workflow:
1. **Make changes** locally
2. **Commit:** `git commit -m "Your changes"`
3. **Push:** `git push origin main`
4. **Automatic deployment happens!** 🚀
   - Vercel auto-deploys frontend
   - Render auto-deploys backend
   - Changes go live automatically

**No manual deployment needed!** 🎉

---

## 🔍 Verify Auto-Deploy is Enabled

### Vercel:
1. Go to your project → **Settings** → **Git**
2. Check: **"Auto-deploy from Git"** should be **ON**
3. Branch should be: **`main`** (or your default branch)

### Render:
1. Go to your service → **Settings** → **Build & Deploy**
2. Check: **"Auto-Deploy"** should be **"Yes"**
3. Branch should be: **`main`** (or your default branch)

---

## 🆘 Troubleshooting

### Auto-deploy not working?
1. **Check GitHub connection:**
   - Vercel: Settings → Git → Repository should be connected
   - Render: Settings → Build & Deploy → Repository should be connected
2. **Check branch name:**
   - Make sure you're pushing to `main` (or the branch configured)
3. **Check auto-deploy is enabled:**
   - Vercel: Settings → Git → Auto-deploy should be ON
   - Render: Settings → Build & Deploy → Auto-Deploy should be "Yes"

### Build fails?
- Check build logs in dashboard
- Common issues: Missing environment variables, build errors
- Fix the issue and push again

---

## 📝 Notes

- **Environment Variables:** Always add in platform dashboards, never commit `.env` files
- **Deployment Time:** Usually 1-3 minutes after push
- **Free Tier:** Render spins down after 15 min inactivity (first request takes ~30 sec)

---

## ✅ Checklist

- [ ] GitHub repo connected to Vercel
- [ ] GitHub repo connected to Render
- [ ] Auto-deploy enabled in Vercel
- [ ] Auto-deploy enabled in Render
- [ ] Environment variables set
- [ ] Tested with a small change
- [ ] Verified auto-deploy works

---

**That's it!** You're all set for automatic deployments! 🎉

