import React from 'react'
import { Link } from 'react-router-dom'
import { Scale, Github, ExternalLink } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
                <Scale className="w-4 h-4 text-gold-400" />
              </div>
              <span className="font-bold gold-text">NyayMitra</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered legal assistance for every Indian citizen. Built with ❤️ for social good.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'Analyze Dispute', to: '/analyze' },
                { label: 'Legal Chat', to: '/chat/new' },
                { label: 'Documents', to: '/documents' },
                { label: 'Verify Transaction', to: '/verify' },
              ].map(({ label, to }) => (
                <Link key={to} to={to}
                  className="block text-xs text-slate-500 hover:text-gold-400 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Legal Disclaimer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              NyayMitra provides general legal information only. It is not a substitute for professional legal advice.
              For serious legal matters, please consult a qualified advocate.
            </p>
            <a
              href="https://lexchain.vercel.app" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-gold-400 hover:text-gold-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> LexChain Contract Analysis
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-6 pt-4 text-center text-xs text-slate-600">
          © 2026 NyayMitra — Hackathon Project. AI responses may not always be accurate.
        </div>
      </div>
    </footer>
  )
}

export default Footer
