import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactFlow, { Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { GitBranch, Clock, DollarSign, FileText, Info } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { PROCESS_FLOW_TYPES } from '../utils/helpers'

const PROCESS_DATA = {
  'consumer-court': {
    title: 'Consumer Court Process',
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: '1. File Complaint', cost: 'Free–₹500', time: '1 day', docs: ['Complaint form', 'Receipt', 'Evidence'] }, type: 'input' },
      { id: '2', position: { x: 250, y: 120 }, data: { label: '2. Admission Hearing', cost: 'Free', time: '1-2 months' } },
      { id: '3', position: { x: 100, y: 240 }, data: { label: '3a. Mediation', cost: '₹0', time: '30 days' } },
      { id: '4', position: { x: 400, y: 240 }, data: { label: '3b. Notice to Opp. Party', cost: 'Free', time: '30-45 days' } },
      { id: '5', position: { x: 250, y: 360 }, data: { label: '4. Evidence & Arguments', cost: '₹5000+', time: '3-6 months' } },
      { id: '6', position: { x: 250, y: 480 }, data: { label: '5. Final Order', cost: 'Free', time: '1-3 months' }, type: 'output' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ]
  },
  'fir-filing': {
    title: 'FIR Filing Process',
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: '1. Visit Police Station', cost: 'Free', time: 'Day 1', docs: ['ID proof', 'Incident details'] }, type: 'input' },
      { id: '2', position: { x: 250, y: 120 }, data: { label: '2. File Written Complaint', cost: 'Free', time: 'Day 1' } },
      { id: '3', position: { x: 250, y: 240 }, data: { label: '3. FIR Registered', cost: 'Free', time: 'Same day' } },
      { id: '4', position: { x: 250, y: 360 }, data: { label: '4. Investigation', cost: 'Free', time: '90 days' } },
      { id: '5', position: { x: 250, y: 480 }, data: { label: '5. Charge Sheet / Closure', cost: 'Free', time: '90-180 days' }, type: 'output' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ]
  },
  'rti-process': {
    title: 'RTI Application Process',
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: '1. Prepare Application', cost: '₹10 fee', time: '1 day', docs: ['Postal Order/IPO', 'Written application'] }, type: 'input' },
      { id: '2', position: { x: 250, y: 120 }, data: { label: '2. Submit to PIO', cost: '₹10', time: 'Day 1' } },
      { id: '3', position: { x: 250, y: 240 }, data: { label: '3. Response from PIO', cost: 'Free', time: '30 days' } },
      { id: '4', position: { x: 100, y: 360 }, data: { label: '4a. Info Received', cost: 'Free', time: '30 days' }, type: 'output' },
      { id: '5', position: { x: 400, y: 360 }, data: { label: '4b. First Appeal', cost: 'Free', time: '30 days' } },
      { id: '6', position: { x: 400, y: 480 }, data: { label: '5. CIC Appeal', cost: 'Free', time: '90 days' }, type: 'output' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ]
  },
  'rent-tribunal': {
    title: 'Rent Tribunal Process',
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: '1. Legal Notice to Landlord', cost: '₹500-1000', time: '15 days notice', docs: ['Rent agreement', 'Payment receipts'] }, type: 'input' },
      { id: '2', position: { x: 250, y: 120 }, data: { label: '2. File Application to Rent Controller', cost: '₹200-500', time: 'Day 1' } },
      { id: '3', position: { x: 250, y: 240 }, data: { label: '3. Hearing & Evidence', cost: '₹0', time: '3-6 months' } },
      { id: '4', position: { x: 250, y: 360 }, data: { label: '4. Rent Controller Order', cost: 'Free', time: '1-3 months' } },
      { id: '5', position: { x: 250, y: 480 }, data: { label: '5. High Court (if appealed)', cost: '₹5000+', time: '1-2 years' }, type: 'output' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ]
  }
}

const ProcessPage = () => {
  const { type } = useParams()
  const processData = PROCESS_DATA[type] || PROCESS_DATA['consumer-court']

  const initialNodes = processData.nodes.map(n => ({
    ...n,
    style: {
      background: '#1e3a8a50',
      border: '1px solid #1e40af80',
      color: '#e2e8f0',
      borderRadius: '12px',
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: '500',
      minWidth: '180px',
      textAlign: 'center',
    }
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(processData.edges.map(e => ({
    ...e,
    style: { stroke: '#fbbf24', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#fbbf24' }
  })))
  const [selected, setSelected] = useState(null)

  const onNodeClick = (_, node) => setSelected(node)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{processData.title}</h1>
            <p className="text-slate-400 text-xs">Click any node to see details</p>
          </div>
        </div>
        {/* Process Type Switcher */}
        <div className="flex flex-wrap gap-2">
          {PROCESS_FLOW_TYPES.map(pf => (
            <a
              key={pf.id}
              href={`/process/${pf.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${type === pf.id
                  ? 'bg-primary-800 text-primary-200 border border-primary-700'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
            >
              <span>{pf.icon}</span> {pf.label}
            </a>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 overflow-hidden" style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls style={{ background: '#1e293b', border: '1px solid #334155' }} />
          </ReactFlow>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selected ? (
            <Card gold>
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-gold-400" />
                <h3 className="font-semibold text-white">{selected.data.label}</h3>
              </div>
              <div className="space-y-3">
                {selected.data.cost && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">Cost: </span>
                    <Badge variant="success" size="xs">{selected.data.cost}</Badge>
                  </div>
                )}
                {selected.data.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Timeline: </span>
                    <Badge variant="info" size="xs">{selected.data.time}</Badge>
                  </div>
                )}
                {selected.data.docs && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gold-400" />
                      <span className="text-sm text-slate-300">Required Documents:</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {selected.data.docs.map(d => (
                        <li key={d} className="text-xs text-slate-400 list-disc">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <div className="text-3xl mb-3">👆</div>
              <p className="text-slate-400 text-sm">Click on any step in the flowchart to see details</p>
            </Card>
          )}

          {/* Summary Cards */}
          {processData.nodes.slice(0, 3).map(n => (
            <div key={n.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-sm font-medium text-slate-300">{n.data.label}</p>
              {(n.data.cost || n.data.time) && (
                <div className="flex gap-2 mt-1.5">
                  {n.data.cost && <Badge variant="success" size="xs">{n.data.cost}</Badge>}
                  {n.data.time && <Badge variant="info" size="xs">{n.data.time}</Badge>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProcessPage
