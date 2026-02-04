import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ open = true }) {
  useEffect(()=>{
    try{
      if (open) document.body.classList.add('bqi-sidebar-open')
      else document.body.classList.remove('bqi-sidebar-open')
      // notify layout listeners
      try{ window.dispatchEvent(new CustomEvent('bqi-sidebar-changed')) }catch(e){}
    }catch(e){}
    return ()=>{ try{ document.body.classList.remove('bqi-sidebar-open') }catch(e){} }
  },[open])
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', color: '#3B82F6' },
    { path: '/admin/reports', label: 'Reports Oversight', icon: '📋', color: '#10B981' },
    { path: '/admin/users', label: 'User Management', icon: '👥', color: '#8B5CF6' },
    { path: '/admin/bridges', label: 'Bridge Management', icon: '🌉', color: '#F59E0B' },
    { path: '/maps', label: 'Bridge Map', icon: '🗺️', color: '#EC4899' },
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
            <span style={{ fontSize: '20px', color: 'white' }}>👑</span>
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#3B82F6',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Admin Panel
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94A3B8',
              fontWeight: '500'
            }}>
              Bridge Quality Index
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(15, 118, 110, 0.1)',
          border: '1px solid rgba(15, 118, 110, 0.2)',
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
            Administrator Mode
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'white'
          }}>
            Full System Access
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
          Main Navigation
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/admin' && location.pathname.startsWith(item.path))
          
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
                {item.path === '/admin' && (
                  <div style={{
                    fontSize: '11px',
                    color: isActive ? 'rgba(255, 255, 255, 0.7)' : '#64748B'
                  }}>
                    Overview & Stats
                  </div>
                )}
                {item.path === '/admin/reports' && (
                  <div style={{
                    fontSize: '11px',
                    color: isActive ? 'rgba(255, 255, 255, 0.7)' : '#64748B'
                  }}>
                    Review & Approve
                  </div>
                )}
                {item.path === '/admin/users' && (
                  <div style={{
                    fontSize: '11px',
                    color: isActive ? 'rgba(255, 255, 255, 0.7)' : '#64748B'
                  }}>
                    Manage Accounts
                  </div>
                )}
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
            Quick Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Pending Reports', value: '5', color: '#F59E0B' },
              { label: 'Active Users', value: '48', color: '#10B981' },
              { label: 'Bridges Monitored', value: '11', color: '#3B82F6' },
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

        {/* Help Section */}
        <Link
          to="/admin/help"
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
            marginTop: '20px',
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
              Documentation & Guides
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
          <div>Bridge Quality Index</div>
          <div>Admin Panel v2.0.1</div>
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
          /* align footer with content area when sidebar open */
          body.bqi-sidebar-open footer { margin-left: 280px !important; transition: margin-left 0.25s ease }
        }
        @media (max-width: 1023px) {
          aside { box-shadow: 0 8px 40px rgba(0,0,0,0.25); }
          body.bqi-sidebar-open .page-full { padding-left: 0 !important; }
        }
        
        /* show close button on small screens */
        @media (max-width: 1023px) {
          .bqi-sidebar-close { display: block !important; position: absolute; right: 12px; top: 12px; background: transparent; border: none; color: #CBD5E1; font-size: 18px; cursor: pointer }
        }
        /* Global responsive helpers: keep hamburger on top, avoid footer overlap, responsive tables */
        @media (max-width: 1023px) {
          .page-full { padding-left: 0 !important }
          footer { margin-left: 0 !important }
        }

        @media (min-width: 1024px) {
          /* ensure footer aligns with content when sidebar open */
          body.bqi-sidebar-open footer { margin-left: 280px !important }
        }

        /* Make tables responsive on small screens */
        @media (max-width: 900px) {
          .container table, .page-full table { display: block; width: 100%; overflow-x: auto }
          .container canvas, .container .chart-container { width: 100% !important; height: auto !important }
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