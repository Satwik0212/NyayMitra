import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'
import { LanguageProvider } from './context/LanguageContext'
import './i18n/config'

// Layout
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'

// Pages
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import ResultsPage from './pages/ResultsPage'
import ChatPage from './pages/ChatPage'
import ProcessPage from './pages/ProcessPage'
import DocumentsPage from './pages/DocumentsPage'
import ProfilePage from './pages/ProfilePage'
import VerifyPage from './pages/VerifyPage'
import LoginPage from './pages/LoginPage'
import LawyerMarketplacePage from './pages/LawyerMarketplacePage'
import LawyerProfilePage from './pages/LawyerProfilePage'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
)

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 pt-16">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Full-screen auth route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard routes */}
              <Route path="/*" element={
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                    <Route path="/analyze" element={<PageTransition><AnalyzePage /></PageTransition>} />
                    <Route path="/results/:id" element={<PageTransition><ResultsPage /></PageTransition>} />
                    <Route path="/results" element={<Navigate to="/analyze" replace />} />
                    <Route path="/chat/:conversationId" element={<PageTransition><ChatPage /></PageTransition>} />
                    <Route path="/chat" element={<Navigate to="/chat/new" replace />} />
                    <Route path="/process/:type" element={<PageTransition><ProcessPage /></PageTransition>} />
                    <Route path="/process" element={<Navigate to="/process/consumer-court" replace />} />
                    <Route path="/documents" element={<PageTransition><DocumentsPage /></PageTransition>} />
                    <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                    <Route path="/verify/:tx" element={<PageTransition><VerifyPage /></PageTransition>} />
                    <Route path="/verify" element={<PageTransition><VerifyPage /></PageTransition>} />
                    <Route path="/lawyers" element={<PageTransition><LawyerMarketplacePage /></PageTransition>} />
                    <Route path="/lawyers/:id" element={<PageTransition><LawyerProfilePage /></PageTransition>} />
                    <Route path="*" element={
                      <PageTransition>
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                          <div className="text-6xl mb-4">⚖️</div>
                          <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                          <p className="text-slate-400 mb-6">This page doesn't exist in our legal system.</p>
                          <a href="/" className="px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium">
                            Go Home
                          </a>
                        </div>
                      </PageTransition>
                    } />
                  </Routes>
                </DashboardLayout>
              } />
            </Routes>
          </Router>
        </LanguageProvider>
      </AnalysisProvider>
    </AuthProvider>
  )
}

export default App
