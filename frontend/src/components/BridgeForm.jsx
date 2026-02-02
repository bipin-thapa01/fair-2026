import React, { useMemo, useState } from 'react'
import { calculateBQI } from '../utils/bqi'

export default function BridgeForm({initial, onSubmit}){
  const [form, setForm] = useState({
    id: initial?.id || `b${Date.now()}`,
    name: initial?.name || '',
    lat: initial?.lat ?? 27.7,
    lng: initial?.lng ?? 85.33,
    age: initial?.age ?? 30,
    condition: initial?.condition ?? 60,
    traffic: initial?.traffic ?? 50,
    seismicRisk: initial?.seismicRisk ?? 50,
    floodRisk: initial?.floodRisk ?? 30,
    strain: initial?.strain ?? 0.3,
    vibration: initial?.vibration ?? 2,
    displacement: initial?.displacement ?? 0.01,
    temperature: initial?.temperature ?? 28,
    district: initial?.district ?? ''
  })

  const bqi = useMemo(()=>calculateBQI(form),[form])

  const change = (k,v)=>setForm(s=>({...s,[k]:v}))

  return (
    <form onSubmit={(e)=>{e.preventDefault(); onSubmit({...form, bqi})}} className="bridge-form">
      <label>Bridge name<input value={form.name} onChange={e=>change('name', e.target.value)} required/></label>
      <label>Latitude<input type="number" value={form.lat} onChange={e=>change('lat', parseFloat(e.target.value))} step="0.0001"/></label>
      <label>Longitude<input type="number" value={form.lng} onChange={e=>change('lng', parseFloat(e.target.value))} step="0.0001"/></label>
      <label>District<input value={form.district} onChange={e=>change('district', e.target.value)} /></label>

      <label>Condition ({form.condition})
        <input type="range" min="0" max="100" value={form.condition} onChange={e=>change('condition', parseInt(e.target.value))}/>
      </label>
      <label>Age ({form.age} years)
        <input type="range" min="0" max="120" value={form.age} onChange={e=>change('age', parseInt(e.target.value))}/>
      </label>
      <label>Traffic ({form.traffic})
        <input type="range" min="0" max="100" value={form.traffic} onChange={e=>change('traffic', parseInt(e.target.value))}/>
      </label>
      <label>Seismic risk ({form.seismicRisk})
        <input type="range" min="0" max="100" value={form.seismicRisk} onChange={e=>change('seismicRisk', parseInt(e.target.value))}/>
      </label>
      <label>Flood risk ({form.floodRisk})
        <input type="range" min="0" max="100" value={form.floodRisk} onChange={e=>change('floodRisk', parseInt(e.target.value))}/>
      </label>

      <h4>Sensor Inputs</h4>
      <label>Strain ({form.strain})
        <input type="number" step="0.01" value={form.strain} onChange={e=>change('strain', parseFloat(e.target.value))} />
      </label>
      <label>Vibration ({form.vibration})
        <input type="number" step="0.1" value={form.vibration} onChange={e=>change('vibration', parseFloat(e.target.value))} />
      </label>
      <label>Displacement ({form.displacement})
        <input type="number" step="0.001" value={form.displacement} onChange={e=>change('displacement', parseFloat(e.target.value))} />
      </label>
      <label>Temperature ({form.temperature} °C)
        <input type="number" step="0.1" value={form.temperature} onChange={e=>change('temperature', parseFloat(e.target.value))} />
      </label>

      <div className="bqi-row">Real-time BQI: <strong>{bqi}</strong></div>
      <div className="norm-row">Normalized values (approx): <small>Strain, Vibration, Displacement, Temp</small></div>
      <div className="form-actions">
        <button type="submit">Save</button>
      </div>
    </form>
  )
}
