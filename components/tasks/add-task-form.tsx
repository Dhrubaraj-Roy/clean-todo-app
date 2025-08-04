"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTaskStore } from "@/lib/store/task-store"
import type { Task } from "@/lib/types"

interface AddTaskFormProps {
  status?: Task["status"]
}

export function AddTaskForm({ status = "present" }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { addTask } = useTaskStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsAdding(true)
    try {
      await addTask(title.trim(), status)
      setTitle("")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 animate-fade-in">
      <div className="flex gap-2">
        <Input
          placeholder={`Add a new ${status === "future" ? "future" : ""} task...`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 transition-all duration-300"
          disabled={isAdding}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || isAdding}
          className="px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
