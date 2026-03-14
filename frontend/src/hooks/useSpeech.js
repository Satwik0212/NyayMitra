import { useState, useEffect, useRef } from 'react'

export const useSpeech = (onResult) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
          onResult?.(finalTranscript)
        }
      }

      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return
    setIsListening(true)
    setTranscript('')
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const toggleListening = () => {
    if (isListening) stopListening()
    else startListening()
  }

  return { isListening, transcript, isSupported, startListening, stopListening, toggleListening }
}
