'use client'

import { useEffect, useRef } from 'react'

export function AnalyticsTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const payload = {
      path: window.location.pathname,
      referrer: document.referrer || null,
    }

    // Use sendBeacon for reliability, fallback to fetch
    const data = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {})
    }
  }, [])

  return null
}
