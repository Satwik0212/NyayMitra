import React from 'react'

const variants = {
  default: 'bg-slate-700 text-slate-300',
  primary: 'bg-primary-900/60 text-primary-300 border border-primary-700/50',
  gold: 'bg-gold-500/10 text-gold-400 border border-gold-500/30',
  success: 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50',
  danger: 'bg-red-900/60 text-red-400 border border-red-700/50',
  warning: 'bg-orange-900/60 text-orange-400 border border-orange-700/50',
  info: 'bg-blue-900/60 text-blue-400 border border-blue-700/50',
}

const Badge = ({ children, variant = 'default', size = 'sm', className = '', dot = false }) => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  )
}

export default Badge
