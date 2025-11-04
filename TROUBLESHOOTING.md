# Troubleshooting Guide 🔧

## Registration/Sign Up Issues

### Problem: Cannot register or sign up

Here are the most common issues and solutions:

### 1. **Backend Server Not Running**

**Symptoms:**
- Error message: "Cannot connect to server"
- Network error in browser console
- Frontend can't reach backend API

**Solution:**
1. Make sure you've installed dependencies:
   ```bash
   npm run install-all
   ```

2. Check if backend is running:
   - Open a terminal in the project root
   - Run: `npm run server` or `cd backend && npm run dev`
   - You should see: "🚀 Server running on port 5000"

3. Check backend terminal for errors

### 2. **MongoDB Not Connected**

**Symptoms:**
- Backend runs but registration fails
- MongoDB connection error in backend terminal
- "Server error" or database errors

**Solution:**

**Option A: Local MongoDB**
1. Install MongoDB on your system
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`
3. Verify MongoDB is running:
   ```bash
   mongosh
   # Should connect successfully
   ```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doittoday
   ```

**Option C: Use Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 3. **Validation Errors Not Showing**

**Symptoms:**
- Form submits but nothing happens
- No error message displayed
- Browser console shows errors

**Solution:**
- I've updated the error handling to show all validation errors
- Check browser console (F12) for detailed errors
- Make sure all form fields are filled correctly:
  - Name: required
  - Email: valid email format
  - Password: at least 6 characters

### 4. **Port Already in Use**

**Symptoms:**
- "Port 5000 already in use" error
- Server won't start

**Solution:**
1. Change port in `backend/.env`:
   ```env
   PORT=5001
   ```
2. Update frontend API URL if needed
3. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

### 5. **CORS Errors**

**Symptoms:**
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors

**Solution:**
- CORS is already configured in `backend/server.js`
- Make sure backend is running on port 5000
- Check that frontend is making requests to the correct URL

### 6. **Environment Variables Missing**

**Symptoms:**
- JWT errors
- Database connection failures
- Server crashes

**Solution:**
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doittoday
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

## Quick Diagnostic Checklist ✅

1. ✅ Backend server running? (`npm run server`)
2. ✅ MongoDB connected? (Check backend terminal)
3. ✅ Dependencies installed? (`npm run install-all`)
4. ✅ Environment variables set? (`backend/.env` exists)
5. ✅ Ports available? (5000 for backend, 3000 for frontend)
6. ✅ Browser console errors? (Check F12 for detailed errors)

## Getting Help

If you're still having issues:

1. **Check the browser console** (F12) for errors
2. **Check the backend terminal** for server errors
3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # Should connect
   ```
4. **Test backend directly**:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"message":"Server is running!"}
   ```

## Common Error Messages

### "Cannot connect to server"
→ Backend not running. Start with `npm run server`

### "MongoDB connection error"
→ MongoDB not running. Start MongoDB service or use MongoDB Atlas

### "User already exists"
→ Email already registered. Try a different email or login instead

### "Password must be at least 6 characters"
→ Password too short. Use at least 6 characters

### "Please provide a valid email"
→ Email format invalid. Check email address

---

Still stuck? Check the browser console and backend terminal for specific error messages!


