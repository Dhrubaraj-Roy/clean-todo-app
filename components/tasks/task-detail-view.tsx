"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Task } from "@/lib/types"
import { useTaskStore } from "@/lib/store/task-store"
import { Editor } from "../editor/editor"
import { supabase } from "@/lib/supabase"

interface TaskDetailViewProps {
  task: Task
  open: boolean
  onClose: () => void
}

export function TaskDetailView({ task, open, onClose }: TaskDetailViewProps) {
  const { updateTaskDetails } = useTaskStore()
  const [title, setTitle] = useState(task.title)
  const [details, setDetails] = useState(task.details || null)

  useEffect(() => {
    setTitle(task.title)
    setDetails(task.details || null)
  }, [task])

  const handleSaveDetails = async (newDetails: any) => {
    setDetails(newDetails)
    await updateTaskDetails(task.id, newDetails)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900/95 backdrop-blur-xl border-slate-600/50 text-white">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Created {formatDate(task.created_at)}
                </div>
                {task.completed_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Completed {formatDate(task.completed_at)}
                  </div>
                )}
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                  {task.status}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Editor
            initialContent={details}
            onUpdate={handleSaveDetails}
            placeholder={`Add sub-tasks with checkboxes, insert links, or write detailed notes...

📝 Tips:
• Press Ctrl/Cmd + K to add links
• Type [ ] for checkboxes or use the toolbar
• Use bullet points and formatting for better organization`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
