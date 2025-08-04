"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import CodeBlock from "@tiptap/extension-code-block"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Code as CodeIcon, 
  Quote,
  Save
} from "lucide-react"
import type { Task } from "@/lib/types"

export default function EditorPage() {
  const params = useParams()
  const taskId = params.taskId as string
  
  const [task, setTask] = useState<Task | null>(null)
  const [title, setTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load task data from localStorage (since we're using mock data)
  useEffect(() => {
    const loadTask = () => {
      const tasks = JSON.parse(localStorage.getItem("celan-tasks") || "[]")
      const foundTask = tasks.find((t: Task) => t.id === taskId)
      
      if (foundTask) {
        setTask(foundTask)
        setTitle(foundTask.title)
      } else {
        // If task not found, show error message instead of closing
        console.error("Task not found:", taskId)
        // Create a placeholder task for editing
        const placeholderTask: Task = {
          id: taskId,
          title: "New Task",
          status: "present",
          position: 1,
          user_id: "demo-user-123",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          details: null,
          completed: false
        }
        setTask(placeholderTask)
        setTitle(placeholderTask.title)
      }
      setIsLoading(false)
    }

    loadTask()
  }, [taskId])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer hover:text-blue-300",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing...",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-slate-800 rounded-lg p-4 font-mono text-sm",
        },
      }),
    ],
    content: task?.details || null,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] p-8 prose-lg",
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && task?.details !== undefined) {
      editor.commands.setContent(task.details)
    }
  }, [editor, task?.details])

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !task) return

    const autoSave = () => {
      const content = editor.getJSON()
      if (content && JSON.stringify(content) !== JSON.stringify(task.details)) {
        const tasks = JSON.parse(localStorage.getItem("celan-tasks") || "[]")
        const updatedTasks = tasks.map((t: Task) => 
          t.id === taskId 
            ? { ...t, details: content, updated_at: new Date().toISOString() }
            : t
        )
        localStorage.setItem("celan-tasks", JSON.stringify(updatedTasks))
        
        // Update task store
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('taskUpdated', {
            detail: { taskId, details: content }
          }))
        }
      }
    }

    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [editor, task, taskId])

  const handleSave = async () => {
    if (!editor || !task) return

    setIsSaving(true)
    try {
      const content = editor.getJSON()
      
      // Update task in localStorage
      const tasks = JSON.parse(localStorage.getItem("celan-tasks") || "[]")
      const updatedTasks = tasks.map((t: Task) => 
        t.id === taskId 
          ? { ...t, title, details: content, updated_at: new Date().toISOString() }
          : t
      )
      localStorage.setItem("celan-tasks", JSON.stringify(updatedTasks))
      
      // Update task store to sync with main app
      if (typeof window !== 'undefined') {
        // Dispatch a custom event to notify the main app
        window.dispatchEvent(new CustomEvent('taskUpdated', {
          detail: { taskId, title, details: content }
        }))
      }
      
      // Show success message
      console.log("Task saved successfully!")
      setIsSaving(false)
    } catch (error) {
      console.error("Error saving task:", error)
      setIsSaving(false)
    }
  }

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 max-w-2xl text-2xl font-bold bg-transparent border-none text-white px-0 h-auto py-2 focus:ring-0"
            placeholder="Task title..."
          />
          <div className="flex items-center gap-2">
            {isSaving && <span className="text-sm text-slate-400">Saving...</span>}
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-slate-700/30 bg-slate-900/50">
        <div className="flex items-center gap-1 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'bg-white/20' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive('italic') ? 'bg-white/20' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={editor?.isActive('strike') ? 'bg-white/20' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={editor?.isActive('code') ? 'bg-white/20' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-600 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor?.isActive('heading', { level: 1 }) ? 'bg-white/20' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor?.isActive('heading', { level: 2 }) ? 'bg-white/20' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor?.isActive('heading', { level: 3 }) ? 'bg-white/20' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-600 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive('bulletList') ? 'bg-white/20' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive('orderedList') ? 'bg-white/20' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            className={editor?.isActive('taskList') ? 'bg-white/20' : ''}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-600 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={editor?.isActive('link') ? 'bg-white/20' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            className={editor?.isActive('codeBlock') ? 'bg-white/20' : ''}
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={editor?.isActive('blockquote') ? 'bg-white/20' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-900 to-slate-900/95">
        <EditorContent 
          editor={editor} 
          className="focus-within:outline-none"
        />
      </div>
    </div>
  )
} 