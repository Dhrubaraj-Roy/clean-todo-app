"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "../tasks/task-card"
import { AddTaskForm } from "../tasks/add-task-form"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ColumnProps {
  id: string
  title: string
  subtitle: string
  tasks: Task[]
  className?: string
  showAddForm?: boolean
  isOver?: boolean
}

export function Column({ id, title, subtitle, tasks, className, showAddForm, isOver }: ColumnProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id,
  })

  // Use the passed isOver prop or the droppable state
  const isCurrentlyOver = isOver || isDroppableOver

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border backdrop-blur-xl transition-all duration-200 ease-out transform",
        "hover:scale-[1.02] will-change-transform",
        isCurrentlyOver && [
          "ring-2 ring-purple-400/70 ring-opacity-80 scale-[1.02]",
          "shadow-2xl shadow-purple-500/30",
          "bg-gradient-to-br from-purple-900/20 to-pink-900/20",
        ],
        className,
      )}
    >
      <div className={cn(
        "p-4 border-b border-white/10 transition-all duration-200",
        isCurrentlyOver && "bg-purple-500/10 border-purple-400/30"
      )}>
        <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
        <div className="mt-2 text-xs text-slate-400">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      <div className={cn(
        "flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[400px] transition-all duration-200",
        isCurrentlyOver && "bg-purple-500/5"
      )}>
        {showAddForm && <AddTaskForm status={id as Task["status"]} />}

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <div 
              key={task.id} 
              className="animate-fade-in-up" 
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationDuration: '300ms'
              }}
            >
              <TaskCard task={task} />
            </div>
          ))}
        </SortableContext>

        {tasks.length === 0 && !showAddForm && (
          <div className={cn(
            "text-center py-8 text-slate-400 transition-all duration-200",
            isCurrentlyOver && "text-purple-300 scale-105"
          )}>
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Drag tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
