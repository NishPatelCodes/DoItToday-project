# 🔒 Security Checklist Before Pushing to GitHub

## ✅ Pre-Push Checklist

Before pushing your code to GitHub, verify these items:

### 1. Environment Variables (.env files)
- [ ] `.env` file is in `.gitignore`
- [ ] `backend/.env` is in `.gitignore`
- [ ] `frontend/.env` is in `.gitignore`
- [ ] All `.env*` variations are ignored
- [ ] No `.env` files are staged for commit

**Check with:**
```bash
git status
# Should NOT see any .env files listed
```

### 2. Secrets & Keys
- [ ] MongoDB connection string is NOT in code
- [ ] JWT secret is NOT in code
- [ ] API keys are NOT in code
- [ ] Passwords are NOT in code

### 3. Verify What Will Be Committed
```bash
# Check what files will be committed
git status

# See file contents (double-check sensitive files aren't included)
git diff --cached

# If you see any .env files, UNSTAGE them:
git reset HEAD <filename>
```

### 4. Safe to Commit Files
✅ **These are SAFE to commit:**
- `.env.example` files (template files, no real secrets)
- `package.json` (no secrets)
- Source code (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration files (without secrets)
- `README.md` and documentation

❌ **These should NEVER be committed:**
- `.env` files (any variation)
- `node_modules/`
- `*.log` files
- `*.key`, `*.pem` files
- Any file containing passwords or secrets

### 5. Double-Check Before Push
```bash
# List all files that will be pushed
git ls-files

# If you see .env in the list, REMOVE it:
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env

# Then commit the removal
git commit -m "Remove sensitive .env files"
```

### 6. If You Accidentally Committed Secrets

**If you already pushed secrets to GitHub:**
1. **IMMEDIATELY** change all secrets:
   - Generate new JWT secret
   - Update MongoDB password
   - Rotate any API keys

2. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

3. Consider making the repository private or using GitHub's secret scanning

---

## 🔐 What Should Be in .env Files

### Backend (.env)
```env
# NEVER commit these!
MONGODB_URI=mongodb+srv://username:PASSWORD@cluster.mongodb.net/doittoday
JWT_SECRET=your_super_secret_random_string_here
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
# NEVER commit these!
VITE_API_URL=http://localhost:5000
```

---

## ✅ What's Safe to Commit

### .env.example files (Safe!)
These are template files with placeholder values:
- `backend/.env.example` ✅
- `frontend/.env.example` ✅

These help others understand what environment variables are needed without exposing secrets.

---

## 🚨 Red Flags - Stop and Check!

If you see any of these in `git status`, DO NOT COMMIT:
- `.env`
- `.env.local`
- `.env.production`
- `secrets/`
- `*.key`
- `*.pem`
- Any file with "password", "secret", "key", "token" in the name

---

## 📝 Quick Verification Commands

```bash
# 1. Check if .env files are ignored
git check-ignore .env backend/.env frontend/.env
# Should return the file paths if properly ignored

# 2. See what will be committed
git status --short

# 3. Check for sensitive strings in staged files
git diff --cached | grep -i "mongodb\|password\|secret\|api_key"
# Should return nothing if clean

# 4. Verify .gitignore is working
git status --ignored
# Should show .env files in "Ignored files" section
```

---

## 🎯 Final Steps Before Push

1. ✅ Review `git status` - no .env files
2. ✅ Check `git diff --cached` - no secrets visible
3. ✅ Verify `.gitignore` includes all .env variations
4. ✅ Ensure `.env.example` files exist (template only)
5. ✅ Commit and push safely!

---

## 💡 Pro Tips

1. **Use `.env.example` files** - Template files showing required variables
2. **Never hardcode secrets** - Always use environment variables
3. **Use platform secrets** - For deployment, use platform's environment variable settings
4. **Regular audits** - Periodically check your repository for accidentally committed secrets
5. **Use secret scanning** - Enable GitHub's secret scanning feature

---

## ✅ You're Safe to Push When:

- ✅ `git status` shows no `.env` files
- ✅ All sensitive data is in `.gitignore`
- ✅ Only `.env.example` files exist (templates)
- ✅ No hardcoded secrets in source code
- ✅ Ready to commit and push!

Stay secure! 🔒

