import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LandingAnim from '../components/landing.jsx'
import logo from '../assets/logo.png'

function greeting(){
  const h = new Date().getHours()
  if (h < 12) return '🌅 Good Morning'
  if (h < 18) return '☀️ Good Afternoon'
  return '🌙 Good Evening'
}

export default function Landing(){
  const [scrollY, setScrollY] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      id: 1,
      letter: 'C',
      title: 'Citizen View',
      description: 'Public access to bridge safety summaries, recent inspection highlights, and downloadable public reports.',
      color: '#3B82F6',
      icon: '👥'
    },
    {
      id: 2,
      letter: 'G',
      title: 'Government Oversight',
      description: 'Administrative dashboards for monitoring, audit trails, and policy-driven alerts to prioritize interventions.',
      color: '#10B981',
      icon: '🏛️'
    },
    {
      id: 3,
      letter: 'B',
      title: 'Bridge Analytics',
      description: 'Time-series analytics from sensors, BQI distribution charts, and exportable CSV reports for decision making.',
      color: '#8B5CF6',
      icon: '📊'
    },
    {
      id: 4,
      letter: 'R',
      title: 'Reports',
      description: 'Downloadable assessment reports, inspection summaries, and incident logs for individual bridges.',
      color: '#EC4899',
      icon: '📋'
    }
  ]

  const stats = [
    { label: 'Bridges Monitored', value: '50+', icon: '🌉' },
    { label: 'Active Inspections', value: '120+', icon: '🔍' },
    { label: 'Cities Covered', value: '15', icon: '🏙️' },
    { label: 'Avg Response Time', value: '24h', icon: '⚡' }
  ]

  return (
    <div className="landing-hero page-full" style={{
      background: 'linear-gradient(135deg, #ECF9F0 0%, #F0FDF4 50%, #E6F7FF 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Video Section - Top Right */}
      <div className="landing-video-wrapper">
        <div className="landing-video-card">
          <LandingAnim />
        </div>
        
        {/* Floating elements around video */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          borderRadius: '20px',
          transform: 'rotate(15deg)',
          opacity: 0.8,
          animation: 'float 6s ease-in-out infinite',
          zIndex: -1
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #10B981, #0F766E)',
          borderRadius: '20px',
          transform: 'rotate(-15deg)',
          opacity: 0.8,
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
          zIndex: -1
        }}></div>
      </div>
      {/* Responsive video styles */}
      <style>{`
        .landing-video-wrapper { position: absolute; top: 155px; right: 40px; width: 45%; height: 400px; z-index: 2 }
        .landing-video-card { width: 100%; height: 100%; background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; border: 2px solid rgba(255,255,255,0.8); position: relative }

        @media (max-width: 1024px) {
          .landing-video-wrapper { top: 140px; right: 24px; width: 48%; height: 360px }
        }

        /* medium laptops (e.g. 1280x800) improve balance */
        @media (max-width: 1366px) and (min-width: 1025px) {
          .landing-video-wrapper { top: 140px; right: 32px; width: 42%; height: 380px }
          .hero-title { font-size: 40px !important }
          .hero-sub { font-size: 16px !important }
        }

        @media (max-width: 768px) {
          .landing-video-wrapper { position: static; width: 100%; height: auto; margin-top: 18px; right: auto; top: auto }
          .landing-video-card { border-radius: 16px; height: auto }
        }

        @media (max-width: 420px) {
          .landing-video-wrapper { margin-top: 12px }
          .landing-video-card { border-radius: 12px }
        }
      `}</style>

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
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
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)',
        borderRadius: '50%',
        animation: 'pulse 6s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.7
      }}></div>

      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1,
        paddingTop: '60px'
      }}>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          maxWidth: '55%',
          marginTop: '40px'
        }}>
          {/* Logo and Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.8)'
            }}>
              <img src={logo} alt="BQI" style={{ height: '50px' }} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#3B82F6',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                Bridge Quality Index
              </div>
              <h1 className="hero-title" style={{
                color: '#1E293B',
                fontSize: '48px',
                fontWeight: '800',
                lineHeight: '1.2',
                margin: 0
              }}>
                {greeting()},<br />
                Welcome to Nepal's<br />
                <span style={{
                  background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Bridge Safety Platform
                </span>
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p className="hero-sub" style={{
            color: '#64748B',
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '32px',
            maxWidth: '600px'
          }}>
            Digitally Monitoring Nepal's Bridges — Ensuring transparency, safety, and preventive maintenance through real-time data analytics.
          </p>

          {/* Stats Bar */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '24px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1E293B'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <Link 
              to="/maps" 
              className="btn ghost"
              style={{
                padding: '16px 32px',
                border: '2px solid #0F766E',
                color: '#0F766E',
                background: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(15, 118, 110, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(15, 118, 110, 0.2)';
                e.currentTarget.style.background = '#0F766E';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 118, 110, 0.1)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#0F766E';
              }}
            >
              <span>🌉</span>
              Explore Bridge Map
            </Link>
            
            <Link 
              to="/login" 
              className="btn primary hero-login"
              style={{
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #0D9488, #2563EB)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #0F766E, #3B82F6)';
              }}
            >
              <span>🔐</span>
              Login / Register
            </Link>
          </div>

          {/* Key Benefits */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              {
                icon: '📊',
                title: 'Public Summaries',
                description: 'View simplified bridge health scores and recent inspections for public awareness.'
              },
              {
                icon: '📈',
                title: 'Admin Analytics',
                description: 'Authorized users can access dashboards, trends, and exportable reports.'
              },
              {
                icon: '📡',
                title: 'Sensor-Driven Scores',
                description: 'Integrates vibration and strain sensors to produce automated BQI calculations.'
              }
            ].map((benefit, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
                transition: 'transform 0.3s ease'
              }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{
                  fontSize: '28px',
                  marginBottom: '12px'
                }}>
                  {benefit.icon}
                </div>
                <h4 style={{
                  margin: '0 0 8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  {benefit.title}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748B',
                  lineHeight: '1.5'
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        /* Make landing hero stack on narrow viewports */
        @media (max-width: 900px) {
          .landing-hero .container { flex-direction: column !important; align-items: stretch !important; padding: 24px !important }
          .landing-hero .container > div:first-child { max-width: 100% !important }
          .landing-video-wrapper { position: static !important; width: 100% !important; height: auto !important; margin-top: 16px }
          .landing-video-card { border-radius: 12px !important }
          .hero-title { font-size: 32px !important }
          .hero-sub { font-size: 16px !important }
        }
        @media (max-width: 420px) {
          .hero-title { font-size: 26px !important }
          .hero-sub { font-size: 14px !important }
        }
      `}</style>

      {/* Features Section */}
      <div className="container constrain features" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#3B82F6',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            Our Platform Features
          </div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1E293B',
            margin: '0 0 16px'
          }}>
            Comprehensive Bridge Management
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748B',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            From citizen awareness to government oversight, our platform provides end-to-end solutions for bridge safety and maintenance.
          </p>
        </div>

        <div className="feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className="feature card"
              style={{
                background: activeFeature === index ? `linear-gradient(135deg, ${feature.color}10, white)` : 'white',
                padding: '32px',
                borderRadius: '20px',
                boxShadow: activeFeature === index 
                  ? `0 15px 40px ${feature.color}30` 
                  : '0 8px 30px rgba(0,0,0,0.08)',
                border: `2px solid ${activeFeature === index ? feature.color : 'transparent'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(0)}
            >
              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '60px',
                height: '60px',
                background: feature.color,
                borderBottomLeftRadius: '20px',
                opacity: 0.1
              }}></div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: `linear-gradient(135deg, ${feature.color}, ${feature.color}80)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: `0 6px 20px ${feature.color}40`
                }}>
                  {feature.letter}
                </div>
                <div style={{
                  fontSize: '32px',
                  opacity: 0.5
                }}>
                  {feature.icon}
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{
                  margin: '0 0 12px',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1E293B'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748B',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
              
              {/* Hover indicator */}
              {activeFeature === index && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '4px',
                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}80)`,
                  animation: 'slideIn 0.3s ease'
                }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 16px'
          }}>
            Ready to Ensure Bridge Safety?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#CBD5E1',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Join thousands of citizens and government officials in monitoring Nepal's bridge infrastructure.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link 
              to="/Login" 
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(15deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .page-mounted {
          animation: fadeIn 0.8s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 1200px) {
          .container {
            flex-direction: column !important;
            text-align: center;
          }
          
          .hero-title {
            font-size: 36px !important;
          }
          
          /* Video positioning for tablet */
          div[style*="position: absolute; top: 40px; right: 40px;"] {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            width: 90% !important;
            margin: 0 auto 40px !important;
            height: 300px !important;
          }
          
          div[style*="flex: 1; display: flex; flex-direction: column"] {
            max-width: 100% !important;
            margin-top: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 28px !important;
          }
          
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
          
          /* Video positioning for mobile */
          div[style*="position: absolute; top: 40px; right: 40px;"] {
            height: 250px !important;
            margin-bottom: 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*="position: absolute; top: 40px; right: 40px;"] {
            height: 200px !important;
          }
        }
        
        ::selection {
          background: rgba(59, 130, 246, 0.3);
          color: #1E293B;
        }
      `}</style>
    </div>
  )
}