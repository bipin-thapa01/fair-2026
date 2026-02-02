import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar({open=true}){
  return (
    <aside style={{width:220, padding:14, borderRight:'1px solid var(--border-gray)', transform: open ? 'translateX(0)' : 'translateX(-260px)', transition:'transform .28s ease', background:'var(--bg-light)'}}>
      <nav style={{display:'flex',flexDirection:'column',gap:10}}>
        <Link className="sidebar-link" to="/admin">Dashboard</Link>
        <Link className="sidebar-link" to="/admin/reports">Reports Oversight</Link>
        <Link className="sidebar-link" to="/admin/users">View Users</Link>
        <Link className="sidebar-link" to="/maps">Map</Link>
      </nav>
    </aside>
  )
}
