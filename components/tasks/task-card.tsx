"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Calendar, Trash2, Edit, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/types"
import { useTaskStore } from "@/lib/store/task-store"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { TaskDetailView } from "./task-detail-view"
import { FullPageEditor } from "../editor/full-page-editor"

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { deleteTask, addTask, toggleTaskCompletion } = useTaskStore()
  const [showDetails, setShowDetails] = useState(false)
  const [showFullEditor, setShowFullEditor] = useState(false)
  const [editorMode, setEditorMode] = useState<"edit" | "duplicate">("edit")

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task.id)
    }
  }

  const handleDuplicate = async () => {
    setEditorMode("duplicate")
    setShowFullEditor(true)
  }

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleTaskCompletion(task.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isDragging || isSortableDragging) {
    return (
      <Card className="opacity-70 rotate-3 shadow-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-400/30 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white flex-1">{task.title}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-all duration-200 ease-out hover:shadow-lg hover:shadow-purple-500/20 group backdrop-blur-sm border-white/20 hover:border-purple-400/50 transform hover:scale-[1.02] will-change-transform",
          task.status === "past" && "bg-slate-700/40 border-slate-500/30",
          task.status === "present" && "bg-gradient-to-br from-purple-700/40 to-pink-700/40 border-purple-400/30",
          task.status === "future" && "bg-slate-700/40 border-slate-500/30",
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCompletion}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={cn(
                  "h-5 w-5 p-0 rounded border-2 transition-all duration-200 hover:bg-white/10 flex-shrink-0",
                  (task.completed || task.status === "past")
                    ? "bg-green-500 border-green-500 text-white" 
                    : "border-slate-400 text-transparent hover:border-green-400"
                )}
              >
                {(task.completed || task.status === "past") && <Check className="h-3 w-3" />}
              </Button>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium transition-all duration-300 select-none",
                    (task.completed || task.status === "past") ? "text-slate-300 line-through" : "text-white",
                  )}
                >
                  {task.title}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 text-white flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50">
                <DropdownMenuItem onClick={() => {
                  setEditorMode("edit")
                  setShowFullEditor(true)
                }} className="text-white hover:bg-white/10">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} className="text-white hover:bg-white/10">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-600/50" />
                <DropdownMenuItem onClick={handleDelete} className="text-red-400 hover:bg-red-500/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.completed_at && (
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 animate-fade-in">
              <Calendar className="h-3 w-3" />
              {formatDate(task.completed_at)}
            </div>
          )}
        </CardContent>
      </Card>

      {showDetails && <TaskDetailView task={task} open={showDetails} onClose={() => setShowDetails(false)} />}
      {showFullEditor && (
        <FullPageEditor 
          task={task} 
          isOpen={showFullEditor} 
          onClose={() => setShowFullEditor(false)}
          mode={editorMode}
        />
      )}
    </>
  )
}
