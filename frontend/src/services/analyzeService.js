import api from './api'

export const analyzeDispute = async (text, language = 'en') => {
  const response = await api.post('/api/v1/analyze', { text, language })
  return response.data
}

export const getHistory = async () => {
  const response = await api.get('/api/v1/history')
  return response.data
}

export const getPrecedents = async (domain) => {
  const response = await api.get(`/api/v1/precedents/${domain}`)
  return response.data
}

export const getUpdates = async () => {
  const response = await api.get('/api/v1/updates')
  return response.data
}
