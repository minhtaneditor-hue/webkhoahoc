export const ADMIN_EMAILS = [
  'minhtaneditor@gmail.com',
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
].filter(Boolean) as string[];

/**
 * Checks if a user email belongs to the admin list.
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.trim().toLowerCase() === cleanEmail);
}
