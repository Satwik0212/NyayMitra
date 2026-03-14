import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'

const LawyerCard = ({ lawyer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/60 transition-all"
    >
      <div className="flex flex-col gap-3">
        {/* Name */}
        <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
          {lawyer.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 text-slate-300">
          <MapPin className="w-5 h-5 mt-0.5 text-primary-400 shrink-0" />
          <p className="text-sm">
            {lawyer.full_address || `${lawyer.location_city}${lawyer.location_state !== 'Unknown' ? `, ${lawyer.location_state}` : ''}`}
            {lawyer.lat && lawyer.lon ? ` (Lat: ${lawyer.lat.toFixed(4)}, Lon: ${lawyer.lon.toFixed(4)})` : ''}
          </p>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col gap-2 mt-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Details</h4>
          
          {lawyer.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{lawyer.contact_phone}</span>
            </div>
          )}
          
          {lawyer.contact_email && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{lawyer.contact_email}</span>
            </div>
          )}
          
          {lawyer.contact_website && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Globe className="w-4 h-4 text-slate-400" />
              <a href={lawyer.contact_website.startsWith('http') ? lawyer.contact_website : `https://${lawyer.contact_website}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors truncate">
                {lawyer.contact_website}
              </a>
            </div>
          )}
          
          {!lawyer.contact_phone && !lawyer.contact_email && !lawyer.contact_website && (
            <span className="text-sm text-slate-500 italic">No contact details provided.</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default LawyerCard
