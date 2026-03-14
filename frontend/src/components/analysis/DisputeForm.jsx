import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Scale, ChevronDown, Send } from 'lucide-react'
import Button from '../ui/Button'
import { useSpeech } from '../../hooks/useSpeech'
import { DISPUTE_CATEGORIES } from '../../utils/helpers'

const DisputeForm = ({ onSubmit, loading }) => {
  const [text, setText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const textareaRef = useRef(null)

  const { isListening, isSupported, toggleListening } = useSpeech((transcript) => {
    setText(prev => prev + ' ' + transcript)
    textareaRef.current?.focus()
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ text: text.trim(), category: selectedCategory })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-3">
          Select Dispute Category (optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DISPUTE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(prev => prev === cat.id ? '' : cat.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200
                ${selectedCategory === cat.id
                  ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                  : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div className="text-xs font-medium leading-tight">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Describe Your Dispute
        </label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Explain your legal situation in detail. The more context you provide, the better the analysis. You can write in English or any Indian language..."
            rows={7}
            className={`
              w-full bg-slate-800/80 border rounded-2xl px-4 py-4 pr-16 text-slate-200
              placeholder-slate-500 resize-none focus:outline-none focus:ring-2 transition-all
              ${isListening
                ? 'border-red-500/70 focus:ring-red-500/30'
                : 'border-slate-700 focus:border-primary-600 focus:ring-primary-500/20'
              }
            `}
          />
          {/* Voice button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 top-3 p-2 rounded-xl transition-all
                ${isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {/* Character count */}
          <div className="absolute bottom-3 right-3 text-xs text-slate-600">
            {text.length} chars
          </div>
        </div>
        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-400 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening... speak clearly
          </motion.p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          loading={loading}
          disabled={!text.trim() || loading}
          icon={Scale}
          className="flex-1 sm:flex-none"
        >
          {loading ? 'Analyzing...' : 'Analyze My Dispute'}
        </Button>
        {text && (
          <button
            type="button"
            onClick={() => { setText(''); setSelectedCategory('') }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}

export default DisputeForm
