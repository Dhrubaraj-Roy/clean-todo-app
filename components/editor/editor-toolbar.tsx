"use client"

import type { Editor } from "@tiptap/react"
import { Bold, Italic, Link, List, ListChecks, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addLink = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border-b border-slate-600/50 p-2 flex items-center gap-1 bg-slate-700/50">
      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBold().run()
        }}
        className={editor.isActive("bold") ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleItalic().run()
        }}
        className={editor.isActive("italic") ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onMouseDown={addLink} 
        className={editor.isActive("link") ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}
      >
        <Link className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 bg-slate-600" />

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBulletList().run()
        }}
        className={editor.isActive("bulletList") ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleTaskList().run()
        }}
        className={editor.isActive("taskList") ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}
      >
        <ListChecks className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 bg-slate-600" />

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().undo().run()
        }}
        disabled={!editor.can().undo()}
        className={"text-slate-300 hover:text-white hover:bg-slate-600 disabled:text-slate-500"}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().redo().run()
        }}
        disabled={!editor.can().redo()}
        className={"text-slate-300 hover:text-white hover:bg-slate-600 disabled:text-slate-500"}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
