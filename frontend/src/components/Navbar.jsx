import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BridgesContext } from '../App'
import './navbar.css'
import logo from '../assets/logo.png'

export default function Navbar(){
  const { user, setUser } = useContext(BridgesContext)
  const navigate = useNavigate()

  const logout = () =>{
    // clear user session and related caches
    localStorage.removeItem('bqi_user')
    localStorage.removeItem('bqi_watchlist')
    localStorage.removeItem('bqi_edit')
    setUser(null)
    navigate('/')
  }
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleMobile = () => setMobileOpen(v => !v)

  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">
          <img src={logo} alt="BQI" className="logo-img" />
          <span className="brand-text">BQI</span>
        </Link>
        <button className="mobile-toggle" onClick={() => { toggleMobile(); window.dispatchEvent(new CustomEvent('toggleSidebar')) }} aria-label="Menu">
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`}><div/></span>
        </button>
      </div>
      <nav className={`nav-right ${mobileOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <Link to="/" className="nav-link" onClick={()=>setMobileOpen(false)}>Home</Link>
            <Link to="/about" className="nav-link" onClick={()=>setMobileOpen(false)}>About BQI</Link>
            <Link to="/maps" className="nav-link" onClick={()=>setMobileOpen(false)}>Map</Link>
            <Link to="/login" className="nav-link login-btn" onClick={()=>setMobileOpen(false)}>Login</Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            {/* Map moved to admin sidebar per design */}
            <div className="user-info" style={{display:'flex',alignItems:'center',gap:8,paddingLeft:8}}>
              <div style={{fontSize:12,color:'#14532D'}}>{user.email}</div>
              {user.phone && <div style={{fontSize:12,color:'#14532D'}}>{user.phone}</div>}
            </div>
            <button className="link-like" onClick={()=>{logout(); setMobileOpen(false)}} aria-label="Logout">Logout</button>
          </>
        )}

        {user && user.role !== 'admin' && (
          <>
            <Link to="/maps" className="nav-link" onClick={()=>setMobileOpen(false)}>Map</Link>
            <div className="user-info" style={{display:'flex',alignItems:'center',gap:8,paddingLeft:8}}>
              <div style={{fontSize:12,color:'#14532D'}}>{user.email}</div>
              {user.phone && <div style={{fontSize:12,color:'#14532D'}}>{user.phone}</div>}
            </div>
            <div style={{position:'relative'}}>
              <button className="link-like" onClick={()=>{logout(); setMobileOpen(false)}} aria-label="Logout">Logout</button>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
