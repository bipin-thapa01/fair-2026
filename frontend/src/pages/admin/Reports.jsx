import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

function Toast({msg, type}){
  if (!msg) return null
  const bg = type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
  const color = type === 'success' ? 'var(--primary)' : '#b91c1c'
  return (
    <div style={{position:'fixed',right:20,top:90,background:bg,color:color,padding:12,borderRadius:8,boxShadow:'0 8px 20px rgba(0,0,0,0.08)'}}>{msg}</div>
  )
}

const initial = [
  {id:'r1', bridge:'Bagmati Bridge', summary:'Observed increased vibration near midspan, recommend detailed inspection.', status:'Pending', submitted:'2026-01-25 09:12', auditor:'Inspector A'},
  {id:'r2', bridge:'Narayani Bridge', summary:'Local scouring noticed at pier 3, water level rising.', status:'Pending', submitted:'2026-01-26 14:03', auditor:'Inspector B'},
  {id:'r3', bridge:'Himal Viaduct', summary:'Minor cracking on approach slab; monitor monthly.', status:'Pending', submitted:'2026-01-28 08:22', auditor:'Inspector C'}
]

export default function Reports(){
  const [reports, setReports] = useState(initial)
  const [toast, setToast] = useState(null)

  const notify = (msg, type='success')=>{
    setToast({msg,type})
    setTimeout(()=>setToast(null),2000)
  }

  const handleAction = (id, action)=>{
    // optimistic UI: mark as actioned then remove with animation
    setReports(r=>r.map(x=>x.id===id?{...x,status:action}:x))
    if (action === 'Approved') notify('Report approved successfully','success')
    else notify('Report declined successfully','error')
    // remove card after short delay
    setTimeout(()=> setReports(r=>r.filter(x=>x.id!==id)),600)
  }

  return (
    <div className="page-full" style={{display:'flex'}}>
      <Sidebar open={true} />
      <div style={{flex:1}}>
        <Topbar onToggle={()=>{}} />
        <div className="container constrain" style={{paddingTop:12}}>
          <h2 style={{color:'var(--primary)'}}>Reports Oversight</h2>
          <Toast msg={toast?.msg} type={toast?.type} />
          <div style={{display:'grid',gap:12,marginTop:12}}>
            {reports.map(r=> (
              <div key={r.id} className={`card ${r.status!=='Pending' ? 'fading' : ''}`} style={{transition:'opacity .5s,transform .4s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <strong style={{color:'var(--primary)'}}>{r.bridge}</strong>
                    <div style={{fontSize:13,color:'#555'}}>{r.summary}</div>
                    <div style={{fontSize:12,color:'#666',marginTop:8}}>Submitted: {r.submitted} • Auditor: {r.auditor}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>handleAction(r.id,'Approved')} style={{background:'var(--accent)',color:'#fff',padding:'8px 12px',borderRadius:8,border:'none'}}>Approve</button>
                    <button onClick={()=>handleAction(r.id,'Declined')} style={{background:'#c62828',color:'#fff',padding:'8px 12px',borderRadius:8,border:'none'}}>Decline</button>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:12,color:'#777'}}>Audit trail: {r.submitted} — status: {r.status}</div>
              </div>
            ))}
            {reports.length === 0 && <div className="card">No pending reports.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
