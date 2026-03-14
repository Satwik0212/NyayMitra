import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, ExternalLink, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import { DISPUTE_CATEGORIES } from '../utils/helpers'

const FEATURES = [
  { icon: Zap, title: 'Instant Analysis', desc: 'Get AI-powered legal analysis in seconds' },
  { icon: Shield, title: 'Know Your Rights', desc: 'Understand applicable laws and your legal rights' },
  { icon: Globe, title: 'Multi-Language', desc: 'Works in English, Hindi, Tamil, Telugu, Bengali & more' },
]

const LandingPage = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient border border-slate-700/50 p-8 sm:p-12 md:p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-950 flex items-center justify-center shadow-2xl border border-primary-600/30">
              <Scale className="w-8 h-8 text-gold-400" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold gold-text leading-none">NyayMitra</h1>
              <p className="text-sm text-slate-400">AI Legal Assistant</p>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Legal Help for{' '}
            <span className="gold-text">Every Citizen</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 mb-8"
          >
            AI-powered legal guidance. Understand your rights, analyze disputes, generate legal documents, and navigate the Indian legal system with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/analyze"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-gray-900 font-bold rounded-2xl text-lg transition-all shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 hover:scale-105"
            >
              <Scale className="w-5 h-5" /> Analyze My Dispute <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={import.meta.env.VITE_LEXCHAIN_URL || 'https://lexchain.vercel.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 border border-slate-600 hover:border-primary-500 text-slate-300 hover:text-white rounded-2xl text-lg transition-all hover:bg-primary-900/20"
            >
              <ExternalLink className="w-5 h-5" /> Contract Analysis (LexChain)
            </a>
          </motion.div>
        </div>
      </section>

      {/* Two Main Cards */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dispute Advisor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-primary-700/40 bg-gradient-to-br from-primary-900/40 to-slate-900 p-8 hover:border-primary-500/60 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-white mb-2">Dispute Advisor</h3>
            <p className="text-slate-400 mb-6 text-sm">
              AI-powered analysis of your legal dispute. Get applicable laws, rights, recommended actions, and evidence checklist instantly.
            </p>
            <ul className="space-y-2 mb-6">
              {['Applicable Indian Laws', 'Your Legal Rights', 'Recommended Actions', 'Evidence Checklist', 'Procedural Flow'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl font-medium transition-all group-hover:translate-x-1"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Contract Intelligence */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-slate-900 to-slate-800/50 p-8 hover:border-gold-400/50 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-white mb-2">Contract Intelligence</h3>
            <p className="text-slate-400 mb-6 text-sm">
              Powered by LexChain — Upload contracts for AI-powered clause analysis, risk detection, and compliance checking.
            </p>
            <ul className="space-y-2 mb-6">
              {['Contract Risk Analysis', 'Clause-by-clause Review', 'Party Obligations', 'Red Flag Detection', 'Compliance Check'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={import.meta.env.VITE_LEXCHAIN_URL || 'https://lexchain.vercel.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-gray-900 rounded-xl font-medium transition-all group-hover:translate-x-1"
            >
              Open LexChain <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Dispute Categories */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Common Legal Issues</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">Click any category to start an analysis</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DISPUTE_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/analyze?category=${cat.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 hover:border-primary-600/50 hover:bg-primary-900/20 transition-all text-center group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white">{cat.label}</p>
                <p className="text-xs text-slate-500 leading-tight">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="text-center p-6 rounded-2xl border border-slate-700/50 bg-slate-800/40"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-900/60 border border-primary-800/50 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="rounded-2xl border border-amber-800/30 bg-amber-900/10 p-6">
        <div className="flex items-start gap-3">
          <span className="text-amber-400 text-xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-300 mb-1">Legal Disclaimer</h3>
            <p className="text-sm text-amber-200/70 leading-relaxed">
              NyayMitra provides general legal information and guidance only. It is not a substitute for professional legal advice from a qualified advocate or legal professional. For serious legal matters, please consult a licensed lawyer. AI-generated information may not always be accurate or up-to-date with the latest legal developments.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
