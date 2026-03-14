import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { formatDate } from '../../utils/helpers'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const isStreaming = message.streaming

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
        ${isUser
          ? 'bg-gradient-to-br from-primary-600 to-gold-500 text-white'
          : 'bg-gradient-to-br from-slate-700 to-slate-800 text-gold-400 border border-slate-600'
        }
      `}>
        {isUser ? 'U' : '⚖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm
          ${isUser
            ? 'bg-primary-800/60 border border-primary-700/50 text-white rounded-tr-sm'
            : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
          }
        `}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose-dark">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-gold-400 ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-600 px-1">
          {formatDate(message.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

export default MessageBubble
