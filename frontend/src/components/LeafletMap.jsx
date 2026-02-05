import React, { useEffect, useRef, useState, useContext } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { BridgesContext } from '../contexts/BridgesContext'
import { useNavigate } from 'react-router-dom'



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

// Toast component for notifications
function Toast({ msg }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: msg.type === 'success' ? '#10B981' : '#DC2626',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px'
    }}>
      {msg.text}
    </div>
  )
}

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
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    bridgeId: '',
    title: '',
    description: '',
    issueType: ''
  })

  const currentRoleLower = (user?.role || '').toString().toLowerCase()
  const currentIsAdmin = currentRoleLower === 'admin'

  // Toast function
  const pushToast = (text, type = 'success') => {
    const t = { id: Date.now(), text, type }
    setToasts(s => [t, ...s])
    setTimeout(() => setToasts(s => s.filter(x => x.id !== t.id)), 3800)
  }

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

  // Function to create popup content - REMOVED VIEW DETAILS BUTTON
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
        </div>
        
        <div style="display:flex;gap:8px">
          ${!currentIsAdmin ? `<button id="submit-report-btn" data-bridge-id="${b.id}" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid #e6edf8;background:linear-gradient(90deg,#f8fbff,#fff);cursor:pointer;font-size:13px;font-weight:500;transition:all 0.2s;color:#333;">Report Issue</button>` : ''}
        </div>
      </div>
    `
  }

  // Update the updateMapMarkers function
  const updateMapMarkers = () => {
    const map = mapRef.current
    const cluster = markersRef.current
    
    if (!map || !cluster) return
    
    try {
      cluster.clearLayers()
    } catch (e) {
      console.error('Failed to clear cluster layers:', e)
    }
    
    // Use bridges from context
    let bridgesToDisplay = bridges || []
    
    if (bridgesToDisplay.length === 0) {
      console.warn('No bridges from context, checking if loading...')
      return
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

  // Initialize map - FIXED ZOOMING ISSUE
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
    
    // Initialize map with Nepal bounds - IMPORTANT: Changed initial zoom to 8 (was 13)
    const map = L.map(container, {
      center: [27.7172, 85.3240],
      zoom: 8, // CHANGED FROM 13 TO 8 for better initial view
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
    
    // Improved marker cluster configuration (showing count like in screenshot)
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16, // FIX: Changed from 15 to 16
      zoomToBoundsOnClick: true, // Enables zoom when clicking cluster
      iconCreateFunction: function(cluster) {
        const childMarkers = cluster.getAllChildMarkers()
        const count = childMarkers.length
        
        // Calculate average BQI for the cluster
        const bqis = childMarkers.map(marker => {
          const bridgeName = marker.options.title
          const bridge = bridges.find(b => b.name === bridgeName)
          return bridge ? getBQIFromBridge(bridge) : 60
        })
        const avgBqi = Math.round(bqis.reduce((a, b) => a + b, 0) / bqis.length)
        const color = getColorForBQI(avgBqi)
        const lightColor = lighten(color, 0.4)
        
        // Determine size based on count
        let size = 40
        if (count > 10) size = 50
        if (count > 20) size = 60
        
        // Create cluster icon with count (like in screenshot with "6", "4")
        return L.divIcon({
          html: `
            <div class="cluster-icon" style="
              width: ${size}px;
              height: ${size}px;
              background: radial-gradient(circle at 30% 30%, ${lightColor}, ${color});
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              position: relative;
              cursor: pointer;
            ">
              <div style="font-size: ${count > 9 ? '16px' : '18px'}; line-height: 1;">${count}</div>
              <div style="font-size: 9px; opacity: 0.9; margin-top: -2px;">bridge${count !== 1 ? 's' : ''}</div>
            </div>
          `,
          className: 'cluster-marker',
          iconSize: L.point(size, size),
          iconAnchor: [size / 2, size / 2]
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
    
    // Handle cluster click to zoom (additional functionality)
    markerCluster.on('clustermouseover', (e) => {
      const count = e.layer.getChildCount()
      e.layer.bindTooltip(
        `${count} bridge${count !== 1 ? 's' : ''} - Click to zoom in`,
        { 
          direction: 'top',
          offset: L.point(0, -25)
        }
      ).openTooltip()
    })
    
    markerCluster.on('clustermouseout', (e) => {
      e.layer.closeTooltip()
    })
    
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
    }

    const handleBridgesUpdated = () => {
      console.log('Map - Received bridges-updated event')
      if (refreshBridges && typeof refreshBridges === 'function') {
        refreshBridges()
      } else {
        updateMapMarkers()
      }
    }

    window.addEventListener('bqi-health-updated', handleHealthUpdated)
    window.addEventListener('bqi-bridges-updated', handleBridgesUpdated)
    
    return () => {
      window.removeEventListener('bqi-health-updated', handleHealthUpdated)
      window.removeEventListener('bqi-bridges-updated', handleBridgesUpdated)
    }
  }, [refreshBridges])
  
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
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle report submission - USING YOUR EXACT METHOD
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!selectedBridge) {
      pushToast('No bridge selected', 'error')
      return
    }
    
    if (!formData.title.trim()) {
      pushToast('Title is required', 'error')
      return
    }
    if (!formData.description.trim()) {
      pushToast('Description is required', 'error')
      return
    }
    if (!formData.issueType) {
      pushToast('Please select an issue type', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('bqi_user') || '{}')
      const userName = currentUser.name || 'Anonymous User'
      const userEmail = currentUser.email || ''

      if (!userEmail) {
        pushToast('User not found. Please login again.', 'error')
        return
      }

      // Create new report using YOUR EXACT STRUCTURE
      const newReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bridgeId: selectedBridge.id,
        bridge: selectedBridge.name,
        title: formData.title.trim(),
        description: formData.description.trim(),
        summary: formData.title.trim(),
        issueType: formData.issueType,
        category: formData.issueType.charAt(0).toUpperCase() + formData.issueType.slice(1),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        submitted: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        auditor: userName,
        userName: userName,
        userEmail: userEmail, // This is the key for user-specific filtering
        estimatedCost: 'To be determined',
        estimatedTime: 'To be determined'
      }

      // Save to main reports storage - YOUR EXACT METHOD
      const allReports = JSON.parse(localStorage.getItem('bqi_reports') || '[]')
      const updatedAllReports = [newReport, ...allReports]
      localStorage.setItem('bqi_reports', JSON.stringify(updatedAllReports))

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('bqi-report-submitted', { 
        detail: { report: newReport, bridge: selectedBridge } 
      }))

      // Reset form
      setFormData({
        bridgeId: '',
        title: '',
        description: '',
        issueType: ''
      })
      
      setShowReportForm('success')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowReportForm(false)
        setSelectedBridge(null)
        setIsLoading(false)
      }, 3000)
      
      pushToast('Report submitted successfully! Our team will review it shortly.', 'success')
      
    } catch (error) {
      console.error('Error submitting report:', error)
      pushToast('Failed to submit report. Please try again.', 'error')
      setIsLoading(false)
    }
  }

  // Close report form
  const handleCloseReportForm = () => {
    setShowReportForm(false)
    setSelectedBridge(null)
    setFormData({
      bridgeId: '',
      title: '',
      description: '',
      issueType: ''
    })
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
      pushToast('Failed to refresh bridges: ' + (error.message || 'Unknown error'), 'error')
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
                    e.target.style.borderColor = '#1f6feb'
                    e.target.style.background = '#fff'
                    e.target.style.boxShadow = '0 0 0 4px rgba(31, 111, 235, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.background = '#fafafa'
                  e.target.style.boxShadow = 'none'
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
                        e.currentTarget.style.background = '#f9f9f9'
                        e.currentTarget.style.borderColor = '#ddd'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (statusFilter !== option.value) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = '#eee'
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
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef, #dee2e6)'
                    e.currentTarget.style.borderColor = '#ccc'
                    e.currentTarget.style.color = '#555'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                    e.currentTarget.style.borderColor = '#ddd'
                    e.currentTarget.style.color = '#666'
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
      </div>
      
      {/* Report Form Modal - FIXED: Fixed select input stretching */}
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
              width: '90%', // FIXED: Changed from '100%' to '90%'
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={handleCloseReportForm}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ×
              </button>

              {/* Form Header */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: 0,
                  color: '#1f2937',
                  fontSize: '22px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Submit Report for {selectedBridge.name}
                </h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Provide details about the bridge issue you've identified
                </p>
              </div>

              {/* Form - FIXED: Fixed select input styling */}
              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Bridge Selection (Pre-filled since we're on the map) */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    <span style={{ marginRight: '6px' }}>🌉</span>
                    Selected Bridge
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#f9fafb',
                    color: '#374151',
                    boxSizing: 'border-box' // ADDED
                  }}>
                    {selectedBridge.name} {selectedBridge.bqi ? `(BQI: ${selectedBridge.bqi})` : ''}
                  </div>
                  <input type="hidden" name="bridgeId" value={selectedBridge.id} />
                </div>

                {/* Issue Type - FIXED: Fixed stretched select */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    <span style={{ marginRight: '6px' }}>⚠️</span>
                    Issue Type *
                  </label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxSizing: 'border-box', // ADDED
                      appearance: 'none', // ADDED for better styling
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      backgroundSize: '16px',
                      paddingRight: '40px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1f6feb'
                      e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Select issue type...</option>
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

                {/* Title */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    <span style={{ marginRight: '6px' }}>📝</span>
                    Report Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief title describing the issue..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1f6feb'
                      e.target.style.background = '#fff'
                      e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.background = '#fafafa'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    <span style={{ marginRight: '6px' }}>📋</span>
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide detailed information about the issue, including location, severity, and any visible signs..."
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      resize: 'vertical',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1f6feb'
                      e.target.style.background = '#fff'
                      e.target.style.boxShadow = '0 0 0 3px rgba(31, 111, 235, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.background = '#fafafa'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* User Info */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Reporting as:</div>
                  <div>{user.name || user.email?.split('@')[0] || 'Anonymous'} ({user.email || 'No email'})</div>
                </div>

                {/* Form Actions */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '10px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseReportForm}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '2px solid #e5e7eb',
                      background: '#f9fafb',
                      borderRadius: '10px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'all 0.2s',
                      opacity: isLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = '#f3f4f6'
                        e.currentTarget.style.borderColor = '#d1d5db'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                      }
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
                      background: 'linear-gradient(135deg, #1f6feb, #3fb0ff)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      opacity: isLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 111, 235, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ marginRight: '8px' }}>⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '8px' }}>📤</span>
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      
      {/* Toasts */}
      <div>
        {toasts.map(t => <Toast key={t.id} msg={t} />)}
      </div>

      
      
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
        
        .cluster-icon {
          transition: transform 0.3s ease;
        }
        
        .cluster-icon:hover {
          transform: scale(1.1);
        }
        
        @keyframes clusterPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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