import { useState, useCallback } from 'react'
import { sendMessage, streamMessage } from '../services/chatService'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const addMessage = useCallback((role, content) => {
    const msg = { role, content, timestamp: new Date().toISOString(), id: Date.now() }
    setMessages(prev => [...prev, msg])
    return msg
  }, [])

  const sendChat = useCallback(async (text) => {
    const userMsg = addMessage('user', text)
    setIsLoading(true)

    // Prepare history (exclude the just-added user message for the API call)
    const history = messages.map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await sendMessage(text, history)
      addMessage('assistant', response.response)
    } catch (error) {
      addMessage('assistant', `Error: ${error.message}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [messages, addMessage])

  const sendStreamChat = useCallback((text) => {
    addMessage('user', text)
    setIsStreaming(true)

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    let assistantId = Date.now()
    let accumulated = ''

    // Add placeholder
    setMessages(prev => [...prev, {
      role: 'assistant', content: '', timestamp: new Date().toISOString(), id: assistantId, streaming: true
    }])

    streamMessage(
      text,
      history,
      (token) => {
        accumulated += token
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: accumulated } : m
        ))
      },
      () => {
        setIsStreaming(false)
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        ))
      },
      (err) => {
        setIsStreaming(false)
        console.error('Stream error:', err)
      }
    )
  }, [messages, addMessage])

  const clearChat = () => setMessages([])

  return { messages, isLoading, isStreaming, sendChat, sendStreamChat, clearChat, addMessage }
}
