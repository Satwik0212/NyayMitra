import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertCircle } from 'lucide-react'

const ConsultationModal = ({ isOpen, onClose, lawyer, onSubmit, loading, initialCaseSummary = '' }) => {
  const [caseSummary, setCaseSummary] = useState(initialCaseSummary)
  const [urgency, setUrgency] = useState('NORMAL')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      lawyer_id: lawyer.id,
      case_summary: caseSummary,
      urgency: urgency
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Request Consultation</h2>
              <p className="text-sm text-slate-400 mt-0.5">with {lawyer.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-primary-950/30 border border-primary-900/50 text-sm text-primary-200">
              <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <p>
                Your request will be sent directly to the lawyer. They usually respond within 24-48 hours. <strong>No payment is required until the lawyer accepts.</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Case Summary
                </label>
                <textarea
                  value={caseSummary}
                  onChange={(e) => setCaseSummary(e.target.value)}
                  placeholder="Briefly describe your legal situation and what kind of help you are looking for..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none"
                >
                  <option value="NORMAL">Normal (Within a week)</option>
                  <option value="URGENT">Urgent (Within 48 hours)</option>
                  <option value="EMERGENCY">Emergency (Immediate)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-900/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConsultationModal
