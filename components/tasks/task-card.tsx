"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Calendar, Trash2, Edit, Copy, Check, CheckSquare, Link as LinkIcon } from "lucide-react"
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
import { useState, useEffect } from "react"
import { TaskDetailView } from "./task-detail-view"
import { FullPageEditor } from "../editor/full-page-editor"
import { SubtaskManager } from "./subtask-manager"
import { analyzeTaskContent, getTaskContentSummary } from "@/lib/task-content-utils"

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { deleteTask, addTask, toggleTaskCompletion } = useTaskStore()
  const [showDetails, setShowDetails] = useState(false)
  const [showFullEditor, setShowFullEditor] = useState(false)
  const [showSubtaskManager, setShowSubtaskManager] = useState(false)
  const [editorMode, setEditorMode] = useState<"edit" | "duplicate">("edit")
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null)
  const [isTripleClick, setIsTripleClick] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: isTripleClick, // Disable sortable during triple-click
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
    }
  }, [clickTimer])

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
    e.preventDefault()
    await toggleTaskCompletion(task.id)
  }

  const handleClick = (e: React.MouseEvent) => {
    // Don't handle clicks on the checkbox or dropdown
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    // Single click opens subtask manager immediately
    setIsTripleClick(true)
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    
    // Open subtask manager
    setTimeout(() => {
      setShowSubtaskManager(true)
    }, 10)
    
    // Reset click flag after dialog operations are complete
    setTimeout(() => setIsTripleClick(false), 500)
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
      <Card className="opacity-90 rotate-1 shadow-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/60 backdrop-blur-sm scale-105 transition-all duration-150 ease-out">
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
          "cursor-grab active:cursor-grabbing transition-all duration-150 ease-out hover:shadow-lg hover:shadow-purple-500/20 group backdrop-blur-sm border-white/20 hover:border-purple-400/50 transform hover:scale-[1.02] will-change-transform relative",
          "focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900",
          task.status === "past" && "bg-slate-700/40 border-slate-500/30",
          task.status === "present" && "bg-gradient-to-br from-purple-700/40 to-pink-700/40 border-purple-400/30",
          task.status === "future" && "bg-slate-700/40 border-slate-500/30",
        )}
        onClick={handleClick}
        onMouseDown={(e) => {
          // Prevent drag if it's a triple-click
          if (e.detail === 3 || isTripleClick) {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        }}
        onPointerDown={(e) => {
          // Also prevent pointer events for triple-clicks
          if (e.detail === 3 || isTripleClick) {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        }}
        {...(isTripleClick ? {} : attributes)}
        {...(isTripleClick ? {} : listeners)}
      >
        {/* Enhanced drag handle indicator */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-60 transition-all duration-200 pointer-events-none z-20">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full shadow-sm"></div>
        </div>
        
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCompletion}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 p-0 rounded border-2 transition-all duration-200 hover:bg-white/10 flex-shrink-0 z-10 touch-manipulation",
                  "focus:outline-none focus:ring-2 focus:ring-green-400/50",
                  (task.completed || task.status === "past")
                    ? "bg-green-500 border-green-500 text-white" 
                    : "border-slate-400 text-transparent hover:border-green-400"
                )}
              >
                {(task.completed || task.status === "past") && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
              </Button>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-all duration-200 select-none break-words leading-relaxed",
                    (task.completed || task.status === "past") ? "text-slate-300 line-through" : "text-white",
                  )}
                >
                  {task.title}
                </p>
                {/* Task content indicators */}
                {task.details && (() => {
                  const analysis = analyzeTaskContent(task.details)
                  return (analysis.hasSubtasks || analysis.hasLinks) && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {analysis.hasSubtasks && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 rounded-full px-1.5 sm:px-2 py-0.5">
                          <CheckSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="text-xs">{analysis.subtaskCount}</span>
                        </div>
                      )}
                      {analysis.hasLinks && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 rounded-full px-1.5 sm:px-2 py-0.5">
                          <LinkIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="text-xs">{analysis.linkCount}</span>
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {/* Single-click hint - Hidden on small screens to save space */}
                <div className="hidden sm:block opacity-0 group-hover:opacity-60 transition-opacity duration-300 mt-1">
                  <p className="text-xs text-slate-500 italic">Click to add subtasks & links</p>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-6 sm:w-6 p-0 opacity-50 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/20 text-white flex-shrink-0 z-10 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 min-w-[120px]">
                <DropdownMenuItem onClick={handleDuplicate} className="text-white hover:bg-white/10 text-sm">
                  <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-600/50" />
                <DropdownMenuItem onClick={handleDelete} className="text-red-400 hover:bg-red-500/20 text-sm">
                  <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.completed_at && (
            <div className="flex items-center gap-1 mt-1 sm:mt-2 text-xs text-slate-400 animate-fade-in">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="text-xs">{formatDate(task.completed_at)}</span>
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
      {showSubtaskManager && (
        <SubtaskManager 
          task={task}
          open={showSubtaskManager}
          onClose={() => {
            setShowSubtaskManager(false)
            // Reset triple-click flag when dialog closes
            setIsTripleClick(false)
          }}
        />
      )}
    </>
  )
}
