import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function UserSidebar({open=true}){
  const navigate = useNavigate()
  const location = useLocation()

  const nav = (p)=>{
    try{
      // debug log to help trace navigation
      // eslint-disable-next-line no-console
      console.log('[UserSidebar] navigate ->', p)
      // if already on the same route (or a nested path that ends with the same segment), do not toggle/hide the sidebar
      const normalize = (s='') => String(s).replace(/\/+$|^\s+|\s+$/g, '')
      const lp = normalize(location && location.pathname)
      const pp = normalize(p)
      if(lp && pp && (lp === pp || lp.endsWith(pp) || lp.endsWith('/' + pp.split('/').filter(Boolean).pop()))) return
      navigate(p)
      // do not auto-toggle the global sidebar here — keep sidebar state controlled by the layout/hamburger
    }catch(err){
      // eslint-disable-next-line no-console
      console.error('[UserSidebar] navigate error', err)
    }
  }

  return (
    <aside style={{width:200, padding:12, borderRight:'1px solid #e6e9ef', transform: open ? 'translateX(0)' : 'translateX(-220px)', transition:'transform .28s ease'}}>
          <nav style={{display:'flex',flexDirection:'column',gap:8}}>
            <button type="button" className="sidebar-link" onClick={()=>nav('/user')}>Dashboard</button>
            <button type="button" className="sidebar-link" onClick={()=>nav('/user/reports')}>My Reports</button>
            <button type="button" className="sidebar-link" onClick={()=>nav('/user/tips')}>Safety Tips</button>
            <button type="button" className="sidebar-link" onClick={()=>nav('/maps')}>Map</button>
          </nav>
    </aside>
  )
}
