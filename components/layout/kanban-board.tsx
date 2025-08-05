"use client"

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { useState } from "react"
import { Column } from "./column"
import { TaskCard } from "../tasks/task-card"
import { ReminderSection } from "../tasks/reminder-section"
import { useTaskStore } from "@/lib/store/task-store"
import type { Task } from "@/lib/types"

export function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Very small distance for immediate drag detection
        tolerance: 2, // Very small tolerance for better precision
        delay: 50, // Minimal delay for faster response
      },
    }),
    useSensor(KeyboardSensor),
  )

  const pastTasks = tasks.filter((task) => task.status === "past").sort((a, b) => b.position - a.position)
  const presentTasks = tasks.filter((task) => task.status === "present").sort((a, b) => a.position - b.position)
  const futureTasks = tasks.filter((task) => task.status === "future").sort((a, b) => a.position - b.position)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Determine the new status based on the drop target
    let newStatus: Task["status"] = activeTask.status
    let targetTasks = tasks.filter((t) => t.status === activeTask.status)

    if (overId === "past" || overId === "present" || overId === "future") {
      newStatus = overId as Task["status"]
      targetTasks = tasks.filter((t) => t.status === newStatus)
    } else {
      // Dropped on another task, determine the column
      const targetTask = tasks.find((t) => t.id === overId)
      if (targetTask) {
        newStatus = targetTask.status
        targetTasks = tasks.filter((t) => t.status === newStatus)
      }
    }

    // Calculate new position
    let newPosition: number

    if (overId === "past" || overId === "present" || overId === "future") {
      // Dropped on empty column or column header
      newPosition = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.position)) + 1 : 1
    } else {
      // Dropped on another task
      const targetTask = tasks.find((t) => t.id === overId)
      if (targetTask) {
        const sortedTasks = targetTasks.sort((a, b) => a.position - b.position)
        const targetIndex = sortedTasks.findIndex((t) => t.id === overId)

        if (targetIndex === 0) {
          newPosition = targetTask.position / 2
        } else if (targetIndex === sortedTasks.length - 1) {
          newPosition = targetTask.position + 1
        } else {
          const prevTask = sortedTasks[targetIndex - 1]
          newPosition = (prevTask.position + targetTask.position) / 2
        }
      } else {
        newPosition = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.position)) + 1 : 1
      }
    }

    // Only update if something changed
    if (activeTask.status !== newStatus || activeTask.position !== newPosition) {
      moveTask(activeId, newStatus, newPosition)
    }
  }

  return (
    <div className="animate-fade-in-up animation-delay-300">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          <Column
            id="past"
            title="Past"
            subtitle="Completed tasks"
            tasks={pastTasks}
            className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/50 transition-all duration-300 lg:col-span-1"
          />

          <Column
            id="present"
            title="Present"
            subtitle="Focus zone"
            tasks={presentTasks}
            className="bg-gradient-to-br from-purple-800/40 to-pink-800/40 border-purple-500/30 lg:scale-105 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 lg:col-span-3"
            showAddForm
          />

          <div className="lg:col-span-1 space-y-4">
            <Column
              id="future"
              title="Future"
              subtitle="Ideas & planning"
              tasks={futureTasks}
              className="bg-slate-800/40 border-slate-600/30 hover:bg-slate-800/50 transition-all duration-300"
              showAddForm
            />
            <ReminderSection />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="transform rotate-2 scale-110 transition-all duration-150 shadow-2xl">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
