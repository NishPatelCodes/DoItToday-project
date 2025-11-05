# OAuth Setup Guide (Google & Apple Sign-In)

This guide explains how to set up Google and Apple OAuth authentication for DoItToday.

## Features Added

✅ **Google Sign-In** - Users can sign in with their Google account
✅ **Apple Sign-In** - Users can sign in with their Apple ID  
✅ **Beautiful UI** - OAuth buttons integrated into login/register pages
✅ **Automatic User Creation** - New users are created automatically on first OAuth login
✅ **Secure Token Flow** - JWT tokens generated after successful OAuth authentication

## Setup Instructions

### 1. Google OAuth Setup

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For **Application type**, choose **Web application**
7. Add **Authorized redirect URIs**:
   - Development: `http://localhost:5000/auth/google/callback`
   - Production: `https://your-backend-url.com/auth/google/callback`
8. Click **Create** and save your **Client ID** and **Client Secret**

#### B. Configure Environment Variables (Backend)

Add these to your `.env` file (or Render environment variables):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:5173
# Production: FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2. Apple OAuth Setup

#### A. Create Apple Sign In Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add button)
4. Select **Services IDs** and click **Continue**
5. Enter a description and identifier (e.g., `com.yourapp.signin`)
6. Click **Continue** and **Register**
7. Click on your newly created Service ID
8. Enable **Sign In with Apple**
9. Click **Configure**
10. Add your domains and return URLs:
    - Domain: `localhost` (for dev) or `your-domain.com` (for prod)
    - Return URL: `http://localhost:5000/auth/apple/callback` (dev)
    - Production: `https://your-backend-url.com/auth/apple/callback`
11. Save and continue

#### B. Create Apple Private Key

1. In Apple Developer Portal, go to **Keys**
2. Click **+** to create a new key
3. Enter a name (e.g., "DoItToday Sign In Key")
4. Check **Sign in with Apple**
5. Click **Configure** and select your App ID
6. Click **Continue** and **Register**
7. **Download the key file** (`.p8` file) - you can only download it once!
8. Note the **Key ID** shown on the page

#### C. Configure Environment Variables (Backend)

Add these to your `.env` file:

```env
# Apple OAuth
APPLE_CLIENT_ID=com.yourapp.signin  # Your Service ID
APPLE_TEAM_ID=YOUR_TEAM_ID  # Found in Apple Developer Portal (top right, next to your name)
APPLE_KEY_ID=YOUR_KEY_ID  # From the key you created
APPLE_PRIVATE_KEY_PATH=./config/AuthKey.p8  # Path to your .p8 key file

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### D. Upload Private Key

1. Create a `config` folder in your backend directory if it doesn't exist
2. Copy the downloaded `.p8` file to `backend/config/AuthKey.p8`
3. **For production (Render)**: Upload the `.p8` file content as an environment variable or use a secure file storage

### 3. Frontend Configuration

The frontend is already configured! It will automatically use:
- `VITE_API_URL` environment variable for API calls
- Defaults to `http://localhost:5000` for development

No additional frontend configuration needed.

### 4. Testing Locally

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:5173/login`
4. Click "Continue with Google" or "Continue with Apple"
5. Complete the OAuth flow
6. You should be redirected back and logged in!

## Production Deployment

### Render (Backend)

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Add all the OAuth environment variables:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=/auth/google/callback
   APPLE_CLIENT_ID=...
   APPLE_TEAM_ID=...
   APPLE_KEY_ID=...
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. For Apple's private key:
   - Option A: Add as environment variable `APPLE_PRIVATE_KEY` (paste the entire contents)
   - Option B: Use Render's file upload feature (if available)

6. Update your OAuth redirect URLs in Google Cloud Console and Apple Developer Portal to use your production backend URL

### Vercel (Frontend)

No additional configuration needed! The frontend will automatically use the production API URL.

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Make sure the callback URL in Google Cloud Console exactly matches your backend URL
- Include the port number for local development

**Error: "This app isn't verified"**
- This is normal for development
- Click "Advanced" → "Go to [App Name] (unsafe)" for testing
- For production, submit your app for verification

### Apple OAuth Issues

**Error: "invalid_client"**
- Check that your `APPLE_CLIENT_ID` matches your Service ID
- Verify your Team ID and Key ID are correct
- Make sure the `.p8` file path is correct

**Error: "invalid_request"**
- Verify the redirect URL matches what's configured in Apple Developer Portal
- Make sure the domain is correctly configured

### General Issues

**Users aren't being created**
- Check your MongoDB connection
- Look at backend logs for error messages
- Verify the User model allows OAuth users (no password requirement issues)

**Redirect fails after OAuth**
- Check `FRONTEND_URL` is set correctly
- Verify CORS settings allow your frontend origin
- Check browser console for errors

## Security Notes

🔒 **Important Security Considerations:**

1. **Never commit** `.env` files or `.p8` key files to Git
2. **Always use HTTPS** in production for OAuth callbacks
3. **Rotate secrets regularly** - especially if exposed
4. **Keep dependencies updated** - especially passport packages
5. **Validate tokens** - the backend validates all JWT tokens

## Optional Enhancements

Want to add more features?

- **Facebook Login**: Install `passport-facebook` and add similar configuration
- **GitHub Login**: Install `passport-github2` for developer-focused auth
- **Microsoft Login**: Install `passport-microsoft` for enterprise users
- **Account Linking**: Allow users to link multiple OAuth providers to one account

## Need Help?

- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Apple Sign In: https://developer.apple.com/sign-in-with-apple/
- Passport.js: http://www.passportjs.org/packages/

---

Made with ❤️ for DoItToday

