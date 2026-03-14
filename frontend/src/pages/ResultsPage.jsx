import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Scale, ArrowRight, MessageSquare, FileText, Shield, ExternalLink, ChevronDown, ChevronUp, CheckCircle, Clock, Briefcase } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import StrengthMeter from '../components/analysis/StrengthMeter'
import EvidenceChecklist from '../components/analysis/EvidenceChecklist'
import { PageLoader } from '../components/ui/Loader'
import { capitalizeFirst, getDomainIcon } from '../utils/helpers'

const UrgencyBanner = ({ level }) => {
  const cfg = {
    emergency: { bg: 'bg-red-900/40 border-red-700/60', icon: '🚨', text: 'text-red-300', label: 'Emergency — Seek Immediate Legal Help' },
    urgent: { bg: 'bg-orange-900/40 border-orange-700/60', icon: '⚠️', text: 'text-orange-300', label: 'Urgent — Act Within This Week' },
    normal: { bg: 'bg-emerald-900/30 border-emerald-700/50', icon: '✅', text: 'text-emerald-300', label: 'Standard — You Have Time to Plan' },
  }
  const c = cfg[level] || cfg.normal

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg}`}>
      <span className="text-2xl">{c.icon}</span>
      <div>
        <p className={`font-semibold ${c.text}`}>{c.label}</p>
        <p className="text-slate-400 text-xs mt-0.5">Urgency: {capitalizeFirst(level)}</p>
      </div>
    </div>
  )
}

const ResultsPage = () => {
  const { loadCurrentAnalysis } = useAnalysis()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [expandedSection, setExpandedSection] = useState('laws')

  useEffect(() => {
    const result = loadCurrentAnalysis()
    if (!result) navigate('/analyze')
    else setAnalysis(result)
  }, [])

  if (!analysis) return <PageLoader text="Loading results..." />

  const strengthScore = analysis.applicable_laws?.length > 3 ? 72 :
    analysis.applicable_laws?.length > 1 ? 48 : 28

  const toggleSection = (key) => setExpandedSection(prev => prev === key ? null : key)

  const Section = ({ id, title, icon, children }) => (
    <Card className="overflow-hidden" padding="p-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {expandedSection === id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expandedSection === id && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-slate-700/50 p-5">
          {children}
        </motion.div>
      )}
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analysis Results</h1>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{getDomainIcon(analysis.domain)} {capitalizeFirst(analysis.domain)}</Badge>
              <Badge variant={analysis.urgency_level === 'emergency' ? 'danger' : analysis.urgency_level === 'urgent' ? 'warning' : 'success'} dot>
                {capitalizeFirst(analysis.urgency_level)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/chat/new">
              <Button variant="outline" size="sm" icon={MessageSquare}>Ask AI</Button>
            </Link>
            <Link to="/documents">
              <Button variant="outline" size="sm" icon={FileText}>Get Document</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Urgency Banner */}
      <UrgencyBanner level={analysis.urgency_level} />

      {/* Summary + Strength */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Case Summary</CardTitle></CardHeader>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-4">
          <StrengthMeter score={strengthScore} label="Case Strength" />
        </Card>
      </div>

      {/* Contract Detected */}
      {analysis.is_contract && (
        <div className="flex items-start gap-4 p-5 rounded-2xl border border-gold-500/40 bg-gold-500/10">
          <span className="text-2xl">📄</span>
          <div>
            <h3 className="font-semibold text-gold-300 mb-1">Contract Detected!</h3>
            <p className="text-sm text-slate-300 mb-3">This appears to involve a contract. For deep contract analysis, use LexChain.</p>
            <a
              href={import.meta.env.VITE_LEXCHAIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400 hover:bg-gold-300 text-gray-900 rounded-xl text-sm font-semibold transition-all"
            >
              Analyze Contract on LexChain <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Applicable Laws */}
      <Section id="laws" title="Applicable Laws" icon="📚">
        <div className="space-y-3">
          {analysis.applicable_laws?.map((law, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-start gap-2">
                <Badge variant="primary" size="xs">{law.section || 'General'}</Badge>
                <p className="font-medium text-white text-sm">{law.law_name}</p>
              </div>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{law.description}</p>
            </div>
          ))}
          {(!analysis.applicable_laws || analysis.applicable_laws.length === 0) && (
            <p className="text-slate-400 text-sm">No specific laws identified. Please consult a lawyer.</p>
          )}
        </div>
      </Section>

      {/* Your Rights */}
      <Section id="rights" title="Your Legal Rights" icon="🛡️">
        <div className="space-y-3">
          {analysis.user_rights?.map((right, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-300 text-sm">{right.right}</p>
                <p className="text-slate-400 text-xs mt-1">{right.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Recommended Actions */}
      <Section id="actions" title="Recommended Actions" icon="✅">
        <div className="space-y-3">
          {analysis.recommended_actions?.map((action, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border
              ${action.is_immediate
                ? 'border-orange-700/50 bg-orange-900/20'
                : 'border-slate-700/50 bg-slate-900/40'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                ${action.is_immediate ? 'bg-orange-500 text-white' : 'bg-primary-800 text-primary-300'}`}>
                {i + 1}
              </div>
              <div>
                {action.is_immediate && <Badge variant="warning" size="xs" className="mb-1">Immediate Action</Badge>}
                <p className="font-medium text-white text-sm">{action.action}</p>
                <p className="text-slate-400 text-xs mt-1">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Evidence Checklist */}
      <Card>
        <CardHeader><CardTitle>Evidence Checklist 📋</CardTitle></CardHeader>
        <EvidenceChecklist />
      </Card>

      {/* Actions footer */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/chat/new">
          <Button variant="primary" icon={MessageSquare}>Discuss with AI</Button>
        </Link>
        <Link 
          to="/lawyers" 
          state={{ caseSummary: analysis.summary }}
        >
          <Button variant="primary" className="bg-gold-500 hover:bg-gold-400 text-gray-900 border-none" icon={Briefcase}>
            Connect with a Lawyer
          </Button>
        </Link>
        <Link to={`/process/${analysis.domain || 'consumer-court'}`}>
          <Button variant="outline">View Legal Process</Button>
        </Link>
        <Link to="/documents">
          <Button variant="outline" icon={FileText}>Generate Document</Button>
        </Link>
      </div>
    </div>
  )
}

export default ResultsPage
