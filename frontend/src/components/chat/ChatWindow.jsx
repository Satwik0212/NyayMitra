import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff } from 'lucide-react'
import MessageBubble from './MessageBubble'
import Loader from '../ui/Loader'
import { useSpeech } from '../../hooks/useSpeech'

const SUGGESTED_QUESTIONS = [
  'What evidence should I collect?',
  'How long does this process take?',
  'What are my legal rights here?',
  'What is the next step I should take?',
]

const ChatWindow = ({ messages, isLoading, isStreaming, onSend }) => {
  const [input, setInput] = React.useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { isListening, isSupported, toggleListening } = useSpeech((transcript) => {
    setInput(prev => prev + ' ' + transcript)
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading || isStreaming) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center text-3xl shadow-lg">
              ⚖️
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">NyayMitra Legal Chat</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                Ask any legal question. I can help with Indian law, rights, procedures, and advice.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="text-xs text-left px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-primary-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && !isStreaming && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-gold-400 text-sm">⚖</div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 bg-slate-900/60 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question... (Press Enter to send)"
              rows={2}
              className={`w-full bg-slate-800 border rounded-xl px-4 py-3 pr-10 text-slate-200
                placeholder-slate-500 resize-none focus:outline-none focus:ring-2 transition-all text-sm
                ${isListening ? 'border-red-500/70' : 'border-slate-700 focus:border-primary-600 focus:ring-primary-500/20'}`}
            />
          </div>
          {isSupported && (
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all flex-shrink-0
                ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isStreaming}
            className="p-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 text-white hover:from-primary-600 hover:to-primary-800 transition-all flex-shrink-0 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          NyayMitra provides general legal information, not professional legal advice.
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
