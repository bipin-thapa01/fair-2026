import React, { useState, useContext } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'

function Toast({msg}){
  return (
    <div className={`toast ${msg.type === 'success' ? 'success' : msg.type === 'error' ? 'error' : ''}`}>
      {msg.text}
    </div>
  )
}

export default function UserReports(){
  const [reports, setReports] = useState([
    {id:1, title:'Cracked deck near pier 2', status:'Pending', date:'2026-01-21'},
    {id:2, title:'Loose railing at northbound lane', status:'Pending', date:'2026-01-15'},
    {id:3, title:'Potholes on approach slab', status:'Pending', date:'2025-12-30'},
  ])
  const [toasts, setToasts] = useState([])
  const { bridges } = useContext(BridgesContext)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ bridgeId:'', title:'', description:'' })

  const pushToast = (text, type='success') =>{
    const t = {id: Date.now(), text, type}
    setToasts(s => [t, ...s])
    setTimeout(()=> setToasts(s=> s.filter(x=> x.id !== t.id)), 3800)
  }

  // admin action handlers removed — user-facing reports are read-only here

  const submit = (e)=>{
    e.preventDefault()
    if(!form.title) return pushToast('Title required','error')
    const nr = { id: Date.now(), title: form.title, status:'Pending', date: new Date().toISOString().slice(0,10), bridgeId: form.bridgeId, description: form.description }
    setReports(r=> [nr, ...r])
    pushToast('Report submitted','success')
    setForm({bridgeId:'', title:'', description:''})
    setFormOpen(false)
  }

  return (
    <div className="page-full page-mounted" style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <h2 style={{margin:0}}>My Reports</h2>
      </div>
      <div style={{display:'grid',gap:12}}>
        <div>
          <button className="btn primary" onClick={()=>setFormOpen(v=>!v)}>{formOpen ? 'Close' : 'New Report'}</button>
          {formOpen && (
            <form onSubmit={submit} style={{marginTop:12,display:'grid',gap:8}}>
              <label>Bridge
                <select value={form.bridgeId} onChange={e=>setForm(f=>({...f,bridgeId:e.target.value}))}>
                  <option value="">Select bridge</option>
                  {bridges.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label>Title
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
              </label>
              <label>Description
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} />
              </label>
              <div style={{display:'flex',gap:8}}>
                <button type="submit" className="btn primary">Submit</button>
                <button type="button" className="btn" onClick={()=>setFormOpen(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        {reports.map(r=> (
          <div className={`card ${r.status === 'Resolved' || r.status === 'Withdrawn' ? 'fading' : ''}`} key={r.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong>{r.title}</strong>
                <div style={{fontSize:12,color:'#666'}}>{r.date} — <span style={{fontWeight:700}}>{r.status}</span></div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div style={{fontSize:13,fontWeight:700,color: r.status === 'approved' ? '#059669' : r.status === 'declined' ? '#B91C1C' : '#92400E'}}>{r.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="toast-wrap">
        {toasts.map(t=> <Toast key={t.id} msg={t} />)}
      </div>
    </div>
  )
}
