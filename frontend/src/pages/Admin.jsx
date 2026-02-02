import React, { useContext, useState, useEffect } from 'react'
import { BridgesContext } from '../App'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

export default function Admin(){
  const { bridges } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(true)

  useEffect(()=>{
    const handler = ()=> setAsideOpen(v=>!v)
    window.addEventListener('toggleSidebar', handler)
    return ()=> window.removeEventListener('toggleSidebar', handler)
  },[])

  const total = bridges.length
  const avg = Math.round((bridges.reduce((s,b)=>s+(b.bqi||0),0) / Math.max(1,total)))
  const critical = bridges.filter(b=> (b.bqi||0) < 50).length

  const mockHealthLogs = [
    {id:'h1', bridge:'Bagmati Bridge', strain:0.35, vibration:2.1, temp:28, ts:'2026-01-30 08:12'},
    {id:'h2', bridge:'Narayani Bridge', strain:0.85, vibration:5.2, temp:34, ts:'2026-01-30 07:22'},
  ]

  const mockMl = [
    {id:'m1', bridge:'Bagmati Bridge', healthIndex:72, confidence:0.88, action:'Monitor'},
    {id:'m2', bridge:'Narayani Bridge', healthIndex:43, confidence:0.92, action:'Inspect Now'},
  ]

  // chart data (mock)
  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  const strainData = [0.3,0.32,0.35,0.38,0.36,0.34]
  const vibrationData = [1.8,2.0,2.1,2.4,2.3,2.2]
  const tempData = [26,27,28,29,28,27]

  const lineData = {
    labels: months,
    datasets: [
      { label: 'Strain (µε)', data: strainData, borderColor: 'rgba(20,83,45,0.9)', backgroundColor: 'rgba(20,83,45,0.06)', tension:0.3, yAxisID:'y1' },
      { label: 'Vibration (Hz)', data: vibrationData, borderColor: 'rgba(15,118,110,0.9)', backgroundColor: 'rgba(15,118,110,0.06)', tension:0.3, yAxisID:'y2' }
    ]
  }

  const barData = {
    labels: ['EXCELLENT','GOOD','FAIR','POOR','CRITICAL'],
    datasets: [{ label: 'Bridges', data: [8,15,22,7,3], backgroundColor: ['#14532D','#4D7C0F','#F59E0B','#F97316','#C62828'] }]
  }

  const pieData = { labels:['ADMIN','USER'], datasets:[{ data:[3,45], backgroundColor:['#14532D','#0F766E'] }] }

  const areaData = { labels: months, datasets:[{ label:'Temperature (°C)', data: tempData, borderColor:'#0F766E', backgroundColor:'rgba(15,118,110,0.12)', fill:true, tension:0.3 }] }

  const chartOptionsCommon = {
    animation: { duration: 900, easing: 'easeOutCubic' },
    plugins: { legend: { position: 'top' } },
    responsive: true,
    maintainAspectRatio:false
  }

  const lineOptions = { ...chartOptionsCommon, scales: { y1:{ type:'linear', position:'left' }, y2:{ type:'linear', position:'right', grid:{ drawOnChartArea:false } } } }
  const areaOptions = { ...chartOptionsCommon, elements: { line: { tension:0.3 } } }

  return (
    <div className="page-full" style={{display:'flex'}}>
      <Sidebar open={asideOpen} />
      <div style={{flex:1}}>
        <Topbar onToggle={()=>setAsideOpen(v=>!v)} />
        <div className="container constrain" style={{paddingTop:12}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            <div className="card">Total Bridges<br/><strong>{total}</strong></div>
            <div className="card">Average BQI<br/><strong>{avg}</strong></div>
            <div className="card">Flagged Bridges<br/><strong>{critical}</strong></div>
            <div className="card">Reports Submitted<br/><strong>12</strong></div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
            <div className="card">
              <h4 style={{color:'var(--primary)'}}>Bridge Health Logs</h4>
              <ul>
                {mockHealthLogs.map(h=> (
                  <li key={h.id} style={{marginBottom:8}}>
                    <strong>{h.bridge}</strong> — Strain: {h.strain} µε, Vib: {h.vibration} Hz, Temp: {h.temp}°C
                    <div style={{fontSize:12,color:'#666'}}>Recorded: {h.ts}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h4 style={{color:'var(--primary)'}}>ML Output Logs</h4>
              <table>
                <thead><tr><th>Bridge</th><th>Index</th><th>Confidence</th><th>Action</th></tr></thead>
                <tbody>
                  {mockMl.map(m=> (
                    <tr key={m.id}><td>{m.bridge}</td><td>{m.healthIndex}</td><td>{Math.round(m.confidence*100)}%</td><td>{m.action}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
            <div className="card" style={{height:220}}>
              <h4 style={{color:'var(--primary)'}}>Strain & Vibration Trends</h4>
              <div style={{height:160}}><Line data={lineData} options={lineOptions} /></div>
            </div>
            <div className="card" style={{height:220}}>
              <h4 style={{color:'var(--primary)'}}>Temperature Variations (Area)</h4>
              <div style={{height:160}}><Line data={areaData} options={areaOptions} /></div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
            <div className="card" style={{height:220}}>
              <h4 style={{color:'var(--primary)'}}>BQI Distribution</h4>
              <div style={{height:160}}><Bar data={barData} options={chartOptionsCommon} /></div>
            </div>
            <div className="card" style={{height:220}}>
              <h4 style={{color:'var(--primary)'}}>User Roles</h4>
              <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center'}}><Doughnut data={pieData} options={chartOptionsCommon} /></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
