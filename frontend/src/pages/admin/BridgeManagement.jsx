import React, { useContext, useState, useEffect } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'
import api from '../../lib/api'
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

export default function BridgeManagement() {
  const { 
    bridges, 
    addBridge,
    refreshBridges,
    isLoading: contextLoading,
    apiConnected
  } = useContext(BridgesContext)
  
  const [form, setForm] = useState({ 
    name: '', 
    latitude: '', 
    longitude: '',
    status: 'EXCELLENT' // Default status from API options
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [asideOpen, setAsideOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  const validateForm = () => {
    if (!form.name.trim()) return 'Bridge name is required'
    if (!form.latitude || isNaN(parseFloat(form.latitude))) return 'Valid latitude is required'
    if (!form.longitude || isNaN(parseFloat(form.longitude))) return 'Valid longitude is required'
    
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (lat < 26.3 || lat > 30.5) return 'Latitude must be within Nepal bounds (26.3° to 30.5°)'
    if (lng < 80.0 || lng > 88.3) return 'Longitude must be within Nepal bounds (80.0° to 88.3°)'
    
    return ''
  }

  const save = async () => {
    const validationError = validateForm()
    if (validationError) {
      setToast({ msg: validationError, type: 'error' })
      return
    }

    try {
      setLocalLoading(true)
      
      // POST only name, latitude, longitude — backend provides bqi/status
      await addBridge({
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      })
      setToast({ msg: 'Bridge created successfully', type: 'success' })
      
      setForm({ 
        name: '', 
        latitude: '', 
        longitude: '',
        status: 'EXCELLENT'
      })
      
      if (refreshBridges) {
        await refreshBridges()
      }
      
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
      
    } catch (error) {
      console.error('Error saving bridge:', error)
      setToast({ 
        msg: `Failed to save bridge: ${error.message || 'Please check bridge name uniqueness'}`,
        type: 'error' 
      })
    } finally {
      setLocalLoading(false)
    }
  }

  // Fetch latest per-bridge details (bqi, status) from API by id
  const [bridgeDetails, setBridgeDetails] = useState({})

  // Get status color based on API status
  const getStatusColor = (status) => {
    const statusStr = (status || '').toString().toUpperCase()
    switch(statusStr) {
      case 'EXCELLENT': return '#10B981'
      case 'GOOD': return '#22C55E'
      case 'FAIR': return '#F59E0B'
      case 'POOR': return '#EF4444'
      case 'CRITICAL': return '#DC2626'
      default: return '#64748B'
    }
  }

  // Get BQI color based on value
  const getBQIColor = (bqi) => {
    if (bqi === null || bqi === undefined) return '#64748B'
    if (bqi >= 80) return '#10B981' // Excellent
    if (bqi >= 70) return '#22C55E' // Good
    if (bqi >= 60) return '#F59E0B' // Fair
    if (bqi >= 50) return '#EF4444' // Poor
    return '#DC2626' // Critical
  }

  // Group bridges by ID and get latest (in case of duplicates)
  const getLatestBridges = () => {
    const bridgeMap = new Map()
    
    bridges.forEach(bridge => {
      if (bridge.id) {
        if (!bridgeMap.has(bridge.id)) {
          bridgeMap.set(bridge.id, bridge)
        } else {
          // If we need to handle multiple entries with same ID, keep the latest
          const existing = bridgeMap.get(bridge.id)
          bridgeMap.set(bridge.id, bridge) // Simple: keep current one
        }
      }
    })
    
    return Array.from(bridgeMap.values())
  }

  const latestBridges = getLatestBridges()
  
  const filteredBridges = latestBridges.filter(bridge => {
    const matchesSearch = searchTerm === '' || 
      bridge.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bridge.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Prefer API-fetched status when available
    const mergedStatus = (bridgeDetails[bridge.id] && bridgeDetails[bridge.id].status) || bridge.status || ''
    const matchesStatus = statusFilter === 'all' || mergedStatus.toString().toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const isLoading = contextLoading || localLoading

  // Fetch per-bridge details (bqi/status) after latestBridges is available
  useEffect(() => {
    let mounted = true
    const ids = latestBridges.map(b => b.id).filter(Boolean)
    if (ids.length === 0) return

    const fetchAll = async () => {
      try {
        const promises = ids.map(id => api.getBridge(id).then(data => ({ id, data })).catch(() => ({ id, data: null })))
        const results = await Promise.all(promises)
        if (!mounted) return
        setBridgeDetails(prev => {
          const next = { ...prev }
          results.forEach(r => { if (r.data) next[r.id] = r.data })
          return next
        })
      } catch (e) {
        console.error('Failed to fetch bridge details:', e)
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [latestBridges])

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
          <Toast msg={toast?.msg} type={toast?.type} />

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
                Bridge Management
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748B',
                fontSize: '14px'
              }}>
                {isLoading ? 'Loading...' : `Viewing ${latestBridges.length} bridges`}
                {!apiConnected && (
                  <span style={{ 
                    marginLeft: '8px', 
                    color: '#F59E0B',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    (Offline Mode)
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={() => setForm({ name: '', latitude: '', longitude: '', status: 'EXCELLENT' })}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: isLoading ? '#CBD5E1' : 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <span>🌉</span>
              {isLoading ? 'Loading...' : 'Add New Bridge'}
            </button>
          </div>

          {/* Main Content */}
          <div className="bridge-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '24px'
          }}>
            {/* Left Column: Bridges List */}
            <div>
              {/* Filters */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1E293B'
                    }}>
                      Search Bridges
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
                        placeholder="Search by name or ID..."
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 40px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          background: isLoading ? '#F1F5F9' : '#F8FAFC',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          opacity: isLoading ? 0.7 : 1
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
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: isLoading ? '#F1F5F9' : '#F8FAFC',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bridges List */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1E293B'
                  }}>
                    Bridges ({filteredBridges.length})
                  </h3>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    Unique: {latestBridges.length}
                  </div>
                </div>

                <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                  {isLoading && latestBridges.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#94A3B8'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🌉</div>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        Loading bridges...
                      </p>
                    </div>
                  ) : filteredBridges.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#94A3B8'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🌉</div>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No bridges match your search criteria' 
                          : 'No bridges in the system yet. Add your first bridge!'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredBridges.map(bridge => {
                        const mergedBqi = (bridgeDetails[bridge.id] && bridgeDetails[bridge.id].bqi) ?? bridge.bqi
                        const mergedStatus = (bridgeDetails[bridge.id] && bridgeDetails[bridge.id].status) ?? bridge.status
                        const statusColor = getStatusColor(mergedStatus)
                        const bqiColor = getBQIColor(mergedBqi)
                        
                        return (
                          <div 
                            key={bridge.id} 
                            style={{
                              padding: '16px',
                              background: '#F8FAFC',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0',
                              transition: 'all 0.3s ease',
                              borderLeft: `4px solid ${statusColor}`
                            }}
                            onMouseEnter={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <div className="bridge-card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                                    {bridge.name}
                                  </h4>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: statusColor + '20',
                                    color: statusColor,
                                    padding: '4px 8px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                  }}>
                                    {(bridgeDetails[bridge.id] && bridgeDetails[bridge.id].status) || bridge.status || 'UNKNOWN'}
                                  </div>
                                </div>
                                
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px', color: '#64748B' }}>🆔</span>
                                    <span style={{ fontSize: '14px', color: '#475569' }}>
                                      {bridge.id || 'No ID'}
                                    </span>
                                  </div>
                                  
                                  {(mergedBqi !== undefined && mergedBqi !== null) && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: getBQIColor(mergedBqi) + '20',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#1E293B',
                                        border: `1px solid ${getBQIColor(mergedBqi)}`
                                      }}>
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          background: getBQIColor(mergedBqi),
                                          marginRight: '4px'
                                        }}></div>
                                        <span style={{ fontWeight: '600', color: getBQIColor(mergedBqi) }}>
                                          BQI: {mergedBqi}
                                        </span>
                                      </div>
                                  )}
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Coordinates</div>
                                    <div style={{ fontSize: '13px', color: '#475569' }}>
                                      {`${bridge.latitude ? bridge.latitude.toFixed(6) : 'N/A'}, ${bridge.longitude ? bridge.longitude.toFixed(6) : 'N/A'}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Bridge Form */}
            <div>
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                position: 'sticky',
                top: '24px'
              }}>
                <h3 style={{
                  margin: '0 0 24px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>
                    🌉
                  </span>
                  Add New Bridge
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Bridge Name *</label>
                    <input 
                      type="text" 
                      value={form.name} 
                      onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
                      placeholder="Enter unique bridge name" 
                      required 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0', 
                        background: isLoading ? '#F1F5F9' : '#F8FAFC', 
                        fontSize: '14px', 
                        outline: 'none', 
                        transition: 'all 0.3s ease',
                        opacity: isLoading ? 0.7 : 1
                      }} 
                    />
                    <small style={{ display: 'block', marginTop: '4px', color: '#94A3B8' }}>
                      Bridge name must be unique
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Latitude *</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={form.latitude} 
                      onChange={(e) => setForm(f => ({...f, latitude: e.target.value}))} 
                      placeholder="27.717245" 
                      required 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0', 
                        background: isLoading ? '#F1F5F9' : '#F8FAFC', 
                        fontSize: '14px', 
                        outline: 'none',
                        opacity: isLoading ? 0.7 : 1
                      }} 
                    />
                    <small style={{ display: 'block', marginTop: '4px', color: '#94A3B8' }}>
                      Must be within Nepal: 26.3° to 30.5°
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Longitude *</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={form.longitude} 
                      onChange={(e) => setForm(f => ({...f, longitude: e.target.value}))} 
                      placeholder="85.323959" 
                      required 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0', 
                        background: isLoading ? '#F1F5F9' : '#F8FAFC', 
                        fontSize: '14px', 
                        outline: 'none',
                        opacity: isLoading ? 0.7 : 1
                      }} 
                    />
                    <small style={{ display: 'block', marginTop: '4px', color: '#94A3B8' }}>
                      Must be within Nepal: 80.0° to 88.3°
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Initial Status</label>
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm(f => ({...f, status: e.target.value}))} 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0', 
                        background: isLoading ? '#F1F5F9' : '#F8FAFC', 
                        fontSize: '14px', 
                        outline: 'none', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                      }}
                    >
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <small style={{ display: 'block', marginTop: '4px', color: '#94A3B8' }}>
                      BQI will be calculated by the backend
                    </small>
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button 
                      onClick={save} 
                      disabled={isLoading}
                      style={{ 
                        padding: '12px 24px', 
                        background: isLoading ? '#CBD5E1' : 'linear-gradient(135deg, #0F766E, #3B82F6)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8box', 
                        fontWeight: '600', 
                        cursor: isLoading ? 'not-allowed' : 'pointer', 
                        flex: 2, 
                        transition: 'all 0.3s ease',
                        opacity: isLoading ? 0.7 : 1
                      }} 
                      onMouseEnter={(e) => { 
                        if (!isLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)'; 
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)'; 
                        }
                      }} 
                      onMouseLeave={(e) => { 
                        if (!isLoading) {
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.boxShadow = 'none'; 
                        }
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Create Bridge'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .page-mounted {
          animation: fadeIn 0.6s ease;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #0F766E !important;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
        }
        
        @media (max-width: 1200px) {
          .bridge-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 16px !important;
          }
          
          .bridge-grid {
            grid-template-columns: 1fr !important;
          }

          .bridge-card-row {
            flex-direction: column !important;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}