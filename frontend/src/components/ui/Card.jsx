import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  gold = false,
  onClick,
  padding = 'p-6',
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        rounded-2xl border
        ${gold
          ? 'border-gold-500/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80'
          : 'border-slate-700/50 bg-slate-800/60'
        }
        ${glow ? 'shadow-lg shadow-primary-900/30' : ''}
        ${hover ? 'cursor-pointer' : ''}
        ${padding} ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

export default Card
