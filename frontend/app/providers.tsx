'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = (process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)?.trim()
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com'

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: host,
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-05-30',
      })
    }

    // Keep Render backend awake & pre-warmed so user requests are instantaneous
    const pingBackend = () => {
      fetch('https://api.cottbook.com/api/health/', { 
        method: 'GET',
        cache: 'no-store',
        keepalive: true
      }).catch(() => {});
    };

    pingBackend();
    const interval = setInterval(pingBackend, 9 * 60 * 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pingBackend();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
