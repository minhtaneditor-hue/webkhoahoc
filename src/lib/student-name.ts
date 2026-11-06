/** Admin marks returning students with a trailing "HVC" (học viên cũ) in full_name. Students should never see it. */
export const publicName = (full?: string | null) => (full || '').trim().replace(/(^|\s+)hvc$/i, '').trim();
