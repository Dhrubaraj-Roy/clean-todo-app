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

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
}
