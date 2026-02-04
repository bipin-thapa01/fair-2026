import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

function Toast({ msg, type }) {
  if (!msg) return null
  const bg = type === 'success' 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))'
  const color = type === 'success' ? '#059669' : '#DC2626'
  
  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      top: '100px',
      background: bg,
      color: color,
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      border: '1px solid ' + (type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: type === 'success' 
          ? 'linear-gradient(135deg, #10B981, #059669)' 
          : 'linear-gradient(135deg, #EF4444, #DC2626)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px'
      }}>
        {type === 'success' ? '✓' : '✗'}
      </div>
      {msg}
    </div>
  )
}

const initialReports = [
  {id:'r1', bridge:'Bagmati Bridge', bridgeId:'BQI-001', summary:'Observed increased vibration near midspan, recommend detailed inspection.', status:'Pending', submitted:'2026-01-25 09:12', auditor:'Inspector A', priority:'High', category:'Vibration Analysis', estimatedCost: '15,000', estimatedTime: '2 weeks'},
  {id:'r2', bridge:'Narayani Bridge', bridgeId:'BQI-002', summary:'Local scouring noticed at pier 3, water level rising. Immediate action required.', status:'Pending', submitted:'2026-01-26 14:03', auditor:'Inspector B', priority:'Critical', category:'Structural Integrity', estimatedCost: '45,000', estimatedTime: '4 weeks'},
  {id:'r3', bridge:'Himal Viaduct', bridgeId:'BQI-003', summary:'Minor cracking on approach slab; monitor monthly. Low priority maintenance.', status:'Pending', submitted:'2026-01-28 08:22', auditor:'Inspector C', priority:'Low', category:'Maintenance', estimatedCost: '8,000', estimatedTime: '1 week'},
  {id:'r4', bridge:'Koshi Bridge', bridgeId:'BQI-004', summary:'Corrosion detected on support beams. Requires cleaning and protective coating.', status:'Pending', submitted:'2026-01-29 11:45', auditor:'Inspector D', priority:'Medium', category:'Corrosion Control', estimatedCost: '25,000', estimatedTime: '3 weeks'},
  {id:'r5', bridge:'Gandaki Bridge', bridgeId:'BQI-005', summary:'Deck drainage system clogged. Requires cleaning to prevent water damage.', status:'Pending', submitted:'2026-01-30 10:30', auditor:'Inspector E', priority:'Medium', category:'Drainage System', estimatedCost: '12,000', estimatedTime: '5 days'},
]

