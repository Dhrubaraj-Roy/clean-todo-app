export interface Task {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  title: string
  status: "past" | "present" | "future"
  position: number
  details?: any // JSONB content from Tiptap
  completed_at?: string
  completed?: boolean
}

// Helper interface for structured task details
export interface TaskDetails {
  content: any // TipTap JSON content
  hasSubtasks?: boolean
  hasLinks?: boolean
  subtasks?: SubTask[]
  links?: TaskLink[]
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export interface TaskLink {
  id: string
  title: string
  url: string
  created_at: string
}

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
}
