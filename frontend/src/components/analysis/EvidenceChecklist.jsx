import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'

const EvidenceChecklist = ({ items = [] }) => {
  const [checked, setChecked] = useState({})

  const toggle = (idx) => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }))
  const checkedCount = Object.values(checked).filter(Boolean).length

  // Default items if none provided
  const evidenceItems = items.length > 0 ? items : [
    'Written complaint / dispute description',
    'Photographic evidence of the issue',
    'Receipts, invoices, or contracts',
    'Email or WhatsApp conversation history',
    'Witness contact information',
    'Previous correspondence with the other party',
  ]

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">
          {checkedCount} of {evidenceItems.length} collected
        </span>
        <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-gold-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(checkedCount / evidenceItems.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {evidenceItems.map((item, idx) => (
          <motion.button
            key={idx}
            onClick={() => toggle(idx)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
              ${checked[idx]
                ? 'bg-emerald-900/30 border border-emerald-700/40'
                : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
              }`}
          >
            {checked[idx]
              ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              : <Circle className="w-5 h-5 flex-shrink-0 text-slate-500" />
            }
            <span className={`text-sm ${checked[idx] ? 'text-emerald-300 line-through' : 'text-slate-300'}`}>
              {item}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default EvidenceChecklist
