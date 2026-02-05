import React, { useState, useEffect, useContext } from 'react'
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

// Add new API functions for health logs
async function fetchSensorLogs() {
  try {
    const response = await fetch('http://localhost:8080/api/bridgeHealth/sensorLog');
    if (!response.ok) throw new Error('Failed to fetch sensor logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sensor logs:', error);
    return [];
  }
}

async function fetchMLLogs() {
  try {
    const response = await fetch('http://localhost:8080/api/bridgeHealth/mlLog');
    if (!response.ok) throw new Error('Failed to fetch ML logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ML logs:', error);
    return [];
  }
}

function getHealthStatusColor(status) {
  switch(status?.toUpperCase()) {
    case 'EXCELLENT': return '#10B981';
    case 'GOOD': return '#22C55E';
    case 'FAIR': return '#F59E0B';
    case 'POOR': return '#EF4444';
    case 'CRITICAL': return '#DC2626';
    default: return '#64748B';
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    full: date.toISOString()
  };
}

export default function HealthLogs() {
  const { bridges, isLoading: bridgesLoading } = useContext(BridgesContext);
  const [asideOpen, setAsideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedBridge, setSelectedBridge] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [logs, setLogs] = useState({
    sensorLogs: [],
    mlLogs: []
  });
  const [realTimeMode, setRealTimeMode] = useState(true);

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v);
    window.addEventListener('bqi-toggle-sidebar', handler);
    return () => window.removeEventListener('bqi-toggle-sidebar', handler);
  }, []);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const [sensorLogs, mlLogs] = await Promise.all([
        fetchSensorLogs(),
        fetchMLLogs()
      ]);
      
      // Sort sensor logs by createdAt (newest first) initially
      const sortedSensorLogs = [...(sensorLogs || [])].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Sort ML logs by createdAt (newest first)
      const sortedMLLogs = [...(mlLogs || [])].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setLogs({
        sensorLogs: sortedSensorLogs,
        mlLogs: sortedMLLogs
      });
      
      if (!toast?.msg) {
        setToast({ 
          msg: `Loaded ${sensorLogs?.length || 0} sensor logs and ${mlLogs?.length || 0} health assessments`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setToast({ 
        msg: 'Failed to load health logs. Please check if backend is running.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Set up real-time polling if enabled
    let intervalId;
    if (realTimeMode) {
      intervalId = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [realTimeMode]);

  const handleRefresh = () => {
    fetchLogs();
    setToast({ msg: 'Refreshing health logs...', type: 'success' });
  };

  const getFilteredAndSortedLogs = () => {
    // First filter by bridge
    let filteredSensorLogs = logs.sensorLogs.filter(log => 
      selectedBridge === 'all' || log.bridgeId === selectedBridge
    );
    
    // Then sort based on selected order
    if (sortOrder === 'newest') {
      // Already sorted newest first by default
      filteredSensorLogs = [...filteredSensorLogs].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      // Sort oldest first
      filteredSensorLogs = [...filteredSensorLogs].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    
    return filteredSensorLogs;
  };

  const filteredLogs = getFilteredAndSortedLogs();

  const getBridgeName = (bridgeId) => {
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge ? bridge.name : bridgeId;
  };

  const getHealthStatus = (logId) => {
    const mlLog = logs.mlLogs.find(log => log.bridgeLogRef === logId);
    return mlLog;
  };

  const getLatestLogs = () => {
    // Always show 5 latest logs regardless of filter
    const latestLogs = [...logs.sensorLogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    return latestLogs.map(log => ({
      ...log,
      healthStatus: getHealthStatus(log.id)
    }));
  };

  const isLoading = bridgesLoading || loading;

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
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                color: '#1E293B',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Bridge Health Logs
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748B',
                fontSize: '14px'
              }}>
                Real-time monitoring of bridge sensor data and health assessments
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(236, 72, 153, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: realTimeMode ? '#10B981' : '#EF4444',
                  animation: realTimeMode ? 'pulse 1.5s infinite' : 'none'
                }}></div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: realTimeMode ? '#059669' : '#DC2626'
                }}>
                  {realTimeMode ? 'Live Updates' : 'Manual Mode'}
                </span>
              </div>
              
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                disabled={isLoading || refreshing}
                style={{
                  padding: '10px 16px',
                  background: realTimeMode 
                    ? 'linear-gradient(135deg, #0F766E, #3B82F6)' 
                    : 'linear-gradient(135deg, #6B7280, #9CA3AF)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {realTimeMode ? '🟢 Live' : '⚪ Manual'}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading || refreshing}
                style={{
                  padding: '10px 20px',
                  background: isLoading || refreshing 
                    ? '#CBD5E1' 
                    : 'linear-gradient(135deg, #EC4899, #8B5CF6)',
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
                  if (!isLoading && !refreshing) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(236, 72, 153, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !refreshing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {refreshing ? '🔄' : '🔃'}
                {refreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>

          {/* Filters and Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Bridge Filter */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                Filter by Bridge
              </label>
              <select
                value={selectedBridge}
                onChange={(e) => setSelectedBridge(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: isLoading ? '#F1F5F9' : '#F8FAFC',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="all">All Bridges ({bridges.length})</option>
                {bridges.map(bridge => (
                  <option key={bridge.id} value={bridge.id}>
                    {bridge.name} ({bridge.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Statistics */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#059669',
                  marginBottom: '4px'
                }}>
                  {logs.sensorLogs.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: '500'
                }}>
                  Total Sensor Logs
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#7C3AED',
                  marginBottom: '4px'
                }}>
                  {logs.mlLogs.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: '500'
                }}>
                  Health Assessments
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#DB2777',
                  marginBottom: '4px'
                }}>
                  {new Set(logs.sensorLogs.map(l => l.bridgeId)).size}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: '500'
                }}>
                  Bridges with Data
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#D97706',
                  marginBottom: '4px'
                }}>
                  {logs.mlLogs.filter(l => l.healthState === 'CRITICAL' || l.healthState === 'POOR').length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: '500'
                }}>
                  Critical Issues
                </div>
              </div>
            </div>
          </div>

          {/* Latest Activity */}
          <div style={{
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🕒</span>
              Latest Health Activity
            </h3>
            
            {isLoading ? (
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                color: '#94A3B8'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Loading health logs...
                </p>
              </div>
            ) : getLatestLogs().length === 0 ? (
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                color: '#94A3B8'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No health logs available yet
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {getLatestLogs().map((log, index) => {
                  const healthStatus = log.healthStatus;
                  
                  return (
                    <div 
                      key={log.id || index}
                      style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: `1px solid ${healthStatus ? getHealthStatusColor(healthStatus.healthState) + '40' : '#E2E8F0'}`,
                        borderLeft: `4px solid ${healthStatus ? getHealthStatusColor(healthStatus.healthState) : '#64748B'}`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1E293B',
                            marginBottom: '4px'
                          }}>
                            {getBridgeName(log.bridgeId)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748B'
                          }}>
                            {log.bridgeId}
                          </div>
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: '#64748B',
                          background: '#F1F5F9',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {formatTimeAgo(log.createdAt)}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            marginBottom: '2px'
                          }}>
                            Strain
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            {log.strainMicrostrain?.toFixed(0)} µε
                          </div>
                        </div>
                        
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            marginBottom: '2px'
                          }}>
                            Vibration
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            {log.vibrationMs2?.toFixed(2)} m/s²
                          </div>
                        </div>
                        
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            marginBottom: '2px'
                          }}>
                            Temperature
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            {log.temperatureC?.toFixed(1)}°C
                          </div>
                        </div>
                        
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            marginBottom: '2px'
                          }}>
                            Humidity
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            {log.humidityPercent?.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      
                      {healthStatus && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: getHealthStatusColor(healthStatus.healthState) + '10',
                          borderRadius: '8px',
                          border: `1px solid ${getHealthStatusColor(healthStatus.healthState)}20`
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: getHealthStatusColor(healthStatus.healthState),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {healthStatus.healthIndex}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: getHealthStatusColor(healthStatus.healthState)
                            }}>
                              {healthStatus.healthState}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#64748B'
                            }}>
                              {healthStatus.recommendedAction || 'No specific recommendations'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Logs Table */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📋</span>
                  Detailed Logs
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#64748B'
                }}>
                  {sortOrder === 'newest' ? 'Showing newest logs first' : 'Showing oldest logs first'}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#64748B'
                }}>
                  Showing {filteredLogs.length} of {logs.sensorLogs.length} logs
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setSortOrder('newest')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      background: sortOrder === 'newest' 
                        ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' 
                        : '#F1F5F9',
                      color: sortOrder === 'newest' ? 'white' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>⬇️</span>
                    Newest First
                  </button>
                  
                  <button
                    onClick={() => setSortOrder('oldest')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      background: sortOrder === 'oldest' 
                        ? 'linear-gradient(135deg, #3B82F6, #0F766E)' 
                        : '#F1F5F9',
                      color: sortOrder === 'oldest' ? 'white' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>⬆️</span>
                    Oldest First
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{
              overflowX: 'auto'
            }}>
              {isLoading ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#94A3B8'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Loading detailed logs...
                  </p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#94A3B8'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {selectedBridge === 'all' 
                      ? 'No health logs available yet' 
                      : `No health logs found for ${getBridgeName(selectedBridge)}`}
                  </p>
                </div>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: '#F8FAFC',
                      borderBottom: '2px solid #E2E8F0'
                    }}>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        width: '180px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Time</span>
                          {sortOrder === 'newest' ? '⬇️' : '⬆️'}
                        </div>
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Bridge</th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Sensor Data</th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Health Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => {
                      const healthStatus = getHealthStatus(log.id);
                      const bridgeName = getBridgeName(log.bridgeId);
                      const dateTime = formatDateTime(log.createdAt);
                      
                      return (
                        <tr 
                          key={log.id} 
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            transition: 'background 0.2s ease',
                            background: index === 0 && sortOrder === 'newest' ? 'rgba(236, 72, 153, 0.02)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = index === 0 && sortOrder === 'newest' 
                              ? 'rgba(236, 72, 153, 0.02)' 
                              : 'transparent';
                          }}
                        >
                          <td style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}>
                            <div style={{ 
                              fontWeight: index === 0 && sortOrder === 'newest' ? '600' : '400',
                              color: index === 0 && sortOrder === 'newest' ? '#EC4899' : '#475569'
                            }}>
                              {dateTime.date}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#94A3B8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span>{dateTime.time}</span>
                              {index === 0 && sortOrder === 'newest' && (
                                <span style={{
                                  background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                                  color: 'white',
                                  fontSize: '9px',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  fontWeight: '600'
                                }}>
                                  LATEST
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            color: '#475569'
                          }}>
                            <div style={{
                              fontWeight: '500',
                              color: '#1E293B',
                              marginBottom: '2px'
                            }}>
                              {bridgeName}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#64748B'
                            }}>
                              {log.bridgeId}
                            </div>
                          </td>
                          <td style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            color: '#475569'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '16px'
                            }}>
                              <div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#64748B',
                                  marginBottom: '2px'
                                }}>
                                  Strain
                                </div>
                                <div style={{
                                  fontWeight: '600',
                                  color: log.strainMicrostrain > 15000 ? '#DC2626' : '#059669'
                                }}>
                                  {log.strainMicrostrain?.toFixed(0)} µε
                                </div>
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#64748B',
                                  marginBottom: '2px'
                                }}>
                                  Temp
                                </div>
                                <div style={{
                                  fontWeight: '600',
                                  color: log.temperatureC > 40 ? '#DC2626' : '#059669'
                                }}>
                                  {log.temperatureC?.toFixed(1)}°C
                                </div>
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#64748B',
                                  marginBottom: '2px'
                                }}>
                                  Vib
                                </div>
                                <div style={{
                                  fontWeight: '600',
                                  color: log.vibrationMs2 > 3 ? '#DC2626' : '#059669'
                                }}>
                                  {log.vibrationMs2?.toFixed(2)} m/s²
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            color: '#475569'
                          }}>
                            {healthStatus ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: getHealthStatusColor(healthStatus.healthState),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}>
                                  {healthStatus.healthIndex}
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: getHealthStatusColor(healthStatus.healthState)
                                  }}>
                                    {healthStatus.healthState}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#64748B',
                                    maxWidth: '200px'
                                  }}>
                                    {healthStatus.recommendedAction || 'Normal operation'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#94A3B8',
                                fontSize: '12px'
                              }}>
                                <span>⏳</span>
                                Awaiting analysis...
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {filteredLogs.length > 0 && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#64748B'
              }}>
                <div>
                  {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} displayed • 
                  {sortOrder === 'newest' ? ' Newest first' : ' Oldest first'}
                </div>
                <div>
                  {selectedBridge === 'all' ? 'All bridges' : `Bridge: ${getBridgeName(selectedBridge)}`}
                </div>
              </div>
            )}
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
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(0.95); 
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
          border-color: #EC4899 !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1) !important;
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