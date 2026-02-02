import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BridgesContext } from '../App'

export default function Login(){
  const { setUser } = useContext(BridgesContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const validate = ()=>{
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email'
    if (password.length < 6) return 'Password must be at least 6 characters'
    if (isRegister){
      if (email.toLowerCase().includes('admin')) return 'Cannot register admin email'
    }
    return ''
  }

  const submit = (e)=>{
    e.preventDefault()
    const v = validate()
    if (v){ setError(v); return }
    if (isRegister){
      const user = {name: email.split('@')[0], email, role:'user'}
      localStorage.setItem('bqi_user', JSON.stringify(user))
      setUser(user)
      navigate('/user')
      return
    }
    // Try to authenticate against stored mock user
    const stored = localStorage.getItem('bqi_user')
    if (stored){
      try{
        const su = JSON.parse(stored)
        if (su.email === email){
          // if stored password exists, validate it
          if (su.password){
            if (su.password === password){
              setUser(su)
              navigate(su.role === 'admin' ? '/admin' : '/user')
              return
            } else {
              setError('Invalid credentials')
              return
            }
          }
        }
      }catch(e){/* ignore parse errors */}
    }

    // fallback mock auth: admin check or create temporary user
    const role = (email.toLowerCase().includes('admin') && password === 'admin123') ? 'admin' : 'user'
    const user = {name: email.split('@')[0], email, role}
    localStorage.setItem('bqi_user', JSON.stringify(user))
    setUser(user)
    navigate(role === 'admin' ? '/admin' : '/user')
  }

  return (
    <div 
      className="login-page page-full" 
      style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        minHeight:'100vh',
        background:'linear-gradient(180deg,#ECF9F0,#F7FFF5)',
        color:'#1C1917'
      }}
    >
      <div 
        className="login-card card gold" 
        style={{
          border:'none',
          background:'#fff8e1',
          boxShadow:'0 4px 12px rgba(20,83,45,0.2)',
          padding:'2rem',
          borderRadius:'12px'
        }}
      >
        <h2 style={{color:'#14532D'}}>
          {isRegister ? 'Create Account' : 'Login'}
        </h2>
        <form onSubmit={submit} className="login-form">
          <label style={{display:'block',marginBottom:12}}>Email
            <input 
              value={email} 
              onChange={e=>{ setEmail(e.target.value); setError('') }} 
              required 
              style={{
                width:'100%',
                padding:10,
                marginTop:8,
                borderRadius:6,
                border:'1px solid #D1D5DB',
                background:'#ffffff',
                color:'#1C1917'
              }}
            />
          </label>
          <label style={{display:'block',marginBottom:12}}>Password
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              style={{
                width:'100%',
                padding:10,
                marginTop:8,
                borderRadius:6,
                border:'1px solid #D1D5DB',
                background:'#ffffff',
                color:'#1C1917'
              }}
            />
          </label>
          {error && <div style={{background:'rgba(196,45,45,0.12)',padding:10,borderRadius:6}}>{error}</div>}

          <div style={{marginTop:18}}>
            <button 
              type="submit" 
              className="btn primary" 
              style={{
                background:'#0F766E',
                color:'#fff',
                padding:'12px 16px',
                borderRadius:8,
                width:'100%',
                border:'none'
              }}
            >
              {isRegister ? 'Create account' : 'Login'}
            </button>
          </div>

          <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            {!isRegister && (
              <button 
                type="button" 
                className="link" 
                onClick={()=>setIsRegister(true)} 
                style={{
                  color:'var(--primary)',
                  background:'none',
                  border:'none',
                  cursor:'pointer'
                }}
              >
                Create Account
              </button>
            )}
          </div>
        </form>   
      </div>
    </div>
  )
}
