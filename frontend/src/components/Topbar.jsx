import React, { useContext } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'

function greeting(){
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Topbar({onToggle}){
  const { user } = useContext(BridgesContext)
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid var(--border-gray)',background:'transparent'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={onToggle} style={{border:'none',background:'transparent',cursor:'pointer',fontSize:18}} aria-label="Toggle sidebar">☰</button>
        <div style={{fontWeight:700,color:'var(--primary)'}}>{greeting()}, {user?.name || 'Administrator'}</div>
      </div>
      <div style={{fontSize:14,color:'var(--text-dark)'}}></div>
    </div>
  )
}
