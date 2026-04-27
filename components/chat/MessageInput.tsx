"use client"

import { useState, useRef } from "react"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, onTyping, disabled, placeholder = "Message..." }: MessageInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    inputRef.current?.focus()
  }

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-900">
      <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus-within:border-violet-500 transition-colors">
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onTyping?.()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none max-h-32 py-1"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || disabled}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
      <p className="text-xs text-slate-600 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
