'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

// Meta (Facebook) Pixel, switched on by the "Facebook Pixel ID" field in Admin > Nội dung & liên hệ.
// PageView on every route change; checkout pages add InitiateCheckout / Purchase via window.fbq.
declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

export default function FacebookPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const id = (pixelId || '').replace(/\D/g, '');

  useEffect(() => {
    if (id && !/^\/(admin|learn)(\/|$)/.test(pathname || '')) window.fbq?.('track', 'PageView');
  }, [id, pathname]);

  if (!id) return null;
  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');`}
    </Script>
  );
}
