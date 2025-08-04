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
  // Initialize mock user if not exists
  if (!safeLocalStorage.getItem("celan-user")) {
    safeLocalStorage.setItem("celan-user", JSON.stringify(MOCK_USER))
  }

  return {
    auth: {
      getSession: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        return {
          data: {
            session: mockUser ? { user: mockUser } : null,
          },
          error: null,
        }
      },
      getUser: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        return {
          data: { user: mockUser || MOCK_USER },
          error: null,
        }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        const newUser = { ...MOCK_USER, email }
        safeLocalStorage.setItem("celan-user", JSON.stringify(newUser))
        return { data: { user: newUser }, error: null }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = { ...MOCK_USER, email }
        safeLocalStorage.setItem("celan-user", JSON.stringify(user))
        return { data: { user }, error: null }
      },
      signOut: async () => {
        safeLocalStorage.removeItem("celan-user")
        return { error: null }
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
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
              const newTask = {
                ...data,
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: MOCK_USER.id,
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
                const tasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
                const taskIndex = tasks.findIndex((t: any) => t[column] === value)
                if (taskIndex !== -1) {
                  tasks[taskIndex] = { 
                    ...tasks[taskIndex], 
                    ...data, 
                    updated_at: new Date().toISOString() 
                  }
                  safeLocalStorage.setItem("celan-tasks", JSON.stringify(tasks))
                  return { data: tasks[taskIndex], error: null }
                } else {
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
