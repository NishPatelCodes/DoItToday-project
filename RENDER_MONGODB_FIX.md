# 🔧 Fix MongoDB Connection Error on Render

## ❌ Error You're Seeing:
```
❌ MongoDB connection error: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

## 🔍 What This Means:
Your backend is trying to connect to **localhost MongoDB** instead of **MongoDB Atlas**. This means the `MONGODB_URI` environment variable is **NOT SET** in Render.

---

## ✅ Solution: Set MONGODB_URI in Render

### Step 1: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster (e.g., `Cluster0`)
3. Click **"Connect"** button
4. Choose **"Connect your application"**
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Prepare Your Connection String

Replace placeholders in the connection string:

1. Replace `<username>` with your MongoDB username (e.g., `NishPatel`)
2. Replace `<password>` with your **URL-encoded password**:
   - If password is `Nish@501`, it becomes `Nish%40501`
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
3. Replace the database name (after `.mongodb.net/`):
   - Change `/?retryWrites=true...` to `/doittoday?retryWrites=true&w=majority`

**Final Example:**
```
mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday?retryWrites=true&w=majority
```

### Step 3: Add to Render Environment Variables

1. Go to your Render dashboard
2. Click on your **backend service** (`doittoday-backend`)
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Enter:
   - **Key:** `MONGODB_URI`
   - **Value:** Your complete connection string from Step 2
   - **Example:** 
     ```
     mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday?retryWrites=true&w=majority
     ```
6. Click **"Save Changes"**

### Step 4: Redeploy

1. Render will **automatically redeploy** after saving
2. Or manually click **"Manual Deploy"** → **"Deploy latest commit"**
3. Check the logs - you should see:
   ```
   ✅ Connected to MongoDB
   ```

---

## 🔐 Important: URL Encoding Your Password

If your password contains special characters, you **MUST** URL-encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |

**Example:**
- Password: `Nish@501`
- Encoded: `Nish%40501`
- Full URI: `mongodb+srv://NishPatel:Nish%40501@cluster0.okontry.mongodb.net/doittoday`

---

## 🛡️ MongoDB Atlas Network Access

Make sure MongoDB Atlas allows connections from Render:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Or add Render's IP ranges (but allowing all is easier for now)
4. Click **"Confirm"**

---

## ✅ Verification Checklist

After setting MONGODB_URI:

- [ ] Connection string is correct (no typos)
- [ ] Password is URL-encoded (special characters converted)
- [ ] Database name is included (`/doittoday`)
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Environment variable is saved in Render
- [ ] Service has been redeployed
- [ ] Logs show: `✅ Connected to MongoDB`

---

## 🆘 Still Not Working?

### Check 1: Verify Environment Variable is Set
1. In Render, go to **Environment** tab
2. Check if `MONGODB_URI` appears in the list
3. Make sure the value is correct (hover to see full value)

### Check 2: Check Render Logs
1. Go to **Logs** tab in Render
2. Look for the error message
3. The updated code will now show a clearer error if MONGODB_URI is missing

### Check 3: Test Connection String Locally
1. Create a `.env` file in `backend/` directory
2. Add: `MONGODB_URI=your_connection_string`
3. Run: `cd backend && npm start`
4. If it works locally, the connection string is correct

### Check 4: MongoDB Atlas Database User
1. Go to MongoDB Atlas → **Database Access**
2. Make sure your user exists and has proper permissions
3. Password should match what you're using (before URL encoding)

---

## 📝 Quick Copy-Paste Format

Your MONGODB_URI should look like this:
```
mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

Replace:
- `USERNAME` = Your MongoDB username
- `URL_ENCODED_PASSWORD` = Your password with special chars encoded
- `CLUSTER` = Your cluster name (e.g., `cluster0.okontry`)
- `DATABASE_NAME` = `doittoday` (or your preferred name)

---

Once you set `MONGODB_URI` correctly in Render and redeploy, the error should be fixed! 🚀




