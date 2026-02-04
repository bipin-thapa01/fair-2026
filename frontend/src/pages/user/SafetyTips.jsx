import React, { useState } from 'react'

const tips = [
  {
    id: 1,
    title: 'Before You Report',
    icon: '📝',
    color: '#3B82F6',
    bullets: [
      'Note exact location (km marker, nearest landmark).',
      'Take photos from safe vantage points — do not stand in traffic.',
      'Capture multiple shots: wide, medium, and close-up of damage.',
      'Note date/time, weather, and any vehicle loads present.',
      'Avoid entering restricted areas or climbing on structure.',
      'Provide contact info for follow-up (optional).'
    ]
  },
  {
    id: 2,
    title: 'When Observing Structural Damage',
    icon: '🏗️',
    color: '#EF4444',
    bullets: [
      'Do not attempt to move debris; mark location for crews.',
      'If damage affects traffic, notify local authorities immediately.',
      'Document cracks, sagging, or deformities with multiple angles.',
      'Report exposed rebar, active leaks or washout near foundations.',
      'Measure approximate crack length or gap width when safe to do so.',
      'Describe any sudden changes since the last inspection (if known).'
    ]
  },
  {
    id: 3,
    title: 'Reporting Roadway Hazards',
    icon: '⚠️',
    color: '#F59E0B',
    bullets: [
      'Report potholes or approach slab issues with photos.',
      'Note lane(s) affected and approximate size of defect.',
      'If safety signage is missing, include that in your report.',
      'If debris is present, mark the location and provide photos.',
      'When possible, record any nearby traffic or environmental hazards.',
      'Provide timestamps for any observed progression of damage.'
    ]
  },
  {
    id: 4,
    title: 'General Safety Guidelines',
    icon: '🛡️',
    color: '#10B981',
    bullets: [
      'Always wear high-visibility clothing when near roadways.',
      'Use proper safety equipment if conducting close inspections.',
      'Never inspect alone – always have a spotter or partner.',
      'Stay aware of your surroundings and traffic flow at all times.',
      'Follow local regulations and obtain permits when required.',
      'Report any unsafe conditions immediately to prevent accidents.'
    ]
  },
  {
    id: 5,
    title: 'Photography Tips',
    icon: '📸',
    color: '#8B5CF6',
    bullets: [
      'Use landscape orientation for better framing of structures.',
      'Include a reference object for scale (coin, ruler, hand).',
      'Capture photos in good lighting conditions when possible.',
      'Take photos from multiple distances and angles.',
      'Document both the defect and its surrounding context.',
      'Use geotagging features if your camera supports them.'
    ]
  },
  {
    id: 6,
    title: 'Emergency Response',
    icon: '🚨',
    color: '#EC4899',
    bullets: [
      'In case of immediate danger, call emergency services first.',
      'Provide clear location details to first responders.',
      'Stay at a safe distance from compromised structures.',
      'Do not attempt repairs yourself – leave it to professionals.',
      'Keep bystanders away from hazardous areas.',
      'Follow evacuation procedures if instructed by authorities.'
    ]
  }
]

