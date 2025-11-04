# 🔧 Troubleshooting Login "Server Error"

If you're seeing a "server error" when trying to log in, follow these steps:

---

## 🔍 Step 1: Check Browser Console

1. Open your deployed frontend (Vercel URL)
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Try to log in
5. Look for **red error messages**

**What to look for:**
- `Network Error` or `ERR_NETWORK`
- `CORS error`
- `401 Unauthorized`
- `500 Internal Server Error`
- `Cannot connect to server at...`

---

## 🔍 Step 2: Check Network Tab

1. Open **Developer Tools** (F12)
2. Go to **Network** tab
3. Try to log in
4. Look for the `/auth/login` request
5. Click on it to see details

**Check:**
- **Request URL** - Should be: `https://doittoday-project.onrender.com/api/auth/login`
- **Status Code** - Should be `200` (success) or see what error code
- **Response** - Click "Response" tab to see what the server returned

---

## ✅ Step 3: Verify Environment Variables

### In Vercel (Frontend):
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://doittoday-project.onrender.com/api`
   - **Environment:** Should be set for Production, Preview, and Development

### In Render (Backend):
1. Go to Render Dashboard → Your Service → **Environment** tab
2. Check these are set:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Random secret string
   - `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV` - Should be `production`
   - `PORT` - Should be `10000` (or auto-set by Render)

---

## ✅ Step 4: Test Backend Directly

Open these URLs in your browser:

### Health Check:
```
https://doittoday-project.onrender.com/api/health
```
**Expected:** `{"message":"Server is running!"}`

### If this works:
✅ Backend is running  
✅ Backend is accessible  
❌ Problem might be CORS or frontend configuration

### If this doesn't work:
❌ Backend might not be running  
❌ Check Render logs

---

## ✅ Step 5: Check Render Logs

1. Go to Render Dashboard → Your Service → **Logs** tab
2. Look for:
   - `✅ Connected to MongoDB` - MongoDB is working
   - `❌ MongoDB connection error` - MongoDB issue
   - `🚀 Server running on port 10000` - Server started
   - Any error messages when you try to log in

**Common errors:**
- `MONGODB_URI environment variable is not set!` → Set `MONGODB_URI` in Render
- `MongoDB connection error` → Check MongoDB URI and network access
- `CORS blocked origin` → Check `FRONTEND_URL` is set correctly

---

## ✅ Step 6: Test API Endpoint Directly

Use Postman, curl, or browser to test:

### Test Login Endpoint:
```bash
curl -X POST https://doittoday-project.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "streak": 0
  }
}
```

**If this works:**
✅ Backend is working  
✅ API endpoint is correct  
❌ Problem is in frontend or CORS

**If this doesn't work:**
- Check error message
- Verify MongoDB is connected
- Check user exists in database

---

## 🔧 Common Issues & Fixes

### Issue 1: "Network Error" or "Cannot connect to server"

**Cause:** Frontend can't reach backend

**Fix:**
1. Check `VITE_API_URL` in Vercel is set to: `https://doittoday-project.onrender.com/api`
2. Make sure backend is running (check Render)
3. Redeploy frontend after setting environment variable

---

### Issue 2: "CORS error" in browser console

**Cause:** Backend not allowing frontend origin

**Fix:**
1. In Render, set `FRONTEND_URL` to your exact Vercel URL
   - Example: `https://doittoday-project.vercel.app`
   - **No trailing slash!**
   - **Include https://**
2. Redeploy backend after setting
3. Check Render logs for CORS messages

---

### Issue 3: "401 Unauthorized" or "Invalid credentials"

**Cause:** 
- Wrong email/password
- User doesn't exist
- JWT_SECRET mismatch

**Fix:**
1. Try registering a new user first
2. Check user exists in MongoDB
3. Verify `JWT_SECRET` is set in Render

---

### Issue 4: "500 Internal Server Error"

**Cause:** Server-side error (database, code, etc.)

**Fix:**
1. Check Render logs for detailed error
2. Verify MongoDB is connected
3. Check if all required environment variables are set

---

### Issue 5: "MongoDB connection error"

**Cause:** MongoDB not connected

**Fix:**
1. Check `MONGODB_URI` is set in Render
2. Verify password is URL-encoded (`@` → `%40`)
3. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
4. See `RENDER_MONGODB_FIX.md` for details

---

## 🧪 Quick Test Checklist

- [ ] Backend health check works: `https://doittoday-project.onrender.com/api/health`
- [ ] `VITE_API_URL` is set in Vercel: `https://doittoday-project.onrender.com/api`
- [ ] `FRONTEND_URL` is set in Render: `https://your-vercel-app.vercel.app`
- [ ] `MONGODB_URI` is set in Render
- [ ] `JWT_SECRET` is set in Render
- [ ] MongoDB is connected (check Render logs)
- [ ] Frontend redeployed after setting `VITE_API_URL`
- [ ] Backend redeployed after setting `FRONTEND_URL`
- [ ] Browser console shows no errors
- [ ] Network tab shows `/auth/login` request with status 200

---

## 📞 Still Not Working?

1. **Check browser console** - What exact error message?
2. **Check network tab** - What status code? What response?
3. **Check Render logs** - Any errors?
4. **Test backend directly** - Does `/api/health` work?
5. **Verify all environment variables** are set correctly

Share the error messages you see, and I can help debug further! 🚀

