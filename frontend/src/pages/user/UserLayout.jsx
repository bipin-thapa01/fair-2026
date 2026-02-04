import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BridgesContext } from '../../contexts/BridgesContext'
import UserSidebar from '../../components/UserSidebar'
import Topbar from '../../components/Topbar'
import './userLayout.css'

export default function UserLayout(){
  const [asideOpen, setAsideOpen] = useState(false)
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

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  return (
    <div className="page-full" style={{display:'flex', background: '#F8FAFC', minHeight:'100vh'}}>
      <UserSidebar open={asideOpen} />
      <div style={{flex:1, overflow: 'auto'}}>
        <Topbar onToggle={() => setAsideOpen(v => !v)} />

        <div className="container" style={{ padding: '24px' }}>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
