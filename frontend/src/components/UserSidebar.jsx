import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function UserSidebar({ open = true }) {
  useEffect(()=>{
    try{
      if (open) document.body.classList.add('bqi-sidebar-open')
      else document.body.classList.remove('bqi-sidebar-open')
      try{ window.dispatchEvent(new CustomEvent('bqi-sidebar-changed')) }catch(e){}
    }catch(e){}
    return ()=>{ try{ document.body.classList.remove('bqi-sidebar-open') }catch(e){} }
  },[open])
  const location = useLocation()

  const menuItems = [
    { path: '/user', label: 'Dashboard', icon: '📊', color: '#3B82F6', description: 'Overview & Activities' },
    { path: '/user/reports', label: 'My Reports', icon: '📋', color: '#10B981', description: 'Submitted Reports' },
    { path: '/user/tips', label: 'Safety Tips', icon: '💡', color: '#F59E0B', description: 'Guidelines & Best Practices' },
    { path: '/maps', label: 'Bridge Map', icon: '🗺️', color: '#EC4899', description: 'Interactive Maps' },
  ]

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
      boxShadow: '0 0 40px rgba(0, 0, 0, 0.2)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      transform: open ? 'translateX(0)' : 'translateX(-280px)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 100,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.03)'
      }}>
        <button onClick={()=>{ try{ window.dispatchEvent(new CustomEvent('bqi-toggle-sidebar')) }catch(e){} }} aria-label="Close sidebar" style={{display:'none'}} className="bqi-sidebar-close">✕</button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(15, 118, 110, 0.3)'
          }}>
            <span style={{ fontSize: '20px', color: 'white' }}>👤</span>
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#3B82F6',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              User Portal
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94A3B8',
              fontWeight: '500'
            }}>
              Bridge Safety Reports
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          padding: '10px 12px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#CBD5E1',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Citizen Reporter
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'white'
          }}>
            Active Member
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#94A3B8',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          padding: '0 8px'
        }}>
          User Navigation
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/user' && location.pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: isActive ? 'white' : '#94A3B8',
                background: isActive ? 
                  `linear-gradient(90deg, ${item.color}20, ${item.color}10)` : 
                  'transparent',
                border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#CBD5E1';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}80)`,
                  borderTopRightRadius: '2px',
                  borderBottomRightRadius: '2px'
                }}></div>
              )}

              {/* Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: isActive ? 
                  `linear-gradient(135deg, ${item.color}, ${item.color}80)` : 
                  'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: isActive ? 'white' : item.color,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 4px 12px ${item.color}30` : 'none'
              }}>
                {item.icon}
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  marginBottom: '2px'
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isActive ? 'rgba(255, 255, 255, 0.7)' : '#64748B'
                }}>
                  {item.description}
                </div>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                  animation: 'pulse 2s infinite'
                }}></div>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          margin: '20px 0'
        }}></div>

        {/* Quick Stats */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '16px',
          marginTop: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#94A3B8',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            Your Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Reports Submitted', value: '8', color: '#10B981' },
              { label: 'Pending Review', value: '2', color: '#F59E0B' },
              { label: 'Bridges Visited', value: '5', color: '#3B82F6' },
            ].map((stat, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: stat.color,
                  boxShadow: `0 0 6px ${stat.color}`
                }}></div>
                <div style={{ flex: 1, fontSize: '13px', color: '#CBD5E1' }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Section */}
        <Link
          to="/emergency"
          style={{
            textDecoration: 'none',
            color: '#EF4444',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#FCA5A5';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#EF4444',
            animation: 'pulse 2s infinite'
          }}>
            🚨
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              Emergency Report
            </div>
            <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>
              Immediate danger reporting
            </div>
          </div>
        </Link>

        {/* Help Section */}
        <Link
          to="/user/help"
          style={{
            textDecoration: 'none',
            color: '#94A3B8',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.color = '#CBD5E1';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#3B82F6'
          }}>
            ❓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Help & Support
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              FAQ & User Guide
            </div>
          </div>
        </Link>
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: 'auto',
        position: 'sticky',
        bottom: 0,
        background: 'linear-gradient(180deg, transparent, #0F172A 20px)'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#64748B',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <div>Bridge Safety Platform</div>
          <div>User Portal v2.0.1</div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(0.95); 
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        aside {
          animation: slideIn 0.3s ease;
        }
        
        /* Custom scrollbar */
        aside::-webkit-scrollbar {
          width: 6px;
        }
        
        aside::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        aside::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* Responsive behavior: apply content offset only on wide screens when sidebar open */
        @media (min-width: 1024px) {
          body.bqi-sidebar-open .page-full {
            padding-left: 280px !important;
            transition: padding-left 0.25s ease;
          }
          .page-full { transition: padding-left 0.25s ease; }
        }
        @media (max-width: 1023px) {
          aside { box-shadow: 0 8px 40px rgba(0,0,0,0.25); }
          body.bqi-sidebar-open .page-full { padding-left: 0 !important; }
        }
        
        @media (max-height: 700px) {
          div[style*="margin-top: 20px"] {
            margin-top: 10px !important;
          }
          
          nav {
            padding: 15px 20px !important;
          }
        }
      `}</style>
    </aside>
  )
}