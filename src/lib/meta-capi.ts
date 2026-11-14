import { createHash } from 'crypto';
import { after } from 'next/server';
import { getSiteSettings } from './content';

import { clientIp } from '@/lib/client-ip';
// Meta Conversions API: the server-side copy of the Pixel events. It still counts when an ad
// blocker stops the Pixel or the buyer closes the page before the transfer is confirmed.
// The pixel id comes from Admin > Nội dung & liên hệ, the token from META_CAPI_ACCESS_TOKEN;
// without either, nothing is sent. Set META_CAPI_TEST_CODE to see events under "Thử nghiệm sự kiện".
// Browser and server send the same event_id for one event, so Meta counts it once.

const GRAPH_URL = 'https://graph.facebook.com/v24.0';

/** What only the visitor's browser request can tell us. Saved on the order for the later webhook. */
export type MetaContext = { fbp?: string; fbc?: string; ip?: string; ua?: string; url?: string };

export type MetaEvent = {
  name: 'Lead' | 'Schedule' | 'InitiateCheckout' | 'Purchase';
  eventId: string;
  url: string;
  context?: MetaContext | null;
  customer?: { email?: string | null; phone?: string | null; name?: string | null; userId?: string | null };
  data?: { value?: number; contentName?: string | null; contentId?: string | null; orderId?: string };
};

export const metaEnabled = () => !!process.env.META_CAPI_ACCESS_TOKEN;

export function siteUrl(path = '/') {
  return `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com'}${path}`;
}

/** Reads the Meta cookies, IP, browser and page from a request sent by the visitor's browser. */
export function metaContext(req: Request): MetaContext {
  const cookies = req.headers.get('cookie') || '';
  const cookie = (name: string) => cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
  return {
    fbp: cookie('_fbp'),
    fbc: cookie('_fbc'),
    ip: clientIp(req) || undefined,
    ua: req.headers.get('user-agent') || undefined,
    url: req.headers.get('referer') || undefined,
  };
}

/** An event id sent by the browser, or undefined when it does not look like one of ours. */
export function cleanEventId(raw: unknown) {
  const id = String(raw ?? '');
  return /^[\w-]{1,80}$/.test(id) ? id : undefined;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const hashed = (value?: string | null) => {
  const clean = value?.trim().toLowerCase();
  return clean ? [sha256(clean)] : undefined;
};

/** Meta matches phones with the country code and digits only: 0912 345 678 -> 84912345678. */
export function normalizePhone(phone?: string | null) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 9) return undefined;
  return digits.startsWith('0') ? `84${digits.slice(1)}` : digits;
}

/** Vietnamese order: "Lê Minh Tấn" -> family name "Lê", given name "Tấn". */
function splitName(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};
  return parts.length === 1 ? { fn: parts[0] } : { ln: parts[0], fn: parts[parts.length - 1] };
}

export function buildMetaBody(event: MetaEvent, token: string, testCode?: string) {
  const { context: ctx, customer: who, data } = event;
  const { fn, ln } = splitName(who?.name);
  const custom = {
    currency: data?.value !== undefined ? 'VND' : undefined,
    value: data?.value,
    content_name: data?.contentName || undefined,
    content_ids: data?.contentId ? [data.contentId] : undefined,
    content_type: data?.contentId ? 'product' : undefined,
    order_id: data?.orderId,
  };
  return {
    data: [{
      event_name: event.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: 'website',
      event_source_url: ctx?.url || event.url,
      user_data: {
        em: hashed(who?.email),
        ph: hashed(normalizePhone(who?.phone)),
        fn: hashed(fn),
        ln: hashed(ln),
        external_id: hashed(who?.userId),
        fbp: ctx?.fbp,
        fbc: ctx?.fbc,
        client_ip_address: ctx?.ip,
        client_user_agent: ctx?.ua,
      },
      custom_data: custom,
    }],
    test_event_code: testCode || undefined,
    access_token: token,
  };
}

/**
 * Sends one event after the response has gone out. Tracking must never break a checkout or a
 * webhook, so this does not throw; a rejected event only shows up in the logs.
 */
export function sendMetaEvent(event: MetaEvent) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return;
  try {
    after(async () => {
      try {
        const pixelId = (await getSiteSettings()).fb_pixel_id?.replace(/\D/g, '');
        if (!pixelId) return;
        const res = await fetch(`${GRAPH_URL}/${pixelId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildMetaBody(event, token, process.env.META_CAPI_TEST_CODE)),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) console.error(`Meta CAPI: ${event.name} ${event.eventId} rejected (${res.status})`, await res.text());
      } catch (error) {
        console.error(`Meta CAPI: ${event.name} ${event.eventId} failed`, error);
      }
    });
  } catch (error) {
    console.error('Meta CAPI: could not schedule event', error);
  }
}
