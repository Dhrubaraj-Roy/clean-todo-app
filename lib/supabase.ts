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

  // Helper function to get stored users
  const getStoredUsers = () => {
    const usersJson = safeLocalStorage.getItem("celan-users") || "[]"
    const users = JSON.parse(usersJson)
    console.log("Retrieved stored users:", users)
    return users
  }

  // Helper function to save users
  const saveUsers = (users: any[]) => {
    console.log("Saving users:", users)
    safeLocalStorage.setItem("celan-users", JSON.stringify(users))
  }

  // Helper function to find user by email
  const findUserByEmail = (email: string) => {
    const users = getStoredUsers()
    const foundUser = users.find((user: any) => user.email === email)
    console.log("Finding user by email:", email, "Found:", foundUser)
    return foundUser
  }

  return {
    auth: {
      getSession: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        const isDemoMode = safeLocalStorage.getItem("celan-demo-mode") === "true"
        
        console.log("getSession called - mockUser:", mockUser, "isDemoMode:", isDemoMode)
        
        // Return user if exists (either demo or real user)
        return {
          data: {
            session: mockUser ? { user: mockUser } : null,
          },
          error: null,
        }
      },
      getUser: async () => {
        const mockUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
        
        console.log("getUser called - mockUser:", mockUser)
        
        // Return user if exists (either demo or real user)
        return {
          data: { user: mockUser || null },
          error: null,
        }
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        console.log("Mock signUp called with:", { email, password })
        
        // Check if user already exists
        const existingUser = findUserByEmail(email)
        if (existingUser) {
          console.log("User already exists:", existingUser)
          return { 
            data: { user: null }, 
            error: { message: "User already exists with this email" } 
          }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          console.log("Invalid email format")
          return { 
            data: { user: null }, 
            error: { message: "Invalid email format" } 
          }
        }

        // Validate password (minimum 6 characters)
        if (password.length < 6) {
          console.log("Password too short")
          return { 
            data: { user: null }, 
            error: { message: "Password must be at least 6 characters" } 
          }
        }

        // Create new user
        const newUser = { 
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          password, // In real app, this would be hashed
          created_at: new Date().toISOString()
        }

        console.log("Creating new user:", newUser)

        // Save user to storage
        const users = getStoredUsers()
        users.push(newUser)
        saveUsers(users)
        console.log("Saved users:", users)

        // Set as current user
        safeLocalStorage.setItem("celan-user", JSON.stringify(newUser))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out") // Clear sign out flag
        // Clear demo tasks when creating real account
        safeLocalStorage.removeItem("celan-tasks")
        
        console.log("Set current user and cleared demo mode")
        
        // Trigger auth state change
        triggerAuthStateChange("SIGNED_IN", { user: newUser })
        
        return { data: { user: newUser }, error: null }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log("Mock signInWithPassword called with:", { email, password })
        
        // Find user by email
        const user = findUserByEmail(email)
        console.log("Found user:", user)
        
        if (!user) {
          console.log("User not found")
          return { 
            data: { user: null }, 
            error: { message: "Invalid email or password" } 
          }
        }

        // Check password (in real app, this would be hashed comparison)
        if (user.password !== password) {
          console.log("Password mismatch")
          return { 
            data: { user: null }, 
            error: { message: "Invalid email or password" } 
          }
        }

        console.log("Password correct, signing in user:", user)

        // Set as current user
        safeLocalStorage.setItem("celan-user", JSON.stringify(user))
        safeLocalStorage.setItem("celan-demo-mode", "false")
        safeLocalStorage.removeItem("celan-has-signed-out") // Clear sign out flag
        // Clear demo tasks when signing in with real account
        safeLocalStorage.removeItem("celan-tasks")
        
        console.log("Set current user and cleared demo mode")
        
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
            const currentUser = JSON.parse(safeLocalStorage.getItem("celan-user") || "null")
            const userId = currentUser?.id || MOCK_USER.id
            const allTasks = JSON.parse(safeLocalStorage.getItem("celan-tasks") || "[]")
            
            // Filter tasks for current user
            const userTasks = allTasks.filter((task: any) => task.user_id === userId)
            
            const sortedTasks = userTasks.sort((a: any, b: any) => {
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
                
                // Find task by ID and ensure it belongs to current user
                const taskIndex = allTasks.findIndex((t: any) => t[column] === value && t.user_id === userId)
                
                if (taskIndex !== -1) {
                  allTasks[taskIndex] = { 
                    ...allTasks[taskIndex], 
                    ...data, 
                    updated_at: new Date().toISOString() 
                  }
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
            
            // Filter out the task to delete, ensuring it belongs to current user
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
