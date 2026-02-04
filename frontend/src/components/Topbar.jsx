import React, { useContext } from 'react'
import { BridgesContext } from '../contexts/BridgesContext'
import { useLocation } from 'react-router-dom'

function greeting(){
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Topbar({onToggle}){
  const { user } = useContext(BridgesContext)
  const location = useLocation()
  const isMaps = location?.pathname?.toLowerCase().startsWith('/maps')
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid var(--border-gray)',background:'transparent'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={onToggle} className="bqi-hamburger" style={{border:'none',background:'transparent',cursor:'pointer',fontSize:18,position:'relative',zIndex:1101}} aria-label="Toggle sidebar">☰</button>
        <div style={{fontWeight:700,color:'var(--primary)'}}>{isMaps ? 'Maps' : `${greeting()}, ${user?.name || 'Administrator'}`}</div>
      </div>
      <div style={{fontSize:14,color:'var(--text-dark)'}}></div>
    </div>
  )
}

// Add small CSS to ensure hamburger sits above sidebar on mobile
const style = document.createElement('style')
style.innerHTML = `
  .bqi-hamburger { position: relative; z-index: 1101 }
  @media (max-width: 1023px) {
    .bqi-hamburger { position: fixed !important; left: 12px !important; top: 12px !important; background: rgba(255,255,255,0.9); padding: 8px 10px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); z-index: 1101 }
  }
`
try{ document.head.appendChild(style) }catch(e){}
