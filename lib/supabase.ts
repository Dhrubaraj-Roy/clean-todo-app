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
  
  // Initialize demo user/tasks if first-time visit and not explicitly signed out
  if (!safeLocalStorage.getItem("celan-user") && !safeLocalStorage.getItem("celan-demo-mode") && !hasSignedOut) {
    safeLocalStorage.setItem("celan-user", JSON.stringify(MOCK_USER))
    safeLocalStorage.setItem("celan-demo-mode", "true")
    const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
    if (!allTasks.some((t: any) => t.user_id === MOCK_USER.id)) {
      safeLocalStorage.setItem("celan-tasks", JSON.stringify([...allTasks, ...DEMO_TASKS]))
    }
  }

  // Store auth state change callbacks
  let authStateCallbacks: ((event: string, session: any) => void)[] = []

  const triggerAuthStateChange = (event: string, session: any) => {
    authStateCallbacks.forEach(callback => callback(event, session))
  }

  // Helper functions to manage users
  const getStoredUsers = () => JSON.parse(safeLocalStorage.getItem("celan-users") || "[]")
  const saveUsers = (users: any[]) => safeLocalStorage.setItem("celan-users", JSON.stringify(users))
  const findUserByEmail = (email: string) => getStoredUsers().find((u: any) => u.email === email)

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
          data: { user: mockUser || null },
          error: null,
        }
      },
      // Simulated email confirmation flow
      confirmEmail: async (token: string) => {
        const users = getStoredUsers()
        const userIndex = users.findIndex((u: any) => u.confirmation_token === token)
        if (userIndex === -1) {
          return { data: null, error: { message: "Invalid or expired confirmation token" } }
        }
        users[userIndex].confirmed = true
        // Remove token after confirmation
        delete users[userIndex].confirmation_token
        saveUsers(users)

        // Set current session to confirmed user
        safeLocalStorage.setItem("celan-user", JSON.stringify(users[userIndex]))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out")
        
        triggerAuthStateChange("SIGNED_IN", { user: users[userIndex] })
        return { data: { user: users[userIndex] }, error: null }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        // Validate and uniqueness checks
        const existingUser = findUserByEmail(email)
        if (existingUser) {
          return { data: { user: null }, error: { message: "User already exists with this email" } }
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return { data: { user: null }, error: { message: "Invalid email format" } }
        }
        if (password.length < 6) {
          return { data: { user: null }, error: { message: "Password must be at least 6 characters" } }
        }

        const confirmationToken = `tok_${Math.random().toString(36).slice(2)}`
        const newUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          password, // NOTE: only for mock
          created_at: new Date().toISOString(),
          confirmed: false,
          confirmation_token: confirmationToken,
        }

        const users = getStoredUsers()
        users.push(newUser)
        saveUsers(users)

        // Do NOT set session yet; require confirmation first
        // Return a token so UI can simulate clicking email link in demo
        return { data: { user: { id: newUser.id, email: newUser.email }, confirmationToken }, error: null }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = findUserByEmail(email)
        if (!user || user.password !== password) {
          return { data: { user: null }, error: { message: "Invalid email or password" } }
        }
        if (!user.confirmed) {
          return { data: { user: null }, error: { message: "Email not confirmed. Please confirm your email." } }
        }

        // Set as current session
        safeLocalStorage.setItem("celan-user", JSON.stringify(user))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out")

        triggerAuthStateChange("SIGNED_IN", { user })
        return { data: { user }, error: null }
      },
      signOut: async () => {
        // Remember sign out to avoid auto-demo
        safeLocalStorage.setItem("celan-has-signed-out", "true")
        // Do NOT delete tasks globally; they are user-scoped in storage
        safeLocalStorage.removeItem("celan-user")
        safeLocalStorage.removeItem("celan-demo-mode")

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
                if (index > -1) authStateCallbacks.splice(index, 1)
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
            const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
            const userId = currentUser?.id || MOCK_USER.id
            const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
            const userTasks = allTasks.filter((task: any) => task.user_id === userId)
            const sortedTasks = userTasks.sort((a: any, b: any) => {
              if (options?.ascending === false) return b[column] - a[column]
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
              const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
              const userId = currentUser?.id || MOCK_USER.id
              const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
              const newTask = {
                ...data,
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: userId,
                completed: data.completed || false,
              }
              allTasks.push(newTask)
              safeLocalStorage.setItem("celan-tasks", JSON.stringify(allTasks))
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
                const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
                const userId = currentUser?.id || MOCK_USER.id
                const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
                const taskIndex = allTasks.findIndex((t: any) => t[column] === value && t.user_id === userId)
                if (taskIndex !== -1) {
                  allTasks[taskIndex] = { ...allTasks[taskIndex], ...data, updated_at: new Date().toISOString() }
                  safeLocalStorage.setItem("celan-tasks", JSON.stringify(allTasks))
                  return { data: allTasks[taskIndex], error: null }
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
            const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
            const userId = currentUser?.id || MOCK_USER.id
            const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
            const filteredTasks = allTasks.filter((t: any) => !(t[column] === value && t.user_id === userId))
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
