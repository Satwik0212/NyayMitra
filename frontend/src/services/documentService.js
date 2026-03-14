import api from './api'

export const generateDocument = async (docType, parameters) => {
  const response = await api.post('/api/v1/generate-document', {
    doc_type: docType,
    parameters
  })
  return response.data
}
