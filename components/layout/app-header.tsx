"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { LogOut, User, Crown } from "lucide-react"

export function AppHeader() {
  const { user, isDemo } = useAuth()

  const handleSignOut = async () => {
    try {
      console.log("Sign out clicked, current user:", user)
      console.log("Is demo mode:", isDemo)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      } else {
        console.log("Sign out successful")
        // Force page reload to ensure clean state
        window.location.reload()
      }
    } catch (err) {
      console.error("Sign out exception:", err)
    }
  }

  return (
    <header className="mb-4 sm:mb-8 text-center relative px-2">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-2 sm:mb-4">
          Clean TODO App
        </h1>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-2 sm:mb-4"></div>
        
        {/* User info and logout */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white/80">
            <div className="flex items-center gap-2">
              {isDemo ? (
                <Crown className="h-4 w-4 text-amber-400" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="text-xs sm:text-sm truncate max-w-[200px]">
                {user.email}
                {isDemo && <span className="text-amber-400 ml-1">(Demo)</span>}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs sm:text-sm"
              title={isDemo ? "Sign out to create your own account" : "Sign out"}
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {isDemo ? "Sign Out & Create Account" : "Sign Out"}
              </span>
              <span className="sm:hidden">
                {isDemo ? "Sign Out" : "Out"}
              </span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
} 