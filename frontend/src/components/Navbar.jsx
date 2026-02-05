import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BridgesContext } from '../contexts/BridgesContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, setUser } = useContext(BridgesContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('bqi_user')
    localStorage.removeItem('bqi_token')
    localStorage.removeItem('bqi_watchlist')
    localStorage.removeItem('bqi_edit')
    setUser(null)
    navigate('/')
    setUserMenuOpen(false)
  }

  const toggleMobile = () => setMobileOpen(v => !v)

  const toggleUserMenu = () => setUserMenuOpen(v => !v)

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name && !user?.email) return 'U'
    const name = user.name || user.email.split('@')[0]
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Normalize role and helpers
  const roleLower = (user?.role || '').toString().toLowerCase()
  const isAdmin = roleLower === 'admin'

  // Get user role color
  const getUserRoleColor = () => {
    switch(roleLower) {
      case 'admin': return '#8B5CF6'
      case 'government': return '#3B82F6'
      case 'inspector': return '#EC4899'
      default: return '#10B981'
    }
  }

  return (
    <header 
      className="nav" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92))',
        backdropFilter: 'blur(10px)',
        boxShadow: scrolled 
          ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
          : '0 2px 10px rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid rgba(15, 118, 110, 0.1)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        height: '100%',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <button 
              className="mobile-toggle" 
              onClick={() => { 
                toggleMobile(); 
                window.dispatchEvent(new CustomEvent('bqi-toggle-sidebar')) 
              }} 
              aria-label="Menu"
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 118, 110, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <div style={{
                width: '24px',
                height: '24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  width: '100%',
                  height: '2px',
                  background: mobileOpen ? '#0F766E' : '#1E293B',
                  transform: mobileOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none',
                  transition: 'all 0.3s ease',
                  borderRadius: '1px'
                }}></span>
                <span style={{
                  width: mobileOpen ? '0' : '100%',
                  height: '2px',
                  background: '#1E293B',
                  opacity: mobileOpen ? 0 : 1,
                  transition: 'all 0.3s ease',
                  borderRadius: '1px'
                }}></span>
                <span style={{
                  width: '100%',
                  height: '2px',
                  background: mobileOpen ? '#0F766E' : '#1E293B',
                  transform: mobileOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none',
                  transition: 'all 0.3s ease',
                  borderRadius: '1px'
                }}></span>
              </div>
            </button>
          )}

          <Link to="/" className="brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(15, 118, 110, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              overflow: 'hidden'
            }}>
              <img 
                src={logo} 
                alt="BQI" 
                style={{ 
                  height: '32px',
                  filter: 'brightness(0) invert(1)'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#3B82F6',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.2'
              }}>
                Bridge Quality Index
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748B',
                fontWeight: '500'
              }}>
                Nepal's Bridge Safety Platform
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links (Non-logged in users) */}
        {!user && (
          <nav className="nav-links" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '32px'
          }}>
            {[
              { path: '/', label: 'Home', icon: '🏠' },
              { path: '/about', label: 'About BQI', icon: 'ℹ️' },
              { path: '/maps', label: 'Bridge Map', icon: '🌉' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#0F766E' : '#475569',
                  fontSize: '15px',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)';
                    e.currentTarget.style.color = '#0F766E';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
                {location.pathname === item.path && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '12px',
                    right: '12px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #0F766E, #3B82F6)',
                    borderRadius: '2px'
                  }}></div>
                )}
              </Link>
            ))}
          </nav>
        )}

        {/* Right: Auth/User Section */}
        <div className="auth-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!user ? (
            <>
              <Link
                to="/login"
                style={{
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(15, 118, 110, 0.2)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 118, 110, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 118, 110, 0.2)';
                }}
              >
                <span>🔐</span>
                Login / Register
              </Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={toggleUserMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(15, 118, 110, 0.05)',
                  border: '1px solid rgba(15, 118, 110, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 118, 110, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {getUserInitials()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: getUserRoleColor(),
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                  {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : ''}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#64748B',
                  transition: 'transform 0.2s',
                  transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(15, 118, 110, 0.1)',
                  minWidth: '220px',
                  zIndex: 1001,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(15, 118, 110, 0.1)',
                    background: 'rgba(15, 118, 110, 0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {getUserInitials()}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#1E293B',
                          marginBottom: '2px'
                        }}>
                          {user.name || user.email.split('@')[0]}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: getUserRoleColor(),
                          fontWeight: '500'
                        }}>
                          {isAdmin ? '👑 Administrator' : 
                           roleLower === 'government' ? '🏛️ Government' : 
                           roleLower === 'inspector' ? '🔍 Inspector' : '👤 Public User'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={() => {
                        navigate(isAdmin ? '/admin' : '/user')
                        setUserMenuOpen(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#475569',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)';
                        e.currentTarget.style.color = '#0F766E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <span>📊</span>
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        navigate('/maps')
                        setUserMenuOpen(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#475569',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)';
                        e.currentTarget.style.color = '#0F766E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <span>🌉</span>
                      Bridge Map
                    </button>

                    <button
                      onClick={() => {
                        navigate('/profile')
                        setUserMenuOpen(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#475569',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)';
                        e.currentTarget.style.color = '#0F766E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <span>👤</span>
                      My Profile
                    </button>
                  </div>

                  <div style={{
                    padding: '8px',
                    borderTop: '1px solid rgba(15, 118, 110, 0.1)',
                    background: 'rgba(15, 118, 110, 0.02)'
                  }}>
                    <button
                      onClick={logout}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1))';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && !user && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderTop: '1px solid rgba(15, 118, 110, 0.1)',
          padding: '20px 24px',
          zIndex: 999,
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { path: '/', label: 'Home', icon: '🏠' },
              { path: '/about', label: 'About BQI', icon: 'ℹ️' },
              { path: '/maps', label: 'Bridge Map', icon: '🌉' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#0F766E' : '#475569',
                  fontSize: '16px',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  background: location.pathname === item.path ? 'rgba(15, 118, 110, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.background = 'rgba(15, 118, 110, 0.05)';
                    e.currentTarget.style.color = '#0F766E';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
                {location.pathname === item.path && (
                  <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#0F766E' }}>
                    ●
                  </div>
                )}
              </Link>
            ))}
            
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: 'white',
                padding: '16px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>🔐</span>
              Login / Register
            </Link>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .nav {
          animation: fadeIn 0.5s ease;
        }
        
        /* Click outside to close dropdown */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 999;
        }
        
        @media (max-width: 768px) {
          button.mobile-toggle {
            display: flex !important;
          }

          .nav-links {
            display: none !important;
          }

          .auth-section {
            gap: 12px !important;
          }

          .brand > div {
            display: none !important;
          }

          .brand > div:first-child {
            display: flex !important;
          }
        }
        
        @media (max-width: 480px) {
          .nav > div {
            padding: 0 16px !important;
          }
          
          button[style*="padding: 10px 24px"] {
            padding: 8px 16px !important;
            font-size: 14px !important;
          }
          
          .brand > div > div:first-child {
            font-size: 12px !important;
          }
          
          .brand > div > div:last-child {
            display: none !important;
          }
        }
      `}</style>

      {/* Click outside to close dropdown */}
      {userMenuOpen && (
        <div 
          className="overlay"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  )
}