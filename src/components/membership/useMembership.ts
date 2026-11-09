'use client';

import { useEffect, useState } from 'react';

/** Whether the signed-in visitor is an active member (false for guests or while loading). Display only. */
export function useMembership() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch('/api/membership')
      .then((r) => r.json())
      .then((d) => { if (alive) setActive(!!d.active); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return active;
}
