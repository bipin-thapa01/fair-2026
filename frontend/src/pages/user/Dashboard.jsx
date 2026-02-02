import React, { useContext, useEffect, useState } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function Dashboard(){
  const { bridges, user } = useContext(BridgesContext)
  const [notifications, setNotifications] = useState([])
  const [chartVisible, setChartVisible] = useState(false)

  useEffect(()=>{
    setTimeout(()=> setChartVisible(true), 250)
    setNotifications([
      {id:1, text:'Report #123 approved', time:'2h'},
      {id:2, text:'Report #124 declined', time:'1d'}
    ])
  },[])

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

  const pending = bridges.filter(b=> (b.bqi||0) < 50).length

  const buckets = {EXCELLENT:0,GOOD:0,FAIR:0,POOR:0,CRITICAL:0}
  bridges.forEach(b=>{
    const s = (b.status||'').toString().toUpperCase()
    if(s && buckets.hasOwnProperty(s)) buckets[s]++
    else {
      const c = b.condition || 0
      if(c >= 85) buckets.EXCELLENT++
      else if(c >= 70) buckets.GOOD++
      else if(c >= 50) buckets.FAIR++
      else if(c >= 35) buckets.POOR++
      else buckets.CRITICAL++
    }
  })

  const statusChartData = { labels: Object.keys(buckets), datasets:[{label:'Status', data:Object.values(buckets), backgroundColor:["#14532D","#0F766E","#4D7C0F","#F59E0B","#DC2626"]}] }

  return (
    <div className="page-full page-mounted" style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>{greeting()}, {displayName()}</h2>
        <div style={{color:'#666'}}>{new Date().toLocaleDateString()}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:12,marginTop:12}}>
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
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {notifications.map(n=> <div key={n.id} className="notification"><strong>{n.text}</strong><div style={{fontSize:12,color:'#666'}}>{n.time}</div></div>)}
            </div>
          </div>
        </div>
      </div>

      <div style={{marginTop:16}}>
        <h4>Bridge Health Status Distribution</h4>
        <div style={{height:260}}>
          <Bar data={statusChartData} options={{responsive:true,plugins:{legend:{position:'bottom'}}}} />
        </div>
      </div>
    </div>
  )
}
