import React, { useContext, useEffect, useState } from 'react'
import LeafletMap from '../components/LeafletMap'
import { BridgesContext } from '../contexts/BridgesContext'
import Sidebar from '../components/Sidebar'
import UserSidebar from '../components/UserSidebar'
import Topbar from '../components/Topbar'

export default function MapsPage(){
  const { user } = useContext(BridgesContext)
  const [asideOpen, setAsideOpen] = useState(false)

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
      {user ? (
        user.role === 'admin' ? <Sidebar open={asideOpen} /> : <UserSidebar open={asideOpen} />
      ) : null}
      <div style={{flex:1,position:'relative'}}>
        <Topbar onToggle={() => setAsideOpen(v => !v)} />
        <LeafletMap />
      </div>
    </div>
  )
}
