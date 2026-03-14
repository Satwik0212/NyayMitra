import React, { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export const AnalysisProvider = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const saveAnalysis = (result) => {
    setCurrentAnalysis(result)
    setAnalysisHistory(prev => [result, ...prev].slice(0, 20))
    // Persist in sessionStorage
    try {
      sessionStorage.setItem('current_analysis', JSON.stringify(result))
    } catch {}
  }

  const loadCurrentAnalysis = () => {
    if (currentAnalysis) return currentAnalysis
    try {
      const saved = sessionStorage.getItem('current_analysis')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCurrentAnalysis(parsed)
        return parsed
      }
    } catch {}
    return null
  }

  const clearAnalysis = () => {
    setCurrentAnalysis(null)
    sessionStorage.removeItem('current_analysis')
  }

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis, analysisHistory, isAnalyzing,
      setIsAnalyzing, saveAnalysis, loadCurrentAnalysis, clearAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}

export default AnalysisContext
