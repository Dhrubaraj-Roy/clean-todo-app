"use client"

import { useEffect, useState } from "react"
import { supabase, isUsingMockData } from "@/lib/supabase"
import { useTaskStore } from "@/lib/store/task-store"

export function DebugInfo() {
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const { error: taskError } = useTaskStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          setAuthError(error.message)
        } else {
          setUser(user)
        }
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm backdrop-blur-sm border border-white/20">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Mode: {isUsingMockData ? 'Mock' : 'Real Supabase'}</div>
        <div>User: {user ? user.email : 'Not signed in'}</div>
        {authError && <div className="text-red-400">Auth Error: {authError}</div>}
        {taskError && <div className="text-red-400">Task Error: {taskError}</div>}
      </div>
    </div>
  )
} 