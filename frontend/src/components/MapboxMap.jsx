import React, { useEffect, useRef, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import sampleBridges from '../data/sampleBridges'
import { classification } from '../utils/bqi'
import { useNavigate } from 'react-router-dom'

// Mapbox token: provide via Vite env `VITE_MAPBOX_TOKEN` or localStorage 'mapbox_token'
const getToken = ()=> import.meta.env.VITE_MAPBOX_TOKEN || localStorage.getItem('mapbox_token') || ''

function emojiForScore(s){
  if (s >= 80) return '😀'
  if (s >= 60) return '🙂'
  if (s >= 40) return '😐'
  if (s >= 20) return '🙁'
  return '😢'
}

// Generate extra demo bridges if sample count < 10
function generateBridges(){
  const base = sampleBridges.slice()
  let i = 0
  while (base.length < 12){
    const src = sampleBridges[i % sampleBridges.length]
    const shiftLat = (Math.random()-0.5) * 2
    const shiftLng = (Math.random()-0.5) * 3
    base.push({ ...src, id: src.id + '-x' + i, name: src.name + ' ' + (i+1), lat: +(src.lat + shiftLat).toFixed(4), lng: +(src.lng + shiftLng).toFixed(4), bqi: Math.max(10, Math.min(100, (src.bqi ?? 60) + Math.round((Math.random()-0.5)*20))) })
    i++
  }
  return base
}

export default function MapboxMap(){
  const mapNode = useRef(null)
  const mapRef = useRef(null)
  const navigate = useNavigate()
  const [coords, setCoords] = useState({lat:27.7172,lng:85.3240,zoom:8})
  const [query, setQuery] = useState('')
  const [healthFilter, setHealthFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')

  const token = getToken()
  const [tokenInput, setTokenInput] = useState('')

  // If no token, render a helpful UI and avoid initializing Mapbox (prevents runtime error)
  if (!token){
    return (
      <div className="page-full" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{maxWidth:720,width:'100%',background:'#fff',padding:20,borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.08)'}}>
          <h3 style={{marginTop:0}}>Mapbox token not found</h3>
          <p>To use the interactive Mapbox map, provide a Mapbox public token. You can either:</p>
          <ul>
            <li>Add <code>VITE_MAPBOX_TOKEN=your_token</code> to a <strong>.env</strong> file and restart the dev server.</li>
            <li>Or paste a token below and click <strong>Save token (dev)</strong> — it will be stored in <code>localStorage</code>.</li>
          </ul>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <input value={tokenInput} onChange={e=>setTokenInput(e.target.value)} placeholder="pk.* public token" style={{flex:1,padding:8,border:'1px solid #ddd',borderRadius:6}} />
            <button style={{padding:'8px 12px',background:'linear-gradient(90deg,#1f6feb,#3fb0ff)',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}} onClick={()=>{ if(tokenInput){ localStorage.setItem('mapbox_token', tokenInput); location.reload() } }}>Save token (dev)</button>
          </div>
          <p style={{marginTop:12,fontSize:13,color:'#666'}}>Mapbox docs: <a href="https://docs.mapbox.com/api/overview/#access-tokens-and-token-scopes" target="_blank" rel="noreferrer">access tokens</a></p>
        </div>
      </div>
    )
  }

  const bridges = useMemo(()=> generateBridges(), [])

  useEffect(()=>{
    if (!token){
      console.warn('Mapbox token not set. Set VITE_MAPBOX_TOKEN or localStorage mapbox_token')
    }
    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [85.3240,27.7172],
      zoom: 7
    })
    mapRef.current = map

    map.on('move', ()=>{
      const c = map.getCenter()
      setCoords({lat: +c.lat.toFixed(4), lng: +c.lng.toFixed(4), zoom: +map.getZoom().toFixed(2)})
    })

    map.on('load', ()=>{
      // build GeoJSON
      const features = bridges.map(b=>({type:'Feature',properties:{id:b.id,name:b.name,bqi:b.bqi,district:b.district},geometry:{type:'Point',coordinates:[b.lng,b.lat]}}))
      map.addSource('bridges', {type:'geojson',data:{type:'FeatureCollection',features},cluster:true,clusterMaxZoom:14,clusterRadius:50})

      // cluster layer
      map.addLayer({
        id:'clusters',
        type:'circle',
        source:'bridges',
        filter:['has','point_count'],
        paint:{'circle-color':['step',['get','point_count'], '#6fd3ff', 5, '#1f6feb', 10, '#083b66'],'circle-radius':['step',['get','point_count'],12,5,16,10,20]}
      })
      map.addLayer({id:'cluster-count',type:'symbol',source:'bridges',filter:['has','point_count'],layout:{'text-field':'{point_count_abbreviated}','text-size':12}})

      // unclustered points
      map.addLayer({
        id:'unclustered-point',
        type:'circle',
        source:'bridges',
        filter:['!',['has','point_count']],
        paint:{'circle-color':'#1f6feb','circle-radius':10,'circle-blur':0.15,'circle-stroke-color':'#fff','circle-stroke-width':1}
      })

      // click handlers
      map.on('click','clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties.cluster_id
        map.getSource('bridges').getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err) return
          map.easeTo({center: features[0].geometry.coordinates, zoom: zoom})
        })
      })

      map.on('click','unclustered-point', function(e){
        const feature = e.features[0]
        const props = feature.properties
        const coordsFeat = feature.geometry.coordinates.slice()
        // build popup content
        const b = bridges.find(x=>x.id === props.id)
        const popupNode = document.createElement('div')
        popupNode.style.minWidth = '220px'
        popupNode.innerHTML = `
          <div style="font-weight:700;margin-bottom:6px">${props.name}</div>
          <div style="font-size:12px;margin-bottom:6px">Location: ${coordsFeat[1].toFixed(4)}, ${coordsFeat[0].toFixed(4)}</div>
          <div style="margin-bottom:6px">BQI: <strong>${props.bqi ?? '—'}</strong></div>
          <div style="margin-bottom:6px">Status: <strong>${(function(s){ if(s>=75) return 'Good'; if(s>=50) return 'Moderate'; return 'Critical' })(props.bqi)}</strong></div>
          <div style="margin-bottom:6px"><em>Recent:</em><ul style='margin:6px 0;padding-left:16px'>${(function(){ const now=props.bqi||0; return [now, Math.max(0,now-2), Math.max(0,now-5)].map(s=>`<li>Score: ${s}</li>`).join('') })()}</ul></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <div style="font-size:18px">${emojiForScore(props.bqi||0)}</div>
            <button id="popup-report" style="background:linear-gradient(90deg,#1f6feb,#3fb0ff);border:none;color:#fff;padding:6px 8px;border-radius:6px;cursor:pointer">Submit Report</button>
          </div>
        `
        new mapboxgl.Popup().setLngLat(coordsFeat).setDOMContent(popupNode).addTo(map)
        // attach handler
        popupNode.querySelector('#popup-report').addEventListener('click', ()=>{
          const user = JSON.parse(localStorage.getItem('bqi_user')||'null')
          if (!user) navigate('/login')
          else alert('Report flow for ' + props.name + ' (demo)')
        })
      })

      // change mouse cursor
      map.on('mouseenter','clusters',()=>map.getCanvas().style.cursor='pointer')
      map.on('mouseleave','clusters',()=>map.getCanvas().style.cursor='')
      map.on('mouseenter','unclustered-point',()=>map.getCanvas().style.cursor='pointer')
      map.on('mouseleave','unclustered-point',()=>map.getCanvas().style.cursor='')
    })

    return ()=> map.remove()
  },[token, bridges, navigate])

  // filter/update source data when query or filters change
  useEffect(()=>{
    const map = mapRef.current
    if (!map) return
    const filtered = bridges.filter(b=>{
      if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false
      if (healthFilter !== 'all'){
        const cls = classification(b.bqi ?? 0)
        if (healthFilter === 'good' && cls.label !== 'Safe') return false
        if (healthFilter === 'moderate' && cls.label !== 'Moderate') return false
        if (healthFilter === 'critical' && cls.label !== 'Critical') return false
      }
      if (regionFilter !== 'all' && b.district && !b.district.toLowerCase().includes(regionFilter.toLowerCase())) return false
      return true
    })
    const features = filtered.map(b=>({type:'Feature',properties:{id:b.id,name:b.name,bqi:b.bqi,district:b.district},geometry:{type:'Point',coordinates:[b.lng,b.lat]}}))
    const src = map.getSource && map.getSource('bridges')
    if (src && src.setData) src.setData({type:'FeatureCollection',features})
  },[query, healthFilter, regionFilter, bridges])

  return (
    <div className="page-full" style={{position:'relative'}}>
      <div style={{position:'absolute',left:12,top:12,zIndex:3,display:'flex',gap:8,background:'rgba(255,255,255,0.9)',padding:8,borderRadius:8}}>
        <input placeholder="Search bridge" value={query} onChange={e=>setQuery(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid #ddd'}} />
        <select value={healthFilter} onChange={e=>setHealthFilter(e.target.value)} style={{padding:6,borderRadius:6}}>
          <option value="all">All</option>
          <option value="good">Good</option>
          <option value="moderate">Moderate</option>
          <option value="critical">Critical</option>
        </select>
        <input placeholder="Region filter" value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} style={{padding:6,borderRadius:6,border:'1px solid #ddd'}} />
      </div>

      <div ref={mapNode} style={{width:'100%',height:'100%'}} />

      <div style={{position:'absolute',right:12,bottom:12,zIndex:3,background:'rgba(255,255,255,0.9)',padding:8,borderRadius:6,fontSize:12}}>
        {coords.lat}, {coords.lng} • zoom {coords.zoom}
      </div>
    </div>
  )
}
