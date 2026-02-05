import React, { useContext, useEffect, useState } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'

export default function Dashboard() {
  const { bridges, user } = useContext(BridgesContext)
  const [userReports, setUserReports] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Load user-specific reports
    const loadUserReports = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('bqi_user') || '{}')
        const userEmail = currentUser.email
        
        if (!userEmail) return

        const allReports = JSON.parse(localStorage.getItem('bqi_reports') || '[]')
        const userSpecificReports = allReports.filter(report => report.userEmail === userEmail)
        
        setUserReports(userSpecificReports)

        // Generate notifications from user reports
        const userNotifications = []
        
        // Check for recent report updates
        userSpecificReports.forEach(report => {
          if (report.status === 'Approved') {
            userNotifications.push({
              id: report.id,
              text: `Your report "${report.title}" was approved`,
              time: report.adminActionDate ? new Date(report.adminActionDate).toLocaleDateString() : 'Recently',
              type: 'success',
              icon: '✅'
            })
          } else if (report.status === 'Declined') {
            userNotifications.push({
              id: report.id,
              text: `Your report "${report.title}" was declined`,
              time: report.adminActionDate ? new Date(report.adminActionDate).toLocaleDateString() : 'Recently',
              type: 'error',
              icon: '❌'
            })
          }
        })

        // Add pending reports notification
        const pendingCount = userSpecificReports.filter(r => r.status === 'Pending').length
        if (pendingCount > 0) {
          userNotifications.push({
            id: 'pending',
            text: `You have ${pendingCount} report${pendingCount > 1 ? 's' : ''} pending review`,
            time: 'Currently',
            type: 'warning',
            icon: '⏳'
          })
        }

        setNotifications(userNotifications.slice(0, 4))
      } catch (error) {
        console.error('Error loading user reports:', error)
      }
    }

    loadUserReports()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '🌅 Good Morning'
    if (h < 18) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  const displayName = () => {
    const email = user?.email || 'user'
    const name = email.split('@')[0] || 'user'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Calculate user-specific statistics
  const totalReports = userReports.length
  const pendingReports = userReports.filter(r => r.status === 'Pending').length
  const approvedReports = userReports.filter(r => r.status === 'Approved').length
  const declinedReports = userReports.filter(r => r.status === 'Declined').length

  // Get unique bridges the user has reported on
  const uniqueBridgeIds = new Set(userReports.map(r => r.bridgeId).filter(id => id))
  const bridgesVisited = uniqueBridgeIds.size

  // Bridge health summary for user's reported bridges
  const userBridgeHealth = {}
  userReports.forEach(report => {
    if (report.bridgeId) {
      const bridge = bridges.find(b => b.id === report.bridgeId)
      if (bridge && bridge.bqi) {
        userBridgeHealth[report.bridgeId] = {
          name: bridge.name || report.bridge,
          bqi: bridge.bqi,
          status: bridge.status || (bridge.bqi >= 80 ? 'EXCELLENT' : 
                                  bridge.bqi >= 60 ? 'GOOD' : 
                                  bridge.bqi >= 40 ? 'FAIR' : 
                                  bridge.bqi >= 20 ? 'POOR' : 'CRITICAL')
        }
      }
    }
  })

  const dailyTips = [
    '🔍 Inspect bridge joints regularly for cracks and wear.',
    '⚠️ Avoid overloading bridges beyond posted weight limits.',
    '📱 Report unusual vibrations or noises immediately via app.',
    '💧 Keep drainage clear to prevent scour at foundations.',
    '📸 Document and photograph defects from a safe distance.',
    '🛡️ Always wear proper safety gear during inspections.',
    '📊 Monitor BQI scores monthly for trend analysis.',
    '🚧 Check for vegetation growth near abutments regularly.'
  ]

  const getRandomTip = () => {
    return dailyTips[Math.floor(Math.random() * dailyTips.length)]
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#10B981'
      case 'error': return '#EF4444'
      case 'warning': return '#F59E0B'
      case 'info': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const getBQIColor = (bqi) => {
    if (bqi >= 80) return '#10B981'
    if (bqi >= 60) return '#22C55E'
    if (bqi >= 40) return '#F59E0B'
    if (bqi >= 20) return '#F97316'
    return '#DC2626'
  }

  return (
    <div className="page-full page-mounted" style={{ 
      padding: '32px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px', 
              fontSize: '32px', 
              fontWeight: '700',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>{greeting().split(' ')[0]}</span>
              {greeting().split(' ').slice(1).join(' ')}, {displayName()}!
            </h1>
            <p style={{ 
              margin: '0', 
              color: '#6B7280',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📅</span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => window.location.href = '/user/reports'}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(31, 111, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📋 View My Reports
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {[
          {
            title: 'Total Reports',
            value: totalReports,
            icon: '📋',
            color: '#3B82F6',
            change: 'Submitted',
            desc: 'All your reports'
          },
          {
            title: 'Pending Review',
            value: pendingReports,
            icon: '⏳',
            color: '#F59E0B',
            change: 'Awaiting',
            desc: 'Awaiting admin review'
          },
          {
            title: 'Approved',
            value: approvedReports,
            icon: '✅',
            color: '#10B981',
            change: 'Accepted',
            desc: 'Approved reports'
          },
          {
            title: 'Bridges Visited',
            value: bridgesVisited,
            icon: '🌉',
            color: '#8B5CF6',
            change: 'Monitored',
            desc: 'Unique bridges reported'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${stat.color}20`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 8px 30px ${stat.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: `${stat.color}10`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              opacity: 0.5
            }}>
              {stat.icon}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6B7280',
                marginBottom: '8px'
              }}>
                {stat.title}
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#9CA3AF'
              }}>
                {stat.desc}
              </div>
            </div>
            
            <div style={{
              fontSize: '13px',
              fontWeight: '500',
              color: stat.color,
              padding: '6px 12px',
              background: `${stat.color}10`,
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px',
        marginBottom: '40px'
      }}>
        {/* Your Reported Bridges */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
              Your Reported Bridges
            </h3>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              background: '#F3F4F6',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {Object.keys(userBridgeHealth).length} Bridges
            </span>
          </div>
          
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {Object.keys(userBridgeHealth).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌉</div>
                <p style={{ margin: '0 0 16px' }}>You haven't reported on any bridges yet</p>
                <button
                  onClick={() => window.location.href = '/user/reports'}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              Object.values(userBridgeHealth).map((bridge, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                        {bridge.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>
                        {bridge.status}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: getBQIColor(bridge.bqi)
                    }}>
                      {bridge.bqi}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      background: '#E5E7EB',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${bridge.bqi}%`,
                        height: '100%',
                        background: getBQIColor(bridge.bqi),
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      BQI Score
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      onClick={() => window.location.href = `/maps?bridge=${bridge.name}`}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      View on Map
                    </button>
                    <button
                      onClick={() => window.location.href = `/user/reports?bridge=${bridge.name}`}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      View Reports
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Daily Tip */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              fontSize: '40px',
              opacity: 0.3
            }}>
              💡
            </div>
            <h4 style={{ 
              margin: '0 0 12px', 
              fontSize: '16px', 
              fontWeight: '600',
              position: 'relative'
            }}>
              Daily Safety Tip
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              lineHeight: '1.6',
              position: 'relative'
            }}>
              {getRandomTip()}
            </p>
            <button
              onClick={() => {
                const newTip = getRandomTip()
                const tipElement = document.querySelector('#daily-tip')
                if (tipElement) tipElement.textContent = newTip
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Show Another Tip
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
              Quick Actions
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => window.location.href = '/user/reports?new=true'}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <span>+</span> Submit New Report
              </button>
              
              <button
                onClick={() => window.location.href = '/maps'}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>🗺️</span> View Bridge Map
              </button>
              
              <button
                onClick={() => window.location.href = '/user/tips'}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>📚</span> Safety Guidelines
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
            Recent Notifications
          </h4>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#6B7280',
            background: '#F3F4F6',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {notifications.length} new
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${getStatusColor(n.type)}`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: `${getStatusColor(n.type)}20`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: getStatusColor(n.type),
                    flexShrink: 0
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1F2937',
                      marginBottom: '4px'
                    }}>
                      {n.text}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>⏱️</span>
                      {n.time}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={() => window.location.href = '/user/reports'}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              background: 'transparent',
              color: '#3B82F6',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            View All Reports
          </button>
        )}
      </div>

      {/* Report Status Summary */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
          Your Report Status Summary
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3B82F6' }}>{totalReports}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Reports</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>{pendingReports}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Pending Review</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>{approvedReports}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Approved</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#DC2626' }}>{declinedReports}</div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>Declined</div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .page-mounted {
          animation: fadeIn 0.5s ease;
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
        
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        
        ::selection {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}