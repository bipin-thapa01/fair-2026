import React from 'react'
import { Link } from 'react-router-dom'

export default function UserSidebar({open=true}){
  return (
    <aside style={{width:200, padding:12, borderRight:'1px solid #e6e9ef', transform: open ? 'translateX(0)' : 'translateX(-220px)', transition:'transform .28s ease'}}>
      <nav style={{display:'flex',flexDirection:'column',gap:8}}>
        <Link className="sidebar-link" to="/user">Dashboard</Link>
        <Link className="sidebar-link" to="/maps">Maps</Link>
        <Link className="sidebar-link" to="/user/tips">Bridge Safety Tips</Link>
        <Link className="sidebar-link" to="/user/watchlist">Watchlist</Link>
      </nav>
    </aside>
  )
}
