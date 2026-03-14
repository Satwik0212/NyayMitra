import React from 'react'
import { motion } from 'framer-motion'

const Loader = ({ size = 'md', text = '', fullScreen = false, className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' }

  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-slate-700 border-t-primary-500 rounded-full animate-spin`} />
        <div className={`absolute inset-0 ${sizes[size]} border-4 border-transparent border-r-gold-400 rounded-full animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
    <div className="shimmer h-4 w-24 rounded mb-4" />
    <div className="shimmer h-3 w-full rounded mb-2" />
    <div className="shimmer h-3 w-3/4 rounded mb-2" />
    <div className="shimmer h-3 w-1/2 rounded" />
  </div>
)

export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader size="lg" text={text} />
  </div>
)

export default Loader
