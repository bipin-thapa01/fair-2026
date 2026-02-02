import React from 'react'

export default function Footer(){
  return (
    <footer style={{background:'#f3f7f3',borderTop:'1px solid #e6efe6',padding:'18px 24px',marginTop:24}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{color:'#14532D',fontWeight:700}}>Bridge Quality Index (BQI)</div>
        <div style={{color:'#64748b',fontSize:13}}>© {new Date().getFullYear()} Bridge Quality Index. All rights reserved.</div>
      </div>
    </footer>
  )
}
