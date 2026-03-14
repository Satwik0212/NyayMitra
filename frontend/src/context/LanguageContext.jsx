import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../i18n/config'

const LanguageContext = createContext(null)

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
]

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('nyaymitra_lang') || 'en'
    setCurrentLanguage(saved)
    i18n.changeLanguage(saved)
  }, [])

  const changeLanguage = (code) => {
    setCurrentLanguage(code)
    localStorage.setItem('nyaymitra_lang', code)
    i18n.changeLanguage(code)
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export default LanguageContext
