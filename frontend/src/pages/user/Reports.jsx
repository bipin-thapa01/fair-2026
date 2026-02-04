import React, { useState, useContext, useEffect } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'

// Predefined bridges for the dropdown (with correct structure)
const PREDEFINED_BRIDGES = [
  { id: 'b-1', name: "Sundarijal Bridge", bqi: 82 },
  { id: 'b-2', name: "Kalanki Bridge", bqi: 76 },
  { id: 'b-3', name: "Koteshwor Bridge", bqi: 61 },
  { id: 'b-4', name: "Balaju Bridge", bqi: 55 },
  { id: 'b-5', name: "Chabahil Bridge", bqi: 44 },
  { id: 'b-6', name: "Teku Bridge", bqi: 38 },
  { id: 'b-7', name: "Tripureshwor Bridge", bqi: 69 },
  { id: 'b-8', name: "Pulchowk Bridge", bqi: 23 },
  { id: 'b-9', name: "Thapathali Bridge", bqi: 90 },
  { id: 'b-10', name: "Kantipath Bridge", bqi: 33 },
  { id: 'b-11', name: "Bagmati Bridge", bqi: 47 }
];

function Toast({msg}){
  return (
    <div className={`toast ${msg.type === 'success' ? 'success' : msg.type === 'error' ? 'error' : ''}`}>
      {msg.text}
    </div>
  )
}

