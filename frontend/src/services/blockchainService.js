import api from './api'

export const logDispute = async (recordData) => {
  const response = await api.post('/api/v1/blockchain/log', { record_data: recordData })
  return response.data
}

export const verifyTransaction = async (txHash) => {
  const response = await api.get(`/api/v1/blockchain/verify/${txHash}`)
  return response.data
}

export const getProcessFlow = async (type) => {
  const response = await api.get(`/api/v1/process-flow/${type}`)
  return response.data
}
