import api from './api'

export const getLawyers = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.city) params.append('city', filters.city)
  if (filters.specialization) params.append('specialization', filters.specialization)
  
  const response = await api.get(`/api/v1/lawyers?${params.toString()}`)
  return response.data
}

export const getLawyerDetails = async (id) => {
  const response = await api.get(`/api/v1/lawyers/${id}`)
  return response.data
}

export const registerLawyer = async (lawyerData) => {
  const response = await api.post('/api/v1/lawyers/register', lawyerData)
  return response.data
}

export const requestConsultation = async (consultationData) => {
  const response = await api.post('/api/v1/lawyers/connect-lawyer', consultationData)
  return response.data
}
