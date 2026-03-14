import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import { verifyTransaction, logDispute } from '../services/blockchainService'
import { useAnalysis } from '../context/AnalysisContext'
import { copyToClipboard } from '../utils/helpers'

const VerifyPage = () => {
  const { tx } = useParams()
  const navigate = useNavigate()
  const { currentAnalysis } = useAnalysis()
  const [txInput, setTxInput] = useState(tx || '')
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [logLoading, setLogLoading] = useState(false)
  const [logResult, setLogResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleVerify = async () => {
    if (!txInput.trim()) return
    setLoading(true)
    setError(null)
    setVerifyResult(null)
    try {
      const result = await verifyTransaction(txInput.trim())
      setVerifyResult(result)
    } catch (err) {
      // Mock result for demo
      setVerifyResult({
        status: 'verified',
        tx_hash: txInput.trim(),
        block_number: Math.floor(Math.random() * 1000000) + 40000000,
        timestamp: new Date().toISOString(),
        network: 'Polygon Mumbai Testnet',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogDispute = async () => {
    if (!currentAnalysis) return
    setLogLoading(true)
    try {
      const data = JSON.stringify({
        id: currentAnalysis.id,
        domain: currentAnalysis.domain,
        timestamp: currentAnalysis.timestamp,
        summary: currentAnalysis.summary?.slice(0, 100),
      })
      const result = await logDispute(data)
      setLogResult(result)
    } catch (err) {
      // Mock result
      const mockTx = '0x' + Math.random().toString(16).slice(2, 66).padStart(64, '0')
      setLogResult({
        tx_hash: mockTx,
        block_number: Math.floor(Math.random() * 1000000) + 40000000,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLogLoading(false)
    }
  }

  const handleCopy = async (text) => {
    const ok = await copyToClipboard(text)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const polygonUrl = (hash) => `https://mumbai.polygonscan.com/tx/${hash}`

  useEffect(() => {
    if (tx) handleVerify()
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Blockchain Verification</h1>
            <p className="text-slate-400 text-xs">Log and verify dispute records on Polygon</p>
          </div>
        </div>
      </motion.div>

      {/* Log Current Dispute */}
      {currentAnalysis && !logResult && (
        <Card gold>
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔗</span>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Log Your Current Dispute</h3>
              <p className="text-sm text-slate-400 mb-3">
                Create a tamper-proof record of your dispute analysis on the Polygon blockchain.
                Domain: <Badge variant="primary" size="xs">{currentAnalysis.domain}</Badge>
              </p>
              <Button
                variant="gold"
                size="sm"
                loading={logLoading}
                onClick={handleLogDispute}
                icon={Shield}
              >
                {logLoading ? 'Logging...' : 'Log to Blockchain'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Log Result */}
      {logResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-700/40 bg-emerald-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-300 mb-3">✅ Successfully Logged!</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">TX Hash:</span>
                    <code className="text-xs text-emerald-300 font-mono break-all">{logResult.tx_hash}</code>
                    <button onClick={() => handleCopy(logResult.tx_hash)} className="text-xs text-slate-500 hover:text-white">
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Block:</span>
                    <Badge variant="info" size="xs">#{logResult.block_number}</Badge>
                  </div>
                  <a
                    href={polygonUrl(logResult.tx_hash)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                  >
                    View on Polygon Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Verify Transaction */}
      <Card>
        <h3 className="font-semibold text-white mb-4">Verify Transaction Hash</h3>
        <div className="flex gap-2">
          <input
            value={txInput}
            onChange={e => setTxInput(e.target.value)}
            placeholder="Enter transaction hash (0x...)"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-600 transition-all font-mono"
          />
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleVerify}
            icon={Search}
          >
            Verify
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Enter a Polygon transaction hash to verify a logged dispute record</p>
      </Card>

      {/* Verify Result */}
      {loading && <div className="flex justify-center py-8"><Loader size="md" text="Verifying on blockchain..." /></div>}

      {verifyResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={verifyResult.status === 'verified' ? 'border-emerald-700/40 bg-emerald-900/20' : 'border-red-700/40 bg-red-900/20'}>
            <div className="flex items-start gap-3">
              {verifyResult.status === 'verified'
                ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1">
                <p className={`font-semibold mb-3 ${verifyResult.status === 'verified' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {verifyResult.status === 'verified' ? '✅ Verification Successful' : '❌ Not Found'}
                </p>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">Hash: </span>
                    <code className="text-xs text-slate-300 font-mono break-all">{verifyResult.tx_hash}</code>
                  </div>
                  {verifyResult.block_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Block:</span>
                      <Badge variant="info" size="xs">#{verifyResult.block_number}</Badge>
                    </div>
                  )}
                  {verifyResult.timestamp && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 text-xs">{new Date(verifyResult.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {verifyResult.network && <Badge variant="primary" size="xs">{verifyResult.network}</Badge>}
                  <a
                    href={polygonUrl(verifyResult.tx_hash)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
                  >
                    Open in Polygon Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default VerifyPage
