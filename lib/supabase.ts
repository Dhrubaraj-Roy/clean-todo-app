import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock user for demo purposes
const MOCK_USER = {
  id: "demo-user-123",
  email: "demo@example.com",
  created_at: new Date().toISOString(),
}

// Demo tasks for better user experience
const DEMO_TASKS = [
  {
    id: "demo-task-1",
    title: "Welcome to Clean TODO! 🎉",
    status: "present",
    position: 1,
    user_id: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed: false,
    details: "This is a demo task to show you how the app works. Try dragging it to different columns!"
  },
  {
    id: "demo-task-2", 
    title: "Create your first task",
    status: "present",
    position: 2,
    user_id: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed: false,
    details: "Click the + button to add your own tasks"
  },
  {
    id: "demo-task-3",
    title: "Plan your day",
    status: "future",
    position: 1,
    user_id: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed: false,
    details: "Tasks in the Future column are for upcoming plans"
  },
  {
    id: "demo-task-4",
    title: "Completed demo task",
    status: "past",
    position: 1,
    user_id: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed: true,
    completed_at: new Date().toISOString(),
    details: "This task shows how completed tasks appear"
  }
]

// Safe localStorage wrapper that works in both browser and SSR
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
}

// Mock Supabase client for development/preview
const createMockSupabaseClient = () => {
  // Check if user has explicitly signed out (to prevent demo re-initialization)
  const hasSignedOut = safeLocalStorage.getItem("celan-has-signed-out") === "true"
  
  // Initialize demo user if not exists, no real user is logged in, and user hasn't explicitly signed out
  if (!safeLocalStorage.getItem("celan-user") && !safeLocalStorage.getItem("celan-demo-mode") && !hasSignedOut) {
    safeLocalStorage.setItem("celan-user", JSON.stringify(MOCK_USER))
    safeLocalStorage.setItem("celan-demo-mode", "true")
    // Initialize demo tasks
    safeLocalStorage.setItem("celan-tasks", JSON.stringify(DEMO_TASKS))
  }

  // Store auth state change callbacks
  let authStateCallbacks: ((event: string, session: any) => void)[] = []

  const triggerAuthStateChange = (event: string, session: any) => {
    authStateCallbacks.forEach(callback => callback(event, session))
  }

  return {
    auth: {
      getSession: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        const isDemoMode = safeLocalStorage.getItem("celan-demo-mode") === "true"
        
        return {
          data: {
            session: mockUser && isDemoMode ? { user: mockUser } : null,
          },
          error: null,
        }
      },
      getUser: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        const isDemoMode = safeLocalStorage.getItem("celan-demo-mode") === "true"
        
        return {
          data: { user: mockUser && isDemoMode ? mockUser : null },
          error: null,
        }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        const newUser = { ...MOCK_USER, email, id: `user-${Date.now()}` }
        safeLocalStorage.setItem("celan-user", JSON.stringify(newUser))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out") // Clear sign out flag
        // Clear demo tasks when creating real account
        safeLocalStorage.removeItem("celan-tasks")
        
        // Trigger auth state change
        triggerAuthStateChange("SIGNED_IN", { user: newUser })
        
        return { data: { user: newUser }, error: null }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = { ...MOCK_USER, email, id: `user-${Date.now()}` }
        safeLocalStorage.setItem("celan-user", JSON.stringify(user))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out") // Clear sign out flag
        // Clear demo tasks when signing in with real account
        safeLocalStorage.removeItem("celan-tasks")
        
        // Trigger auth state change
        triggerAuthStateChange("SIGNED_IN", { user })
        
        return { data: { user }, error: null }
      },
      signOut: async () => {
        // Set flag to prevent demo re-initialization
        safeLocalStorage.setItem("celan-has-signed-out", "true")
        
        // Clear all data
        safeLocalStorage.removeItem("celan-user")
        safeLocalStorage.removeItem("celan-demo-mode")
        safeLocalStorage.removeItem("celan-tasks")
        
        // Trigger auth state change
        triggerAuthStateChange("SIGNED_OUT", null)
        
        return { error: null }
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        authStateCallbacks.push(callback)
        
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const index = authStateCallbacks.indexOf(callback)
                if (index > -1) {
                  authStateCallbacks.splice(index, 1)
                }
              },
            },
          },
        }
      },
    },
    from: (table: string) => ({
      select: (columns = "*") => ({
        order: (column: string, options?: any) => {
          return Promise.resolve().then(() => {
            const tasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
            const sortedTasks = tasks.sort((a: any, b: any) => {
              if (options?.ascending === false) {
                return b[column] - a[column]
              }
              return a[column] - b[column]
            })
            return { data: sortedTasks, error: null }
          })
        },
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => {
            return Promise.resolve().then(() => {
              const tasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
              const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
              const newTask = {
                ...data,
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: currentUser?.id || MOCK_USER.id,
                completed: data.completed || false,
              }
              tasks.push(newTask)
              safeLocalStorage.setItem("celan-tasks", JSON.stringify(tasks))
              return { data: newTask, error: null }
            })
          },
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => {
              return Promise.resolve().then(() => {
                console.log("Mock update called with:", { column, value, data })
                const tasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
                console.log("Current tasks in storage:", tasks)
                const taskIndex = tasks.findIndex((t: any) => t[column] === value)
                console.log("Task index found:", taskIndex)
                if (taskIndex !== -1) {
                  tasks[taskIndex] = { 
                    ...tasks[taskIndex], 
                    ...data, 
                    updated_at: new Date().toISOString() 
                  }
                  console.log("Updated task:", tasks[taskIndex])
                  safeLocalStorage.setItem("celan-tasks", JSON.stringify(tasks))
                  return { data: tasks[taskIndex], error: null }
                } else {
                  console.error("Task not found for update")
                  return { data: null, error: { message: "Task not found" } }
                }
              })
            },
          }),
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => {
          return Promise.resolve().then(() => {
            const tasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
            const filteredTasks = tasks.filter((t: any) => t[column] !== value)
            safeLocalStorage.setItem("celan-tasks", JSON.stringify(filteredTasks))
            return { error: null }
          })
        },
      }),
    }),
  }
}

// Export either real Supabase client or mock client
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMockSupabaseClient()

// Export a flag to know if we're using mock data
export const isUsingMockData = !supabaseUrl || !supabaseAnonKey

// Helper function to check if user is in demo mode
export const isDemoMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("celan-demo-mode") === "true"
  }
  return false
}
