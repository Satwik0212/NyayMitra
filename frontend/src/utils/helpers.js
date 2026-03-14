export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

export const getUrgencyColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'emergency': return 'red'
    case 'urgent': return 'orange'
    case 'normal': default: return 'green'
  }
}

export const getDomainIcon = (domain) => {
  const icons = {
    civil: '⚖️',
    criminal: '🔒',
    corporate: '🏢',
    family: '👨‍👩‍👧',
    property: '🏠',
    labor: '👷',
    consumer: '🛒',
    constitutional: '📜',
  }
  return icons[domain?.toLowerCase()] || '⚖️'
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const generateDocumentId = () => {
  return `nm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const DISPUTE_CATEGORIES = [
  { id: 'consumer', label: 'Consumer Rights', icon: '🛒', description: 'Product defects, service failures, refund issues' },
  { id: 'property', label: 'Property Dispute', icon: '🏠', description: 'Landlord-tenant, ownership, encroachment' },
  { id: 'labor', label: 'Employment Issue', icon: '👷', description: 'Wrongful termination, salary disputes, workplace' },
  { id: 'family', label: 'Family Law', icon: '👨‍👩‍👧', description: 'Divorce, custody, maintenance, inheritance' },
  { id: 'criminal', label: 'Criminal Matter', icon: '🔒', description: 'FIR, bail, arrest, criminal charges' },
  { id: 'civil', label: 'Civil Dispute', icon: '⚖️', description: 'Contract disputes, money recovery, injunctions' },
  { id: 'constitutional', label: 'RTI / Constitutional', icon: '📜', description: 'Right to Information, fundamental rights' },
  { id: 'corporate', label: 'Business / Corporate', icon: '🏢', description: 'Company disputes, fraud, partnership' },
]

export const PROCESS_FLOW_TYPES = [
  { id: 'consumer-court', label: 'Consumer Court', icon: '🛒' },
  { id: 'rent-tribunal', label: 'Rent Tribunal', icon: '🏠' },
  { id: 'fir-filing', label: 'FIR Filing', icon: '🔒' },
  { id: 'rti-process', label: 'RTI Process', icon: '📜' },
]
