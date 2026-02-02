import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { BridgesContext } from '../../contexts/BridgesContext'
import UserSidebar from '../../components/UserSidebar'
import './userLayout.css'

export default function UserLayout(){
  const [asideOpen, setAsideOpen] = useState(true)
  const navigate = useNavigate()

  const location = useLocation()
  const routeTitleMap = {
    '/user': 'Dashboard',
    '/user/': 'Dashboard',
    '/user/reports': 'My Reports',
    '/user/tips': 'Safety Tips'
  }
  const title = routeTitleMap[location.pathname] || 'User'

  const { user } = useContext(BridgesContext)

  return (
    <div style={{display:'flex',minHeight:'calc(100vh - 64px)'}}>
      <UserSidebar open={asideOpen} />
      <div style={{flex:1, position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:12,borderBottom:'1px solid var(--border-gray)',background:'linear-gradient(180deg,#ECF9F0,#F7FFF5)'}}>
          <button aria-label="Toggle sidebar" onClick={()=>setAsideOpen(v=>!v)} style={{border:'none',background:'transparent',fontSize:20,cursor:'pointer'}}>☰</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:'var(--primary)'}}>{title}</div>
          </div>
        </div>



        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
