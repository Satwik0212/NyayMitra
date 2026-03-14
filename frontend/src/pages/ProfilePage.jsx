import React from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Scale, Clock, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const ProfilePage = () => {
  const { user, isGuest, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user && !isGuest) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Not Logged In</h2>
        <p className="text-slate-400 mb-6">Please login to view your profile.</p>
        <Link to="/login"><Button variant="primary">Login</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm">Manage your account</p>
      </motion.div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-gold-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {isGuest ? '👤' : (user?.name?.charAt(0) || 'U')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">
                {isGuest ? 'Guest User' : (user?.name || 'User')}
              </h2>
              {isGuest && <Badge variant="warning" size="xs">Guest Mode</Badge>}
            </div>
            <p className="text-slate-400 text-sm">{isGuest ? 'Limited access — Login for full features' : user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Analyses', value: '0', icon: Scale, color: 'text-primary-400' },
          { label: 'Documents', value: '0', icon: Shield, color: 'text-emerald-400' },
          { label: 'Days Active', value: '1', icon: Clock, color: 'text-gold-400' },
        ].map(stat => (
          <Card key={stat.label} className="text-center py-4">
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <div className="space-y-3">
          {isGuest ? (
            <div className="p-4 rounded-xl bg-primary-900/30 border border-primary-800/50">
              <p className="text-sm text-slate-300 mb-3">You're in guest mode. Create an account to save your analyses and documents.</p>
              <Link to="/login">
                <Button variant="primary" size="sm">Create Account</Button>
              </Link>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:border-red-800/50 border border-transparent transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </Card>

      {/* Legal Notice */}
      <div className="p-4 rounded-xl border border-amber-800/30 bg-amber-900/10 text-xs text-amber-200/60 leading-relaxed">
        ⚠️ NyayMitra is an AI assistant and does not provide professional legal advice. For serious matters, please consult a qualified advocate. Your data is processed locally for the hackathon demonstration.
      </div>
    </div>
  )
}

export default ProfilePage
