import React, { useContext, useEffect, useState } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  Filler
)

export default function Dashboard() {
  const { bridges, user } = useContext(BridgesContext)
  const [notifications, setNotifications] = useState([])
  const [chartVisible, setChartVisible] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')

  useEffect(() => {
    setTimeout(() => setChartVisible(true), 250)
    setNotifications([
      { id: 1, text: 'Report #123 - Bagmati Bridge approved', time: '2 hours ago', type: 'success', icon: '✅' },
      { id: 2, text: 'Report #124 - Kalanki Bridge declined', time: '1 day ago', type: 'error', icon: '❌' },
      { id: 3, text: 'New bridge - Sundarijal added to monitoring', time: '3 days ago', type: 'info', icon: '🆕' },
      { id: 4, text: 'Scheduled inspection - Tripureshwor Bridge', time: 'Tomorrow', type: 'warning', icon: '📅' }
    ])
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

  // Calculate statistics
  const totalBridges = bridges.length
  const pendingReports = bridges.filter(b => (b.bqi || 0) < 50).length
  const goodBridges = bridges.filter(b => (b.bqi || 0) >= 70).length
  const criticalBridges = bridges.filter(b => (b.bqi || 0) < 40).length
  
  // BQI score distribution
  const buckets = { EXCELLENT: 0, GOOD: 0, FAIR: 0, POOR: 0, CRITICAL: 0 }
  bridges.forEach(b => {
    const bqi = b.bqi || 0
    if (bqi >= 80) buckets.EXCELLENT++
    else if (bqi >= 60) buckets.GOOD++
    else if (bqi >= 40) buckets.FAIR++
    else if (bqi >= 20) buckets.POOR++
    else buckets.CRITICAL++
  })

  // Status chart data
  const statusChartData = {
    labels: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    datasets: [{
      label: 'Number of Bridges',
      data: Object.values(buckets),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        '#10B981',
        '#22C55E',
        '#FACC15',
        '#F59E0B',
        '#EF4444'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  }

  // Line chart data for BQI trends
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average BQI Score',
        data: [68, 72, 70, 75, 73, 78],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Critical Reports',
        data: [5, 3, 4, 2, 3, 1],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Doughnut chart data
  const doughnutChartData = {
    labels: ['Inspected', 'Pending', 'Overdue'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        '#22C55E',
        '#FACC15',
        '#EF4444'
      ],
      borderWidth: 2,
      cutout: '70%'
    }]
  }

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
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                background: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
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
            title: 'Total Bridges',
            value: totalBridges,
            icon: '🌉',
            color: '#3B82F6',
            change: '+2%',
            desc: 'Monitored bridges'
          },
          {
            title: 'Good Condition',
            value: goodBridges,
            icon: '✅',
            color: '#10B981',
            change: '+5%',
            desc: 'BQI ≥ 70'
          },
          {
            title: 'Critical',
            value: criticalBridges,
            icon: '⚠️',
            color: '#EF4444',
            change: '-1%',
            desc: 'Requires attention'
          },
          {
            title: 'Pending Reports',
            value: pendingReports,
            icon: '📋',
            color: '#F59E0B',
            change: '+3',
            desc: 'Awaiting review'
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: stat.change.startsWith('+') ? '#10B981' : '#EF4444'
            }}>
              <span>{stat.change}</span>
              <span style={{ color: '#9CA3AF' }}>from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px',
        marginBottom: '40px'
      }}>
        {/* Main Chart */}
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
              BQI Score Trends
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#3B82F6', borderRadius: '2px' }}></div>
                <span>Avg BQI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '2px' }}></div>
                <span>Critical</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '300px' }}>
            <Line 
              data={lineChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#6B7280' }
                  },
                  x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#6B7280' }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Side Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Doughnut Chart */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
              Inspection Status
            </h4>
            <div style={{ height: '200px', position: 'relative' }}>
              <Doughnut 
                data={doughnutChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'bottom',
                      labels: { 
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

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
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        marginBottom: '40px'
      }}>
        {/* Bar Chart */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
            Bridge Health Distribution
          </h4>
          <div style={{ height: '300px' }}>
            <Bar 
              data={statusChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#6B7280' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#6B7280' }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Notifications */}
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
            {notifications.map(n => (
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
            ))}
          </div>
          
          <button
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
            View All Notifications
          </button>
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
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .bottom-section {
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
          
          .quick-actions {
            flex-direction: column;
          }
        }
        
        ::selection {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}