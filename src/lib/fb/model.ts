// Server-side refusal fallback for Messenger AI calls. SERVER ONLY.
// Haiku has no server-side fallback, and the API docs say not to send `fallbacks` to it,
// so the beta and the parameter are only added for models that support them (Sonnet, Opus, Fable).

export function fallbackFor(model: string) {
  if (/haiku/i.test(model)) return {};
  return { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const };
}
