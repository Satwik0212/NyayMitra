import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Scale, Mail, Lock, Eye, EyeOff, User, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, signup, loginWithGoogle, enterGuestMode } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim()) throw new Error('Please enter your name')
        await signup(form.email, form.password, form.name)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGuest = () => {
    enterGuestMode()
    navigate('/')
  }

  const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, extra }) => (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
      />
      {extra}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-hero-gradient">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-dark rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-950 flex items-center justify-center shadow-xl mx-auto mb-3 border border-primary-600/30">
              <Scale className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-2xl font-bold gold-text">NyayMitra</h1>
            <p className="text-slate-400 text-sm">AI Legal Assistant</p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-800 rounded-xl mb-6 border border-slate-700">
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${mode === tab ? 'bg-primary-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {tab === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <InputField icon={User} placeholder="Your full name" value={form.name} onChange={update('name')} />
            )}
            <InputField icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={update('email')} />
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={update('password')}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-11 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center text-xs text-slate-500 bg-slate-800 px-3 w-fit mx-auto rounded">or</div>
          </div>

          {/* Google */}
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm font-medium"
            >
              <Chrome className="w-4 h-4 text-blue-400" /> Continue with Google
            </button>
            <button
              onClick={handleGuest}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl text-slate-500 hover:text-slate-300 transition-all text-sm"
            >
              Continue as Guest (limited access)
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 text-center">
            Demo: <span className="text-gold-400">demo@nyaymitra.in</span> / <span className="text-gold-400">demo123</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
