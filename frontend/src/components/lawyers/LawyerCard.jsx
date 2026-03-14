import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, Briefcase, GraduationCap, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const LawyerCard = ({ lawyer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/60 hover:border-primary-500/50 transition-all group"
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Avatar/Initials placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-800 to-slate-800 border border-primary-700/30 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {lawyer.name.replace('Adv. ', '').charAt(0)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors truncate">
              {lawyer.name}
            </h3>
            <div className="flex items-center gap-1 bg-primary-950/80 px-2.5 py-1 rounded-full border border-primary-800/50">
              <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
              <span className="text-sm font-medium text-white">{lawyer.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({lawyer.reviews_count})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{lawyer.location_city}, {lawyer.location_state}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{lawyer.experience_years} Yrs Exp.</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {lawyer.specializations.map(spec => (
              <span key={spec} className="px-2.5 py-1 text-xs rounded-lg bg-primary-900/30 text-primary-300 border border-primary-800/50">
                {spec}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-5">
            {lawyer.about}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-white">
              <span className="text-lg font-bold">₹{lawyer.hourly_rate}</span>
              <span className="text-xs text-slate-400"> / hour</span>
            </div>
            
            <Link 
              to={`/lawyers/${lawyer.id}`}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-lg shadow-primary-900/20"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LawyerCard
