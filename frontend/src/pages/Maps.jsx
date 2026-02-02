import React, { useContext, useEffect, useState } from 'react'
import LeafletMap from '../components/LeafletMap'
import { BridgesContext } from '../contexts/BridgesContext'
import Sidebar from '../components/Sidebar'
import UserSidebar from '../components/UserSidebar'

export default function MapsPage(){
  const { user } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(true)

  useEffect(()=>{
    const handler = () => setAsideOpen(v=>!v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return ()=> window.removeEventListener('bqi-toggle-sidebar', handler)
  },[])

  const greeting = ()=>{
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div style={{height:'100vh',display:'flex'}}>
      {user?.role === 'admin' ? (
        <Sidebar open={asideOpen} />
      ) : (
        <UserSidebar open={asideOpen} />
      )}
      <div style={{flex:1,position:'relative'}}>
        {/* header-style hamburger + greeting */}
        {user && (
          <div style={{position:'absolute',left:16,top:16,zIndex:60,display:'flex',alignItems:'center',gap:10,background:'var(--bg-light)',border:'1px solid var(--border-gray)',padding:'8px 12px',borderRadius:8,boxShadow:'0 6px 18px rgba(8,30,20,0.06)'}}>
            <button onClick={()=> window.dispatchEvent(new CustomEvent('bqi-toggle-sidebar'))} aria-label="Toggle sidebar" style={{background:'transparent',border:'none',fontSize:18,cursor:'pointer'}}>☰</button>
            <div style={{fontWeight:700,color:'var(--primary)'}}>{greeting()}, {user.name}</div>
          </div>
        )}
        <LeafletMap />
      </div>
    </div>
  )
}
