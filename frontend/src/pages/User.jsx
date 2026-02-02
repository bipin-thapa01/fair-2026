import React, { useContext, useState, useMemo, useEffect } from 'react'
import { BridgesContext } from '../App'
import { classification } from '../utils/bqi'
import UserSidebar from '../components/UserSidebar'

export default function User(){
  const { bridges } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(true)

  useEffect(()=>{
    const handler = ()=> setAsideOpen(v=>!v)
    window.addEventListener('toggleSidebar', handler)
    return ()=> window.removeEventListener('toggleSidebar', handler)
  },[])

  const watchedIds = useMemo(()=> JSON.parse(localStorage.getItem('bqi_watchlist')||'[]'), [])
  const watchlist = bridges.filter(b=> watchedIds.includes(b.id))

  const downloadReport = (b)=>{
    const w = window.open('', '_blank')
    w.document.write('<html><head><title>Report</title></head><body>')
    w.document.write(`<h1>${b.name}</h1><p>BQI: ${b.bqi}</p>`)    
    w.document.write('</body></html>')
    w.document.close()
    w.print()
  }

  const pending = bridges.filter(b=> (b.bqi||0) < 50).length

  return (
    <div className="page-full" style={{display:'flex'}}>
      <UserSidebar open={asideOpen} />
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12}}>
          <button onClick={()=>setAsideOpen(v=>!v)} style={{border:'none',background:'transparent',cursor:'pointer'}}>☰</button>
          <div style={{fontWeight:700}}>User Dashboard</div>
          <div>
            <strong>Watched:</strong> {watchlist.length} &nbsp; <strong>Flagged:</strong> {pending}
          </div>
        </div>

        <div className="container constrain">
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:12}}>
            <div>
              <div className="card">
                <h3>Overview</h3>
                <p>Bridges monitored: <strong>{bridges.length}</strong></p>
                <p>Reports (pending): <strong>{pending}</strong></p>
              </div>

              <div className="card" style={{marginTop:12}}>
                <h4>Your Watchlist</h4>
                {watchlist.length === 0 ? <div>No bridges watched yet.</div> : (
                  <ul>
                    {watchlist.map(b=> (
                      <li key={b.id} style={{marginBottom:8}}>
                        <strong>{b.name}</strong> — BQI: {b.bqi} — <button onClick={()=>downloadReport(b)}>Download</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <div className="card">
                <h4>Notifications</h4>
                <ul>
                  {bridges.filter(b=> (b.bqi||0) < 50).slice(0,5).map(b=> (
                    <li key={b.id} style={{marginBottom:8}}>
                      <strong>{b.name}</strong> flagged — BQI: {b.bqi}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card" style={{marginTop:12}}>
                <h4>Educational</h4>
                <p>Bridge safety tips and recommended actions for community reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
