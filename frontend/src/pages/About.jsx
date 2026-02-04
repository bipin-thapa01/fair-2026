import React, { useState } from 'react'

export default function About() {
  const [activeTab, setActiveTab] = useState('problem')

  const sections = {
    problem: {
      title: 'Problem Statements',
      icon: '⚠️',
      color: '#EF4444',
      content: `Many bridges lack continuous monitoring. Inspections are infrequent and subjective, making it difficult to prioritize maintenance and identify at-risk structures early.`,
      bullets: [
        'Lack of continuous bridge health monitoring',
        'Difficulty identifying high-risk bridges early',
        'Manual inspection delays and subjectivity',
        'Inconsistent data collection methods',
        'Limited public access to bridge safety information'
      ]
    },
    solution: {
      title: 'Solutions',
      icon: '💡',
      color: '#10B981',
      content: `BQI combines sensor data and inspection inputs into a single, easy-to-interpret score to guide maintenance decisions and public reporting.`,
      bullets: [
        'BQI provides a digital platform to evaluate bridge safety',
        'Weighted analysis of strain, vibration, and temperature',
        'Role-based dashboards for monitoring and reporting',
        'Real-time data visualization and alerts',
        'Public transparency with controlled access levels'
      ]
    },
    formula: {
      title: 'BQI Formula',
      icon: '📐',
      color: '#3B82F6',
      content: `BQI is calculated as a weighted combination of normalized sub-scores and scaled to 0–100 for easy interpretation.`,
      formula: 'BQI = 100 × [0.45 × (1 − S_norm) + 0.40 × (1 − V_norm) + 0.15 × (1 − T_norm)]',
      explanation: [
        'S_norm, V_norm and T_norm are normalized sub-scores (0-1 range)',
        'Higher values indicate better condition for each metric',
        'Weights reflect relative importance: Strain (45%), Vibration (40%), Temperature (15%)',
        'Conversion (1 − value) reflects health degradation',
        'Final score: 0 = poorest, 100 = best condition'
      ]
    },
    future: {
      title: 'Future Scope',
      icon: '🚀',
      color: '#8B5CF6',
      content: `We plan to expand BQI with richer sensor types, machine-learning prediction, and tighter integration with government platforms.`,
      bullets: [
        'IoT sensor integration for comprehensive monitoring',
        'AI-based predictive maintenance algorithms',
        'Government GIS platform integration',
        'Mobile app for field inspections',
        'Automated report generation and alerts'
      ]
    }
  }

  return (
    <div className="page-full page-mounted" style={{ 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div className="constrain" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#3B82F6',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            Understanding the System
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#1E293B',
            margin: '0 0 16px',
            lineHeight: '1.2'
          }}>
            Bridge Quality Index<br />
            <span style={{
              background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              (BQI) Framework
            </span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748B',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            A comprehensive digital solution for continuous bridge monitoring, safety assessment, 
            and preventive maintenance through data-driven insights.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'white',
          padding: '12px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {Object.keys(sections).map((key) => {
            const section = sections[key]
            const isActive = activeTab === key
            
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '16px 24px',
                  background: isActive ? section.color : 'transparent',
                  color: isActive ? 'white' : '#64748B',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${section.color}20`;
                    e.currentTarget.style.color = section.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{section.icon}</span>
                {section.title}
              </button>
            )
          })}
        </div>

        {/* Active Content Section */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          marginBottom: '40px',
          border: `2px solid ${sections[activeTab].color}20`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${sections[activeTab].color}, ${sections[activeTab].color}80)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              flexShrink: 0,
              boxShadow: `0 8px 25px ${sections[activeTab].color}40`
            }}>
              {sections[activeTab].icon}
            </div>
            <div>
              <h2 style={{
                margin: '0 0 12px',
                fontSize: '28px',
                fontWeight: '700',
                color: sections[activeTab].color
              }}>
                {sections[activeTab].title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#475569',
                lineHeight: '1.6'
              }}>
                {sections[activeTab].content}
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{
            padding: '32px',
            background: `${sections[activeTab].color}08`,
            borderRadius: '16px',
            border: `1px solid ${sections[activeTab].color}20`
          }}>
            {activeTab === 'formula' ? (
              <div>
                {/* Formula Display */}
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  border: '2px solid #E2E8F0'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1E293B',
                    marginBottom: '12px'
                  }}>
                    Core Formula
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: sections[activeTab].color,
                    fontFamily: 'monospace',
                    padding: '16px',
                    background: `${sections[activeTab].color}10`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}>
                    {sections[activeTab].formula}
                  </div>
                  
                  {/* Formula Breakdown */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '24px'
                  }}>
                    {[
                      { label: 'S_norm', value: 'Strain Normalized', desc: 'Structural deformation metric' },
                      { label: 'V_norm', value: 'Vibration Normalized', desc: 'Dynamic response metric' },
                      { label: 'T_norm', value: 'Temperature Normalized', desc: 'Thermal stress metric' }
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: '16px',
                        background: `${sections[activeTab].color}10`,
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: sections[activeTab].color,
                          marginBottom: '4px'
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1E293B',
                          marginBottom: '4px'
                        }}>
                          {item.value}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748B'
                        }}>
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1E293B',
                    marginBottom: '16px'
                  }}>
                    Formula Explanation
                  </div>
                  <div style={{
                    display: 'grid',
                    gap: '12px'
                  }}>
                    {sections[activeTab].explanation.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: sections[activeTab].color,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'white',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#475569',
                          lineHeight: '1.5'
                        }}>
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1E293B',
                  marginBottom: '20px'
                }}>
                  Key Points
                </div>
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {sections[activeTab].bullets.map((bullet, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      transition: 'all 0.3s ease'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.borderColor = sections[activeTab].color;
                      e.currentTarget.style.boxShadow = `0 4px 15px ${sections[activeTab].color}20`;
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: sections[activeTab].color,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#475569',
                        lineHeight: '1.6'
                      }}>
                        {bullet}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Sections Overview */}
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1E293B',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Comprehensive BQI Framework Overview
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {Object.entries(sections).map(([key, section]) => (
              <div 
                key={key}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: `2px solid ${section.color}20`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab(key)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 15px 40px ${section.color}30`;
                  e.currentTarget.style.borderColor = section.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = `${section.color}20`;
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `linear-gradient(135deg, ${section.color}, ${section.color}80)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white'
                  }}>
                    {section.icon}
                  </div>
                  <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: section.color
                  }}>
                    {section.title}
                  </h4>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748B',
                  lineHeight: '1.5'
                }}>
                  {section.content.substring(0, 100)}...
                </p>
                <div style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: section.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Click to learn more →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          color: 'white',
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
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 16px'
            }}>
              Ready to Monitor Bridges with BQI?
            </h3>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              margin: '0 auto 32px',
              lineHeight: '1.6'
            }}>
              Join the platform that's revolutionizing bridge safety monitoring across Nepal. 
              From real-time analytics to preventive maintenance, BQI has you covered.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button style={{
                padding: '16px 32px',
                background: 'white',
                color: '#0F766E',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.3)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                Get Started
              </button>
            </div>
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
          .constrain {
            padding: 0 16px;
          }
          
          h1 {
            font-size: 32px !important;
          }
          
          .tabs-container {
            flex-direction: column;
          }
          
          .tab-button {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 28px !important;
          }
          
          .content-section {
            padding: 24px !important;
          }
        }
        
        ::selection {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}