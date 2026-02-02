import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BridgesContext } from '../contexts/BridgesContext'
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
        <button className="mobile-toggle" onClick={() => { toggleMobile(); window.dispatchEvent(new CustomEvent('bqi-toggle-sidebar')) }} aria-label="Menu">
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}><div/></span>
          </button>
      </div>
      <nav className={`nav-right ${mobileOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <Link to="/" className="nav-link" onClick={()=>setMobileOpen(false)}>Home</Link>
            <Link to="/about" className="nav-link" onClick={()=>setMobileOpen(false)}>About BQI</Link>
            <Link to="/login" className="nav-link login-btn" onClick={()=>setMobileOpen(false)}>Login</Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            {/* Map moved to admin sidebar per design */}
            <div className="user-info" style={{display:'flex',alignItems:'center',gap:12,paddingLeft:8}}>
              <div style={{fontSize:12,color:'var(--primary)'}}>{user.email}</div>
              <button title="Logout" onClick={()=>{logout(); setMobileOpen(false)}} style={{display:'inline-flex',alignItems:'center',gap:8,padding:8,borderRadius:8,border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'var(--text-dark)',cursor:'pointer'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                <span style={{fontWeight:700}}>Logout</span>
              </button>
            </div>
          </>
        )}

        {user && user.role !== 'admin' && (
          <>
            <div className="user-info" style={{display:'flex',alignItems:'center',gap:12,paddingLeft:8}}>
              <div style={{fontSize:12,color:'var(--primary)'}}>{user.email}</div>
              <button title="Logout" className="logout-btn" onClick={()=>{logout(); setMobileOpen(false)}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
