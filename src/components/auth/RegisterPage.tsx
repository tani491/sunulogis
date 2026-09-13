'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'

export function RegisterPage() {
  const { navigate } = useAppStore()

  useEffect(() => {
    navigate('landing')
  }, [navigate])

  return null
}
