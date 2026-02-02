import React, { useContext, useState, useMemo, useEffect } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'
import { classification } from '../utils/bqi'
import UserSidebar from '../components/UserSidebar'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function User(){
  const { bridges, user } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(true)
  const [chartVisible, setChartVisible] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    const handler = ()=> setAsideOpen(v=>!v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return ()=> window.removeEventListener('bqi-toggle-sidebar', handler)
  },[])

  useEffect(()=>{
    // mount and reveal charts after mount for animation
    const m = setTimeout(()=> setMounted(true), 80)
    const t = setTimeout(()=> setChartVisible(true), 300)
    // mock notifications
    setNotifications([
      {id:1, text:'Report #123 approved by inspector', type:'info', time:'2h'},
      {id:2, text:'Report #124 declined: insufficient detail', type:'warning', time:'1d'},
      {id:3, text:'Inspection scheduled for Bridge 7 on 2026-02-10', type:'info', time:'3d'}
    ])
    return ()=> { clearTimeout(t); clearTimeout(m) }
  },[])
  const pending = bridges.filter(b=> (b.bqi||0) < 50).length

  const greeting = () => {
    const h = new Date().getHours()
    if(h < 12) return 'Good Morning'
    if(h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const displayName = () => {
    const email = user?.email || 'user'
    const name = email.split('@')[0] || 'user'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const reportsSubmitted = 7
  const inspectionsCompleted = 12

  const smallStats = [
    {label:'Bridges Monitored', value: bridges.length},
    {label:'Reports Submitted', value: 7},
    {label:'Inspections Completed', value: 12},
  ]

  // Build chart data from schema-like fields (bridges, bridge_health_log, ml_output_log)
  const months = ['-5','-4','-3','-2','-1','now']
  const lineSeries = months.map((m, idx)=> {
    // average vibration across bridges with a tiny variation for mock trend
    const avg = bridges.length ? bridges.reduce((s,b)=> s + (b.vibration||0),0)/bridges.length : 0
    return parseFloat((avg * (1 + (idx - 2) * 0.03)).toFixed(2))
  })

  const lineData = {
    labels: months.map((m,i)=> {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return d.toLocaleString('default',{month:'short'})
    }),
    datasets: [{ label:'bridge_health_log: Vibration (avg)', data: lineSeries, borderColor:'#0f766e', backgroundColor:'rgba(15,118,110,0.08)', tension:0.3 }]
  }

  // health distribution from bridges.condition -> EXCELLENT/GOOD/FAIR/POOR/CRITICAL
  const buckets = {EXCELLENT:0,GOOD:0,FAIR:0,POOR:0,CRITICAL:0}
  bridges.forEach(b=>{
    const c = b.condition || 0
    if(c >= 85) buckets.EXCELLENT++
    else if(c >= 70) buckets.GOOD++
    else if(c >= 50) buckets.FAIR++
    else if(c >= 35) buckets.POOR++
    else buckets.CRITICAL++
  })

  const barData = {
    labels: Object.keys(buckets),
    datasets: [{ label:'bridge_health_log: Health Distribution', data: Object.values(buckets), backgroundColor:['#14532D','#0F766E','#4D7C0F','#F59E0B','#DC2626'] }]
  }

  const rolesMock = {ADMIN:1, USER:4}
  const doughData = { labels: Object.keys(rolesMock), datasets:[{ data: Object.values(rolesMock), backgroundColor:['#0F766E','#4D7C0F'] }] }

  const chartOpts = { responsive:true, plugins:{ legend:{position:'bottom'} }, maintainAspectRatio:false }

  // Build status counts from `bridges` table: use `status` if present, else derive from `condition`
  const statusBuckets = {EXCELLENT:0,GOOD:0,FAIR:0,POOR:0,CRITICAL:0}
  bridges.forEach(b=>{
    const s = (b.status || '').toString().toUpperCase()
    if(s && statusBuckets.hasOwnProperty(s)) { statusBuckets[s]++ }
    else {
      const c = b.condition || 0
      if(c >= 85) statusBuckets.EXCELLENT++
      else if(c >= 70) statusBuckets.GOOD++
      else if(c >= 50) statusBuckets.FAIR++
      else if(c >= 35) statusBuckets.POOR++
      else statusBuckets.CRITICAL++
    }
  })

  const statusLabels = Object.keys(statusBuckets)
  const statusCounts = Object.values(statusBuckets)
  const statusChartData = {
    labels: statusLabels,
    datasets: [{ label: 'bridges: status count', data: statusCounts, backgroundColor:['#14532D','#0F766E','#4D7C0F','#F59E0B','#DC2626'] }]
  }
  return (
    <div className={`page-full ${mounted ? 'page-mounted' : 'page-init'}`} style={{display:'flex'}}>
      <UserSidebar open={asideOpen} />
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12}}>
          <button onClick={()=>{ window.dispatchEvent(new CustomEvent('bqi-toggle-sidebar')); setAsideOpen(v=>!v) }} style={{border:'none',background:'transparent',cursor:'pointer'}}>☰</button>
          <div style={{fontWeight:700}}>User Dashboard</div>
          <div>
            <strong>Flagged:</strong> {pending}
          </div>
        </div>

        <div className="container constrain">
          {/* Greeting + Date */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <h3 style={{margin:0}}>{greeting()}, {displayName()}</h3>
            <div style={{fontSize:14,color:'#666'}}>{new Date().toLocaleDateString()}</div>
          </div>

          {/* Overview and Notifications / Daily Tips placed under greeting */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:12}}>
            <div>
              <div className="card">
                <h3>Overview</h3>
                <p>Bridges monitored: <strong>{bridges.length}</strong></p>
                <p>Reports (pending): <strong>{pending}</strong></p>
              </div>

              <div className="card" style={{marginTop:12}}>
                <h4 style={{marginBottom:8}}>Daily Tips</h4>
                <div style={{fontStyle:'italic',color:'var(--primary)'}}>
                  {(() => {
                    const tips = [
                      'Inspect bridge joints regularly for cracks.',
                      'Avoid overloading bridges beyond weight limits.',
                      'Report unusual vibrations or noises immediately.',
                      'Keep drainage clear to prevent scour at foundations.',
                      'Document and photograph defects from a safe distance.'
                    ]
                    const idx = new Date().getDate() % tips.length
                    return tips[idx]
                  })()}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <h4>Notifications</h4>
                <div className="notifications-list">
                  {notifications.map(n=> (
                    <div key={n.id} className="notification">
                      <div style={{fontSize:13}}><strong>{n.text}</strong></div>
                      <div style={{fontSize:12,color:'#666'}}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{marginTop:12}} className="stats-grid">
            {smallStats.map(s=> (
              <div className="stat-card" key={s.label}>
                <h3 style={{margin:0,color:'var(--primary)'}}>{s.label}</h3>
                <div className="value">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Health status distribution chart for users */}
          <div style={{marginTop:16}}>
            <h4>Bridge Health Status Distribution</h4>
            <div className={`chart-container ${chartVisible ? 'reveal' : 'hidden-reveal'}`} style={{height:260}}>
              <Bar data={statusChartData} options={{...chartOpts, animation:{duration:900}}} />
            </div>
          </div>

          {/* Charts: only show for admin users; hide for regular users */}
          {user?.role === 'admin' && (
            <>
              <h4 style={{marginTop:18}}>Bridge Analytics</h4>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div className={`chart-container ${chartVisible ? 'reveal' : 'hidden-reveal'}`}>
                  <Line data={lineData} options={{...chartOpts, animation:{duration:900}}} />
                </div>
                <div className={`chart-container ${chartVisible ? 'reveal' : 'hidden-reveal'}`}>
                  <Bar data={barData} options={{...chartOpts, animation:{duration:900}}} />
                </div>
              </div>
              <div className={`chart-container ${chartVisible ? 'reveal' : 'hidden-reveal'}`} style={{height:220}}>
                <Doughnut data={doughData} options={{...chartOpts, animation:{duration:900}}} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

