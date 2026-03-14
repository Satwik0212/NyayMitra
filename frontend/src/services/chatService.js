import api from './api'

export const sendMessage = async (message, history = []) => {
  const response = await api.post('/api/v1/chat', { message, history })
  return response.data
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const streamMessage = (message, history = [], onToken, onDone, onError) => {
  const token = localStorage.getItem('nyaymitra_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  fetch(`${BASE_URL}/api/v1/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history }),
  })
    .then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.token) onToken(data.token)
              if (data.done) onDone()
              if (data.error) onError(data.error)
            } catch {}
          }
        }
      }
      onDone()
    })
    .catch(onError)
}
