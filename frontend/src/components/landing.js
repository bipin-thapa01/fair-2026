import React from 'react'

export default function LandingAnim(){
  return (
    <div style={{position:'relative',height:'320px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg viewBox="0 0 1200 320" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#062b44" />
            <stop offset="1" stopColor="#0b3b5a" />
          </linearGradient>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0" stopColor="#6fd3ff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1f6feb" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="320" fill="url(#g1)" />
        {/* simple bridge silhouette */}
        <g transform="translate(0,40)" fill="#022533" opacity="0.95">
          <path d="M20 220 L120 140 L220 220 L320 140 L420 220 L520 140 L620 220 L720 140 L820 220 L920 140 L1020 220 L1180 220 L1180 280 L20 280 Z" />
        </g>
        {/* flowing gradient overlay for subtle motion */}
        <g>
          <rect x="0" y="40" width="1200" height="220" fill="url(#flow)">
            <animate attributeName="x" from="-1200" to="1200" dur="10s" repeatCount="indefinite" />
          </rect>
        </g>
      </svg>

      <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',gap:24,flexDirection:'row',width:'90%',maxWidth:1000}}>
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'2.4rem',color:'#eaf6ff'}}>Digitally Monitoring Nepal’s Bridges</h1>
          <p style={{marginTop:8,color:'#d8eefc'}}>Promoting transparency and safety through sensor-driven analytics and public reporting.</p>
        </div>

        <div style={{width:180,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',padding:12,borderRadius:10,boxShadow:'0 8px 20px rgba(0,0,0,0.35)',transform:'translateY(0)',animation:'cardFloat 4s ease-in-out infinite'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:44,height:44,borderRadius:8,background:'linear-gradient(90deg,#1f6feb,#3fb0ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>B</div>
            <div>
              <div style={{fontWeight:700,color:'#eaf6ff'}}>Live BQI</div>
              <div style={{fontSize:12,color:'#cfeeff'}}>Sensor-driven bridge scores</div>
            </div>
          </div>
          <div style={{marginTop:10,display:'flex',justifyContent:'space-between',color:'#cfeeff'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:700}}>128</div>
              <div style={{fontSize:11}}>Bridges</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:700}}>72</div>
              <div style={{fontSize:11}}>Avg BQI</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes cardFloat {0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}`}</style>
    </div>
  )
}
