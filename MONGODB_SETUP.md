# MongoDB Setup Guide 🗄️

Your app needs MongoDB to store user data, tasks, and goals. Here are two easy options:

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐

**Pros:** Free, no installation, works immediately, cloud-hosted

### Quick Setup (5 minutes):

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier (Free forever)
   - Select a cloud provider and region (closest to you)
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Authentication: Password
   - Create username and password (save these!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your IP)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

6. **Update Your `.env` File**
   
   Create `backend/.env` file with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/doittoday?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```
   
   **Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your database user credentials!

7. **Restart Your Server**
   - Stop the server (Ctrl+C)
   - Start again: `npm run dev`
   - You should see: ✅ Connected to MongoDB

---

## Option 2: Local MongoDB (Windows)

### Install MongoDB:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Version: Latest (7.x)
   - Platform: Windows
   - Package: MSI
   - Download and run installer

2. **Installation Options**
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

3. **Verify Installation**
   - MongoDB should start automatically as a Windows service
   - Check Windows Services (services.msc) for "MongoDB"

4. **Verify Connection**
   - Open Command Prompt or PowerShell
   - Run: `mongosh` (or `mongo` if mongosh not available)
   - Should connect to `mongodb://127.0.0.1:27017`

5. **Your `.env` File**
   
   Create `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/doittoday
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

6. **Restart Your Server**
   - Stop the server (Ctrl+C)
   - Start again: `npm run dev`
   - You should see: ✅ Connected to MongoDB

---

## Option 3: Docker (If you have Docker installed)

Quick start with Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

Then use in `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/doittoday
```

---

## Quick Test

After setting up, test your connection:

```bash
# Test the connection string
mongosh "YOUR_CONNECTION_STRING"
```

Or if using local MongoDB:
```bash
mongosh
```

---

## Troubleshooting

### MongoDB Atlas Connection Issues:

1. **Check username/password** - Make sure they're correct in the connection string
2. **Check IP whitelist** - Make sure your IP is allowed (or allow all IPs)
3. **Check cluster status** - Make sure cluster is running (not paused)

### Local MongoDB Issues:

1. **Service not running** - Start MongoDB service in Windows Services
2. **Port in use** - Check if port 27017 is already in use
3. **Firewall** - Make sure Windows Firewall allows MongoDB

---

## Recommendation

**Use MongoDB Atlas** - It's free, requires no installation, and works immediately! 🚀



