'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Enhanced profile loading with creation
  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Profile doesn't exist, create it
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser && currentUser.id === userId) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              email: currentUser.email || '',
              full_name: currentUser.user_metadata?.full_name || '',
              role: 'analyst'
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Still set a basic profile for immediate access
            setProfile({
              id: currentUser.id,
              email: currentUser.email || '',
              full_name: currentUser.user_metadata?.full_name || '',
              role: 'analyst',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } else {
            // Reload profile after creation
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()
            setProfile(newProfile)
          }
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error)
    }
  }

  // Enhanced auth state change handler
  const handleAuthStateChange = async (event: AuthChangeEvent, session: any) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Wait for user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000))
      await loadProfile(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      setProfile(null)
    }
    setUser(session?.user || null)
  }

  useEffect(() => {
    // Check active sessions
    async function loadUser() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await loadProfile(user.id)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Listen for auth changes with enhanced handler
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      handleAuthStateChange
    )

    return () => subscription.unsubscribe()
  }, [])



  async function signIn(email: string, password: string) {
    // Validate email before sign in
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string) {
    // Validate email before sign up
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error

    // Profile creation is now handled by onAuthStateChange
    // This ensures profile is created regardless of email confirmation setting
    if (data.user) {
      // Wait a moment for the trigger
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadProfile(data.user.id)
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
