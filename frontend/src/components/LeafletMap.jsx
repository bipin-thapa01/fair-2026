import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { classification } from '../utils/bqi'
import { useNavigate } from 'react-router-dom'

function emojiForScore(s) {
  if (s >= 80) return '😀'
  if (s >= 60) return '🙂'
  if (s >= 40) return '😐'
  if (s >= 20) return '🙁'
  return '😢'
}

const NAVBAR_HEIGHT = 64

// Helper function to lighten hex color
function lighten(hex, amt) {
  try {
    const col = hex.replace('#', '')
    const num = parseInt(col, 16)
    let r = (num >> 16) + Math.round(255 * amt)
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * amt)
    let b = (num & 0x0000FF) + Math.round(255 * amt)
    r = Math.min(255, Math.max(0, r))
    g = Math.min(255, Math.max(0, g))
    b = Math.min(255, Math.max(0, b))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  } catch (e) { return hex }
}

// Helper function for hex to rgba
const hexToRgba = (hex, a = 0.5) => {
  try {
    const c = hex.replace('#', '')
    const num = parseInt(c, 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255
    return `rgba(${r}, ${g}, ${b}, ${a})`
  } catch (e) { return hex }
}

// Bridge data with dates
const PROVIDED_BRIDGES = [
  { name: "Sundarijal Bridge", lat: 27.8015, lon: 85.3912, bqi: 82, created: "2023-01-15", updated: "2024-03-10" },
  { name: "Kalanki Bridge", lat: 27.6939, lon: 85.2815, bqi: 76, created: "2022-11-20", updated: "2024-02-28" },
  { name: "Koteshwor Bridge", lat: 27.6789, lon: 85.3498, bqi: 61, created: "2023-03-05", updated: "2024-03-01" },
  { name: "Balaju Bridge", lat: 27.7321, lon: 85.3014, bqi: 55, created: "2022-09-12", updated: "2024-02-15" },
  { name: "Chabahil Bridge", lat: 27.7179, lon: 85.3490, bqi: 44, created: "2023-02-18", updated: "2024-02-25" },
  { name: "Teku Bridge", lat: 27.6932, lon: 85.3091, bqi: 38, created: "2022-12-05", updated: "2024-03-05" },
  { name: "Tripureshwor Bridge", lat: 27.6938, lon: 85.3175, bqi: 69, created: "2023-01-30", updated: "2024-02-20" },
  { name: "Pulchowk Bridge", lat: 27.6725, lon: 85.3251, bqi: 23, created: "2022-10-22", updated: "2024-03-08" },
  { name: "Thapathali Bridge", lat: 27.6998, lon: 85.3118, bqi: 90, created: "2023-04-12", updated: "2024-02-28" },
  { name: "Kantipath Bridge", lat: 27.7046, lon: 85.3170, bqi: 33, created: "2022-08-15", updated: "2024-03-03" },
  { name: "Bagmati Bridge", lat: 27.6780, lon: 85.3206, bqi: 47, created: "2023-02-28", updated: "2024-02-18" }
].map((b, i) => ({
  id: 'b-' + (i + 1),
  name: b.name,
  lat: b.lat,
  lng: b.lon,
  bqi: b.bqi,
  createdAt: b.created + 'T00:00:00.000Z',
  updatedAt: b.updated + 'T00:00:00.000Z'
}))

export default function LeafletMap() {
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef(null)
  const navigate = useNavigate()

  const [coords, setCoords] = useState({ lat: 27.7172, lng: 85.3240, zoom: 13 })
  const [query, setQuery] = useState(() => localStorage.getItem('bqi_query') || '')
  const [healthFilter, setHealthFilter] = useState(() => localStorage.getItem('bqi_health') || 'all')
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedBridge, setSelectedBridge] = useState(null)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [sidebarOffset, setSidebarOffset] = useState(20)

  // Get current user on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('bqi_user') || 'null')
    setCurrentUser(user)
  }, [])

  // adjust overlay offset when sidebar toggles or window resizes
  useEffect(() => {
    const computeOffset = () => {
      try {
        const has = document.body.classList.contains('bqi-sidebar-open')
        if (has && window.innerWidth >= 1024) setSidebarOffset(20 + 280)
        else setSidebarOffset(20)
      } catch (e) { setSidebarOffset(20) }
    }
    computeOffset()
    window.addEventListener('resize', computeOffset)
    window.addEventListener('bqi-sidebar-changed', computeOffset)
    return () => { window.removeEventListener('resize', computeOffset); window.removeEventListener('bqi-sidebar-changed', computeOffset) }
  }, [])

  // Function to create marker icon based on BQI score
  const makeIcon = (bqi) => {
    // Determine color based on BQI score following the rules
    let color
    if (bqi >= 80) color = '#2ecc71'        // Green
    else if (bqi >= 60) color = '#3498db'   // Blue
    else if (bqi >= 40) color = '#f1c40f'   // Yellow
    else if (bqi >= 20) color = '#e67e22'   // Orange
    else color = '#e74c3c'                  // Red
    
    const light = lighten(color, 0.35)
    const shadow1 = hexToRgba(color, 0.55)
    const shadow2 = hexToRgba(color, 0.28)
    
    const html = `
      <div class="glow-marker" 
           style="background:radial-gradient(circle at 30% 30%, ${light}, ${color});
                  box-shadow: 0 0 12px ${shadow1}, 0 0 24px ${shadow2};
                  border: 2px solid rgba(255,255,255,0.8)">
      </div>
    `
    
    return L.divIcon({
      className: 'bridge-marker',
      html,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }

  // Function to create popup content - UPDATED: Hide submit report for admin
  const createPopupContent = (b) => {
    const cls = classification(b.bqi ?? 0)
    const status = cls.label === 'Safe' ? 'Good' : cls.label
    const emoji = emojiForScore(b.bqi || 0)
    const meterWidth = Math.max(4, Math.min(100, b.bqi || 0))
    
    // Format dates
    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'N/A'
      }
    }
    
    const createdDate = formatDate(b.createdAt)
    const updatedDate = formatDate(b.updatedAt)
    
    // Check if current user is admin
    const isAdmin = currentUser && currentUser.role === 'admin'
    
    return `
      <div style="min-width:260px;font-family:Inter,Arial;padding:8px">
        <div style="font-weight:700;margin-bottom:8px;font-size:16px;color:#333">${b.name}</div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <div style="font-size:12px;color:#666">
            <div style="font-weight:500;margin-bottom:2px">Location</div>
            <div>${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</div>
          </div>
          
          <div style="font-size:12px;color:#666">
            <div style="font-weight:500;margin-bottom:2px">Current BQI</div>
            <div style="font-weight:700;color:#333">${b.bqi ?? '—'}</div>
          </div>
        </div>
        
        <div style="background:#f8f9fa;border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div style="font-size:12px;color:#666">
              <div style="font-weight:500;margin-bottom:2px">Health Status</div>
              <div style="font-weight:600;color:${cls.color}">${status}</div>
            </div>
            
            <div style="font-size:12px;color:#666">
              <div style="font-weight:500;margin-bottom:2px">Score Meter</div>
              <div style="font-size:20px">${emoji}</div>
            </div>
          </div>
          
          <div style="background:#e9ecef;border-radius:6px;height:8px;overflow:hidden;margin-bottom:8px">
            <div style="width:${meterWidth}%;height:100%;background:${cls.color};transition:width 0.3s"></div>
          </div>
          
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#888">
            <span>Created: ${createdDate}</span>
            <span>Updated: ${updatedDate}</span>
          </div>
        </div>
        
        ${!isAdmin ? `
          <button id="submit-report-btn" 
                  data-bridge-id="${b.id}"
                  data-bridge-name="${b.name}"
                  style="width:100%;background:linear-gradient(90deg,#1f6feb,#3fb0ff);
                         border:none;color:#fff;padding:10px 16px;border-radius:8px;
                         cursor:pointer;font-weight:500;font-size:14px;transition:all 0.2s">
            Submit Report
          </button>
        ` : `
          <div style="
            width:100%;
            background:linear-gradient(90deg,#f8f9fa,#e9ecef);
            border:none;
            color:#6c757d;
            padding:10px 16px;
            border-radius:8px;
            font-weight:500;
            font-size:14px;
            text-align:center;
            border:1px solid #dee2e6;
          ">
            <span style="display:inline-block;margin-right:8px">👑</span>
            Admin Mode - View Only
          </div>
        `}
      </div>
    `
  }

  // Handle report form submission
  const handleSubmitReport = (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const reportData = {
      id: Date.now(),
      bridgeId: selectedBridge.id,
      bridgeName: selectedBridge.name,
      issueType: formData.get('issueType'),
      title: formData.get('title'),
      description: formData.get('description'),
      timestamp: new Date().toISOString(),
      status: 'submitted'
    }
    
    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem('bqi_reports') || '[]')
    reports.push(reportData)
    localStorage.setItem('bqi_reports', JSON.stringify(reports))
    
    // Show success message
    setShowReportForm('success')
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowReportForm(false)
      setSelectedBridge(null)
    }, 3000)
  }

  const saveReport = (reportData) => {
    const reports = JSON.parse(localStorage.getItem('bqi_reports') || '[]')
    reports.push(reportData)
    localStorage.setItem('bqi_reports', JSON.stringify(reports))
    
    setShowReportForm('success')
    
    setTimeout(() => {
      setShowReportForm(false)
      setSelectedBridge(null)
    }, 3000)
  }

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    if (!container.id) {
      container.id = 'leaflet-container-' + Math.random().toString(36).slice(2, 9)
    }
    const cid = container.id
    
    if (!window._leaflet_maps) window._leaflet_maps = {}
    if (window._leaflet_maps[cid]) {
      try { window._leaflet_maps[cid].remove() } catch (e) { }
      delete window._leaflet_maps[cid]
    }
    
    const map = L.map(container, {
      center: [27.7172, 85.3240],
      zoom: 13,
      minZoom: 6,
      maxBounds: [[26.3, 80.0], [30.5, 88.3]]
    })
    
    mapRef.current = map
    window._leaflet_maps[cid] = map
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50
    })
    
    markersRef.current = markerCluster
    
    PROVIDED_BRIDGES.forEach(b => {
      const icon = makeIcon(b.bqi)
      const marker = L.marker([b.lat, b.lng], { icon, title: b.name })
      
      marker.bindPopup(createPopupContent(b))
      
      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement()
        const submitBtn = popupEl.querySelector('#submit-report-btn')
        
        if (submitBtn) {
          submitBtn.addEventListener('click', (event) => {
            event.preventDefault()
            const bridgeId = submitBtn.getAttribute('data-bridge-id')
            const bridgeName = submitBtn.getAttribute('data-bridge-name')
            const bridge = PROVIDED_BRIDGES.find(br => br.id === bridgeId)
            
            const user = JSON.parse(localStorage.getItem('bqi_user') || 'null')
            if (!user) {
              navigate('/login')
              return
            }
            
            // Check if user is admin - should not happen since button won't show for admin
            if (user.role === 'admin') {
              return
            }
            
            map.closePopup()
            setSelectedBridge(bridge)
            setShowReportForm(true)
          })
        }
      })
      
      markerCluster.addLayer(marker)
    })
    
    map.addLayer(markerCluster)
    
    const onMove = () => {
      const c = map.getCenter()
      setCoords({
        lat: +c.lat.toFixed(4),
        lng: +c.lng.toFixed(4),
        zoom: +map.getZoom().toFixed(2)
      })
    }
    
    map.on('move', onMove)
    map.on('zoom', onMove)
    
    setTimeout(() => {
      try { map.invalidateSize() } catch (e) { }
    }, 100)
    
    return () => {
      map.off('move', onMove)
      map.off('zoom', onMove)
      try { map.remove() } catch (e) { }
      if (window._leaflet_maps && window._leaflet_maps[cid]) {
        delete window._leaflet_maps[cid]
      }
    }
  }, [navigate, currentUser]) // Added currentUser dependency
  
  // Handle filtering
  useEffect(() => {
    const map = mapRef.current
    const cluster = markersRef.current
    
    if (!map || !cluster) return
    
    try {
      cluster.clearLayers()
    } catch (e) {
      console.error('Failed to clear cluster layers:', e)
    }
    
    const filteredBridges = PROVIDED_BRIDGES.filter(b => {
      if (query && !b.name.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      
      if (healthFilter !== 'all') {
        const cls = classification(b.bqi ?? 0)
        const status = cls.label === 'Safe' ? 'Good' : cls.label
        
        switch (healthFilter) {
          case 'good': return status === 'Good'
          case 'moderate': return status === 'Moderate'
          case 'critical': return status === 'Critical'
          default: return true
        }
      }
      
      return true
    })
    
    filteredBridges.forEach(b => {
      const icon = makeIcon(b.bqi)
      const marker = L.marker([b.lat, b.lng], { icon, title: b.name })
      
      marker.bindPopup(createPopupContent(b))
      
      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement()
        const submitBtn = popupEl.querySelector('#submit-report-btn')
        
        if (submitBtn) {
          submitBtn.addEventListener('click', (event) => {
            event.preventDefault()
            const bridgeId = submitBtn.getAttribute('data-bridge-id')
            const bridgeName = submitBtn.getAttribute('data-bridge-name')
            const bridge = PROVIDED_BRIDGES.find(br => br.id === bridgeId)
            
            const user = JSON.parse(localStorage.getItem('bqi_user') || 'null')
            if (!user) {
              navigate('/login')
              return
            }
            
            // Check if user is admin - should not happen since button won't show for admin
            if (user.role === 'admin') {
              return
            }
            
            if (mapRef.current) {
              mapRef.current.closePopup()
            }
            setSelectedBridge(bridge)
            setShowReportForm(true)
          })
        }
      })
      
      cluster.addLayer(marker)
    })
    
    if (map.hasLayer(cluster)) {
      map.removeLayer(cluster)
      map.addLayer(cluster)
    }
  }, [query, healthFilter, navigate, currentUser]) // Added currentUser dependency
  
  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem('bqi_query', query)
  }, [query])
  
  useEffect(() => {
    localStorage.setItem('bqi_health', healthFilter)
  }, [healthFilter])
  
  // Close report form
  const handleCloseReportForm = () => {
    setShowReportForm(false)
    setSelectedBridge(null)
  }

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  // Get visible bridge count
  const getVisibleBridgeCount = () => {
    return PROVIDED_BRIDGES.filter(b => {
      if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false
      if (healthFilter !== 'all') {
        const cls = classification(b.bqi ?? 0)
        const status = cls.label === 'Safe' ? 'Good' : cls.label
        switch (healthFilter) {
          case 'good': return status === 'Good'
          case 'moderate': return status === 'Moderate'
          case 'critical': return status === 'Critical'
          default: return true
        }
      }
      return true
    }).length
  }
  
  return (
    <div className="page-full" style={{ position: 'relative', height: '100vh' }}>
      {/* Top-Left Coordinates Display */}
      <div style={{
        position: 'absolute',
        left: `${sidebarOffset}px`,
        top: `${NAVBAR_HEIGHT + 20}px`,
        zIndex: 4000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        fontFamily: 'monospace',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontWeight: '600', fontSize: '11px', color: '#555' }}>
          CURRENT VIEW
        </div>
        <div style={{ color: '#333' }}>
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          Zoom: {coords.zoom} | Bridges: {getVisibleBridgeCount()}/{PROVIDED_BRIDGES.length}
          {currentUser && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: currentUser.role === 'admin' ? '#8B5CF6' : '#10B981' }}>
              Mode: {currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}
            </div>
          )}
        </div>
      </div>
      
      {/* Top-Right Filter Toggle Button */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: `${NAVBAR_HEIGHT + 20}px`,
        zIndex: 4001
      }}>
        <button
          onClick={toggleFilterPanel}
          style={{
            background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 15px rgba(31, 111, 235, 0.3)',
            transition: 'all 0.3s ease',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 111, 235, 0.3)'
          }}
        >
          {isFilterExpanded ? '−' : '+'}
        </button>
      </div>
      
      {/* Top-Right Filter Panel (Collapsible) */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: `${NAVBAR_HEIGHT + 80}px`,
        zIndex: 4000,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: isFilterExpanded ? '20px' : '0',
        borderRadius: '15px',
        boxShadow: isFilterExpanded ? '0 8px 30px rgba(0,0,0,0.15)' : 'none',
        backdropFilter: 'blur(10px)',
        border: isFilterExpanded ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
        width: isFilterExpanded ? '320px' : '0',
        height: isFilterExpanded ? 'auto' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: isFilterExpanded ? 1 : 0,
        transform: isFilterExpanded ? 'translateY(0)' : 'translateY(-20px)'
      }}>
        {isFilterExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  ⚙️
                </span>
                Bridge Filters
              </div>
              <button
                onClick={toggleFilterPanel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ×
              </button>
            </div>
            
            {/* User Mode Indicator */}
            {currentUser && (
              <div style={{
                padding: '12px',
                background: currentUser.role === 'admin' 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                borderRadius: '10px',
                border: `1px solid ${currentUser.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: currentUser.role === 'admin' 
                    ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' 
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {currentUser.role === 'admin' ? '👑' : '👤'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: currentUser.role === 'admin' ? '#8B5CF6' : '#10B981',
                    fontWeight: '500'
                  }}>
                    {currentUser.role === 'admin' ? 'Administrator Mode' : 'User Mode'}
                    {currentUser.role === 'admin' && (
                      <span style={{ display: 'block', fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        Submit report feature disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Search Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#444'
              }}>
                <span style={{ marginRight: '8px' }}>🔍</span>
                Search Bridges
              </label>
              <input
                type="text"
                placeholder="Type bridge name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f6feb';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(31, 111, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Health Filter */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#444'
              }}>
                <span style={{ marginRight: '8px' }}>🏥</span>
                Health Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { value: 'all', label: 'All Status', color: 'linear-gradient(90deg, #2ecc71, #3498db, #f1c40f, #e67e22, #e74c3c)' },
                  { value: 'good', label: 'Good (≥80)', color: '#2ecc71', emoji: '😀' },
                  { value: 'moderate', label: 'Moderate (40-79)', color: '#f1c40f', emoji: '🙂' },
                  { value: 'critical', label: 'Critical (<40)', color: '#e74c3c', emoji: '😢' }
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '10px',
                      transition: 'all 0.2s',
                      background: healthFilter === option.value ? '#f0f7ff' : 'transparent',
                      border: healthFilter === option.value ? '2px solid #1f6feb' : '2px solid #eee'
                    }}
                    onMouseEnter={(e) => {
                      if (healthFilter !== option.value) {
                        e.currentTarget.style.background = '#f9f9f9';
                        e.currentTarget.style.borderColor = '#ddd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (healthFilter !== option.value) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#eee';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="healthFilter"
                      value={option.value}
                      checked={healthFilter === option.value}
                      onChange={(e) => setHealthFilter(e.target.value)}
                      style={{
                        cursor: 'pointer',
                        width: '18px',
                        height: '18px',
                        accentColor: '#1f6feb'
                      }}
                    />
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: option.color,
                      border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }} />
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
                      {option.label}
                    </span>
                    {option.emoji && (
                      <span style={{ fontSize: '18px' }}>{option.emoji}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Stats Summary */}
            <div style={{
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '2px solid #f0f0f0'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#444' }}>
                  Showing {getVisibleBridgeCount()} of {PROVIDED_BRIDGES.length} bridges
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: healthFilter === 'all' ? '#f0f7ff' : '#f8f9fa',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: healthFilter === 'all' ? '#1f6feb' : '#666'
                }}>
                  {healthFilter === 'all' ? 'All' : 
                   healthFilter === 'good' ? 'Good' :
                   healthFilter === 'moderate' ? 'Moderate' : 'Critical'}
                </div>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#888',
                lineHeight: '1.5'
              }}>
                {query ? `Searching for: "${query}"` : 'Use filters to find specific bridges'}
              </div>
            </div>
            
            {/* Clear Filters Button */}
            {(query || healthFilter !== 'all') && (
              <button
                onClick={() => {
                  setQuery('');
                  setHealthFilter('all');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef, #dee2e6)';
                  e.currentTarget.style.borderColor = '#ccc';
                  e.currentTarget.style.color = '#555';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.color = '#666';
                }}
              >
                <span>🗑️</span>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          marginTop: NAVBAR_HEIGHT
        }}
      />
      
      {/* Bottom-Left BQI Legend */}
      <div style={{
        position: 'absolute',
        left: `${sidebarOffset}px`,
        bottom: '20px',
        zIndex: 4000,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '220px'
      }}>
        <div style={{ 
          fontWeight: '600', 
          marginBottom: '12px', 
          fontSize: '14px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          BQI Score Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { color: '#2ecc71', label: 'Good', range: '80-100', emoji: '😀' },
            { color: '#3498db', label: 'Moderate', range: '60-79', emoji: '🙂' },
            { color: '#f1c40f', label: 'Fair', range: '40-59', emoji: '😐' },
            { color: '#e67e22', label: 'Poor', range: '20-39', emoji: '🙁' },
            { color: '#e74c3c', label: 'Critical', range: '<20', emoji: '😢' }
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: item.color,
                border: '2px solid rgba(255,255,255,0.8)',
                boxShadow: `0 0 8px ${item.color}40`
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#333', fontSize: '13px' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{item.range}</div>
              </div>
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Report Form Modal - Only show for non-admin users */}
      {showReportForm && selectedBridge && currentUser && currentUser.role !== 'admin' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '20px'
        }}>
          {showReportForm === 'success' ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px'
              }}>
                ✅
              </div>
              <h3 style={{
                marginBottom: '10px',
                color: '#333'
              }}>
                Report Submitted Successfully!
              </h3>
              <p style={{
                color: '#666',
                marginBottom: '30px',
                lineHeight: '1.5'
              }}>
                Thank you for submitting your report for<br />
                <strong>{selectedBridge.name}</strong>
              </p>
              <button
                onClick={handleCloseReportForm}
                style={{
                  background: 'linear-gradient(90deg, #1f6feb, #3fb0ff)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#333'
                }}>
                  Submit Report for {selectedBridge.name}
                </h3>
                <button
                  onClick={handleCloseReportForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmitReport} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Issue Type *
                  </label>
                  <select
                    name="issueType"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select issue type</option>
                    <option value="structural">🏗️ Structural Damage</option>
                    <option value="corrosion">🦠 Corrosion/Rust</option>
                    <option value="cracks">⚡ Cracks/Fractures</option>
                    <option value="drainage">💧 Drainage Issues</option>
                    <option value="roadway">🛣️ Roadway Damage</option>
                    <option value="vibrations">🌊 Excessive Vibrations</option>
                    <option value="flood">🌧️ Flood Damage</option>
                    <option value="other">❓ Other Issue</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Report Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Brief title describing the issue..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    placeholder="Describe the issue in detail. Include location, severity, and any visible signs..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      minHeight: '120px',
                      resize: 'vertical',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '10px'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseReportForm}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '1px solid #ddd',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(90deg, #1f6feb, #3fb0ff)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      
      {/* Styles */}
      <style>{`
        .glow-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          position: relative;
        }
        
        .glow-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 20px currentColor;
          opacity: 0.7;
        }
        
        .leaflet-container {
          background: #e6f3ff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-popup-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .leaflet-marker-icon {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #1f6feb !important;
          box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.1) !important;
        }
        
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .filter-panel {
            width: 280px !important;
            right: 10px !important;
          }
          
          .toggle-button {
            width: 45px !important;
            height: 45px !important;
            right: 10px !important;
          }
          
          .legend-panel {
            width: 200px !important;
            right: 10px !important;
            bottom: 10px !important;
          }
          
          .coordinates-panel {
            left: 10px !important;
            top: 70px !important;
          }
        }
        
        @media (max-width: 480px) {
          .filter-panel {
            width: 260px !important;
          }
          
          .legend-panel {
            width: 180px !important;
          }
        }
      `}</style>
    </div>
  )
}