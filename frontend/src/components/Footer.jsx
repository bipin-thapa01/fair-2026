import React from 'react'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      padding: '60px 20px 30px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(15, 118, 110, 0.1) 0%, rgba(15, 118, 110, 0) 70%)',
        borderRadius: '50%',
        opacity: 0.5
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
        borderRadius: '50%',
        opacity: 0.3
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Column */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
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
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3B82F6',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Bridge Quality Index
                </div>
                <h3 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  BQI Nepal
                </h3>
              </div>
            </div>
            <p style={{
              color: '#94A3B8',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              maxWidth: '280px'
            }}>
              Digitally monitoring Nepal's bridges for enhanced safety, transparency, and preventive maintenance through real-time data analytics.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { icon: '📧', label: 'Email', link: 'mailto:contact@bqi.gov.np' },
                { icon: '📱', label: 'Phone', link: 'tel:+977-1-1234567' },
                { icon: '🏛️', label: 'Office', link: '#' },
              ].map((contact, index) => (
                <a
                  key={index}
                  href={contact.link}
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CBD5E1',
                    fontSize: '18px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.color = '#CBD5E1';
                  }}
                  title={contact.label}
                >
                  {contact.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 20px 0',
              paddingBottom: '10px',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { label: 'Bridge Map', path: '/maps' },
                { label: 'Safety Reports', path: '/reports' },
                { label: 'About BQI', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    style={{
                      color: '#94A3B8',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      padding: '8px 0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.paddingLeft = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94A3B8';
                      e.currentTarget.style.paddingLeft = '0';
                    }}
                  >
                    <span style={{ 
                      fontSize: '12px',
                      opacity: 0.5,
                      transition: 'all 0.3s ease'
                    }}>→</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 20px 0',
              paddingBottom: '10px',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              Resources
            </h4>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { label: 'Documentation', path: '/docs' },
                { label: 'API Access', path: '/api' },
                { label: 'Data Privacy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    style={{
                      color: '#94A3B8',
                      textDecoration: 'none',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      padding: '8px 0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.paddingLeft = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94A3B8';
                      e.currentTarget.style.paddingLeft = '0';
                    }}
                  >
                    <span style={{ 
                      fontSize: '12px',
                      opacity: 0.5,
                      transition: 'all 0.3s ease'
                    }}>📄</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 20px 0',
              paddingBottom: '10px',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              Stay Updated
            </h4>
            <p style={{
              color: '#94A3B8',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 20px 0'
            }}>
              Subscribe to get safety alerts and bridge monitoring updates.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Your email address"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0F766E';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(15, 118, 110, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
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
                Subscribe
              </button>
            </div>
            <p style={{
              color: '#64748B',
              fontSize: '11px',
              margin: '12px 0 0 0',
              lineHeight: '1.4'
            }}>
              By subscribing, you agree to our Privacy Policy and consent to receive safety updates.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          margin: '40px 0'
        }}></div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center'
        }}>
          {/* Logo Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[
              { label: 'Government of Nepal', icon: '🇳🇵' },
              { label: 'MoPIT', icon: '🏛️' },
              { label: 'DoR', icon: '🛣️' },
              { label: 'ISO 9001', icon: '✅' },
            ].map((org, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94A3B8',
                  fontSize: '13px',
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <span style={{ fontSize: '16px' }}>{org.icon}</span>
                <span>{org.label}</span>
              </div>
            ))}
          </div>

          {/* Copyright and Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
                { label: 'Cookie Policy', path: '/cookies' },
                { label: 'Disclaimer', path: '/disclaimer' },
                { label: 'Accessibility', path: '/accessibility' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  style={{
                    color: '#94A3B8',
                    textDecoration: 'none',
                    fontSize: '13px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            <div style={{
              color: '#64748B',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span>© {currentYear} Bridge Quality Index Platform. All rights reserved.</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Version 2.0.1</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Made with ❤️ for Nepal</span>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 20px rgba(15, 118, 110, 0.3)',
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(15, 118, 110, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
          }}
          title="Back to top"
        >
          ↑
        </button>
      </div>

      {/* Styles */}
      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          
          button[style*="position: fixed"] {
            bottom: 20px !important;
            right: 20px !important;
            width: 45px !important;
            height: 45px !important;
            font-size: 18px !important;
          }
          
          div[style*="display: flex; gap: 24px; flex-wrap: wrap"] {
            gap: 12px !important;
          }
          
          div[style*="display: flex; gap: 16px"] {
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          footer {
            padding: 40px 16px 20px !important;
          }
          
          div[style*="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center"] {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          div[style*="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center"] {
            flex-direction: column !important;
            gap: 8px !important;
          }
        }
        
        ::selection {
          background: rgba(15, 118, 110, 0.3);
          color: white;
        }
        
        input::placeholder {
          color: #94A3B8;
        }
        
        input:focus::placeholder {
          color: #CBD5E1;
        }
      `}</style>
    </footer>
  )
}