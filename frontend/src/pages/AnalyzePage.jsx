import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, Sparkles } from 'lucide-react'
import DisputeForm from '../components/analysis/DisputeForm'
import { analyzeDispute } from '../services/analyzeService'
import { useAnalysis } from '../context/AnalysisContext'
import Card from '../components/ui/Card'

const AnalyzePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { saveAnalysis, setIsAnalyzing } = useAnalysis()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async ({ text, category }) => {
    setLoading(true)
    setIsAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeDispute(text)
      saveAnalysis({ ...result, input_text: text, category })
      navigate(`/results/${result.id || 'latest'}`)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center">
            <Scale className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analyze Your Dispute</h1>
            <p className="text-slate-400 text-sm">AI-powered legal analysis in seconds</p>
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50"
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-1">Analyzing your dispute...</p>
            <p className="text-slate-400 text-sm">AI is reviewing applicable laws and your rights</p>
            <div className="flex justify-center gap-1 mt-4">
              {['Detecting language', 'Finding laws', 'Analyzing rights', 'Building report'].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }}
                  className="px-2 py-1 rounded-full bg-primary-900/60 border border-primary-700/50 text-xs text-primary-300"
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <Card>
        <DisputeForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {/* Tips */}
      <Card className="border-primary-800/30 bg-primary-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-300 mb-2">Tips for Better Analysis</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Include dates, amounts, and specific details about the incident</li>
              <li>• Mention the state/city where the dispute occurred</li>
              <li>• Describe what you have already tried to resolve the issue</li>
              <li>• You can write in your native language — we support Hindi, Tamil, Telugu & more</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AnalyzePage
