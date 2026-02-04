import React, { useContext, useState, useEffect } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Filler,
  Title 
} from 'chart.js'

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Filler,
  Title
)

export default function Admin(){
  const { bridges } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  // Fetch additional data (example)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('bqi_token')
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          // Handle the fetched data
          console.log('Admin dashboard data:', data)
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    }
    
    fetchAdminData()
  }, [])

  // Calculate metrics
  const total = bridges.length
  const avg = Math.round((bridges.reduce((s, b) => s + (b.bqi || 0), 0) / Math.max(1, total)))
  const critical = bridges.filter(b => (b.bqi || 0) < 50).length
  const good = bridges.filter(b => (b.bqi || 0) >= 80).length
  const fair = bridges.filter(b => (b.bqi || 0) >= 50 && (b.bqi || 0) < 80).length

  // Mock data for UI
  const mockHealthLogs = [
    {id:'h1', bridge:'Bagmati Bridge', bridgeId:'B001', strain:0.35, vibration:2.1, temp:28, ts:'2026-01-30 08:12'},
    {id:'h2', bridge:'Narayani Bridge', bridgeId:'B002', strain:0.85, vibration:5.2, temp:34, ts:'2026-01-30 07:22'},
    {id:'h3', bridge:'Koshi Bridge', bridgeId:'B003', strain:0.42, vibration:1.8, temp:26, ts:'2026-01-30 06:45'},
    {id:'h4', bridge:'Gandaki Bridge', bridgeId:'B004', strain:0.67, vibration:3.9, temp:31, ts:'2026-01-30 05:30'},
  ]

  const mockMl = [
    {id:'m1', bridge:'Bagmati Bridge', healthIndex:72, confidence:0.88, action:'Monitor', status:'stable'},
    {id:'m2', bridge:'Narayani Bridge', healthIndex:43, confidence:0.92, action:'Inspect Now', status:'critical'},
    {id:'m3', bridge:'Koshi Bridge', healthIndex:89, confidence:0.85, action:'Schedule Maintenance', status:'good'},
    {id:'m4', bridge:'Gandaki Bridge', healthIndex:56, confidence:0.78, action:'Urgent Review', status:'warning'},
  ]

  const mockUsers = [
    {id:'u1', name:'Rajesh Kumar', email:'rajesh@bqi.gov.np', role:'admin', lastLogin:'2026-01-30 09:45'},
    {id:'u2', name:'Sarita Sharma', email:'sarita@bqi.gov.np', role:'inspector', lastLogin:'2026-01-30 08:30'},
    {id:'u3', name:'Anil Gurung', email:'anil@example.com', role:'public', lastLogin:'2026-01-29 14:20'},
    {id:'u4', name:'Government Office', email:'gov@bqi.gov.np', role:'government', lastLogin:'2026-01-30 07:15'},
  ]

  // Chart data
  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  const strainData = [0.3,0.32,0.35,0.38,0.36,0.34]
  const vibrationData = [1.8,2.0,2.1,2.4,2.3,2.2]
  const tempData = [26,27,28,29,28,27]
  const inspectionData = [12,15,18,14,20,22]

  const lineData = {
    labels: months,
    datasets: [
      { 
        label: 'Strain (µε)', 
        data: strainData, 
        borderColor: '#8B5CF6', 
        backgroundColor: 'rgba(139, 92, 246, 0.1)', 
        tension: 0.3, 
        fill: false,
        borderWidth: 2
      },
      { 
        label: 'Vibration (Hz)', 
        data: vibrationData, 
        borderColor: '#10B981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        tension: 0.3, 
        fill: false,
        borderWidth: 2
      }
    ]
  }

  const barData = {
    labels: ['EXCELLENT','GOOD','FAIR','POOR','CRITICAL'],
    datasets: [{ 
      label: 'Bridges', 
      data: [good, fair, 15, 7, critical], 
      backgroundColor: ['#059669','#10B981','#F59E0B','#F97316','#DC2626'],
      borderRadius: 6,
      borderWidth: 0
    }]
  }

  const pieData = { 
    labels: ['Admin', 'Inspector', 'Government', 'Public'], 
    datasets: [{ 
      data: [3, 12, 8, 25], 
      backgroundColor: ['#0F766E','#3B82F6','#8B5CF6','#10B981'],
      borderWidth: 0,
      hoverOffset: 15
    }] 
  }

  const areaData = { 
    labels: months, 
    datasets: [{ 
      label:'Temperature (°C)', 
      data: tempData, 
      borderColor:'#3B82F6', 
      backgroundColor:'rgba(59, 130, 246, 0.15)', 
      fill: true, 
      tension: 0.3,
      borderWidth: 2
    }] 
  }

  const inspectionsData = {
    labels: months,
    datasets: [{
      label: 'Inspections Completed',
      data: inspectionData,
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: '#10B981',
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  const chartOptionsCommon = {
    animation: { duration: 900, easing: 'easeOutCubic' },
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: "'Inter', sans-serif", size: 12 },
        bodyFont: { family: "'Inter', sans-serif", size: 11 },
        padding: 12,
        cornerRadius: 8
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }

  const lineOptions = { 
    ...chartOptionsCommon, 
    scales: { 
      x: {
        grid: { display: false }
      },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    } 
  }

  const barOptions = {
    ...chartOptionsCommon,
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const userData = Object.fromEntries(formData)
    
    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        alert('User added successfully')
        // Refresh user list
      }
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          reportType: 'comprehensive'
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bridge-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
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
              { title: 'Total Bridges', value: total, icon: '🌉', color: '#0F766E', change: '+2%' },
              { title: 'Average BQI', value: avg, icon: '📊', color: '#3B82F6', change: '+5%' },
              { title: 'Critical Bridges', value: critical, icon: '⚠️', color: '#DC2626', change: '-1%' },
              { title: 'Active Users', value: '48', icon: '👥', color: '#8B5CF6', change: '+12%' },
              { title: 'Inspections Today', value: '8', icon: '🔍', color: '#10B981', change: '+3%' },
              { title: 'Reports Generated', value: '156', icon: '📋', color: '#F59E0B', change: '+8%' },
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
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ color: stat.change.startsWith('+') ? '#10B981' : '#DC2626' }}>
                    {stat.change}
                  </span> from last week
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  Sensor Data Trends
                </h3>
                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px' }}>
                  <option>Last 6 months</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div style={{ height: '250px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  Bridge Health Distribution
                </h3>
                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px' }}>
                  <option>All Bridges</option>
                  <option>By Region</option>
                  <option>By Age</option>
                </select>
              </div>
              <div style={{ height: '250px' }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                Temperature Monitoring
              </h3>
              <div style={{ height: '200px' }}>
                <Line data={areaData} options={lineOptions} />
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                User Distribution
              </h3>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={pieData} options={chartOptionsCommon} />
              </div>
            </div>
          </div>

          {/* Data Tables */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Health Logs */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  Real-time Sensor Logs
                </h3>
                <button style={{
                  padding: '8px 16px',
                  background: 'rgba(15, 118, 110, 0.1)',
                  color: '#0F766E',
                  border: '1px solid rgba(15, 118, 110, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  View All
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Bridge</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Strain</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Vibration</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHealthLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1E293B' }}>
                          <div style={{ fontWeight: '600' }}>{log.bridge}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{log.bridgeId}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: log.strain > 0.6 ? '#DC2626' : '#10B981' }}>
                          {log.strain} µε
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: log.vibration > 4 ? '#F97316' : '#10B981' }}>
                          {log.vibration} Hz
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748B' }}>
                          {log.ts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ML Predictions */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                  AI Health Predictions
                </h3>
                <button style={{
                  padding: '8px 16px',
                  background: 'rgba(15, 118, 110, 0.1)',
                  color: '#0F766E',
                  border: '1px solid rgba(15, 118, 110, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Update Model
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Bridge</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Health Index</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Confidence</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMl.map(pred => (
                      <tr key={pred.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>
                          {pred.bridge}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: pred.status === 'critical' ? 'rgba(220, 38, 38, 0.1)' : 
                                       pred.status === 'warning' ? 'rgba(249, 115, 22, 0.1)' : 
                                       'rgba(16, 185, 129, 0.1)',
                            color: pred.status === 'critical' ? '#DC2626' : 
                                   pred.status === 'warning' ? '#F97316' : '#10B981',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {pred.healthIndex}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748B' }}>
                          {Math.round(pred.confidence * 100)}%
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: pred.action.includes('Urgent') ? 'rgba(220, 38, 38, 0.1)' : 
                                       pred.action.includes('Now') ? 'rgba(249, 115, 22, 0.1)' : 
                                       'rgba(16, 185, 129, 0.1)',
                            color: pred.action.includes('Urgent') ? '#DC2626' : 
                                   pred.action.includes('Now') ? '#F97316' : '#10B981',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {pred.action}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}