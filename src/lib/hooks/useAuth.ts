'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    mountedRef.current = true
    const supabase = supabaseRef.current

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!mountedRef.current) return

        setSession(currentSession)

        if (currentSession?.user) {
          const profile = await fetchProfile(supabase, currentSession.user.id)
          if (mountedRef.current) setUser(profile)
        }
      } catch {
        // silent
      } finally {
        if (mountedRef.current) setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mountedRef.current) return

        setSession(newSession)

        if (newSession?.user) {
          const profile = await fetchProfile(supabase, newSession.user.id)
          if (mountedRef.current) setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabaseRef.current.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabaseRef.current.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  const logout = useCallback(async () => {
    await supabaseRef.current.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabaseRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    signInWithGoogle,
  }
}
