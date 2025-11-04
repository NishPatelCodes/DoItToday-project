# Quick Start Guide 🚀

Get DoItToday running in minutes!

## Step 1: Install Dependencies

Run this command in the root directory:
```bash
npm run install-all
```

This will install dependencies for the root project, backend, and frontend.

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. MongoDB should be running on `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the connection string in `.env`

## Step 3: Configure Environment Variables

Create a file `backend/.env` with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doittoday
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

## Step 4: Start the Application

Run both frontend and backend simultaneously:
```bash
npm run dev
```

Or run separately in different terminals:
```bash
# Terminal 1 - Backend (Port 5000)
npm run server

# Terminal 2 - Frontend (Port 3000)
npm run client
```

## Step 5: Open in Browser

Visit: **http://localhost:3000**

## First Steps After Launch

1. **Create Account**: Click "Sign Up" and create your account
2. **Add Tasks**: Click "Add Task" to create your first task
3. **Set Goals**: Add a long-term goal with a deadline
4. **Add Friends**: Invite friends by email to see their progress
5. **View Analytics**: Check your productivity charts on the dashboard

## Troubleshooting 🔧

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `backend/.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `backend/.env` or
- Change port in `frontend/vite.config.js`

### Module Not Found Errors
- Run `npm run install-all` again
- Delete `node_modules` and reinstall if needed

## Development Tips 💡

- Backend auto-reloads with nodemon
- Frontend hot-reloads with Vite
- Check browser console for errors
- Check terminal for backend logs

Enjoy building with DoItToday! 🎉


