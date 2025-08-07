"use client"

import React, { useState, useEffect } from "react"
import { Plus, X, Check, ExternalLink, Trash2, Link as LinkIcon, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Task, SubTask, TaskLink } from "@/lib/types"
import { useTaskStore } from "@/lib/store/task-store"
import { cn } from "@/lib/utils"

interface SubtaskManagerProps {
  task: Task
  open: boolean
  onClose: () => void
}

export function SubtaskManager({ task, open, onClose }: SubtaskManagerProps) {
  const { updateTaskDetails, updateTask } = useTaskStore()
  const [taskTitle, setTaskTitle] = useState(task.title)
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [links, setLinks] = useState<TaskLink[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Load existing subtasks and links from task details
  useEffect(() => {
    if (task.details?.subtasks) {
      setSubtasks(task.details.subtasks)
    } else {
      setSubtasks([])
    }
    
    if (task.details?.links) {
      setLinks(task.details.links)
    } else {
      setLinks([])
    }
    
    // Sync task title when dialog opens
    setTaskTitle(task.title)
  }, [task.details, task.title])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: generateId(),
        title: newSubtaskTitle.trim(),
        completed: false,
        created_at: new Date().toISOString(),
      }
      setSubtasks([...subtasks, newSubtask])
      setNewSubtaskTitle("")
    }
  }

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ))
  }

  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      const newLink: TaskLink = {
        id: generateId(),
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim(),
        created_at: new Date().toISOString(),
      }
      setLinks([...links, newLink])
      setNewLinkTitle("")
      setNewLinkUrl("")
    }
  }

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }

  const openLink = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Update title if changed
      if (taskTitle.trim() !== task.title) {
        await updateTask(task.id, { title: taskTitle.trim() })
      }
      
      // Merge existing details with subtasks and links
      const updatedDetails = {
        ...task.details,
        subtasks,
        links,
        hasSubtasks: subtasks.length > 0,
        hasLinks: links.length > 0,
      }
      
      // Update details
      await updateTaskDetails(task.id, updatedDetails)
      
      onClose()
    } catch (error) {
      console.error('Failed to save task changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Manage Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Title Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-medium text-white">Task Title</h3>
            </div>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-purple-400/50"
              placeholder="Enter task title..."
            />
          </div>
          
          <Separator className="bg-slate-700/50" />
          {/* Subtasks Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-white">Subtasks</h3>
              <span className="text-sm text-slate-400">
                ({subtasks.filter(st => st.completed).length}/{subtasks.length})
              </span>
            </div>
            
            {/* Add new subtask */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addSubtask)}
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-purple-400/50"
              />
              <Button 
                onClick={addSubtask}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Subtasks list */}
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSubtask(subtask.id)}
                    className={cn(
                      "h-5 w-5 p-0 rounded border-2 transition-all duration-200 flex-shrink-0",
                      subtask.completed
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-slate-400 text-transparent hover:border-green-400"
                    )}
                  >
                    {subtask.completed && <Check className="h-3 w-3" />}
                  </Button>
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.completed ? "text-slate-400 line-through" : "text-white"
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtask(subtask.id)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {subtasks.length === 0 && (
              <p className="text-slate-400 text-sm italic text-center py-4">
                No subtasks added yet
              </p>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Links Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">Links</h3>
              <span className="text-sm text-slate-400">({links.length})</span>
            </div>
            
            {/* Add new link */}
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Link title..."
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addLink)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50"
                />
                <Button 
                  onClick={addLink}
                  size="sm"
                  disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Links list */}
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openLink(link.url)}
                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{link.title}</p>
                    <p className="text-xs text-slate-400 truncate">{link.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(link.id)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {links.length === 0 && (
              <p className="text-slate-400 text-sm italic text-center py-4">
                No links added yet
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
