# 🚀 Free Deployment Guide for DoItToday

This guide covers free hosting options for both frontend and backend.

## 📋 Prerequisites

1. **GitHub Account** (for code hosting)
2. **MongoDB Atlas Account** (already set up - free tier)
3. **Node.js** installed locally (for building)

---

## 🎨 Frontend Deployment (Free Options)

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ Perfect for React apps

**Steps:**

1. **Build your frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/doittoday.git
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Set root directory to `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables if needed
   - Click "Deploy"

4. **Update API URL:**
   - In `frontend/src/services/api.js`, update the base URL to your backend URL
   - Or use environment variables:
     ```javascript
     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
     ```
   - Add `VITE_API_URL` in Vercel's environment variables

---

### Option 2: Netlify

**Steps:**
1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Sign up with GitHub
4. Click "New site from Git"
5. Select repository
6. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
7. Add environment variables
8. Deploy!

---

## ⚙️ Backend Deployment (Free Options)

### Option 1: Render (Recommended - Easiest)

**Why Render?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ Environment variables support
- ✅ MongoDB Atlas compatible

**Steps:**

1. **Push backend to GitHub:**
   ```bash
   # In your project root
   git add backend/
   git commit -m "Add backend"
   git push
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** `doittoday-backend`
     - **Environment:** `Node`
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && node server.js`
     - **Root Directory:** `backend`

3. **Add Environment Variables:**
   - Click "Environment" tab
   - Add:
     ```
     PORT=10000
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=production
     ```

4. **Update CORS:**
   - In `backend/server.js`, update CORS to allow your frontend URL:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-url.vercel.app', 'http://localhost:5173'],
     credentials: true
   }));
   ```

5. **Deploy!**
   - Render will give you a URL like: `https://doittoday-backend.onrender.com`
   - Update your frontend's API URL to this

---

### Option 2: Railway

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (Railway sets this automatically)
7. Deploy!

**Note:** Railway gives $5 free credit monthly, which is usually enough for small apps.

---

### Option 3: Fly.io

**Steps:**
1. Install Fly CLI: `npm install -g @fly/cli`
2. Sign up at [fly.io](https://fly.io)
3. In your project root:
   ```bash
   fly launch
   ```
4. Follow prompts
5. Add environment variables:
   ```bash
   fly secrets set MONGODB_URI=your_connection_string
   fly secrets set JWT_SECRET=your_secret
   ```
6. Deploy: `fly deploy`

---

## 🔧 Complete Deployment Setup

### Step 1: Prepare Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Backend (.env):**
```env
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doittoday
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

### Step 2: Update CORS in Backend

In `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### Step 3: Update API Base URL in Frontend

In `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 4: Deploy Frontend First

1. Deploy frontend to Vercel
2. Note the deployment URL

### Step 5: Deploy Backend

1. Deploy backend to Render
2. Update CORS with frontend URL
3. Get backend URL

### Step 6: Update Frontend API URL

1. Go to Vercel dashboard
2. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
3. Redeploy frontend

---

## 📊 Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

### Render (Backend)
- ⚠️ Free tier spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds
- ✅ 750 hours/month free
- ✅ Automatic HTTPS

**Alternative:** Railway ($5/month free credit usually covers small apps)

---

## 🎯 Recommended Free Stack

1. **Frontend:** Vercel (free, fast, reliable)
2. **Backend:** Render (free) or Railway (free credit)
3. **Database:** MongoDB Atlas (free tier - already set up)

**Total Cost: $0/month** 🎉

---

## 🚨 Important Notes

1. **Free tier limitations:**
   - Render spins down after inactivity (cold starts)
   - Consider upgrading if you need 24/7 uptime

2. **Environment Variables:**
   - Never commit `.env` files to GitHub
   - Always use platform's environment variable settings

3. **CORS:**
   - Must allow your frontend domain in backend CORS settings

4. **HTTPS:**
   - Both Vercel and Render provide automatic HTTPS
   - Make sure to use HTTPS URLs in your frontend

---

## 📝 Quick Checklist

- [ ] Push code to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render/Railway
- [ ] Add environment variables
- [ ] Update CORS settings
- [ ] Update frontend API URL
- [ ] Test the deployed application

---

## 🆘 Troubleshooting

**Issue: CORS errors**
- Solution: Update backend CORS to include your frontend URL

**Issue: Backend not responding**
- Solution: Check if Render service spun down (wait 30 seconds on first request)

**Issue: Environment variables not working**
- Solution: Make sure to add them in the platform's dashboard, not just `.env` file

**Issue: MongoDB connection errors**
- Solution: Check MongoDB Atlas IP whitelist (allow all IPs: `0.0.0.0/0`)

---

## 🎉 You're Done!

Your app should now be live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

Happy deploying! 🚀

