import type { SupabaseClient } from '@supabase/supabase-js';
import { notifyAdmin } from './notify';

// Bank transfers for orders closed in Messenger. The bot sends a VietQR whose note is
// TANVAFB<fb_orders.id>; the SePay webhook calls fbTransferReceived when that money arrives.

export const FB_PAY_PREFIX = 'TANVAFB';

/** The fb_orders id inside a transfer note, whatever the bank added around it. */
export function findFbOrderId(...texts: (string | null | undefined)[]) {
  for (const t of texts) {
    // Keep separators as spaces: a bank reference appended right after must not glue onto the id
    const m = t?.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').match(/TANVA ?FB ?(\d{1,9})\b/);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Marks the Messenger order as having received money and tells Minh Tấn. Returns false for an unknown order. */
export async function fbTransferReceived(db: SupabaseClient, orderId: number, amount: number, txId: string) {
  const { data: order } = await db.from('fb_orders').select('id, psid, customer_name, phone, product, note, status').eq('id', orderId).maybeSingle();
  if (!order) return false;
  const money = `${Math.round(amount).toLocaleString('vi-VN')}đ`;
  if (String(order.note || '').includes(`sepay:${txId}`)) return true; // webhook retry
  await db.from('fb_orders').update({
    status: order.status === 'new' ? 'confirmed' : order.status,
    note: `${order.note ? `${order.note} · ` : ''}Đã nhận ${money} (sepay:${txId})`,
  }).eq('id', order.id);
  await notifyAdmin({
    title: `Khách đã chuyển khoản ${money}: ${order.product}`,
    psid: order.psid || undefined,
    lines: [['Khách', order.customer_name], ['Zalo / SĐT', order.phone], ['Số tiền', money], ['Đơn', `#${order.id}`]],
  });
  return true;
}
