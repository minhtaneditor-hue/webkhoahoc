'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, type SiteSettings } from '@/lib/site-settings';

// Site settings fetched once in the root layout, readable from client components
// (header ticker, footer, support widget) without each one querying the database.
const SiteContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteContext);
