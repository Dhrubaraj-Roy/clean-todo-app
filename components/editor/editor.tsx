"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback, useEffect } from "react"
import { EditorToolbar } from "./editor-toolbar"

interface EditorProps {
  initialContent?: any
  onUpdate: (content: any) => void
  placeholder?: string
}

export function Editor({ initialContent, onUpdate, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-white",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      debouncedUpdate(json)
    },
  })

  // Debounced save function
  const debouncedUpdate = useCallback(
    debounce((content: any) => {
      onUpdate(content)
    }, 500),
    [onUpdate],
  )

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-slate-600/50 rounded-lg overflow-hidden bg-slate-800/50">
      <EditorToolbar editor={editor} />
      <div className="max-h-[400px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
