import { createHmac } from 'crypto';
import { SITE } from '@/lib/emails';

export const freeEmailToken = (assetId: string, email: string) =>
  createHmac('sha256', process.env.CRON_SECRET || 'tanva').update(`${assetId}:${email}`).digest('hex').slice(0, 24);

/** The button in a free-product email: GET /api/shop/free resolves it to a fresh file link, so it never goes stale. */
export const freeEmailUrl = (assetId: string, email: string) =>
  `${SITE}/api/shop/free?asset=${assetId}&e=${encodeURIComponent(email)}&t=${freeEmailToken(assetId, email)}`;
