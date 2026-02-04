import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BridgesContext } from '../contexts/BridgesContext'

export default function Login(){
  const { setUser } = useContext(BridgesContext)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user starts typing
  }

  const validateForm = () => {
    const { email, password } = formData
    
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    
    // Prevent admin email registration
    if (isRegister) {
      const adminKeywords = ['admin', 'administrator', 'bqi.gov.np', 'gov.np']
      const isAdminEmail = adminKeywords.some(keyword => 
        email.toLowerCase().includes(keyword)
      )
      if (isAdminEmail) {
        return 'Cannot register with administrative email addresses'
      }
    }
    
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isRegister) {
        // Registration API call - only email and password
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: 'user' // Always user for registration
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed')
        }
        
        // Store user data and token
        localStorage.setItem('bqi_token', data.token)
        localStorage.setItem('bqi_user', JSON.stringify(data.user))
        setUser(data.user)
        navigate('/user')
        
      } else {
        // Login API call
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }
        
        // Store user data and token
        localStorage.setItem('bqi_token', data.token)
        localStorage.setItem('bqi_user', JSON.stringify(data.user))
        setUser(data.user)
        navigate(data.user.role === 'admin' ? '/admin' : '/user')
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.')
      console.error('Auth error:', error)
      
      // Fallback to mock data for demo purposes
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          id: Date.now(),
          name: formData.email.split('@')[0],
          email: formData.email,
          role: formData.email.toLowerCase().includes('admin') ? 'admin' : 'user',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.email.split('@')[0])}&background=0F766E&color=fff`
        }
        
        localStorage.setItem('bqi_user', JSON.stringify(mockUser))
        setUser(mockUser)
        setIsLoading(false)
        navigate(mockUser.role === 'admin' ? '/admin' : '/user')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="login-page page-full" 
      style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        minHeight:'100vh',
        background: 'linear-gradient(135deg, #ECF9F0 0%, #F0FDF4 50%, #E6F7FF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
        borderRadius: '50%',
        animation: 'pulse 8s ease-in-out infinite',
        opacity: 0.7
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)',
        borderRadius: '50%',
        animation: 'pulse 6s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.7
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '480px',
        padding: '20px'
      }}>
        {/* Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(15, 118, 110, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0F766E, #3B82F6)'
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(59, 130, 246, 0.1))',
            borderRadius: '50%',
            opacity: 0.6
          }}></div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(15, 118, 110, 0.3)'
              }}>
                <span style={{ fontSize: '24px', color: 'white' }}>🌉</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3B82F6',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Bridge Quality Index
                </div>
                <h2 style={{
                  margin: 0,
                  color: '#1E293B',
                  fontSize: '24px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {isRegister ? 'Create Your Account' : 'Welcome Back'}
                </h2>
              </div>
            </div>
            
            <p style={{
              color: '#64748B',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0
            }}>
              {isRegister 
                ? 'Join Nepal\'s bridge safety community with just your email'
                : 'Sign in to access bridge analytics, reports, and safety insights'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                Email Address
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  fontSize: '18px',
                  color: '#94A3B8'
                }}>
                  ✉️
                </div>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#1E293B',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0F766E';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 118, 110, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                Password
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  fontSize: '18px',
                  color: '#94A3B8'
                }}>
                  🔒
                </div>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#1E293B',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0F766E';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 118, 110, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              {isRegister && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#64748B',
                    lineHeight: '1.4'
                  }}>
                    • Password must be at least 6 characters<br />
                    • Cannot register with administrative email addresses
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '14px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'shake 0.5s ease'
              }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span style={{ 
                  color: '#DC2626', 
                  fontSize: '14px',
                  flex: 1 
                }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
                width: '100%',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(15, 118, 110, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>{isRegister ? '📝' : '🔐'}</span>
                  {isRegister ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </button>
          </form>

          {/* Toggle between Login/Register */}
          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <p style={{
              color: '#64748B',
              fontSize: '14px',
              margin: 0,
              marginBottom: '8px'
            }}>
              {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
            </p>
            <button 
              type="button" 
              onClick={()=>{
                setIsRegister(!isRegister)
                setError('')
                setFormData({
                  email: '',
                  password: '',
                })
              }}
              style={{
                background: 'rgba(15, 118, 110, 0.1)',
                color: '#0F766E',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(15, 118, 110, 0.2)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 118, 110, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 118, 110, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isRegister ? 'Sign In Instead' : 'Create New Account'}
            </button>
          </div>

          {/* Demo credentials */}
          {!isRegister && process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(15, 118, 110, 0.05)',
              borderRadius: '12px',
              border: '1px dashed rgba(15, 118, 110, 0.3)'
            }}>
              <p style={{
                color: '#64748B',
                fontSize: '12px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Demo Credentials (Development Only)
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                color: '#475569'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{ minWidth: '60px' }}>Admin:</span>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '4px',
                    flex: 1,
                    minWidth: '200px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <code style={{ 
                        background: 'rgba(15, 118, 110, 0.1)', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        flex: 1,
                        minWidth: '150px'
                      }}>
                        admin@bqi.gov.np
                      </code>
                      <code style={{ 
                        background: 'rgba(15, 118, 110, 0.1)', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        flex: 1,
                        minWidth: '80px'
                      }}>
                        admin123
                      </code>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic' }}>
                      Cannot be used for registration
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{ minWidth: '60px' }}>User:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                    <code style={{ 
                      background: 'rgba(15, 118, 110, 0.1)', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '11px',
                      flex: 1,
                      minWidth: '150px'
                    }}>
                      user@example.com
                    </code>
                    <code style={{ 
                      background: 'rgba(15, 118, 110, 0.1)', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '11px',
                      flex: 1,
                      minWidth: '80px'
                    }}>
                      anypassword
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: '#94A3B8',
          fontSize: '12px'
        }}>
          <p style={{ margin: 0 }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
          <p style={{ margin: '4px 0 0 0' }}>
            © 2024 Bridge Quality Index. All rights reserved.
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-page {
          animation: fadeIn 0.6s ease;
        }
        
        @media (max-width: 600px) {
          div[style*="max-width"] {
            padding: 16px !important;
          }
          
          div[style*="padding: '48px 40px'"] {
            padding: 32px 24px !important;
          }
          
          div[style*="display: flex; justify-content: space-between"] {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  )
}