"use client"

import { Extension } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare,
  Quote,
  Code2,
  Image as ImageIcon,
  Table as TableIcon,
  Minus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  title: string
  description: string
  icon: any
  command: (props: any) => void
}

const getSuggestionItems = ({ query }: { query: string }) => {
  const items: CommandItem[] = [
    {
      title: "Heading 1",
      description: "Big section heading",
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      },
    },
    {
      title: "Heading 2", 
      description: "Medium section heading",
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading", 
      icon: Heading3,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering",
      icon: ListOrdered,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: "Task List",
      description: "Track tasks with a to-do list",
      icon: CheckSquare,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: Quote,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: "Code Block",
      description: "Capture a code snippet",
      icon: Code2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: "Table",
      description: "Add a table",
      icon: TableIcon,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: "Divider",
      description: "Visually divide blocks",
      icon: Minus,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
  ]

  return items.filter((item) =>
    item.title.toLowerCase().startsWith(query.toLowerCase())
  )
}

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler()
          return true
        }

        if (event.key === "ArrowDown") {
          downHandler()
          return true
        }

        if (event.key === "Enter") {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-slate-600 bg-slate-800/95 backdrop-blur-xl p-1 shadow-xl">
        {items.length ? (
          items.map((item, index) => (
            <button
              className={cn(
                "flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-700/50",
                index === selectedIndex ? "bg-slate-700/50 text-white" : "text-slate-300"
              )}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-600 bg-slate-700/50">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="px-2 py-1 text-slate-400">No results</div>
        )}
      </div>
    )
  }
)

CommandList.displayName = "CommandList"

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: getSuggestionItems,
        render: () => {
          let component: ReactRenderer
          let popup: HTMLDivElement

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = document.createElement('div')
              popup.style.position = 'absolute'
              popup.style.zIndex = '1000'
              popup.appendChild(component.element)
              document.body.appendChild(popup)

              const rect = props.clientRect()
              popup.style.top = `${rect.bottom + window.scrollY}px`
              popup.style.left = `${rect.left + window.scrollX}px`
            },

            onUpdate(props: any) {
              component.updateProps(props)

              if (!props.clientRect || !popup) {
                return
              }

              const rect = props.clientRect()
              popup.style.top = `${rect.bottom + window.scrollY}px`
              popup.style.left = `${rect.left + window.scrollX}px`
            },

            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                return true
              }

              return (component?.ref as any)?.onKeyDown?.(props) || false
            },

            onExit() {
              if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup)
              }
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})