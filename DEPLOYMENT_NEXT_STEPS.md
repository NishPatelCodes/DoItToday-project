# 🎉 Backend is Live! Next Steps

Your backend is now running at: **https://doittoday-project.onrender.com**

---

## ✅ Step 1: Verify MongoDB Connection

Check your Render logs to see if MongoDB connected:

1. Go to Render Dashboard → Your Service → **Logs** tab
2. Look for one of these messages:

   **✅ Success:**
   ```
   ✅ Connected to MongoDB
   ```

   **❌ Error (if you see this):**
   ```
   ❌ MONGODB_URI environment variable is not set!
   ```
   or
   ```
   ❌ MongoDB connection error: ...
   ```

### If MongoDB is NOT connected:
- Go to Render → **Environment** tab
- Add `MONGODB_URI` with your MongoDB Atlas connection string
- See `RENDER_MONGODB_FIX.md` for detailed instructions

---

## ✅ Step 2: Set Required Environment Variables in Render

Go to Render → Your Service → **Environment** tab and add:

### 1. **MONGODB_URI** (if not already set)
```
mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday?retryWrites=true&w=majority
```
(Replace with your actual connection string)

### 2. **JWT_SECRET**
Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Or use any long random string (at least 32 characters)

Example:
```
a7f3b9c2d8e4f1a6b5c9d2e7f3a8b4c1d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8
```

### 3. **FRONTEND_URL** (set this AFTER deploying frontend)
```
https://your-vercel-app.vercel.app
```
(You'll set this after deploying frontend to Vercel)

---

## ✅ Step 3: Deploy Frontend to Vercel

### 3.1. Push Latest Code to GitHub
```bash
git add .
git commit -m "Update for deployment"
git push
```

### 3.2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Important Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (click "Edit" and set to `frontend`)
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)
   - **Install Command:** `npm install` (should auto-detect)

### 3.3. Add Environment Variable in Vercel

In Vercel project settings → **Environment Variables**, add:

**Key:** `VITE_API_URL`  
**Value:** `https://doittoday-project.onrender.com/api`

**Important:**
- Add this for **Production**, **Preview**, and **Development**
- The value should be your Render backend URL + `/api`

### 3.4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. You'll get a URL like: `https://doittoday-project.vercel.app`

---

## ✅ Step 4: Update Render with Frontend URL

After Vercel deployment:

1. Go to Render → Your Service → **Environment** tab
2. Add/Update **FRONTEND_URL**:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://your-vercel-app.vercel.app` (your actual Vercel URL)
   - **No trailing slash!**
3. Save → Render will auto-redeploy

---

## ✅ Step 5: Test Your Deployment

### Test Backend:
Visit: `https://doittoday-project.onrender.com/api/health`

You should see:
```json
{"message":"Server is running!"}
```

### Test Frontend:
1. Visit your Vercel URL
2. Try to register/login
3. Check browser console for any errors

---

## 🔍 Troubleshooting

### Backend Issues:

**"MongoDB connection error"**
- Check `MONGODB_URI` is set correctly in Render
- Password must be URL-encoded (`@` → `%40`)
- Check MongoDB Atlas Network Access (allow `0.0.0.0/0`)

**"CORS error" in frontend**
- Make sure `FRONTEND_URL` is set in Render
- Value should match your Vercel URL exactly (with `https://`)
- No trailing slash

### Frontend Issues:

**"Network Error" or "Cannot connect to server"**
- Check `VITE_API_URL` is set in Vercel
- Value should be: `https://doittoday-project.onrender.com/api`
- Make sure backend is running (check Render logs)

**"401 Unauthorized" or "JWT verification failed"**
- Make sure `JWT_SECRET` is set in Render
- Generate a new one if needed

---

## 📋 Quick Checklist

- [ ] Backend is live on Render ✅
- [ ] MongoDB connected (check logs) ✅
- [ ] `MONGODB_URI` set in Render
- [ ] `JWT_SECRET` set in Render
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set in Vercel (`https://doittoday-project.onrender.com/api`)
- [ ] `FRONTEND_URL` set in Render (your Vercel URL)
- [ ] Test registration/login works
- [ ] Test creating tasks/goals works

---

## 🎉 You're Done!

Once all these are set up:
- ✅ Backend: `https://doittoday-project.onrender.com`
- ✅ Frontend: `https://your-vercel-app.vercel.app`
- ✅ Database: MongoDB Atlas (connected)
- ✅ Everything working together!

Your app is now live and accessible worldwide! 🌍



