/**
 * Health check endpoint
 * Used for monitoring and keeping functions warm
 */

export default function handler(req, res) {
  return res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'unknown',
  });
}

