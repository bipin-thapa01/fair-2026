import React, { useContext, useState } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'

export default function ReportsNew(){
  const { bridges } = useContext(BridgesContext)
  const [form, setForm] = useState({ bridgeId: (bridges && bridges[0] && bridges[0].id) || '', issueType:'Structural', description:'' })
  const submit = async (e)=>{
    e.preventDefault()
    const reports = JSON.parse(localStorage.getItem('bqi_reports')||'[]')
    reports.push({ bridgeId: form.bridgeId, issueType: form.issueType, description: form.description, ts: new Date().toISOString() })
    localStorage.setItem('bqi_reports', JSON.stringify(reports))
    alert('Report submitted successfully.')
    setForm({ bridgeId: form.bridgeId, issueType:'Structural', description:'' })
  }
  return (
    <div style={{padding:18}} className="fade-in">
      <h2>New Report</h2>
      <form onSubmit={submit} style={{maxWidth:640,display:'grid',gap:12}}>
        <label>Bridge<select value={form.bridgeId} onChange={e=>setForm(f=>({...f,bridgeId:e.target.value}))}>
          {bridges && bridges.map(b=> <option key={b.id} value={b.id}>{b.name} — {b.lat}, {b.lng}</option>)}
        </select></label>
        <label>Issue Type<select value={form.issueType} onChange={e=>setForm(f=>({...f,issueType:e.target.value}))}><option>Structural</option><option>Deck</option><option>Approach</option><option>Other</option></select></label>
        <label>Description<textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4}></textarea></label>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button type="submit" style={{background:'#1f6feb',color:'#fff'}}>Submit Report</button>
        </div>
      </form>
    </div>
  )
}