export default function SafetyTips() {
  // Initialize with all tips expanded
  const [expandedTips, setExpandedTips] = useState(new Set(tips.map(tip => tip.id)))

  const toggleTip = (tipId) => {
    const newExpanded = new Set(expandedTips)
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId)
    } else {
      newExpanded.add(tipId)
    }
    setExpandedTips(newExpanded)
  }

  const toggleAllTips = () => {
    if (expandedTips.size === tips.length) {
      // Collapse all
      setExpandedTips(new Set())
    } else {
      // Expand all
      const allIds = tips.map(tip => tip.id)
      setExpandedTips(new Set(allIds))
    }
  }

  return (
    <div className="page-full page-mounted" style={{ 
      padding: '32px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '48px',
        padding: '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
        
        <h1 style={{ 
          margin: '0 0 16px', 
          fontSize: '42px',
          fontWeight: '800',
          position: 'relative'
        }}>
          Safety Guidelines & Tips
        </h1>
        <p style={{ 
          margin: '0 auto 24px', 
          fontSize: '18px',
          maxWidth: '700px',
          lineHeight: '1.6',
          position: 'relative'
        }}>
          Essential safety information for bridge inspection and reporting. Follow these guidelines to ensure your safety and the accuracy of your reports.
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '32px',
          position: 'relative'
        }}>
          <div style={{
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            🛡️ Safety First
          </div>
          <div style={{
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            📋 Best Practices
          </div>
          <div style={{
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            ⚡ Quick Reference
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '20px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px 16px',
            background: '#F3F4F6',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {expandedTips.size} of {tips.length} expanded
          </div>
        </div>
        
        <button
          onClick={toggleAllTips}
          style={{
            padding: '12px 24px',
            background: expandedTips.size === tips.length 
              ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
              : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = expandedTips.size === tips.length 
              ? '0 6px 20px rgba(239, 68, 68, 0.3)' 
              : '0 6px 20px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>{expandedTips.size === tips.length ? '▲' : '▼'}</span>
          {expandedTips.size === tips.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        {[
          { icon: '📊', label: 'Safety Categories', value: tips.length },
          { icon: '✅', label: 'Essential Tips', value: '50+' },
          { icon: '⏱️', label: 'Quick Read', value: '5 min' },
          { icon: '🎯', label: 'Key Focus', value: 'Prevention' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.3s ease'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: `linear-gradient(135deg, ${stat.icon === '📊' ? '#3B82F6' : stat.icon === '✅' ? '#10B981' : stat.icon === '⏱️' ? '#F59E0B' : '#8B5CF6'}, ${stat.icon === '📊' ? '#1D4ED8' : stat.icon === '✅' ? '#059669' : stat.icon === '⏱️' ? '#D97706' : '#7C3AED'})`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1F2937'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '32px',
        marginBottom: '48px'
      }}>
        {tips.map(t => {
          const isExpanded = expandedTips.has(t.id)
          
          return (
            <div 
              key={t.id}
              className="safety-card"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: `2px solid ${t.color}20`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 15px 40px ${t.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
              }}
            >
              {/* Decorative Background Element */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: `${t.color}10`,
                borderRadius: '50%',
                zIndex: 0
              }}></div>
              
              {/* Card Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '16px',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1,
                cursor: 'pointer'
              }} onClick={() => toggleTip(t.id)}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  flexShrink: 0,
                  boxShadow: `0 6px 20px ${t.color}40`
                }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px', 
                    fontSize: '22px',
                    fontWeight: '700',
                    color: t.color
                  }}>
                    {t.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: t.color,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        fontWeight: '500'
                      }}>
                        {t.bullets.length} essential guidelines
                      </span>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: `${t.color}20`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: t.color,
                      transition: 'transform 0.3s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bullet Points - Animated Container */}
              <div style={{
                maxHeight: isExpanded ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.5s ease-in-out',
                position: 'relative',
                zIndex: 1
              }}>
                <ul style={{
                  margin: '0',
                  padding: '0',
                  listStyle: 'none',
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}>
                  {t.bullets.map((b, i) => (
                    <li 
                      key={i} 
                      style={{
                        marginBottom: '16px',
                        paddingLeft: '28px',
                        position: 'relative',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: '#374151'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '6px',
                        width: '18px',
                        height: '18px',
                        background: t.color,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {i + 1}
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                
                {/* Expand/Collapse Button */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #F3F4F6'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTip(t.id);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: `${t.color}10`,
                      border: `2px solid ${t.color}30`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: t.color,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${t.color}20`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${t.color}10`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      transition: 'transform 0.3s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </span>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              </div>
              
              {/* Show message when collapsed */}
              {!isExpanded && (
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  opacity: 0.7,
                  marginTop: '16px',
                  fontSize: '14px',
                  color: '#6B7280',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '12px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }} onClick={() => toggleTip(t.id)}>
                  Click to view {t.bullets.length} safety guidelines
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Important Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '32px',
        border: '2px solid #F59E0B',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '48px'
        }}>
          ⚠️
        </div>
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#92400E'
          }}>
            Important Safety Notice
          </h3>
          <p style={{
            margin: '0 0 20px',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#92400E'
          }}>
            These guidelines are for informational purposes only. In case of emergency or immediate danger, always prioritize personal safety and contact local authorities immediately.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .page-mounted {
          animation: fadeIn 0.5s ease;
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
        
        @media (max-width: 768px) {
          .safety-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .control-bar {
            flex-direction: column;
            gap: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        
        ::selection {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}