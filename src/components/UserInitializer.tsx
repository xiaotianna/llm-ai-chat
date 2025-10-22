"use client"

import { useEffect } from 'react'
import { useUserStore } from '@/store/user'

export default function UserInitializer() {
  const { isInitialized, initializeUser } = useUserStore()

  useEffect(() => {
    if (!isInitialized) {
      initializeUser()
    }
  }, [isInitialized, initializeUser])

  return null
}