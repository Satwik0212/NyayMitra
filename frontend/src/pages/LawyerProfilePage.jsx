import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Briefcase, Mail, ArrowLeft, Shield, Clock, Award } from 'lucide-react'
import { getLawyerDetails, requestConsultation } from '../services/lawyerService'
import ConsultationModal from '../components/lawyers/ConsultationModal'
import { useAuth } from '../context/AuthContext'

const LawyerProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [lawyer, setLawyer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // In a real app, this would be passed from the AI Results page via location state
  const initialCaseSummary = window.history.state?.usr?.caseSummary || ''

  useEffect(() => {
    fetchLawyer()
  }, [id])

  const fetchLawyer = async () => {
    try {
      const data = await getLawyerDetails(id)
      setLawyer(data)
    } catch (err) {
      setError('Failed to load lawyer profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleConsultationSubmit = async (data) => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/lawyers/${id}` } })
      return
    }

    setIsSubmitting(true)
    try {
      await requestConsultation(data)
      setIsModalOpen(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error(err)
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-gold-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !lawyer) {
    return (
      <div className="text-center py-20 text-slate-400">{error || "Lawyer not found"}</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lawyers
      </button>

      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-800 to-slate-800 border-2 border-primary-700/50 flex items-center justify-center text-4xl font-bold text-white shadow-xl flex-shrink-0">
            {lawyer.name.replace('Adv. ', '').charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  {lawyer.name}
                  {lawyer.verified && (
                    <Shield className="w-6 h-6 text-green-500 fill-green-500/20" />
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {lawyer.location_city}, {lawyer.location_state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> {lawyer.experience_years} Years Experience
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">₹{lawyer.hourly_rate}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Per Hour Session</div>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
                <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
                <span className="text-lg font-bold text-white">{lawyer.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-sm">({lawyer.reviews_count} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-4 h-4" /> Responds within 24h
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
              >
                Request Consultation
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-900/20 border border-green-700/50 p-4 rounded-xl text-green-400 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <p>Your consultation request has been sent successfully. {lawyer.name.split(' ')[1]} will reach out to you shortly via your protected email.</p>
        </motion.div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-400" /> About the Advocate
            </h2>
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{lawyer.about}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Areas of Practice</h2>
            <div className="flex flex-wrap gap-3">
              {lawyer.specializations.map(spec => (
                <div key={spec} className="bg-primary-900/20 border border-primary-800/40 text-primary-300 px-4 py-2 rounded-xl text-sm font-medium">
                  {spec} Law
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Languages Spoken</h3>
            <ul className="space-y-2">
              {lawyer.languages.map(lang => (
                <li key={lang} className="text-slate-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {lang}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Availability Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-300 font-medium capitalize">{lawyer.status} for new cases</span>
            </div>
          </div>
        </div>
      </div>

      <ConsultationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lawyer={lawyer}
        onSubmit={handleConsultationSubmit}
        loading={isSubmitting}
        initialCaseSummary={initialCaseSummary}
      />
    </div>
  )
}

export default LawyerProfilePage