export default function Reports() {
  const [reports, setReports] = useState(initialReports)
  const [asideOpen, setAsideOpen] = useState(false)

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])
  const [toast, setToast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('bqi_token')
        const response = await fetch('/api/reports/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setReports(data)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    }
    
    fetchReports()
  }, [])

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (id, action) => {
    // Optimistic update
    setReports(prev => prev.map(x => x.id === id ? { ...x, status: action } : x))
    
    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch(`/api/reports/${id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: action.toLowerCase(),
          comment: 'No comment provided' // Simplified - no comment modal
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update report')
      }

      notify(`Report ${action.toLowerCase()} successfully`, 'success')
      
      // Remove from list after delay
      setTimeout(() => {
        setReports(prev => prev.filter(x => x.id !== id))
      }, 600)
      
    } catch (error) {
      notify('Failed to process report', 'error')
      // Revert optimistic update
      setReports(initialReports)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.bridge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.auditor.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'critical': return '#DC2626'
      case 'high': return '#F97316'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return '#64748B'
    }
  }

  const getPriorityIcon = (priority) => {
    switch(priority.toLowerCase()) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '📋'
      case 'low': return '📝'
      default: return '📄'
    }
  }

  return (
    <div className="page-full" style={{
      display: 'flex',
      background: '#F8FAFC',
      minHeight: '100vh'
    }}>
      <Sidebar open={asideOpen} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Topbar onToggle={() => setAsideOpen(v => !v)} />
        
        <div className="container" style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                color: '#1E293B',
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Reports Oversight
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748B',
                fontSize: '14px'
              }}>
                Review and approve bridge inspection reports from field inspectors
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'rgba(15, 118, 110, 0.1)',
                color: '#0F766E',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {reports.length} Pending Reports
              </span>
            </div>
          </div>

          <Toast msg={toast?.msg} type={toast?.type} />

          {/* Filters */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Search Reports
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8'
                  }}>
                    🔍
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by bridge, auditor, or content..."
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Priority Filter
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Status Filter
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#64748B',
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '12px',
                    color: '#64748B',
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {filteredReports.map(report => (
              <div 
                key={report.id} 
                className={`card ${report.status !== 'Pending' ? 'fading' : ''}`} 
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.3s ease',
                  transform: report.status !== 'Pending' ? 'translateX(100px)' : 'translateX(0)',
                  opacity: report.status !== 'Pending' ? 0 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(15, 118, 110, 0.1)',
                        color: '#0F766E',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        <span>🌉</span>
                        {report.bridge}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3B82F6',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {report.bridgeId}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: getPriorityColor(report.priority) + '20',
                        color: getPriorityColor(report.priority),
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getPriorityIcon(report.priority)} {report.priority} Priority
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '15px',
                        color: '#475569',
                        lineHeight: '1.6'
                      }}>
                        {report.summary}
                      </p>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                          <span>👤</span> Auditor
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                          {report.auditor}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                          <span>📋</span> Category
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                          {report.category}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                          <span>💰</span> Estimated Cost
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                          NPR {report.estimatedCost}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                          <span>⏱️</span> Estimated Time
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                          {report.estimatedTime}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#64748B'
                    }}>
                      <span>📅 Submitted: {report.submitted}</span>
                      <span>📝 Status: {report.status}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginLeft: '24px'
                  }}>
                    <button
                      onClick={() => handleAction(report.id, 'Approved')}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '120px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span>✓</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'Declined')}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '120px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span>✗</span>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div style={{
                background: 'white',
                padding: '48px 24px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  📋
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  No Reports Found
                </h3>
                <p style={{
                  margin: 0,
                  color: '#64748B',
                  fontSize: '14px'
                }}>
                  {searchTerm || filterPriority !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'All reports have been reviewed. Great work!'}
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1E293B'
            }}>
              Reports Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {[
                { label: 'Total Pending', value: reports.length, icon: '📋', color: '#F59E0B' },
                { label: 'Critical Priority', value: reports.filter(r => r.priority === 'Critical').length, icon: '🚨', color: '#DC2626' },
                { label: 'High Priority', value: reports.filter(r => r.priority === 'High').length, icon: '⚠️', color: '#F97316' },
                { label: 'Medium Priority', value: reports.filter(r => r.priority === 'Medium').length, icon: '📋', color: '#F59E0B' },
                { label: 'Low Priority', value: reports.filter(r => r.priority === 'Low').length, icon: '📝', color: '#10B981' },
                { label: 'Today\'s Reports', value: reports.filter(r => r.submitted.includes('2026-01-30')).length, icon: '📅', color: '#3B82F6' },
              ].map((stat, index) => (
                <div key={index} style={{
                  background: stat.color + '10',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${stat.color}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: stat.color + '20',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
        
        .fading {
          animation: fadeOut 0.6s ease forwards;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #0F766E !important;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
        }
        
        @media (max-width: 1024px) {
          .container {
            padding: 16px !important;
          }
          
          div[style*="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: flex; justify-content: space-between; align-items: flex-start"] {
            flex-direction: column !important;
            gap: 20px !important;
          }
          
          div[style*="margin-left: 24px"] {
            margin-left: 0 !important;
            margin-top: 16px !important;
            flex-direction: row !important;
            justify-content: center !important;
          }
        }
        
        @media (max-width: 768px) {
          div[style*="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          button[style*="min-width: 120px"] {
            min-width: 100px !important;
            padding: 10px 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*="display: grid; grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: flex; justify-content: space-between; align-items: center"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}