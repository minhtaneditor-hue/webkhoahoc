import { createHmac, timingSafeEqual } from 'crypto';

// Facebook Graph API for the Page's Messenger inbox. SERVER ONLY.
// FB_PAGE_ACCESS_TOKEN: Meta app > Messenger > Cài đặt API > tạo mã cho Trang (long-lived Page token).
// FB_APP_SECRET: Meta app > Cài đặt > Thông tin cơ bản > Khóa bí mật của ứng dụng.

const GRAPH = `https://graph.facebook.com/${process.env.FB_GRAPH_VERSION || 'v24.0'}`;
const MAX_LEN = 1900; // Messenger allows 2000 characters per message

export const fbConfigured = () => !!process.env.FB_PAGE_ACCESS_TOKEN;

/** Checks X-Hub-Signature-256 so only Facebook can post to the webhook. */
export function validSignature(rawBody: string, header: string | null) {
  const secret = process.env.FB_APP_SECRET;
  if (!secret) return false;
  if (!header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'));
  const got = Buffer.from(header.slice(7));
  return expected.length === got.length && timingSafeEqual(expected, got);
}

/** Splits a long reply on paragraph, then sentence boundaries. */
export function splitMessage(text: string): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > MAX_LEN) {
    const slice = rest.slice(0, MAX_LEN);
    const cut = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('\n'), slice.lastIndexOf('. '));
    const at = cut > MAX_LEN / 2 ? cut + 1 : MAX_LEN;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${GRAPH}${path}?access_token=${encodeURIComponent(process.env.FB_PAGE_ACCESS_TOKEN || '')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Graph API ${res.status}`);
  return data;
}

/**
 * Sends a text reply; returns the Facebook message ids. Outside the 24h window Facebook refuses
 * plain replies, so a person replying from Admin may pass tag HUMAN_AGENT (needs that permission on the app).
 */
export async function sendText(psid: string, text: string, opts: { humanAgent?: boolean } = {}) {
  const mids: string[] = [];
  for (const part of splitMessage(text)) {
    const data = await post('/me/messages', {
      recipient: { id: psid },
      messaging_type: opts.humanAgent ? 'MESSAGE_TAG' : 'RESPONSE',
      ...(opts.humanAgent ? { tag: 'HUMAN_AGENT' } : {}),
      message: { text: part },
    });
    if (data.message_id) mids.push(data.message_id);
  }
  return mids;
}

/** Public reply under a comment (needs pages_manage_engagement). Returns the new comment id. */
export async function replyToComment(commentId: string, message: string) {
  const data = await post(`/${commentId}/comments`, { message });
  return data.id as string | undefined;
}

/**
 * Private reply: opens a Messenger chat with the person who commented (one per comment, within 7 days).
 * Returns their Messenger id (PSID) so the chat can continue as a normal conversation.
 */
export async function privateReply(commentId: string, text: string) {
  const data = await post('/me/messages', { recipient: { comment_id: commentId }, message: { text: text.slice(0, 1900) } });
  return { psid: data.recipient_id as string | undefined, mid: data.message_id as string | undefined };
}

/** Text of a Page post, to understand what a comment is about. */
export async function postText(postId: string) {
  try {
    const qs = new URLSearchParams({ fields: 'message', access_token: process.env.FB_PAGE_ACCESS_TOKEN || '' });
    const res = await fetch(`${GRAPH}/${postId}?${qs}`);
    const d = await res.json();
    return String(d.message || '').slice(0, 3000);
  } catch {
    return '';
  }
}

/** Sends an image (e.g. a VietQR code) by URL; returns the Facebook message id. */
export async function sendImage(psid: string, url: string) {
  const data = await post('/me/messages', {
    recipient: { id: psid },
    messaging_type: 'RESPONSE',
    message: { attachment: { type: 'image', payload: { url, is_reusable: false } } },
  });
  return data.message_id as string | undefined;
}

/** "Đang nhập…" bubble while the AI writes. Never fails the caller. */
export async function typing(psid: string) {
  await post('/me/messages', { recipient: { id: psid }, sender_action: 'typing_on' }).catch(() => {});
}

export type GraphMessage = { id: string; message?: string; created_time: string; from?: { id: string; name?: string } };
export type GraphConversation = {
  id: string;
  updated_time: string;
  participants?: { data: { id: string; name?: string }[] };
  messages?: { data: GraphMessage[] };
};

async function get(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, access_token: process.env.FB_PAGE_ACCESS_TOKEN || '' });
  const res = await fetch(`${GRAPH}${path}?${qs}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Graph API ${res.status}`);
  return data;
}

export async function pageId(): Promise<string> {
  return process.env.FB_PAGE_ID || (await get('/me', { fields: 'id' })).id;
}

export const WEBHOOK_FIELDS = ['messages', 'messaging_postbacks', 'message_echoes', 'feed'];

/** Subscribes this app to the Page's webhook fields with the Page token on the server; returns what is subscribed now. */
export async function subscribePage(page: string) {
  await post(`/${page}/subscribed_apps`, { subscribed_fields: WEBHOOK_FIELDS.join(',') });
  const d = await get(`/${page}/subscribed_apps`, {});
  const mine = (d.data || []).find((a: { id: string }) => a.id === process.env.FB_APP_ID) || d.data?.[0];
  return (mine?.subscribed_fields || []) as string[];
}

/** One page of the Page's past Messenger conversations, newest first, with their last 100 messages. */
export async function fetchConversations(after?: string): Promise<{ data: GraphConversation[]; next: string | null }> {
  const d = await get('/me/conversations', {
    platform: 'messenger',
    limit: '20',
    fields: 'updated_time,participants,messages.limit(100){message,from,created_time}',
    ...(after ? { after } : {}),
  });
  return { data: d.data || [], next: d.paging?.next ? d.paging?.cursors?.after || null : null };
}

/**
 * Name and avatar. The profile endpoint needs Meta's "Business Asset User Profile Access";
 * when Facebook refuses it, the name is read from the Page's conversation participants instead.
 */
export async function getProfile(psid: string): Promise<{ name: string | null; pic: string | null }> {
  try {
    const d = await get(`/${psid}`, { fields: 'first_name,last_name,profile_pic' });
    const name = [d.last_name, d.first_name].filter(Boolean).join(' ').trim() || null;
    if (name) return { name, pic: d.profile_pic || null };
  } catch (err) {
    console.error('[fb profile]', psid, err instanceof Error ? err.message : err);
  }
  try {
    const d = await get(`/${await pageId()}/conversations`, { platform: 'messenger', user_id: psid, fields: 'participants' });
    const person = (d.data?.[0]?.participants?.data || []).find((p: { id: string; name?: string }) => p.id === psid);
    return { name: person?.name || null, pic: null };
  } catch (err) {
    console.error('[fb participants]', psid, err instanceof Error ? err.message : err);
    return { name: null, pic: null };
  }
}
