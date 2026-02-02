import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const sampleUsers = [
  {id:'u1', name:'Asha Gurung', email:'asha@example.com', role:'user'},
  {id:'u2', name:'Binod Shrestha', email:'binod@example.com', role:'user'},
  {id:'u3', name:'Manager Admin', email:'admin@example.com', role:'admin'}
]

export default function Users(){
  const [roleFilter, setRoleFilter] = useState('ALL')
  const list = sampleUsers.filter(u => roleFilter === 'ALL' ? true : u.role.toUpperCase() === roleFilter)

  return (
    <div className="page-full" style={{display:'flex'}}>
      <Sidebar open={true} />
      <div style={{flex:1}}>
        <Topbar onToggle={()=>{}} />
        <div className="container constrain" style={{paddingTop:12}}>
          <h2 style={{color:'var(--primary)'}}>View Users</h2>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <label style={{fontSize:13,marginRight:8}}>Filter by role</label>
              <button onClick={()=>setRoleFilter('ALL')} className={`link-filter ${roleFilter==='ALL'?'active':''}`} style={{padding:8,borderRadius:6}}>ALL</button>
              <button onClick={()=>setRoleFilter('ADMIN')} className={`link-filter ${roleFilter==='ADMIN'?'active':''}`} style={{padding:8,borderRadius:6}}>ADMIN</button>
              <button onClick={()=>setRoleFilter('USER')} className={`link-filter ${roleFilter==='USER'?'active':''}`} style={{padding:8,borderRadius:6}}>USER</button>
            </div>
            <div style={{color:'#666',fontSize:13}}>Total: {list.length}</div>
          </div>

          <div style={{marginTop:12}} className="card">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {list.map(u=> (
                  <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td style={{textTransform:'uppercase',color:u.role==='admin'? 'var(--primary)':'#333'}}>{u.role}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
