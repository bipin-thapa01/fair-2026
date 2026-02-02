import React, { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import sampleBridges from '../data/sampleBridges'
import { classification } from '../utils/bqi'
import { useNavigate } from 'react-router-dom'

function emojiForScore(s){
  if (s >= 80) return '😀'
  if (s >= 60) return '🙂'
  if (s >= 40) return '😐'
  if (s >= 20) return '🙁'
  return '😢'
}

function generateBridges(){
  const base = sampleBridges.slice()
  let i = 0
  while (base.length < 15){
    const src = sampleBridges[i % sampleBridges.length]
    const shiftLat = (Math.random()-0.5) * 2
    const shiftLng = (Math.random()-0.5) * 3
    base.push({ ...src, id: src.id + '-x' + i, name: src.name + ' ' + (i+1), lat: +(src.lat + shiftLat).toFixed(4), lng: +(src.lng + shiftLng).toFixed(4), bqi: Math.max(5, Math.min(100, (src.bqi ?? 60) + Math.round((Math.random()-0.5)*30))) })
    i++
  }
  return base
}

export default function LeafletMap(){
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef(null)
  const navigate = useNavigate()
  const allBridges = useMemo(()=>generateBridges(), [])

  const [coords, setCoords] = useState({lat:27.7172,lng:85.3240,zoom:8})
  const [query, setQuery] = useState(()=> localStorage.getItem('bqi_query') || '')
  const [healthFilter, setHealthFilter] = useState(()=> localStorage.getItem('bqi_health') || 'all')
  const [regionFilter, setRegionFilter] = useState(()=> localStorage.getItem('bqi_region') || 'all')

  useEffect(()=>{
    if (!containerRef.current) return
    // clear previous map instance for this container (protect against reuse error)
    const container = containerRef.current
    if (!container) return
    if (!container.id) container.id = 'leaflet-container-' + Math.random().toString(36).slice(2,9)
    const cid = container.id
    if (!window._leaflet_maps) window._leaflet_maps = {}
    if (window._leaflet_maps[cid]){
      try{ window._leaflet_maps[cid].remove() }catch(e){}
      delete window._leaflet_maps[cid]
    }

    const map = L.map(container, { center:[27.7172,85.3240], zoom:8, minZoom:6 })
    mapRef.current = map
    window._leaflet_maps[cid] = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map)

    // Restrict view to Nepal bounding box to avoid panning out of country
    try{ map.setMaxBounds([[26.3,80.0],[30.5,88.3]]) }catch(e){/* ignore */}

    // ensure Leaflet lays out correctly when container sizing is constrained
    setTimeout(()=>{
      try{ map.invalidateSize() }catch(e){/* ignore */}
    }, 150)

    const markerCluster = L.markerClusterGroup({ chunkedLoading:true, showCoverageOnHover:false })
    markersRef.current = markerCluster

    // create markers
    const makeIcon = (label)=> L.divIcon({
      className: 'bridge-marker',
      html: `<div class="glow-marker">${label}</div>`,
      iconSize:[24,24], iconAnchor:[12,12]
    })

    const createPopupContent = (b)=>{
      const cls = classification(b.bqi ?? 0)
      const status = cls.label === 'Safe' ? 'Good' : cls.label
      const recent = [b.bqi || 0, Math.max(0,(b.bqi||0)-3), Math.max(0,(b.bqi||0)-6)]
      const emoji = emojiForScore(b.bqi || 0)
      const meterWidth = Math.max(4, Math.min(100, b.bqi || 0))
      return `
        <div style="min-width:220px;font-family:Inter,Arial">
          <div style="font-weight:700;margin-bottom:6px">${b.name}</div>
          <div style="font-size:12px;margin-bottom:6px">Location: ${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</div>
          <div style="margin-bottom:6px">BQI: <strong>${b.bqi ?? '—'}</strong></div>
          <div style="margin-bottom:6px">Status: <strong>${status}</strong></div>
          <div style="margin:6px 0"><em>Recent:</em><ul style='margin:6px 0;padding-left:16px'>${recent.map(s=>`<li>Score: ${s}</li>`).join('')}</ul></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <div style="flex:1;background:#eee;border-radius:8px;height:12px;overflow:hidden"><div style="width:${meterWidth}%;height:100%;background:linear-gradient(90deg,#2ee6a7,#1f6feb)"></div></div>
            <div style="font-size:20px">${emoji}</div>
          </div>
          <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <button id="watch-btn" style="background:#fff;border:1px solid #ddd;padding:6px 8px;border-radius:6px;cursor:pointer">Watch</button>
            </div>
            <div>
              <button id="submit-report" style="background:linear-gradient(90deg,#1f6feb,#3fb0ff);border:none;color:#fff;padding:6px 8px;border-radius:6px;cursor:pointer">Submit Report</button>
            </div>
          </div>
        </div>
      `
    }

    allBridges.forEach(b=>{
      const icon = makeIcon('')
      const marker = L.marker([b.lat,b.lng],{icon, title:b.name})
      marker.bindPopup(createPopupContent(b))
      marker.on('popupopen', (e)=>{
        const popupEl = e.popup.getElement()
        const btn = popupEl.querySelector('#submit-report')
        if (btn){
          btn.addEventListener('click', ()=>{
            const user = JSON.parse(localStorage.getItem('bqi_user')||'null')
            if (!user) navigate('/login')
            else alert('Submit report flow (demo) for ' + b.name)
          })
        }
      })
      markerCluster.addLayer(marker)
    })

    map.addLayer(markerCluster)

    // live coords update
    const onMove = ()=>{
      const c = map.getCenter()
      setCoords({lat:+c.lat.toFixed(4), lng:+c.lng.toFixed(4), zoom:+map.getZoom().toFixed(2)})
    }
    map.on('move', onMove)
    map.on('zoom', onMove)

    // cleanup
    return ()=>{
      map.off('move', onMove)
      map.off('zoom', onMove)
      try{ map.remove() }catch(e){}
      if (window._leaflet_maps && window._leaflet_maps[cid]) delete window._leaflet_maps[cid]
    }
  }, [allBridges, navigate])

  // filtering/searching - rebuild marker cluster when filters change
  useEffect(()=>{
    let cluster = markersRef.current
    if (!mapRef.current) return
    const map = mapRef.current
    // ensure we have a cluster instance attached
    if (!cluster){
      cluster = L.markerClusterGroup({ chunkedLoading:true, showCoverageOnHover:false })
      markersRef.current = cluster
      try{ map.addLayer(cluster) }catch(e){ console.error('Failed to add cluster layer', e) }
    }
    if (!cluster) return
    try{ cluster.clearLayers() }catch(e){ console.error('Failed clearing cluster layers', e) }
    const filtered = allBridges.filter(b=>{
      if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false
      if (healthFilter !== 'all'){
        const cls = classification(b.bqi ?? 0).label
        if (healthFilter === 'good' && cls !== 'Safe') return false
        if (healthFilter === 'moderate' && cls !== 'Moderate') return false
        if (healthFilter === 'critical' && cls !== 'Critical') return false
      }
      if (regionFilter !== 'all' && b.district && !b.district.toLowerCase().includes(regionFilter.toLowerCase())) return false
      return true
    })

    try{
      filtered.forEach(b=>{
        try{
          const icon = L.divIcon({className:'bridge-marker',html:'<div class="glow-marker"></div>',iconSize:[24,24],iconAnchor:[12,12]})
          const marker = L.marker([b.lat,b.lng],{icon, title:b.name})
          const popupDiv = document.createElement('div')
          popupDiv.innerHTML = (function(){ const cls = classification(b.bqi ?? 0); const status = cls.label === 'Safe' ? 'Good' : cls.label; const recent = [b.bqi || 0, Math.max(0,(b.bqi||0)-3), Math.max(0,(b.bqi||0)-6)]; const emoji = emojiForScore(b.bqi||0); const meter = Math.max(4, Math.min(100, b.bqi||0)); return `
            <div style="min-width:220px;font-family:Inter,Arial">
              <div style="font-weight:700;margin-bottom:6px">${b.name}</div>
              <div style="font-size:12px;margin-bottom:6px">Location: ${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</div>
              <div style="margin-bottom:6px">BQI: <strong>${b.bqi ?? '—'}</strong></div>
              <div style="margin-bottom:6px">Status: <strong>${status}</strong></div>
              <div style="margin:6px 0"><em>Recent:</em><ul style='margin:6px 0;padding-left:16px'>${recent.map(s=>`<li>Score: ${s}</li>`).join('')}</ul></div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
                <div style="flex:1;background:#eee;border-radius:8px;height:12px;overflow:hidden"><div style="width:${meter}%;height:100%;background:linear-gradient(90deg,#2ee6a7,#1f6feb)"></div></div>
                <div style="font-size:20px">${emoji}</div>
              </div>
              <div style="margin-top:10px;display:flex;justify-content:flex-end">
                <button id="submit-report" style="background:linear-gradient(90deg,#1f6feb,#3fb0ff);border:none;color:#fff;padding:6px 8px;border-radius:6px;cursor:pointer">Submit Report</button>
              </div>
            </div>
          ` })()
          marker.bindPopup(popupDiv)
          marker.on('popupopen', (e)=>{
            const popupEl = e.popup.getElement()
            const btn = popupEl.querySelector('#submit-report')
            const watch = popupEl.querySelector('#watch-btn')
            // initialize watch button state
            const watchlist = JSON.parse(localStorage.getItem('bqi_watchlist')||'[]')
            if (watch){
              const watching = watchlist.includes(b.id)
              watch.textContent = watching ? 'Watching' : 'Watch'
              watch.addEventListener('click', ()=>{
                const list = JSON.parse(localStorage.getItem('bqi_watchlist')||'[]')
                const idx = list.indexOf(b.id)
                if (idx === -1){ list.push(b.id); watch.textContent = 'Watching' }
                else { list.splice(idx,1); watch.textContent = 'Watch' }
                localStorage.setItem('bqi_watchlist', JSON.stringify(list))
              })
            }
            if (btn){ btn.addEventListener('click', ()=>{ const user = JSON.parse(localStorage.getItem('bqi_user')||'null'); if (!user) navigate('/login'); else alert('Submit report flow (demo) for ' + b.name) }) }
          })
          cluster.addLayer(marker)
        }catch(err){ console.error('marker create error', err, b) }
      })
    }catch(err){ console.error('filter loop error', err) }

    // refresh cluster on map
    return
  }, [query, healthFilter, regionFilter, allBridges, navigate])

  // persist filters
  useEffect(()=>{
    localStorage.setItem('bqi_query', query)
  },[query])
  useEffect(()=>{
    localStorage.setItem('bqi_health', healthFilter)
  },[healthFilter])
  useEffect(()=>{
    localStorage.setItem('bqi_region', regionFilter)
  },[regionFilter])

  return (
    <div className="page-full" style={{position:'relative'}}>
      <div style={{position:'absolute',left:12,top:12,zIndex:4000,display:'flex',gap:8,background:'rgba(255,255,255,0.95)',padding:8,borderRadius:8}}>
        <input placeholder="Search bridge" value={query} onChange={e=>setQuery(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid #ddd'}} />
        <select value={healthFilter} onChange={e=>setHealthFilter(e.target.value)} style={{padding:6,borderRadius:6}}>
          <option value="all">All</option>
          <option value="good">Good</option>
          <option value="moderate">Moderate</option>
          <option value="critical">Critical</option>
        </select>
        <input placeholder="Region filter" value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid #ddd'}} />
      </div>

      <div ref={containerRef} style={{width:'100%',height:'calc(100vh - 64px)'}} />

      <div style={{position:'absolute',right:12,bottom:12,zIndex:4000,background:'rgba(255,255,255,0.95)',padding:8,borderRadius:6,fontSize:12}}>
        {coords.lat}, {coords.lng} • zoom {coords.zoom}
      </div>

      <style>{`
        .glow-marker{width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 30% 30%, #6fd3ff,#1f6feb);box-shadow:0 0 12px rgba(31,111,235,0.9),0 0 24px rgba(31,111,235,0.45);border:2px solid rgba(255,255,255,0.6)}
        .leaflet-container { background:#e6f3ff }
      `}</style>
    </div>
  )
}
