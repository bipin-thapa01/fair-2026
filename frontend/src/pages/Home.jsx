import React, { useContext, useMemo } from 'react'
import { BridgesContext } from '../App'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { classification } from '../utils/bqi'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function Home(){
  const { bridges } = useContext(BridgesContext)

  const stats = useMemo(()=>{
    const counts = {Safe:0, Moderate:0, Critical:0}
    bridges.forEach(b=>{
      const cls = classification(b.bqi ?? 0).label
      counts[cls] = (counts[cls]||0)+1
    })
    return counts
  },[bridges])

  const doughnutData = {
    labels: ['Safe','Moderate','Critical'],
    datasets: [{ data: [stats.Safe, stats.Moderate, stats.Critical], backgroundColor:['#2e7d32','#f9a825','#c62828'] }]
  }

  const barData = {
    labels: ['Safe','Moderate','Critical'],
    datasets: [{ label: 'Bridges', data: [stats.Safe, stats.Moderate, stats.Critical], backgroundColor:['#2e7d32','#f9a825','#c62828'] }]
  }

  return (
    <div className="page-full">
      <div className="constrain">
        <h2>Overview Dashboard</h2>
        <section className="dashboard-grid">
        <div className="card"><h3>Distribution</h3><Doughnut data={doughnutData} /></div>
        <div className="card"><h3>Counts</h3><Bar data={barData} /></div>
      </section>
      <section className="card">
        <h3>Recent Bridges</h3>
        <ul>
          {bridges.slice(0,6).map(b=> <li key={b.id}>{b.name} — BQI: {b.bqi ?? '—'}</li>)}
        </ul>
      </section>
      </div>
    </div>
  )
}
