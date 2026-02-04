import React, { useContext, useState, useEffect } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'
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
  const { bridges, addBridge, updateBridge, deleteBridge } = useContext(BridgesContext)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ 
    name: '', 
    location: '', 
    city: '', 
    region: '',
    bridgeId: '',
    lat: '', 
    lng: '', 
    bqi: 75,
    yearBuilt: new Date().getFullYear(),
    length: '',
    width: '',
    status: 'active',
    description: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [asideOpen, setAsideOpen] = useState(false)

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  const startCreate = () => { 
    setEditing(null); 
    setForm({ 
      name: '', 
      location: '', 
      city: '', 
      region: '',
      bridgeId: '',
      lat: '', 
      lng: '', 
      bqi: 75,
      yearBuilt: new Date().getFullYear(),
      length: '',
      width: '',
      status: 'active',
      description: ''
    }) 
  }

  const startEdit = (b) => { 
    setEditing(b.id); 
    setForm({ 
      name: b.name || '', 
      location: b.location || '', 
      city: b.city || '', 
      region: b.region || '',
      bridgeId: b.bridgeId || '',
      lat: b.lat || '', 
      lng: b.lng || '', 
      bqi: b.bqi || 75,
      yearBuilt: b.yearBuilt || new Date().getFullYear(),
      length: b.length || '',
      width: b.width || '',
      status: b.status || 'active',
      description: b.description || ''
    }) 
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Bridge name is required'
    if (!form.lat || isNaN(parseFloat(form.lat))) return 'Valid latitude is required'
    if (!form.lng || isNaN(parseFloat(form.lng))) return 'Valid longitude is required'
    if (form.bqi < 0 || form.bqi > 100) return 'BQI must be between 0 and 100'
    if (form.yearBuilt < 1800 || form.yearBuilt > new Date().getFullYear()) return 'Invalid year built'
    return ''
  }

  const save = async () => {
    const validationError = validateForm()
    if (validationError) {
      setToast({ msg: validationError, type: 'error' })
      return
    }

    try {
      const payload = { 
        id: editing || ('bqi-' + Date.now()), 
        name: form.name, 
        location: form.location,
        city: form.city,
        region: form.region,
        bridgeId: form.bridgeId || `BQI-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        lat: parseFloat(form.lat), 
        lng: parseFloat(form.lng), 
        bqi: parseInt(form.bqi || 0), 
        yearBuilt: parseInt(form.yearBuilt),
        length: parseFloat(form.length) || null,
        width: parseFloat(form.width) || null,
        status: form.status,
        description: form.description,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        sensors: [],
        inspections: []
      }
      
      if (editing) { 
        await updateBridge(editing, payload)
        setToast({ msg: 'Bridge updated successfully', type: 'success' })
      } else { 
        await addBridge(payload)
        setToast({ msg: 'Bridge created successfully', type: 'success' })
      }
      
      setEditing(null)
      setForm({ 
        name: '', 
        location: '', 
        city: '', 
        region: '',
        bridgeId: '',
        lat: '', 
        lng: '', 
        bqi: 75,
        yearBuilt: new Date().getFullYear(),
        length: '',
        width: '',
        status: 'active',
        description: ''
      })
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
    } catch (error) {
      setToast({ msg: 'Failed to save bridge', type: 'error' })
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bridge? This action cannot be undone.')) return
    
    try {
      await deleteBridge(id)
      setToast({ msg: 'Bridge deleted successfully', type: 'success' })
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
    } catch (error) {
      setToast({ msg: 'Failed to delete bridge', type: 'error' })
    }
  }

  const getBQIColor = (bqi) => {
    if (bqi >= 80) return '#10B981'
    if (bqi >= 60) return '#F59E0B'
    if (bqi >= 40) return '#F97316'
    return '#DC2626'
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10B981'
      case 'maintenance': return '#F59E0B'
      case 'inactive': return '#64748B'
      case 'critical': return '#DC2626'
      default: return '#64748B'
    }
  }

  const filteredBridges = bridges.filter(bridge => {
    const matchesSearch = searchTerm === '' || 
      bridge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bridge.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bridge.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || bridge.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
                Add, edit, and manage bridge information in the system
              </p>
            </div>
            
            <button
              onClick={startCreate}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>🌉</span>
              Add New Bridge
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
                        placeholder="Search by name, location, or city..."
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
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
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
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
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
                    Total: {bridges.length}
                  </div>
                </div>

                <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                  {filteredBridges.length === 0 ? (
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
                      {filteredBridges.map(bridge => (
                        <div 
                          key={bridge.id} 
                          style={{
                            padding: '16px',
                            background: '#F8FAFC',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            borderLeft: `4px solid ${getBQIColor(bridge.bqi)}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onClick={() => startEdit(bridge)}
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
                                  background: getStatusColor(bridge.status) + '20',
                                  color: getStatusColor(bridge.status),
                                  padding: '4px 8px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textTransform: 'capitalize'
                                }}>
                                  {bridge.status}
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', color: '#64748B' }}>📍</span>
                                  <span style={{ fontSize: '14px', color: '#475569' }}>
                                    {bridge.location || 'No location'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', color: '#64748B' }}>🏙️</span>
                                  <span style={{ fontSize: '14px', color: '#475569' }}>
                                    {bridge.city || 'No city'}
                                  </span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>BQI Score</div>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: getBQIColor(bridge.bqi) + '20',
                                    color: getBQIColor(bridge.bqi),
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: '700'
                                  }}>
                                    {bridge.bqi}/100
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Coordinates</div>
                                  <div style={{ fontSize: '13px', color: '#475569' }}>
                                    {bridge.lat.toFixed(6)}, {bridge.lng.toFixed(6)}
                                  </div>
                                </div>
                                {bridge.yearBuilt && (
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Year Built</div>
                                    <div style={{ fontSize: '13px', color: '#475569' }}>
                                      {bridge.yearBuilt}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="bridge-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEdit(bridge)
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#3B82F6',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  remove(bridge.id)
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#DC2626',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                    {editing ? '✏️' : '🌉'}
                  </span>
                  {editing ? 'Edit Bridge' : 'Add New Bridge'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Basic Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1E293B',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #F1F5F9'
                    }}>
                      Basic Information
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Bridge Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                          placeholder="Enter bridge name"
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Bridge ID
                        </label>
                        <input
                          type="text"
                          value={form.bridgeId}
                          onChange={(e) => setForm(f => ({...f, bridgeId: e.target.value}))}
                          placeholder="Auto-generated if empty"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm(f => ({...f, description: e.target.value}))}
                          placeholder="Enter bridge description"
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1E293B',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #F1F5F9'
                    }}>
                      Location Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Location
                        </label>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm(f => ({...f, location: e.target.value}))}
                          placeholder="Street/Area"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          City
                        </label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => setForm(f => ({...f, city: e.target.value}))}
                          placeholder="City name"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={form.lat}
                          onChange={(e) => setForm(f => ({...f, lat: e.target.value}))}
                          placeholder="27.717245"
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={form.lng}
                          onChange={(e) => setForm(f => ({...f, lng: e.target.value}))}
                          placeholder="85.323959"
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1E293B',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #F1F5F9'
                    }}>
                      Technical Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          BQI Score *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={form.bqi}
                            onChange={(e) => setForm(f => ({...f, bqi: e.target.value}))}
                            style={{
                              width: '100%',
                              height: '6px',
                              borderRadius: '3px',
                              background: `linear-gradient(to right, #DC2626, #F97316, #F59E0B, #10B981)`,
                              outline: 'none'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            right: '0',
                            top: '-25px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: getBQIColor(form.bqi),
                            background: '#F8FAFC',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            border: `1px solid ${getBQIColor(form.bqi)}`
                          }}>
                            {form.bqi}/100
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Year Built
                        </label>
                        <input
                          type="number"
                          min="1800"
                          max={new Date().getFullYear()}
                          value={form.yearBuilt}
                          onChange={(e) => setForm(f => ({...f, yearBuilt: e.target.value}))}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Length (m)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.length}
                          onChange={(e) => setForm(f => ({...f, length: e.target.value}))}
                          placeholder="Length in meters"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Width (m)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.width}
                          onChange={(e) => setForm(f => ({...f, width: e.target.value}))}
                          placeholder="Width in meters"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          Status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm(f => ({...f, status: e.target.value}))}
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
                          <option value="active">Active</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="inactive">Inactive</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    {editing && (
                      <button
                        onClick={() => {
                          setEditing(null)
                          setForm({ 
                            name: '', 
                            location: '', 
                            city: '', 
                            region: '',
                            bridgeId: '',
                            lat: '', 
                            lng: '', 
                            bqi: 75,
                            yearBuilt: new Date().getFullYear(),
                            length: '',
                            width: '',
                            status: 'active',
                            description: ''
                          })
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'rgba(100, 116, 139, 0.1)',
                          color: '#64748B',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={save}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: editing ? 1 : 2,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {editing ? 'Update Bridge' : 'Create Bridge'}
                    </button>
                  </div>
                </div>
              </div>
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
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0F766E;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0F766E;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
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

          .bridge-actions {
            margin-left: 0 !important;
            flex-direction: row !important;
            justify-content: flex-end;
            gap: 8px;
          }
          .bridge-actions button {
            flex: 1 0 auto;
          }
        }
      `}</style>
    </div>
  )
}