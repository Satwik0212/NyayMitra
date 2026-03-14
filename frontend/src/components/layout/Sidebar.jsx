import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Scale, MessageSquare, FileText, GitBranch,
  History, Bell, User, X, Home, Shield, Briefcase
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home, exact: true },
  { path: '/analyze', label: 'Analyze', icon: Scale },
  { path: '/chat/new', label: 'Legal Chat', icon: MessageSquare },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/lawyers', label: 'Find a Lawyer', icon: Briefcase },
  { path: '/process/consumer-court', label: 'Process Nav', icon: GitBranch },
  { path: '/verify', label: 'Verify', icon: Shield },
  { path: '/profile', label: 'Profile', icon: User },
]

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 bottom-0 w-64 z-30 glass-dark border-r border-slate-700/50
          flex flex-col lg:translate-x-0 lg:static lg:top-auto lg:h-[calc(100vh-4rem)]"
      >
        {/* Close button - mobile */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-sm font-medium text-slate-400">Navigation</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-900/60 text-primary-300 border border-primary-700/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gold-400' : ''}`} />
                  {label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Branding */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Scale className="w-3 h-3 text-gold-500" />
            <span>NyayMitra v1.0 — Hackathon</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">AI Legal Assistant for India</p>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
