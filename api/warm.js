/**
 * Warm-up endpoint to prevent cold starts
 * This endpoint should be pinged every 5-10 minutes by an external service
 * (UptimeRobot, Cron-job.org) - Vercel Cron requires Pro plan
 * 
 * Usage:
 * - UptimeRobot: https://yourapp.com/api/warm (every 9 minutes) - FREE
 * - Cron-job.org: https://yourapp.com/api/warm (every 9 minutes) - FREE
 */

export default function handler(req, res) {
  // Set cache headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Simple health check - just return success
  // This keeps the serverless function warm
  return res.status(200).json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Server is warm and ready',
    region: process.env.VERCEL_REGION || 'unknown'
  });
}

