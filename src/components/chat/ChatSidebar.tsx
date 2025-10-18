'use client'

import { useState, useRef, useEffect } from 'react'
import { LiquidButton } from '@/components/ui/liquid-button'
import { Send, Trash2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatSidebarProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  onClearChat: () => void
  isLoading?: boolean
}

export default function ChatSidebar({ messages, onSendMessage, onClearChat, isLoading = false }: ChatSidebarProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm border-r border-purple-500/20">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🤖 AI Assistant
            </h2>
            <p className="text-xs text-purple-200">Powered by OpenRouter</p>
          </div>
          <LiquidButton
            onClick={onClearChat}
            variant="destructive"
            size="sm"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </LiquidButton>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-purple-300 text-sm mt-8">
            <p>¡Hola! ¿En qué puedo ayudarte hoy?</p>
            <p className="text-xs text-purple-400/60 mt-2">Ask me to generate fashion try-ons!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.role === 'user'
                  ? 'bg-purple-600/30 ml-8 border-l-2 border-purple-400'
                  : 'bg-black/30 mr-8 border-l-2 border-blue-400'
              } rounded-lg p-3 transition-all hover:scale-[1.02]`}
            >
              <div className="text-xs text-purple-200 mb-1 flex items-center gap-2">
                <span>{msg.role === 'user' ? '👤' : '🤖'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="text-sm text-white whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="bg-black/30 mr-8 rounded-lg p-3 border-l-2 border-blue-400">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <div className="animate-pulse">🤖</div>
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to generate images, combine them, or anything else..."
            className="flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <LiquidButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            variant="space"
            size="icon"
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </LiquidButton>
        </div>
        <div className="mt-2 text-xs text-purple-300">
          💡 Press Enter to send
        </div>
      </div>
    </div>
  )
}
