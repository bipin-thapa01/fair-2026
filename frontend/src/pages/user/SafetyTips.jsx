import React from 'react'

const tips = [
  {id:1, title:'Before You Report', bullets:[
    'Note exact location (km marker, nearest landmark).',
    'Take photos from safe vantage points — do not stand in traffic.',
    'Capture multiple shots: wide, medium, and close-up of damage.',
    'Note date/time, weather, and any vehicle loads present.',
    'Avoid entering restricted areas or climbing on structure.',
    'Provide contact info for follow-up (optional).'
  ]},
  {id:2, title:'When Observing Structural Damage', bullets:[
    'Do not attempt to move debris; mark location for crews.',
    'If damage affects traffic, notify local authorities immediately.',
    'Document cracks, sagging, or deformities with multiple angles.',
    'Report exposed rebar, active leaks or washout near foundations.',
    'Measure approximate crack length or gap width when safe to do so.',
    'Describe any sudden changes since the last inspection (if known).'
  ]},
  {id:3, title:'Reporting Roadway Hazards', bullets:[
    'Report potholes or approach slab issues with photos.',
    'Note lane(s) affected and approximate size of defect.',
    'If safety signage is missing, include that in your report.',
    'If debris is present, mark the location and provide photos.',
    'When possible, record any nearby traffic or environmental hazards.',
    'Provide timestamps for any observed progression of damage.'
  ]}
]

export default function SafetyTips(){
  return (
    <div className="page-full page-mounted" style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',gap:12,paddingBottom:12}}>
        <h2 style={{margin:0}}>Safety Tips</h2>
      </div>
      <div className="safety-grid">
        {tips.map(t=> (
          <div className="safety-card" key={t.id}>
            <h4 style={{color:'var(--primary)'}}>{t.title}</h4>
            <ul>
              {t.bullets.map((b,i)=> <li key={i} style={{marginBottom:6}}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
