import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import Card from '../components/ui/Card'
import DocumentEditor from '../components/documents/DocumentEditor'
import DocumentPreview from '../components/documents/DocumentPreview'

const DocumentsPage = () => {
  const [generated, setGenerated] = useState(null)
  const [view, setView] = useState('editor') // 'editor' | 'preview'

  const handleGenerate = (result) => {
    setGenerated(result)
    setView('preview')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Legal Documents</h1>
            <p className="text-slate-400 text-xs">Generate, edit and download legal documents</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Toggle */}
      {generated && (
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl w-fit border border-slate-700">
          {['editor', 'preview'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${view === tab ? 'bg-primary-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'editor' ? '✏️ Editor' : '👁️ Preview'}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'editor' || !generated ? (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <DocumentEditor onGenerate={handleGenerate} generatedContent={generated?.html_content} />
            </Card>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DocumentPreview htmlContent={generated?.html_content} docType={generated?.template_used} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DocumentsPage