export default function UserReports(){
  const [reports, setReports] = useState([
    {id:1, bridgeName: 'Bagmati Bridge', title:'Cracked deck near pier 2', description: 'Found significant cracks on the deck surface near pier 2 during inspection.', status:'Pending', date:'2026-01-21', issueType: 'cracks'},
    {id:2, bridgeName: 'Kalanki Bridge', title:'Loose railing at northbound lane', description: 'Railings on the northbound side are loose and pose safety risk.', status:'Pending', date:'2026-01-15', issueType: 'structural'},
    {id:3, bridgeName: 'Koteshwor Bridge', title:'Potholes on approach slab', description: 'Multiple deep potholes on approach slab causing traffic disruption.', status:'Pending', date:'2025-12-30', issueType: 'roadway'},
  ])
  const [toasts, setToasts] = useState([])
  const { bridges: contextBridges } = useContext(BridgesContext)

  // Log to debug
  useEffect(() => {
    console.log('Context Bridges:', contextBridges);
    console.log('Predefined Bridges:', PREDEFINED_BRIDGES);
  }, [contextBridges]);

  // Use predefined bridges if context doesn't have them
  const availableBridges = contextBridges && contextBridges.length > 0 ? 
    contextBridges.map(bridge => ({
      id: bridge.id || `b-${bridge.name?.replace(/\s+/g, '-').toLowerCase()}`,
      name: bridge.name || 'Unknown Bridge',
      bqi: bridge.bqi || 0
    })) : 
    PREDEFINED_BRIDGES;

  const [showReportForm, setShowReportForm] = useState(false)
  const [formData, setFormData] = useState({ 
    bridgeId: '', 
    title: '', 
    description: '', 
    issueType: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const pushToast = (text, type='success') =>{
    const t = {id: Date.now(), text, type}
    setToasts(s => [t, ...s])
    setTimeout(()=> setToasts(s=> s.filter(x=> x.id !== t.id)), 3800)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.bridgeId) {
      pushToast('Please select a bridge', 'error')
      return
    }
    if (!formData.title.trim()) {
      pushToast('Title is required', 'error')
      return
    }
    if (!formData.description.trim()) {
      pushToast('Description is required', 'error')
      return
    }
    if (!formData.issueType) {
      pushToast('Please select an issue type', 'error')
      return
    }

    setSubmitting(true)

    try {
      // Get selected bridge name
      const selectedBridge = availableBridges.find(b => b.id === formData.bridgeId)
      const bridgeName = selectedBridge ? selectedBridge.name : 'Unknown Bridge'

      // Create new report
      const newReport = {
        id: Date.now(),
        bridgeId: formData.bridgeId,
        bridgeName: bridgeName,
        title: formData.title.trim(),
        description: formData.description.trim(),
        issueType: formData.issueType,
        status: 'Pending',
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString()
      }

      // Add to reports list
      setReports(prev => [newReport, ...prev])

      // Save to localStorage (mimicking API call)
      const existingReports = JSON.parse(localStorage.getItem('bqi_user_reports') || '[]')
      localStorage.setItem('bqi_user_reports', JSON.stringify([newReport, ...existingReports]))

      // Reset form
      setFormData({
        bridgeId: '',
        title: '',
        description: '',
        issueType: ''
      })
      
      setShowReportForm(false)
      pushToast('Report submitted successfully! Our team will review it shortly.', 'success')
      
    } catch (error) {
      pushToast('Failed to submit report. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      bridgeId: '',
      title: '',
      description: '',
      issueType: ''
    })
    setShowReportForm(false)
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'resolved': return '#10b981'
      case 'in progress': return '#f59e0b'
      case 'approved': return '#059669'
      case 'declined': return '#dc2626'
      case 'withdrawn': return '#6b7280'
      default: return '#92400e' // Pending
    }
  }

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'resolved': return '✅'
      case 'in progress': return '🔄'
      case 'approved': return '👍'
      case 'declined': return '❌'
      case 'withdrawn': return '↩️'
      default: return '⏳' // Pending
    }
  }

  const getIssueTypeIcon = (type) => {
    switch(type) {
      case 'structural': return '🏗️'
      case 'corrosion': return '🦠'
      case 'cracks': return '⚡'
      case 'drainage': return '💧'
      case 'roadway': return '🛣️'
      case 'vibrations': return '🌊'
      case 'flood': return '🌧️'
      default: return '❓'
    }
  }

  return (
    <div className="page-full page-mounted" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>My Reports</h2>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Track and submit bridge inspection reports
          </p>
        </div>
        <button 
          onClick={() => setShowReportForm(true)}
          style={{
            background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(31, 111, 235, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 111, 235, 0.2)'
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Submit New Report
        </button>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={resetForm}
              style={{
                position: 'absolute',
                right: '20px',
                top: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>

            {/* Form Header */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '22px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Submit New Report
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Provide details about the bridge issue you've identified
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Bridge Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  <span style={{ marginRight: '6px' }}>🌉</span>
                  Select Bridge *
                </label>
                <select
                  name="bridgeId"
                  value={formData.bridgeId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1f6feb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Choose a bridge...</option>
                  {availableBridges.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} (BQI: {b.bqi || 'N/A'})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Showing {availableBridges.length} bridges available
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  <span style={{ marginRight: '6px' }}>⚠️</span>
                  Issue Type *
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1f6feb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select issue type...</option>
                  <option value="structural">🏗️ Structural Damage</option>
                  <option value="corrosion">🦠 Corrosion/Rust</option>
                  <option value="cracks">⚡ Cracks/Fractures</option>
                  <option value="drainage">💧 Drainage Issues</option>
                  <option value="roadway">🛣️ Roadway Damage</option>
                  <option value="vibrations">🌊 Excessive Vibrations</option>
                  <option value="flood">🌧️ Flood Damage</option>
                  <option value="other">❓ Other Issue</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  <span style={{ marginRight: '6px' }}>📝</span>
                  Report Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief title describing the issue..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1f6feb';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  <span style={{ marginRight: '6px' }}>📋</span>
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about the issue, including location, severity, and any visible signs..."
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1f6feb';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: '2px solid #e5e7eb',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'all 0.2s',
                    opacity: submitting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    opacity: submitting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 111, 235, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={{ marginRight: '8px' }}>⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '8px' }}>📤</span>
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No Reports Yet</h3>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: '400px' }}>
              You haven't submitted any bridge inspection reports yet. Click "Submit New Report" to get started.
            </p>
          </div>
        ) : (
          reports.map(r => (
            <div 
              key={r.id} 
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                opacity: r.status === 'Resolved' || r.status === 'Withdrawn' ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (r.status !== 'Resolved' && r.status !== 'Withdrawn') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (r.status !== 'Resolved' && r.status !== 'Withdrawn') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{getIssueTypeIcon(r.issueType)}</span>
                    <strong style={{ fontSize: '16px', color: '#1f2937' }}>{r.title}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <span>🌉</span>
                      <span>{r.bridgeName || 'Bridge'}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <span>📅</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                  
                  {r.description && (
                    <p style={{
                      margin: '12px 0 0',
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: '1.5',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      {r.description}
                    </p>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: getStatusColor(r.status) + '15',
                    border: `1px solid ${getStatusColor(r.status)}30`,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getStatusColor(r.status),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{getStatusIcon(r.status)}</span>
                    {r.status}
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textAlign: 'right'
                  }}>
                    Report ID: #{r.id.toString().slice(-6)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => <Toast key={t.id} msg={t} />)}
      </div>

      {/* Styles */}
      <style>{`
        input, select, textarea {
          font-family: inherit;
        }
        
        .page-mounted {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}