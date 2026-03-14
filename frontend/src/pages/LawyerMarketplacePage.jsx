import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Briefcase, MapPin } from 'lucide-react'
import LawyerCard from '../components/lawyers/LawyerCard'
import { getLawyers } from '../services/lawyerService'

const DOMAINS = ['CIVIL', 'CRIMINAL', 'FAMILY', 'PROPERTY', 'CONSUMER', 'CORPORATE', 'TAX']
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune']

const LawyerMarketplacePage = () => {
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', specialization: '' })
  
  useEffect(() => {
    fetchLawyers()
  }, [filters])
  
  const fetchLawyers = async () => {
    setLoading(true)
    try {
      const data = await getLawyers(filters)
      setLawyers(data)
    } catch (err) {
      console.error("Failed to fetch lawyers", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find a Lawyer</h1>
        <p className="text-slate-400">Connect with top-rated legal professionals across India to handle your case.</p>
      </motion.div>

      {/* Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-primary-500 outline-none appearance-none"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          >
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="flex-1 relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-primary-500 outline-none appearance-none"
            value={filters.specialization}
            onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
          >
            <option value="">All Specializations</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <button 
          onClick={() => setFilters({ city: '', specialization: '' })}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors whitespace-nowrap"
        >
          Clear Filters
        </button>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-gold-400 rounded-full animate-spin" />
        </div>
      ) : lawyers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {lawyers.map((lawyer, i) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <LawyerCard lawyer={lawyer} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No Lawyers Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto">Try adjusting your filters to see more available legal professionals.</p>
        </div>
      )}
    </div>
  )
}

export default LawyerMarketplacePage
