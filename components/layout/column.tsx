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
}

export function Column({ id, title, subtitle, tasks, className, showAddForm }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border backdrop-blur-xl transition-all duration-300 transform hover:scale-[1.02]",
        isOver && "ring-2 ring-purple-400/50 ring-opacity-50 scale-[1.02]",
        className,
      )}
    >
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
        <div className="mt-2 text-xs text-slate-400">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[400px]">
        {showAddForm && <AddTaskForm status={id as Task["status"]} />}

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <div key={task.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <TaskCard task={task} />
            </div>
          ))}
        </SortableContext>

        {tasks.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-slate-400 animate-pulse">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Drag tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
