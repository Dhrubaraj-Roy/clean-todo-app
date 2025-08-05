"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import CodeBlock from "@tiptap/extension-code-block"

import { 
  Bold, 
  Italic, 
  Underline, 
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
  Code2,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  X,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { useTaskStore } from "@/lib/store/task-store"

interface FullPageEditorProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  mode?: "edit" | "duplicate"
}

export function FullPageEditor({ task, isOpen, onClose, mode = "edit" }: FullPageEditorProps) {
  const [title, setTitle] = useState(task.title)
  const [isSaving, setIsSaving] = useState(false)
  const { updateTaskDetails, addTask } = useTaskStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer hover:text-blue-300",
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
    content: task.details || null,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] p-8 prose-lg",
      },
    },
  })

  useEffect(() => {
    if (editor && task.details !== undefined) {
      editor.commands.setContent(task.details)
    }
  }, [editor, task.details])

  const handleSave = async () => {
    if (!editor) return

    setIsSaving(true)
    try {
      const content = editor.getJSON()
      
      if (mode === "duplicate") {
        // Create a new task with the duplicated content
        const newTaskId = await addTask(title, task.status)
        if (newTaskId) {
          // Update the new task with the details
          await updateTaskDetails(newTaskId, content)
        }
      } else {
        // Update existing task
        await updateTaskDetails(task.id, content)
      }
      
      onClose()
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:")
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="h-full flex flex-col bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 max-w-2xl">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none text-2xl font-bold text-white placeholder:text-slate-400 focus:ring-0 px-0 h-auto py-2"
                placeholder="Untitled"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-sm text-slate-400 animate-pulse">Saving...</span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {mode === "duplicate" ? "Create Copy" : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-700/30 bg-slate-900/50 overflow-x-auto">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("bold") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("italic") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("strike") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("code") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                "h-8 px-2 text-slate-400 hover:text-white text-xs",
                editor?.isActive("heading", { level: 1 }) && "bg-purple-600/20 text-purple-400"
              )}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                "h-8 px-2 text-slate-400 hover:text-white text-xs",
                editor?.isActive("heading", { level: 2 }) && "bg-purple-600/20 text-purple-400"
              )}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                "h-8 px-2 text-slate-400 hover:text-white text-xs",
                editor?.isActive("heading", { level: 3 }) && "bg-purple-600/20 text-purple-400"
              )}
            >
              H3
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("bulletList") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("orderedList") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("taskList") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={addLink}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addImage}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("codeBlock") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={cn(
                "h-8 w-8 p-0 text-slate-400 hover:text-white",
                editor?.isActive("blockquote") && "bg-purple-600/20 text-purple-400"
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-900 to-slate-900/95">
          <div className="max-w-4xl mx-auto">
            <EditorContent 
              editor={editor} 
              className="focus-within:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 