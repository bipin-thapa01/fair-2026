import React from 'react'
import { Link } from 'react-router-dom'
import LandingAnim from '../components/landing.jsx'
import logo from '../assets/logo.png'

function greeting(){
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Landing(){
  return (
    <div className="landing-hero page-full" style={{background:'linear-gradient(180deg,#ECF9F0,#F7FFF5)'}}>
      <div className="container" style={{height:'100%',display:'flex',alignItems:'center',gap:32}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src={logo} alt="BQI" style={{height:84}} />
            <h1 className="hero-title" style={{color:'#14532D'}}>{greeting()}, welcome to Bridge Quality Index</h1>
          </div>
          <p className="hero-sub" style={{color:'#1C1917'}}>Digitally Monitoring Nepal’s Bridges — transparency, safety, and preventive maintenance.</p>
          <div style={{display:'flex',gap:12,marginTop:18}}>
            <Link to="/about" className="btn ghost" style={{borderColor:'#14532D',color:'#14532D'}}>About BQI</Link>
            <Link to="/login" className="btn primary hero-login" style={{background:'#0F766E',color:'#fff',padding:'8px 12px',borderRadius:8}}>Login</Link>
          </div>
          <div style={{marginTop:16,color:'#14532D'}}>
            <p><strong>Public summaries:</strong> View simplified bridge health scores and recent inspections for public awareness.</p>
            <p><strong>Admin analytics:</strong> Authorized users can access dashboards, trends, and exportable reports.</p>
            <p><strong>Sensor-driven scores:</strong> Integrates vibration and strain sensors to produce automated BQI calculations.</p>
          </div>
        </div>
        <div style={{flex:1,height:'70%'}}>
          <LandingAnim />
        </div>
      </div>

      <div className="container constrain features" style={{paddingTop:28}}>
        <div className="feature-grid">
          <div className="feature card"><div style={{fontSize:22,fontWeight:800,color:'#4D7C0F'}}>C</div><div style={{marginTop:6}}><strong>Citizen View</strong><div style={{fontSize:12}}>Public access to bridge safety summaries, recent inspection highlights, and downloadable public reports.</div></div></div>
          <div className="feature card"><div style={{fontSize:22,fontWeight:800,color:'#4D7C0F'}}>G</div><div style={{marginTop:6}}><strong>Government Oversight</strong><div style={{fontSize:12}}>Administrative dashboards for monitoring, audit trails, and policy-driven alerts to prioritize interventions.</div></div></div>
          <div className="feature card"><div style={{fontSize:22,fontWeight:800,color:'#4D7C0F'}}>B</div><div style={{marginTop:6}}><strong>Bridge Analytics</strong><div style={{fontSize:12}}>Time-series analytics from sensors, BQI distribution charts, and exportable CSV reports for decision making.</div></div></div>
          <div className="feature card"><div style={{fontSize:22,fontWeight:800,color:'#4D7C0F'}}>R</div><div style={{marginTop:6}}><strong>Reports</strong><div style={{fontSize:12}}>Downloadable assessment reports, inspection summaries, and incident logs for individual bridges.</div></div></div>
        </div>
      </div>
    </div>
  )
}
