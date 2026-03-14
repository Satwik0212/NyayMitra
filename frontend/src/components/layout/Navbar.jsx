import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Globe, ChevronDown, User, LogOut, Scale } from 'lucide-react'

const Navbar = ({ onToggleSidebar }) => {
  const { t } = useTranslation()
  const { user, isGuest, logout } = useAuth()
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-slate-700/50 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold gold-text leading-none">NyayMitra</h1>
              <p className="text-xs text-slate-500 leading-none">AI Legal Assistant</p>
            </div>
          </Link>
        </div>

        {/* Right: Lang + Auth */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowUserMenu(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:block">{supportedLanguages.find(l => l.code === currentLanguage)?.nativeName}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {supportedLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setShowLangMenu(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors
                        ${currentLanguage === lang.code ? 'text-gold-400' : 'text-slate-300'}`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-slate-500 text-xs ml-auto">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {(user || isGuest) ? (
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false) }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-gold-500 flex items-center justify-center text-white text-sm font-semibold">
                  {isGuest ? 'G' : (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U')}
                </div>
                <span className="hidden sm:block text-sm text-slate-300">
                  {isGuest ? 'Guest' : (user?.name || 'User')}
                </span>
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/login"
                className="px-4 py-1.5 text-sm font-medium bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
