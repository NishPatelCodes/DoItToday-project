# 🔐 Render Environment Variables Guide

This guide explains all the environment variables you need to set in Render for your backend deployment.

---

## 📋 Required Environment Variables

When deploying your backend to Render, you need to set these environment variables:

### 1. **NODE_ENV**
- **Value:** `production`
- **Purpose:** Tells Node.js this is a production environment
- **Why:** Enables production optimizations and error handling
- **Status:** ✅ Already set in `render.yaml` (auto-configured)

### 2. **PORT**
- **Value:** `10000` (or let Render auto-assign)
- **Purpose:** The port your backend server will run on
- **Why:** Render assigns a port automatically, but we set a default
- **Status:** ✅ Already set in `render.yaml`
- **Note:** Render will override this with their assigned port automatically

### 3. **MONGODB_URI** ⚠️ **REQUIRED - YOU MUST SET THIS**
- **Value:** Your MongoDB Atlas connection string
- **Example:** `mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday?retryWrites=true&w=majority`
- **Purpose:** Connects your backend to MongoDB database
- **Where to get it:**
  1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
  2. Click "Connect" on your cluster
  3. Choose "Connect your application"
  4. Copy the connection string
  5. Replace `<password>` with your actual password (URL-encoded)
  6. Replace `doittoday` with your database name
- **⚠️ Important:** 
  - Make sure to URL-encode special characters in password (e.g., `@` becomes `%40`)
  - Never commit this to GitHub!

### 4. **JWT_SECRET** ⚠️ **REQUIRED - YOU MUST SET THIS**
- **Value:** A long, random, secret string
- **Purpose:** Used to sign and verify JWT tokens for authentication
- **Why:** Keeps user sessions secure
- **How to generate:**
  - Use a random string generator
  - Or run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - Example: `a7f3b9c2d8e4f1a6b5c9d2e7f3a8b4c1d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8`
- **⚠️ Important:** 
  - Make it long and random (at least 32 characters)
  - Never commit this to GitHub!
  - Keep it secret!

### 5. **FRONTEND_URL** ⚠️ **REQUIRED - YOU MUST SET THIS**
- **Value:** Your Vercel frontend URL
- **Purpose:** Allows your frontend to make API requests (CORS)
- **Where to get it:**
  - After deploying frontend to Vercel, you'll get a URL like:
  - `https://your-app-name.vercel.app`
- **Format:** `https://your-app-name.vercel.app`
- **⚠️ Important:** 
  - Set this AFTER deploying your frontend
  - Include the full URL with `https://`
  - No trailing slash

---

## 🚀 How to Set Environment Variables in Render

### Step-by-Step:

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Open Your Service**
   - Click on your `doittoday-backend` service

3. **Go to Environment Tab**
   - Click on **"Environment"** in the left sidebar

4. **Add Each Variable**
   - Click **"Add Environment Variable"**
   - Enter the **Key** and **Value**
   - Click **"Save Changes"**

5. **Redeploy** (if needed)
   - After adding variables, Render will auto-redeploy
   - Or manually click "Manual Deploy"

---

## 📝 Complete Example

Here's what your Render environment variables should look like:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday?retryWrites=true&w=majority
JWT_SECRET = a7f3b9c2d8e4f1a6b5c9d2e7f3a8b4c1d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8
FRONTEND_URL = https://your-app-name.vercel.app
```

---

## ⚠️ Important Notes

### Security:
- ✅ **Never commit** these values to GitHub
- ✅ They're already in `.gitignore`
- ✅ Only set them in Render dashboard
- ✅ Use strong, random values for `JWT_SECRET`

### MongoDB URI:
- Make sure to **URL-encode** special characters:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - etc.
- Example: If password is `Nish@501`, use `Nish%40501`

### FRONTEND_URL:
- Set this **AFTER** deploying frontend to Vercel
- Include `https://` protocol
- No trailing `/` at the end
- Example: `https://doittoday-project.vercel.app`

### Order of Deployment:
1. ✅ Deploy frontend to Vercel first
2. ✅ Get the Vercel URL
3. ✅ Deploy backend to Render
4. ✅ Set `FRONTEND_URL` in Render with your Vercel URL
5. ✅ Update frontend's `VITE_API_URL` in Vercel with Render URL

---

## 🔍 Verify Your Setup

After setting all variables, check:

1. **Backend logs in Render** - Should show "Connected to MongoDB"
2. **Frontend can connect** - Try logging in from your Vercel app
3. **No CORS errors** - Check browser console

---

## 🆘 Troubleshooting

### "MongoDB connection error"
- Check `MONGODB_URI` is correct
- Verify password is URL-encoded
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)

### "CORS error"
- Check `FRONTEND_URL` matches your Vercel URL exactly
- Include `https://` protocol
- No typos in the URL

### "JWT verification failed"
- Check `JWT_SECRET` is set correctly
- Make sure it's the same value if you're using it elsewhere

---

## ✅ Quick Checklist

Before deploying to Render:

- [ ] `MONGODB_URI` - Your MongoDB connection string (URL-encoded password)
- [ ] `JWT_SECRET` - Long random string (generate with Node.js crypto)
- [ ] `FRONTEND_URL` - Your Vercel frontend URL (set after frontend deploys)
- [ ] `NODE_ENV` - Set to `production` (auto-set in render.yaml)
- [ ] `PORT` - Set to `10000` (auto-set in render.yaml, Render will override)

---

Good luck with your deployment! 🚀




