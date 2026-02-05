import React, { useContext, useState, useEffect } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from "../lib/api";

export default function Admin(){
  const { bridges } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [mlLogs, setMlLogs] = useState([])

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  // Load real data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load reports from localStorage
        const storedReports = localStorage.getItem('bqi_reports')
        if (storedReports) {
          const parsedReports = JSON.parse(storedReports)
          setReports(parsedReports)
        }

        // Load users from API
        try {
          const usersData = await api.getUsers()
          setUsers(usersData)
        } catch (error) {
          console.warn('Using localStorage users due to API error:', error.message)
          // Fallback to localStorage
          const storedUsers = localStorage.getItem('bqi_users')
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers))
          }
        }

        // Load ML logs from API
        try {
          const logs = await api.getMLLogs()
          setMlLogs(logs)
        } catch (error) {
          console.warn('No ML logs available:', error.message)
          setMlLogs([])
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  // Calculate real metrics
  const totalBridges = bridges.length
  const totalUsers = users.length
  const pendingReports = reports.filter(r => r.status === 'Pending').length
  const approvedReports = reports.filter(r => r.status === 'Approved').length
  const declinedReports = reports.filter(r => r.status === 'Declined').length
  const totalReports = reports.length

  // Bridge health metrics
  const avgBQI = bridges.length > 0 
    ? Math.round(bridges.reduce((sum, b) => sum + (b.bqi || 0), 0) / bridges.length)
    : 0
  
  const criticalBridges = bridges.filter(b => (b.bqi || 0) < 40).length
  const goodBridges = bridges.filter(b => (b.bqi || 0) >= 70).length
  const fairBridges = bridges.filter(b => (b.bqi || 0) >= 40 && (b.bqi || 0) < 70).length

  // Bridge health distribution for chart
  const healthDistribution = {
    EXCELLENT: bridges.filter(b => (b.bqi || 0) >= 80).length,
    GOOD: bridges.filter(b => (b.bqi || 0) >= 60 && (b.bqi || 0) < 80).length,
    FAIR: bridges.filter(b => (b.bqi || 0) >= 40 && (b.bqi || 0) < 60).length,
    POOR: bridges.filter(b => (b.bqi || 0) >= 20 && (b.bqi || 0) < 40).length,
    CRITICAL: bridges.filter(b => (b.bqi || 0) < 20).length
  }

  // Recent reports (last 5)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.submitted || b.timestamp) - new Date(a.submitted || a.timestamp))
    .slice(0, 5)

  // Recent users (last 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.lastLogin || b.createdAt) - new Date(a.lastLogin || a.createdAt))
    .slice(0, 5)

  // Function to trigger data refresh
  const refreshData = () => {
    window.dispatchEvent(new CustomEvent('bqi-data-updated'))
    window.location.reload()
  }

  return (
    <div className="page-full" style={{
      display: 'flex',
      background: '#F8FAFC',
      minHeight: '100vh'
    }}>
      <Sidebar open={asideOpen} />
      <div style={{flex: 1, overflow: 'auto'}}>
        <Topbar onToggle={() => setAsideOpen(v => !v)} />
        
        <div className="container" style={{padding: '24px'}}>
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
                Admin Dashboard
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748B',
                fontSize: '14px'
              }}>
                Monitor bridge health, user activity, and system analytics
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={refreshData}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(15, 118, 110, 0.1)',
                  color: '#0F766E',
                  border: '1px solid rgba(15, 118, 110, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {[
              { 
                title: 'Total Bridges', 
                value: totalBridges, 
                icon: '🌉', 
                color: '#0F766E', 
                desc: 'Monitored bridges',
                change: bridges.length > 0 ? '+Active' : 'No data'
              },
              { 
                title: 'Average BQI', 
                value: avgBQI || 'N/A', 
                icon: '📊', 
                color: '#3B82F6', 
                desc: 'Overall health score',
                change: avgBQI > 70 ? '+Good' : avgBQI > 40 ? '+Fair' : '+Needs Attention'
              },
              { 
                title: 'Critical Bridges', 
                value: criticalBridges, 
                icon: '⚠️', 
                color: '#DC2626', 
                desc: 'BQI < 40',
                change: criticalBridges > 0 ? '+Needs Action' : '+All Good'
              },
              { 
                title: 'Total Users', 
                value: totalUsers, 
                icon: '👥', 
                color: '#8B5CF6', 
                desc: 'Registered users',
                change: totalUsers > 0 ? '+Active' : 'No users'
              },
              { 
                title: 'Pending Reports', 
                value: pendingReports, 
                icon: '📋', 
                color: '#F59E0B', 
                desc: 'Awaiting review',
                change: pendingReports > 0 ? '+Action Required' : '+All Caught Up'
              },
              { 
                title: 'Total Reports', 
                value: totalReports, 
                icon: '📈', 
                color: '#10B981', 
                desc: 'All submissions',
                change: totalReports > 0 ? '+Submitted' : 'No reports'
              },
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                transition: 'transform 0.3s ease'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                      {stat.title}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `${stat.color}15`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                    {stat.desc}
                  </div>
                  <div style={{ fontSize: '12px', color: stat.change.includes('Good') || stat.change.includes('Caught') ? '#10B981' : '#F59E0B' }}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Recent Reports */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  Recent Reports
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#64748B',
                  background: '#F8FAFC',
                  padding: '6px 12px',
                  borderRadius: '20px'
                }}>
                  {pendingReports} Pending
                </div>
              </div>
              
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {recentReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
                    No reports yet
                  </div>
                ) : (
                  recentReports.map(report => (
                    <div 
                      key={report.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>
                            {report.title || 'Untitled Report'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                            {report.bridge || report.bridgeId || 'Unknown Bridge'}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          background: report.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 
                                     report.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                     'rgba(239, 68, 68, 0.1)',
                          color: report.status === 'Pending' ? '#D97706' : 
                                 report.status === 'Approved' ? '#059669' : '#DC2626',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {report.status}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                        <span>By: {report.userName || report.auditor || 'Anonymous'}</span>
                        <span>{report.date ? new Date(report.date).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {reports.length > 5 && (
                <button 
                  onClick={() => window.location.href = '/admin/reports'}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    background: 'transparent',
                    color: '#0F766E',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#0F766E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  View All Reports
                </button>
              )}
            </div>

            {/* Bridge Health Summary */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  Bridge Health Summary
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#64748B',
                  background: '#F8FAFC',
                  padding: '6px 12px',
                  borderRadius: '20px'
                }}>
                  {totalBridges} Bridges
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                {Object.entries(healthDistribution).map(([status, count]) => {
                  const percentage = totalBridges > 0 ? Math.round((count / totalBridges) * 100) : 0
                  const getColor = (status) => {
                    switch(status) {
                      case 'EXCELLENT': return '#10B981'
                      case 'GOOD': return '#22C55E'
                      case 'FAIR': return '#F59E0B'
                      case 'POOR': return '#F97316'
                      case 'CRITICAL': return '#DC2626'
                      default: return '#64748B'
                    }
                  }
                  
                  return (
                    <div key={status} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            background: getColor(status),
                            borderRadius: '2px'
                          }}></div>
                          <span style={{ fontSize: '14px', color: '#1E293B' }}>{status}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                          {count} ({percentage}%)
                        </div>
                      </div>
                      <div style={{
                        height: '8px',
                        background: '#E2E8F0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: getColor(status),
                          borderRadius: '4px',
                          transition: 'width 1s ease'
                        }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{goodBridges}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Good</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>{fairBridges}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Fair</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#DC2626' }}>{criticalBridges}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Critical</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                Recent Users
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#64748B',
                background: '#F8FAFC',
                padding: '6px 12px',
                borderRadius: '20px'
              }}>
                {totalUsers} Total Users
              </div>
            </div>
            
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {recentUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>👤</div>
                  No users found
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1E293B' }}>
                                {user.name || 'Anonymous User'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#64748B' }}>
                          {user.email || 'No email'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: user.role === 'admin' ? 'rgba(15, 118, 110, 0.1)' : 
                                       user.role === 'inspector' ? 'rgba(59, 130, 246, 0.1)' : 
                                       'rgba(139, 92, 246, 0.1)',
                            color: user.role === 'admin' ? '#0F766E' : 
                                   user.role === 'inspector' ? '#3B82F6' : '#8B5CF6',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#64748B' }}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {users.length > 5 && (
              <button 
                onClick={() => window.location.href = '/admin/users'}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  background: 'transparent',
                  color: '#0F766E',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#0F766E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                View All Users
              </button>
            )}
          </div>

          {/* System Status */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
              System Status
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {[
                { 
                  label: 'API Status', 
                  status: 'Online', 
                  color: '#10B981',
                  icon: '🔗',
                  details: 'Connected to backend'
                },
                { 
                  label: 'Database', 
                  status: localStorage.getItem('bqi_reports') ? 'Online' : 'Offline', 
                  color: localStorage.getItem('bqi_reports') ? '#10B981' : '#DC2626',
                  icon: '💾',
                  details: localStorage.getItem('bqi_reports') ? 'Local storage active' : 'No data'
                },
                { 
                  label: 'Bridge Data', 
                  status: bridges.length > 0 ? 'Loaded' : 'No Data', 
                  color: bridges.length > 0 ? '#10B981' : '#F59E0B',
                  icon: '🌉',
                  details: `${bridges.length} bridges loaded`
                },
                { 
                  label: 'Reports System', 
                  status: reports.length > 0 ? 'Active' : 'Inactive', 
                  color: reports.length > 0 ? '#10B981' : '#64748B',
                  icon: '📋',
                  details: `${reports.length} reports stored`
                },
              ].map((item, index) => (
                <div key={index} style={{
                  padding: '20px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: `1px solid ${item.color}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${item.color}20`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: item.color
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#64748B' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: item.color }}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}