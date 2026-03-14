import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Edit3, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import { generateDocument } from '../../services/documentService'

const DOC_TYPES = [
  {
    id: 'legal_notice',
    label: 'Legal Notice',
    icon: '⚖️',
    fields: ['sender_name', 'sender_address', 'recipient_name', 'recipient_address', 'subject', 'facts', 'demand', 'timeline_days'],
  },
  {
    id: 'consumer_complaint',
    label: 'Consumer Complaint',
    icon: '🛒',
    fields: ['complainant_name', 'complainant_address', 'opposite_party', 'product_service', 'purchase_date', 'complaint_details', 'relief_sought'],
  },
  {
    id: 'fir_helper',
    label: 'FIR Draft',
    icon: '🔒',
    fields: ['complainant_name', 'complainant_address', 'incident_date', 'incident_location', 'incident_description', 'accused_details', 'witnesses'],
  },
  {
    id: 'rti_application',
    label: 'RTI Application',
    icon: '📜',
    fields: ['applicant_name', 'applicant_address', 'public_authority', 'information_sought', 'period_of_information', 'reason'],
  },
]

const FIELD_LABELS = {
  sender_name: 'Your Full Name',
  sender_address: 'Your Address',
  recipient_name: "Recipient's Name",
  recipient_address: "Recipient's Address",
  subject: 'Subject',
  facts: 'Facts of the Case',
  demand: 'Your Demand / Relief Sought',
  timeline_days: 'Response Timeline (days)',
  complainant_name: 'Complainant Name',
  complainant_address: 'Complainant Address',
  opposite_party: 'Opposite Party (Company/Person)',
  product_service: 'Product / Service',
  purchase_date: 'Purchase/Service Date',
  complaint_details: 'Details of Complaint',
  relief_sought: 'Relief Sought',
  incident_date: 'Date of Incident',
  incident_location: 'Location of Incident',
  incident_description: 'Description of Incident',
  accused_details: 'Accused Details (if known)',
  witnesses: 'Witnesses (if any)',
  applicant_name: 'Your Name',
  applicant_address: 'Your Address',
  public_authority: 'Public Authority (Department)',
  information_sought: 'Information Sought',
  period_of_information: 'Period of Information',
  reason: 'Reason for Request (optional)',
}

const DocumentEditor = ({ onGenerate, generatedContent }) => {
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!selectedType) return
    setLoading(true)
    try {
      const result = await generateDocument(selectedType.id, formData)
      onGenerate(result)
    } catch (err) {
      console.error('Document generation failed:', err)
      // Provide mock HTML for demo
      onGenerate({
        html_content: `<div style="font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto">
          <h1 style="text-align:center;color:#1e3a8a">${selectedType.label}</h1>
          <p style="text-align:center;color:#666">Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <hr style="margin:20px 0"/>
          <p>To,</p>
          <p><strong>${formData.recipient_name || formData.opposite_party || 'The Concerned Authority'}</strong></p>
          <p>${formData.recipient_address || formData.complainant_address || ''}</p>
          <br/>
          <p>Subject: <strong>${formData.subject || selectedType.label}</strong></p>
          <br/>
          <p>This is to bring to your kind notice that ${formData.facts || formData.complaint_details || formData.incident_description || formData.information_sought || '[Details provided]'}.</p>
          <br/>
          <p>Relief Sought: ${formData.demand || formData.relief_sought || 'Prompt action and resolution'}</p>
          <br/><br/>
          <p>Yours faithfully,</p>
          <p><strong>${formData.sender_name || formData.complainant_name || formData.applicant_name || 'The Complainant'}</strong></p>
          <p>${formData.sender_address || formData.complainant_address || formData.applicant_address || ''}</p>
        </div>`,
        template_used: selectedType.id
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Doc Type Selector */}
      {!selectedType ? (
        <div>
          <h3 className="text-base font-semibold text-slate-300 mb-4">Select Document Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_TYPES.map(type => (
              <motion.button
                key={type.id}
                onClick={() => { setSelectedType(type); setFormData({}) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-primary-600/50 hover:bg-primary-900/20 text-left transition-all"
              >
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <p className="font-medium text-white">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{type.fields.length} fields required</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedType(null)}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >← Back</button>
            <span className="text-xl">{selectedType.icon}</span>
            <h3 className="text-lg font-semibold text-white">{selectedType.label}</h3>
          </div>

          <div className="space-y-4">
            {selectedType.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  {FIELD_LABELS[field] || field}
                </label>
                {field.includes('details') || field.includes('description') || field.includes('facts') || field.includes('information_sought') ? (
                  <textarea
                    value={formData[field] || ''}
                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm resize-none"
                    placeholder={`Enter ${FIELD_LABELS[field] || field}...`}
                  />
                ) : (
                  <input
                    type={field.includes('date') ? 'date' : 'text'}
                    value={formData[field] || ''}
                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
                    placeholder={`Enter ${FIELD_LABELS[field] || field}...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="gold"
              size="lg"
              loading={loading}
              onClick={handleGenerate}
              icon={FileText}
              className="w-full sm:w-auto"
            >
              {loading ? 'Generating...' : 'Generate Document'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentEditor
