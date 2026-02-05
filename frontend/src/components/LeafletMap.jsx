import React, { useEffect, useRef, useState, useContext } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { BridgesContext } from '../contexts/BridgesContext'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

// Import BQI utilities
import { getColorForBQI, getStatusFromBQI } from '../lib/bqiCalculator'

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

// Fix for your API's swapped coordinates
const normalizeLatLng = (src) => {
  const lat = src?.longitude  // This is actually latitude
  const lng = src?.latitude   // This is actually longitude
  
  return { 
    latitude: lat !== undefined && lat !== '' ? Number(lat) : null,
    longitude: lng !== undefined && lng !== '' ? Number(lng) : null
  }
}

// Get BQI score from bridge data (prioritizes bridge.bqi, falls back to status)
const getBQIFromBridge = (bridge) => {
  // If bridge has bqi field, use it
  if (bridge.bqi !== undefined && bridge.bqi !== null) {
    return bridge.bqi;
  }
  
  // Fallback to status-based BQI
  const statusStr = (bridge.status || '').toString().toUpperCase();
  if (statusStr === 'EXCELLENT') return 90;
  if (statusStr === 'GOOD') return 75;
  if (statusStr === 'FAIR') return 55;
  if (statusStr === 'POOR') return 35;
  if (statusStr === 'CRITICAL') return 10;
  return 60;
};

export default function LeafletMap() {
  const { bridges = [], refreshBridges, user } = useContext(BridgesContext)
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef(null)
  const navigate = useNavigate()

  const [coords, setCoords] = useState({ lat: 27.7172, lng: 85.3240, zoom: 13 })
  const [query, setQuery] = useState(() => localStorage.getItem('bqi_query') || '')
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('bqi_status') || 'all')
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedBridge, setSelectedBridge] = useState(null)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [visibleBridgesCount, setVisibleBridgesCount] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)

  const currentRoleLower = (user?.role || '').toString().toLowerCase()
  const currentIsAdmin = currentRoleLower === 'admin'

  // Debug: Check context
  useEffect(() => {
    console.log('Map Component - Bridges Context:', {
      bridgesCount: bridges?.length,
      bridgesWithBQI: bridges?.filter(b => b.bqi !== undefined).length,
      bridgesSample: bridges?.slice(0, 2).map(b => ({ name: b.name, bqi: b.bqi, status: b.status }))
    })
  }, [bridges])

  // Function to create marker icon based on BQI
  const makeIcon = (bridge) => {
    const bqi = getBQIFromBridge(bridge)
    const color = getColorForBQI(bqi)
    
    const light = lighten(color, 0.35)
    const shadow1 = hexToRgba(color, 0.55)
    const shadow2 = hexToRgba(color, 0.28)
    
    // Add BQI number inside marker
    const html = `
      <div class="glow-marker" 
           style="background:radial-gradient(circle at 30% 30%, ${light}, ${color});
                  box-shadow: 0 0 12px ${shadow1}, 0 0 24px ${shadow2};
                  border: 2px solid rgba(255,255,255,0.8);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 11px;
                  color: white;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
        ${Math.round(bqi)}
      </div>
    `
    
    return L.divIcon({
      className: 'bridge-marker',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }

  // Function to create popup content
  const createPopupContent = (b) => {
    const n = normalizeLatLng(b)
    const bqi = getBQIFromBridge(b)
    const status = getStatusFromBQI(bqi)
    const lat = n.latitude
    const lng = n.longitude

    // Get last update time
    let lastUpdateText = ''
    if (b.updatedAt) {
      const updateTime = new Date(b.updatedAt)
      lastUpdateText = `Last updated: ${updateTime.toLocaleDateString()} ${updateTime.toLocaleTimeString()}`
    }

    return `
      <div style="min-width:280px;font-family:Inter,Arial;padding:16px">
        <div style="font-weight:700;margin-bottom:10px;font-size:18px;color:#222">${b.name}</div>
        
        <!-- BQI Score Display -->
        <div style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="font-size:14px;color:#444">
              <strong>BQI Score:</strong>
            </div>
            <div style="
              font-size:18px;
              font-weight:700;
              color:${getColorForBQI(bqi)};
              background:${getColorForBQI(bqi)}20;
              padding:4px 12px;
              border-radius:20px;
              border: 2px solid ${getColorForBQI(bqi)}40;
            ">
              ${bqi}/100
            </div>
          </div>
          <div style="font-size:13px;color:#666">
            <strong>Status:</strong> <span style="color:${getColorForBQI(bqi)};font-weight:500">${status}</span>
          </div>
          ${lastUpdateText ? `<div style="font-size:11px;color:#888;margin-top:4px">${lastUpdateText}</div>` : ''}
        </div>
        
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;font-size:12px;color:#555">
          <div><strong>ID:</strong> ${b.id}</div>
          <div><strong>Coordinates:</strong> ${lat?.toFixed(5) || '—'}, ${lng?.toFixed(5) || '—'}</div>
          <div style="font-size:11px;color:#888;font-style:italic">
            API fields: longitude=${b.longitude?.toFixed(5)}, latitude=${b.latitude?.toFixed(5)}
          </div>
        </div>
        
        <div style="display:flex;gap:8px">
          <button id="view-details" data-bridge-id="${b.id}" style="flex:1;padding:10px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#0F766E,#3B82F6);color:white;cursor:pointer;font-size:13px;font-weight:500">View Details</button>
          ${!currentIsAdmin ? `<button id="submit-report-btn" data-bridge-id="${b.id}" style="flex:1;padding:10px 14px;border-radius:8px;border:1px solid #e6edf8;background:linear-gradient(90deg,#f8fbff,#fff);cursor:pointer;font-size:13px;font-weight:500">Report Issue</button>` : ''}
        </div>
        
        <!-- BQI Calculation Info -->
        <div style="margin-top:12px;padding:8px;background:#f8f9fa;border-radius:6px;border-left:3px solid ${getColorForBQI(bqi)};">
          <div style="font-size:10px;color:#666;font-weight:500">BQI Formula</div>
          <div style="font-size:9px;color:#888;font-family:monospace;">
            BQI = 100 × [0.45×(1−S) + 0.40×(1−V) + 0.15×(1−T)]
          </div>
        </div>
      </div>
    `
  }

 // Update the useEffect that logs bridge context
useEffect(() => {
  console.log('Map Component - Bridges Context:', {
    bridgesCount: bridges?.length || 0,
    bridgesWithBQI: bridges?.filter(b => b.bqi !== undefined).length || 0,
    bridgesSample: bridges?.slice(0, 3).map(b => ({ 
      name: b.name, 
      bqi: b.bqi, 
      status: b.status,
      id: b.id 
    })) || []
  });
  
  // Check if bridges are loading from API or using fallback
  if (bridges && bridges.length > 0) {
    const firstBridge = bridges[0];
    console.log('First bridge details:', {
      name: firstBridge.name,
      id: firstBridge.id,
      hasBQI: firstBridge.bqi !== undefined,
      bqi: firstBridge.bqi,
      coordinates: `Lat: ${firstBridge.latitude}, Lng: ${firstBridge.longitude}`
    });
  }
}, [bridges]);

// Update the updateMapMarkers function to use bridges from context
const updateMapMarkers = () => {
  const map = mapRef.current;
  const cluster = markersRef.current;
  
  if (!map || !cluster) return;
  
  try {
    cluster.clearLayers();
  } catch (e) {
    console.error('Failed to clear cluster layers:', e);
  }
  
  // Use bridges from context - they should now have BQI
  let bridgesToDisplay = bridges || [];
  
  console.log('Bridges to display:', bridgesToDisplay.length, 'with BQI:', 
    bridgesToDisplay.filter(b => b.bqi !== undefined).length);
  
  // Only use fallback if REALLY no bridges
  if (bridgesToDisplay.length === 0) {
    console.warn('No bridges from context, checking if loading...');
    // Don't immediately use mock data - wait a bit
    return;
  }
    
    const filteredBridges = bridgesToDisplay.filter(b => {
      // Search filter
      if (query && !b.name?.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const bridgeStatus = getStatusFromBQI(getBQIFromBridge(b)).toLowerCase()
        return bridgeStatus === statusFilter.toLowerCase()
      }
      
      return true
    })
    
    let validBridgesCount = 0
    
    filteredBridges.forEach(b => {
      // Use normalized coordinates (swap longitude/latitude)
      const n = normalizeLatLng(b)
      let lat = n.latitude
      let lng = n.longitude
      
      // Skip bridges with invalid coordinates
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for bridge ${b.id}:`, lat, lng)
        return
      }
      
      // Check if coordinates are valid for Nepal
      const isLatValid = lat >= 26.3 && lat <= 30.5
      const isLngValid = lng >= 80.0 && lng <= 88.3
      
      if (!isLatValid || !isLngValid) {
        // Try the original (unswapped) coordinates as a fallback
        const originalLat = b.latitude
        const originalLng = b.longitude
        
        if (originalLat >= 26.3 && originalLat <= 30.5 && 
            originalLng >= 80.0 && originalLng <= 88.3) {
          lat = originalLat
          lng = originalLng
        } else {
          return
        }
      }
      
      validBridgesCount++
      const icon = makeIcon(b)
      const marker = L.marker([lat, lng], { icon, title: b.name })

      marker.bindPopup(createPopupContent(b))

      // Handle popup events
      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement()
        const submitBtn = popupEl.querySelector('#submit-report-btn')
        const viewDetailsBtn = popupEl.querySelector('#view-details')

        if (viewDetailsBtn) {
          viewDetailsBtn.onclick = () => {
            navigate(`/bridges/${b.id}`)
          }
        }

        if (submitBtn && !currentIsAdmin) {
          submitBtn.onclick = (event) => {
            event.preventDefault()
            if (!user) {
              navigate('/login')
              return
            }

            if (mapRef.current) mapRef.current.closePopup()
            setSelectedBridge(b)
            setShowReportForm(true)
          }
        }
      })

      cluster.addLayer(marker)
    })
    
    setVisibleBridgesCount(validBridgesCount)
    console.log(`Map - Added ${validBridgesCount} markers with BQI`)
    
    if (map.hasLayer(cluster)) {
      map.removeLayer(cluster)
      map.addLayer(cluster)
    }
    
    // If we have bridges, fit bounds to show all markers
    if (validBridgesCount > 0 && cluster.getLayers().length > 0) {
      try {
        const bounds = cluster.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (e) {
        console.error('Error fitting bounds:', e)
      }
    } else {
      console.warn('No valid markers to display')
    }
    
    // Set last update time
    setLastUpdateTime(new Date().toISOString())
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
    
    // Initialize map with Nepal bounds
    const map = L.map(container, {
      center: [27.7172, 85.3240],
      zoom: 8,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: [[26.3, 80.0], [30.5, 88.3]], // Nepal bounds
      maxBoundsViscosity: 1.0
    })
    
    mapRef.current = map
    window._leaflet_maps[cid] = map
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)
    
    // Initialize marker cluster
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 15,
      iconCreateFunction: function(cluster) {
        const childMarkers = cluster.getAllChildMarkers()
        const bqis = childMarkers.map(marker => {
          const bridge = bridges.find(b => b.name === marker.options.title)
          return bridge ? getBQIFromBridge(bridge) : 60
        })
        const avgBqi = Math.round(bqis.reduce((a, b) => a + b, 0) / bqis.length)
        const color = getColorForBQI(avgBqi)
        
        return L.divIcon({
          html: `<div style="
            background: ${color};
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          ">${cluster.getChildCount()}<br/><span style="font-size:9px">BQI:${avgBqi}</span></div>`,
          className: 'cluster-marker',
          iconSize: L.point(40, 40)
        })
      }
    })
    
    markersRef.current = markerCluster
    
    // Add markers to cluster
    updateMapMarkers()
    
    map.addLayer(markerCluster)
    
    // Update coordinates on map move
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
    
    // Invalidate size after a delay to ensure proper rendering
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
  }, [navigate, user])
  
  // Update markers when bridges, filters, or user changes
  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      console.log('Map - Updating markers due to change in bridges/filters')
      updateMapMarkers()
    }
  }, [bridges, query, statusFilter, user])
  
  // Listen for health updates
  useEffect(() => {
    const handleHealthUpdated = (event) => {
      console.log('Map - Received health update:', event.detail)
      updateMapMarkers()
    };

    const handleBridgesUpdated = () => {
      console.log('Map - Received bridges-updated event')
      if (refreshBridges && typeof refreshBridges === 'function') {
        refreshBridges()
      } else {
        updateMapMarkers()
      }
    };

    window.addEventListener('bqi-health-updated', handleHealthUpdated);
    window.addEventListener('bqi-bridges-updated', handleBridgesUpdated);
    
    return () => {
      window.removeEventListener('bqi-health-updated', handleHealthUpdated);
      window.removeEventListener('bqi-bridges-updated', handleBridgesUpdated);
    };
  }, [refreshBridges]);
  
  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem('bqi_query', query)
  }, [query])
  
  useEffect(() => {
    localStorage.setItem('bqi_status', statusFilter)
  }, [statusFilter])
  
  // Auto-refresh BQI every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshBridges && typeof refreshBridges === 'function') {
        console.log('Auto-refreshing bridges and BQI...')
        refreshBridges()
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [refreshBridges])
  
  // Handle report form submission
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const reportData = {
      id: Date.now(),
      bridgeId: selectedBridge.id,
      bridgeName: selectedBridge.name,
      issueType: formData.get('issueType'),
      title: formData.get('title'),
      description: formData.get('description'),
      reporterName: user?.name || user?.email?.split('@')[0],
      reporterEmail: user?.email,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    }
    
    try {
      setIsLoading(true)
      // Save to localStorage
      const reports = JSON.parse(localStorage.getItem('bqi_reports') || '[]')
      reports.push(reportData)
      localStorage.setItem('bqi_reports', JSON.stringify(reports))
      
      setShowReportForm('success')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowReportForm(false)
        setSelectedBridge(null)
      }, 3000)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Close report form
  const handleCloseReportForm = () => {
    setShowReportForm(false)
    setSelectedBridge(null)
  }

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  // Safe refresh bridges function
  const handleRefreshBridges = async () => {
    try {
      setIsLoading(true)
      if (refreshBridges && typeof refreshBridges === 'function') {
        console.log('Refreshing bridges via context function')
        await refreshBridges()
      } else {
        console.warn('refreshBridges not available in context')
        window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
      }
    } catch (error) {
      console.error('Error refreshing bridges:', error)
      alert('Failed to refresh bridges: ' + (error.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setQuery('')
    setStatusFilter('all')
  }
  
  // Format last update time
  const formatUpdateTime = () => {
    if (!lastUpdateTime) return 'Never'
    const time = new Date(lastUpdateTime)
    const now = new Date()
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return time.toLocaleDateString()
  }
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%',
      minHeight: '600px'
    }}>
      {/* Bottom-Right Coordinates Display */}
      <div style={{
        position: 'absolute',
        right: '20px',
        bottom: '20px',
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
        gap: '4px',
        minWidth: '220px'
      }}>
        <div style={{ fontWeight: '600', fontSize: '11px', color: '#555' }}>
          BRIDGE QUALITY MAP
        </div>
        <div style={{ color: '#333' }}>
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          Zoom: {coords.zoom} | Bridges: {visibleBridgesCount}/{(bridges||[]).length}
          <div style={{ marginTop: '4px' }}>
            Updated: {formatUpdateTime()}
          </div>
          {user && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: currentIsAdmin ? '#8B5CF6' : '#10B981' }}>
              Mode: {currentIsAdmin ? '👑 Admin' : '👤 User'}
            </div>
          )}
        </div>
        <button
          onClick={handleRefreshBridges}
          disabled={isLoading}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh BQI'}
        </button>
      </div>
      
      {/* Top-Right Filter Toggle Button */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        zIndex: 4001
      }}>
        <button
          onClick={toggleFilterPanel}
          disabled={isLoading}
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
            fontWeight: 'bold',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 111, 235, 0.3)'
            }
          }}
        >
          {isFilterExpanded ? '−' : '+'}
        </button>
      </div>
      
      {/* Top-Right Filter Panel (Collapsible) */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '80px',
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
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: isLoading ? '#f5f5f5' : '#fafafa',
                  opacity: isLoading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  if (!isLoading) {
                    e.target.style.borderColor = '#1f6feb';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(31, 111, 235, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#444'
              }}>
                <span style={{ marginRight: '8px' }}>🏥</span>
                Bridge Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { value: 'all', label: 'All Status', color: 'linear-gradient(90deg, #2ecc71, #3498db, #f1c40f, #e67e22, #e74c3c)' },
                  { value: 'excellent', label: 'Excellent (80-100)', color: '#2ecc71', emoji: '😀' },
                  { value: 'good', label: 'Good (60-79)', color: '#3498db', emoji: '🙂' },
                  { value: 'fair', label: 'Fair (40-59)', color: '#f1c40f', emoji: '😐' },
                  { value: 'poor', label: 'Poor (20-39)', color: '#e67e22', emoji: '🙁' },
                  { value: 'critical', label: 'Critical (0-19)', color: '#e74c3c', emoji: '😢' }
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
                      background: statusFilter === option.value ? '#f0f7ff' : 'transparent',
                      border: statusFilter === option.value ? '2px solid #1f6feb' : '2px solid #eee'
                    }}
                    onMouseEnter={(e) => {
                      if (statusFilter !== option.value) {
                        e.currentTarget.style.background = '#f9f9f9';
                        e.currentTarget.style.borderColor = '#ddd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (statusFilter !== option.value) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#eee';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="statusFilter"
                      value={option.value}
                      checked={statusFilter === option.value}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={isLoading}
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
                  Showing {visibleBridgesCount} of {(bridges||[]).length} bridges
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: statusFilter === 'all' ? '#f0f7ff' : '#f8f9fa',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: statusFilter === 'all' ? '#1f6feb' : '#666'
                }}>
                  {statusFilter === 'all' ? 'All' : 
                   statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
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
            {(query || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef, #dee2e6)';
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.color = '#555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.color = '#666';
                  }
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
          height: 'calc(100vh - 120px)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
      />
      
      {/* Bottom-Left Status Legend */}
      <div style={{
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        zIndex: 4000,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '240px'
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
          Bridge Quality Index (BQI)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { range: '80-100', label: 'Excellent', color: '#2ecc71', emoji: '😀', desc: 'Safe' },
            { range: '60-79', label: 'Good', color: '#3498db', emoji: '🙂', desc: 'Stable' },
            { range: '40-59', label: 'Fair', color: '#f1c40f', emoji: '😐', desc: 'Monitor' },
            { range: '20-39', label: 'Poor', color: '#e67e22', emoji: '🙁', desc: 'Caution' },
            { range: '0-19', label: 'Critical', color: '#e74c3c', emoji: '😢', desc: 'Danger' }
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
                <div style={{ fontSize: '11px', color: '#666' }}>{item.range} - {item.desc}</div>
              </div>
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
            </div>
          ))}
        </div>
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid #eee',
          fontSize: '10px',
          color: '#888'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>BQI Formula:</div>
          <div style={{ fontFamily: 'monospace', fontSize: '9px' }}>
            BQI = 100 × [0.45×(1−S) + 0.40×(1−V) + 0.15×(1−T)]
          </div>
        </div>
      </div>
      
      {/* Report Form Modal - Only show for non-admin users */}
      {showReportForm && selectedBridge && user && !currentIsAdmin && (
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      outline: 'none',
                      opacity: isLoading ? 0.7 : 1
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
                    disabled={isLoading}
                    placeholder="Brief title describing the issue..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      opacity: isLoading ? 0.7 : 1
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
                    disabled={isLoading}
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
                      outline: 'none',
                      opacity: isLoading ? 0.7 : 1
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
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '1px solid #ddd',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#333',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: isLoading ? '#94a3b8' : 'linear-gradient(90deg, #1f6feb, #3fb0ff)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Report'}
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          position: relative;
          animation: pulse 2s infinite;
          cursor: pointer;
        }
        
        .glow-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140%;
          height: 140%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          opacity: 0.8;
          z-index: -1;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(46, 204, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
          }
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
        
        .cluster-marker {
          animation: clusterPulse 3s infinite;
        }
        
        @keyframes clusterPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #1f6feb !important;
          box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .coordinates-panel {
            right: 10px !important;
            bottom: 10px !important;
            left: auto !important;
            top: auto !important;
            min-width: 180px !important;
            font-size: 11px !important;
            padding: 10px 12px !important;
          }
          
          .filter-toggle {
            width: 40px !important;
            height: 40px !important;
            right: 10px !important;
            top: 10px !important;
            font-size: 20px !important;
          }
          
          .filter-panel {
            width: 280px !important;
            right: 10px !important;
            top: 60px !important;
          }
          
          .legend-panel {
            width: 200px !important;
            left: 10px !important;
            bottom: 120px !important;
            padding: 12px !important;
            font-size: 11px !important;
          }
          
          .map-container {
            height: calc(100vh - 120px) !important;
          }
          
          .debug-info {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .coordinates-panel {
            min-width: 160px !important;
            padding: 8px 10px !important;
          }
          
          .filter-panel {
            width: 260px !important;
          }
          
          .legend-panel {
            width: 180px !important;
            bottom: 140px !important;
          }
        }
      `}</style>
    </div>
  )
}