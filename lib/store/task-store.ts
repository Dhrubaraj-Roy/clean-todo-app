import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Task, TaskState } from "@/lib/types"
import { soundManager } from "@/lib/sounds"

interface TaskActions {
  fetchTasks: () => Promise<void>
  addTask: (title: string, status?: Task["status"]) => Promise<string | null>
  moveTask: (taskId: string, newStatus: Task["status"], newPosition: number) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  updateTaskDetails: (taskId: string, details: any) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  toggleTaskCompletion: (taskId: string) => Promise<void>
}

export const useTaskStore = create<TaskState & TaskActions>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.from("tasks").select("*").order("position", { ascending: true })

      if (error) throw error

      set({ tasks: data || [], loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addTask: async (title: string, status: Task["status"] = "present") => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Calculate position for new task
      const tasks = get().tasks.filter((t) => t.status === status)
      const maxPosition = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) : 0
      const newPosition = maxPosition + 1

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          status,
          position: newPosition,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: [...state.tasks, data],
      }))

      // Play sound for task creation
      soundManager.playTaskCreate()

      return data.id
    } catch (error) {
      set({ error: (error as Error).message })
      return null
    }
  },

  moveTask: async (taskId: string, newStatus: Task["status"], newPosition: number) => {
    const currentTasks = get().tasks
    const activeTask = currentTasks.find((t) => t.id === taskId)
    
    if (!activeTask) return

    // Optimistic update - update UI immediately
    const optimisticTask = {
      ...activeTask,
      status: newStatus,
      position: newPosition,
      updated_at: new Date().toISOString(),
    }

    // Set completed_at and completed when moving to 'past'
    if (newStatus === "past") {
      optimisticTask.completed_at = new Date().toISOString()
      optimisticTask.completed = true
    } else {
      optimisticTask.completed_at = undefined
      optimisticTask.completed = false
    }

    // Update UI optimistically
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? optimisticTask : task)),
    }))

    try {
      const updateData: any = {
        status: newStatus,
        position: newPosition,
        updated_at: new Date().toISOString(),
      }

      // Set completed_at and completed when moving to 'past'
      if (newStatus === "past") {
        updateData.completed_at = new Date().toISOString()
        updateData.completed = true
      } else {
        updateData.completed_at = null
        updateData.completed = false
      }

      const { data, error } = await supabase.from("tasks").update(updateData).eq("id", taskId).select().single()

      if (error) throw error

      // Update with server response to ensure consistency
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? data : task)),
      }))

      // Play sound for task movement
      soundManager.playTaskMove()
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? activeTask : task)),
        error: (error as Error).message,
      }))
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const currentTasks = get().tasks
    const activeTask = currentTasks.find((t) => t.id === taskId)
    
    if (!activeTask) return

    // Optimistic update
    const optimisticTask = {
      ...activeTask,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? optimisticTask : task)),
    }))

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? data : task)),
      }))
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? activeTask : task)),
        error: (error as Error).message,
      }))
    }
  },

  updateTaskDetails: async (taskId: string, details: any) => {
    const currentTasks = get().tasks
    const activeTask = currentTasks.find((t) => t.id === taskId)
    
    if (!activeTask) return

    // Optimistic update
    const optimisticTask = {
      ...activeTask,
      details,
      updated_at: new Date().toISOString(),
    }

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? optimisticTask : task)),
    }))

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          details,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? data : task)),
      }))
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? activeTask : task)),
        error: (error as Error).message,
      }))
    }
  },

  deleteTask: async (taskId: string) => {
    const currentTasks = get().tasks
    const taskToDelete = currentTasks.find((t) => t.id === taskId)
    
    if (!taskToDelete) return

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }))

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: [...state.tasks, taskToDelete],
        error: (error as Error).message,
      }))
    }
  },

  toggleTaskCompletion: async (taskId: string) => {
    const currentTasks = get().tasks
    const currentTask = currentTasks.find((t) => t.id === taskId)
    
    if (!currentTask) return

    // Determine new completion state based on current status
    const isCurrentlyCompleted = currentTask.completed || currentTask.status === "past"
    const newCompletedState = !isCurrentlyCompleted

    // Optimistic update
    const optimisticTask = {
      ...currentTask,
      completed: newCompletedState,
      updated_at: new Date().toISOString(),
    }

    if (newCompletedState) {
      optimisticTask.completed_at = new Date().toISOString()
      optimisticTask.status = "past"
      // Calculate position for past section
      const pastTasks = currentTasks.filter((t) => t.status === "past")
      optimisticTask.position = pastTasks.length > 0 ? Math.max(...pastTasks.map((t) => t.position)) + 1 : 1
    } else {
      optimisticTask.completed_at = undefined
      optimisticTask.status = "present"
      // Calculate position for present section
      const presentTasks = currentTasks.filter((t) => t.status === "present")
      optimisticTask.position = presentTasks.length > 0 ? Math.max(...presentTasks.map((t) => t.position)) + 1 : 1
    }

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? optimisticTask : task)),
    }))

    try {
      const updateData: any = {
        completed: newCompletedState,
        updated_at: new Date().toISOString(),
      }

      if (newCompletedState) {
        updateData.completed_at = new Date().toISOString()
        updateData.status = "past"
        // Calculate position for past section
        const pastTasks = currentTasks.filter((t) => t.status === "past")
        updateData.position = pastTasks.length > 0 ? Math.max(...pastTasks.map((t) => t.position)) + 1 : 1
      } else {
        updateData.completed_at = null
        updateData.status = "present"
        // Calculate position for present section
        const presentTasks = currentTasks.filter((t) => t.status === "present")
        updateData.position = presentTasks.length > 0 ? Math.max(...presentTasks.map((t) => t.position)) + 1 : 1
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? data : task)),
      }))

      // Play sound for task completion
      if (newCompletedState) {
        soundManager.playTaskComplete()
      }
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === taskId ? currentTask : task)),
        error: (error as Error).message,
      }))
    }
  },
}))
