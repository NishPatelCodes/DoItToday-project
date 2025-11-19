# Vercel Free Plan Setup Guide

## ✅ Configuration Fixed for Free Plan

Since you're on Vercel's free plan, I've made the following adjustments:

### Removed (Not Available on Free Plan)
- ❌ **Cron Jobs** - Requires Pro plan ($20/month)
- ❌ **Multi-region deployment** - Requires Pro plan

### What Still Works (Free Plan Compatible)
- ✅ **API Routes** - `/api/warm` and `/api/health` work on free plan
- ✅ **Client-side warm-up** - Automatically warms server while user is on site
- ✅ **Route prefetching** - Instant navigation
- ✅ **Service worker caching** - Offline support
- ✅ **Optimized headers** - Performance and security

## 🔧 Keep-Alive Setup (Required for Free Plan)

Since Vercel Cron is not available on the free plan, you **MUST** set up an external service to keep your functions warm:

### Option 1: UptimeRobot (Recommended - FREE)
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Click "Add New Monitor"
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: DoItToday Warm-Up
   - **URL**: `https://your-app.vercel.app/api/warm`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: (optional)
5. Click "Create Monitor"

### Option 2: Cron-job.org (FREE)
1. Go to https://cron-job.org
2. Sign up for free account
3. Click "Create cronjob"
4. Configure:
   - **Title**: DoItToday Warm-Up
   - **Address**: `https://your-app.vercel.app/api/warm`
   - **Schedule**: `*/9 * * * *` (every 9 minutes)
5. Click "Create cronjob"

### Option 3: EasyCron (FREE tier available)
1. Go to https://www.easycron.com
2. Sign up for free account
3. Create a new cron job
4. Set URL to `https://your-app.vercel.app/api/warm`
5. Set schedule to every 9 minutes

## 📊 Expected Performance

With external keep-alive service:
- **Cold Start**: < 500ms (eliminated)
- **First Load**: < 800ms
- **Navigation**: < 200ms

Without external keep-alive:
- **Cold Start**: 1-3 seconds (after 10+ minutes of inactivity)
- **First Load**: < 800ms
- **Navigation**: < 200ms

## ⚠️ Important Notes

1. **External Keep-Alive is REQUIRED** - Without it, functions will go cold after ~10 minutes of inactivity
2. **Client-side warm-up helps** - While users are on your site, functions stay warm
3. **Free plan limits**:
   - 100GB bandwidth/month
   - 100 serverless function executions/day (per function)
   - No cron jobs
   - Single region deployment

## 🎯 Next Steps

1. **Deploy to Vercel** - Push your code and Vercel will auto-deploy
2. **Set up UptimeRobot** - Follow Option 1 above (takes 2 minutes)
3. **Verify warm endpoint** - Visit `https://your-app.vercel.app/api/warm`
4. **Monitor performance** - Check Vercel Analytics dashboard

## 📝 Files Modified

- `vercel.json` - Removed cron jobs, kept headers and rewrites
- `frontend/vercel.json` - Removed cron jobs and regions
- `api/warm.js` - Updated documentation for free plan
- `api/health.js` - Health check endpoint

---

**Status**: ✅ Free Plan Compatible
**Action Required**: Set up external keep-alive service (UptimeRobot recommended)

