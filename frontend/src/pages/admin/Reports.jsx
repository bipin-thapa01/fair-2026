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

// Get reports from localStorage and filter out sample reports
const getInitialReports = () => {
  try {
    const stored = localStorage.getItem('bqi_reports');
    if (stored) {
      const reports = JSON.parse(stored);
      
      // Filter out sample reports
      const filteredReports = reports.filter(report => {
        // Check for sample content patterns
        const isSampleContent = 
          report.title?.includes('sample') || 
          report.description?.includes('sample') ||
          report.description?.includes('gfgfgfg') ||
          report.title?.includes('gfggfgf');
        
        // Check for old dates (sample reports are usually old)
        if (report.submitted) {
          const reportDate = new Date(report.submitted);
          const today = new Date();
          const isOldReport = reportDate.getTime() < today.getTime() - 86400000; // Older than 1 day
          
          // Keep only non-sample and recent reports
          return !isSampleContent && !isOldReport;
        }
        
        return !isSampleContent;
      });
      
      // Ensure all IDs are strings
      return filteredReports.map(report => ({
        ...report,
        id: typeof report.id === 'number' ? report.id.toString() : report.id
      }));
    }
  } catch (error) {
    console.error('Error loading reports from localStorage:', error);
  }
  
  // Return empty array if no stored reports
  return [];
}

export default function Reports() {
  const [reports, setReports] = useState(getInitialReports);
  const [asideOpen, setAsideOpen] = useState(false);

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v);
    window.addEventListener('bqi-toggle-sidebar', handler);
    return () => window.removeEventListener('bqi-toggle-sidebar', handler);
  }, []);

  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load bridges from localStorage
  const getBridgesList = () => {
    try {
      const bridges = localStorage.getItem('bqi_bridges');
      if (bridges) {
        return JSON.parse(bridges);
      }
    } catch (error) {
      console.error('Error loading bridges:', error);
    }
    return [];
  };

  // Save reports to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bqi_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving reports to localStorage:', error);
    }
  }, [reports]);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (id, action, comment = '') => {
    // Find the report
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return;
    
    const updatedReport = { ...reports[reportIndex] };
    
    if (action === 'Approved') {
      updatedReport.status = 'Approved';
      updatedReport.adminActionDate = new Date().toISOString();
      updatedReport.adminComment = comment || 'Report approved by administrator';
    } else if (action === 'Declined') {
      updatedReport.status = 'Declined';
      updatedReport.adminActionDate = new Date().toISOString();
      updatedReport.adminComment = comment || 'Report declined by administrator';
    }
    
    // Update the report in main storage
    const newReports = [...reports];
    newReports[reportIndex] = updatedReport;
    setReports(newReports);
    
    notify(`Report ${action.toLowerCase()} successfully`, 'success');
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      (report.bridge && report.bridge.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.summary && report.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.auditor && report.auditor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.title && report.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.userName && report.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.userEmail && report.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get bridge name
  const getBridgeName = (bridgeId) => {
    const bridges = getBridgesList();
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge ? bridge.name : bridgeId || 'Unknown Bridge';
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Refresh reports
  const refreshReports = () => {
    setReports(getInitialReports());
    notify('Reports refreshed', 'success');
  };

  // Clean sample reports function
  const cleanSampleReports = () => {
    const currentReports = getInitialReports();
    setReports(currentReports);
    notify('Sample reports cleaned successfully', 'success');
  };

  // Delete a single report
  const deleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const newReports = reports.filter(report => report.id !== id);
      setReports(newReports);
      notify('Report deleted successfully', 'success');
    }
  };

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
              <button
                onClick={refreshReports}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(15, 118, 110, 0.1)',
                  color: '#0F766E',
                  border: '1px solid rgba(15, 118, 110, 0.2)',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔄 Refresh
              </button>
              <span style={{
                background: 'rgba(15, 118, 110, 0.1)',
                color: '#0F766E',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {reports.filter(r => r.status === 'Pending').length} Pending Reports
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
                    placeholder="Search by bridge, auditor, user, or content..."
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
                  <option value="pending">Pending</option>
                  <option value="all">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
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
            {filteredReports.length === 0 ? (
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
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No reports have been submitted yet. Ask users to submit bridge inspection reports.'}
                </p>
              </div>
            ) : (
              filteredReports
                .filter(r => filterStatus === 'all' || r.status === filterStatus)
                .sort((a, b) => new Date(b.submitted || b.timestamp) - new Date(a.submitted || a.timestamp))
                .map(report => (
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
                      opacity: report.status !== 'Pending' ? 0.7 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
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
                            {getBridgeName(report.bridgeId) || report.bridge || 'Unknown Bridge'}
                          </div>
                          
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: report.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 
                                       report.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                       'rgba(239, 68, 68, 0.1)',
                            color: report.status === 'Pending' ? '#D97706' : 
                                   report.status === 'Approved' ? '#059669' : '#DC2626',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {report.status}
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
                            <span>👤</span>
                            {report.userName || report.auditor || 'Anonymous'}
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1E293B'
                          }}>
                            {report.title || 'No title'}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: '15px',
                            color: '#475569',
                            lineHeight: '1.6'
                          }}>
                            {report.summary || report.description || 'No description provided.'}
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
                              <span>📋</span> Category
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                              {report.category || report.issueType || 'General'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                              <span>📅</span> Submitted Date
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                              {formatDate(report.submitted || report.timestamp)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                              <span>📧</span> User Email
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                              {report.userEmail || 'No email'}
                            </div>
                          </div>
                          {report.adminActionDate && (
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                                <span>✅</span> Action Date
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                                {formatDate(report.adminActionDate)}
                              </div>
                            </div>
                          )}
                        </div>

                        {report.adminComment && (
                          <div style={{
                            padding: '12px',
                            background: '#F8FAFC',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            marginBottom: '16px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                              <span>💬</span> Admin Comment
                            </div>
                            <div style={{ fontSize: '14px', color: '#475569' }}>
                              {report.adminComment}
                            </div>
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#64748B'
                        }}>
                          <span>🆔 Report ID: {report.id}</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginLeft: '24px'
                      }}>
                        {report.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => {
                                const comment = prompt('Add a comment (optional):', '');
                                handleAction(report.id, 'Approved', comment);
                              }}
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
                              onClick={() => {
                                const comment = prompt('Add a comment (optional):', '');
                                handleAction(report.id, 'Declined', comment);
                              }}
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
                          </>
                        )}
                        <button
                          onClick={() => deleteReport(report.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#DC2626',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'center'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
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
                { label: 'Total Pending', value: reports.filter(r => r.status === 'Pending').length, icon: '📋', color: '#F59E0B' },
                { label: 'Total Approved', value: reports.filter(r => r.status === 'Approved').length, icon: '✅', color: '#10B981' },
                { label: 'Total Declined', value: reports.filter(r => r.status === 'Declined').length, icon: '❌', color: '#DC2626' },
                { label: 'Total Reports', value: reports.length, icon: '📊', color: '#3B82F6' },
                { label: 'Today\'s Reports', value: reports.filter(r => {
                  const today = new Date().toISOString().split('T')[0];
                  const reportDate = r.submitted ? new Date(r.submitted).toISOString().split('T')[0] : 
                                    r.date ? new Date(r.date).toISOString().split('T')[0] : '';
                  return reportDate === today;
                }).length, icon: '📅', color: '#8B5CF6' },
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
            flex-wrap: wrap;
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