import React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import ChatWindow from '../components/chat/ChatWindow'
import { useChat } from '../hooks/useChat'

const ChatPage = () => {
  const { conversationId } = useParams()
  const { messages, isLoading, isStreaming, sendStreamChat } = useChat()

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-9 h-9 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-gold-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Legal Chat</h1>
          <p className="text-slate-400 text-xs">AI-powered legal assistant — ask anything about Indian law</p>
        </div>
      </motion.div>

      {/* Chat Frame */}
      <div className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onSend={sendStreamChat}
        />
      </div>
    </div>
  )
}

export default ChatPage
