import posthog from 'posthog-js'

const token = (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY)?.trim()
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://app.cottbook.com'

if (typeof window !== 'undefined' && token) {
  posthog.init(token, {
    api_host: host,
    defaults: '2026-05-30',
  })
}

