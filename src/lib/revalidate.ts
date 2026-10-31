// Client helper: ask the server to rebuild public pages after an admin save. Failures are non-fatal.
export async function revalidateSite() {
  try {
    await fetch('/api/admin/revalidate', { method: 'POST' });
  } catch {
    // The pages still refresh on their own revalidate interval
  }
}
