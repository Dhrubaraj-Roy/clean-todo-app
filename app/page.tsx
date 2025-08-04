"use client"

import { useEffect } from "react"
import { KanbanBoard } from "@/components/layout/kanban-board"
import { useTaskStore } from "@/lib/store/task-store"
import { AuthProvider } from "@/components/auth/auth-provider"



export default function HomePage() {
  const { fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Listen for task updates from editor
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const { taskId, title, details } = event.detail
      // Refresh tasks to get updated data
      fetchTasks()
    }

    window.addEventListener('taskUpdated', handleTaskUpdate as EventListener)
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener)
    }
  }, [fetchTasks])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <header className="mb-8 text-center relative">

            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">
                Clean TODO App
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>
          </header>
          <KanbanBoard />
        </div>
      </div>
    </AuthProvider>
  )
}
