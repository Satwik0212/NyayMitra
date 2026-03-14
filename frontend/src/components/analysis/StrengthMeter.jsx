import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { motion } from 'framer-motion'

const StrengthMeter = ({ score = 0, label = 'Case Strength' }) => {
  // score: 0-100
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#fbbf24' : '#ef4444'
  const data = [{ value: pct, fill: color }]
  const strengthLabel =
    pct >= 70 ? 'Strong' :
    pct >= 40 ? 'Moderate' :
    'Weak'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={90 - (360 * pct / 100)}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-white"
            style={{ color }}
          >
            {pct}%
          </motion.span>
          <span className="text-xs text-slate-400 mt-0.5">{strengthLabel}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-300">{label}</p>
    </div>
  )
}

export default StrengthMeter
