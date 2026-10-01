'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = (process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)?.trim()
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com'

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: host,
        defaults: '2026-05-30',
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
