import React, { useEffect, useState } from 'react'
import { BridgesContext } from './contexts/BridgesContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Landing from './pages/Landing'
import About from './pages/About'
import MapsPage from './pages/Maps'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AdminReports from './pages/admin/Reports'
import AdminUsers from './pages/admin/Users'
import AdminBridgeManagement from './pages/admin/BridgeManagement'
import ReportsNew from './pages/ReportsNew'
import UserReports from './pages/user/Reports'
import SafetyTips from './pages/user/SafetyTips'
import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/Dashboard'
import api from './lib/api'
import Footer from './components/Footer'
import HealthLogs from './pages/admin/HealthLogs';

// BQI calculator removed — rely on API-provided bqi/status

function App() {
  const [bridges, setBridges] = useState([])
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bqi_user') || 'null')
    } catch (e) { return null }
  })
  const [bridgeHealth, setBridgeHealth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bqi_health_data') || '{}')
    } catch (e) { return {} }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(true)

  // Helper function for fallback bridges
  const getFallbackBridges = () => {
    return [
      {
        id: 'BRIDGE-001',
        name: 'Model Bridge',
        status: 'EXCELLENT',
        bqi: 95,
        longitude: 27.7122, // This is actually latitude
        latitude: 85.3249,  // This is actually longitude
        updatedAt: new Date().toISOString()
      },
      {
        id: 'BRIDGE-008',
        name: 'Karnali Bridge',
        status: 'EXCELLENT',
        bqi: 92,
        longitude: 28.6412172,
        latitude: 81.283269,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'BRIDGE-002',
        name: 'Bagmati Bridge',
        status: 'GOOD',
        bqi: 72,
        longitude: 27.7172,
        latitude: 85.3240,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'BRIDGE-003',
        name: 'Kaligandaki Bridge',
        status: 'FAIR',
        bqi: 58,
        longitude: 27.9833,
        latitude: 83.7667,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'BRIDGE-004',
        name: 'Narayani Bridge',
        status: 'POOR',
        bqi: 32,
        longitude: 27.6833,
        latitude: 84.4333,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'BRIDGE-005',
        name: 'Mahakali Bridge',
        status: 'CRITICAL',
        bqi: 15,
        longitude: 29.5500,
        latitude: 80.6167,
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Default BQI fallback (should rarely be used; prefer API values)
  const calculateDefaultBQI = (bridgeId) => {
    const hash = bridgeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return (hash % 61) + 40
  }

  // Load bridges and calculate BQI on mount
  useEffect(() => {
    let mounted = true
    
    const loadBridgesAndHealth = async () => {
      try {
        setIsLoading(true)
        setApiConnected(true)
        
        // 1. Load bridges from API
        let apiBridges = []
        try {
          apiBridges = await api.getBridges()
          console.log('Bridges from API:', apiBridges?.length || 0)
          
          if (!apiBridges || !Array.isArray(apiBridges) || apiBridges.length === 0) {
            console.warn('API returned empty bridges array, using fallback')
            apiBridges = getFallbackBridges()
            setApiConnected(false)
          }
        } catch (bridgeError) {
          console.error('Failed to load bridges from API:', bridgeError.message)
          // Use fallback bridges
          apiBridges = getFallbackBridges()
          setApiConnected(false)
        }
        
        if (!mounted) return
        
        if (apiBridges && apiBridges.length > 0) {
          // Use API-provided bridges directly (bqi/status should come from API)
          setBridges(apiBridges)
          setApiConnected(true)
        } else {
          // No bridges from API, use fallback
          console.warn('No bridges from API, using fallback bridges')
          const fallbackBridges = getFallbackBridges()
          setBridges(fallbackBridges)
          setApiConnected(false)
        }
      } catch (e) {
        console.error('Failed to load bridges and health:', e)
        if (mounted) {
          // Use fallback bridges on error
          const fallbackBridges = getFallbackBridges()
          setBridges(fallbackBridges)
          setApiConnected(false)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    
    loadBridgesAndHealth()
    
    return () => { mounted = false }
  }, [])

  // Calculate BQI for a specific bridge
  // Fetch latest bridge health (bqi/status) from API for a specific bridge
  const calculateBridgeBQI = async (bridgeId) => {
    try {
      const data = await api.getBridge(bridgeId)
      const bqi = data?.bqi ?? null
      const status = data?.status ?? null

      // Update bridge in state
      setBridges(prev => prev.map(bridge => bridge.id === bridgeId ? { ...bridge, ...(data || {}) } : bridge))

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('bqi-health-updated', {
        detail: { bridgeId, bqi, status }
      }))

      return { bqi, status }
    } catch (error) {
      console.error(`Error fetching bridge health for ${bridgeId}:`, error)
      return null
    }
  }

  // Add a new bridge
  const addBridge = async (b) => {
    try {
      // New bridges start with default BQI
      const payload = { 
        name: b.name, 
        latitude: parseFloat(b.latitude ?? b.lat ?? b.latitude), 
        longitude: parseFloat(b.longitude ?? b.lng ?? b.longitude)
      }
      
      let result
      if (!apiConnected) {
        // Create local bridge if API is not connected
        result = {
          id: `BRIDGE-${String(Date.now()).slice(-6)}`,
          ...payload,
          updatedAt: new Date().toISOString()
        }
        setBridges(prev => [result, ...prev])
      } else {
        result = await api.addBridge(payload)
        // Reload bridges to get the new one with ID (API should include bqi/status)
        const data = await api.getBridges()
        if (Array.isArray(data)) setBridges(data)
      }
      
      // No local BQI calculation — backend manages health data. Keep bridgeHealth minimal.
      const newHealth = { ...bridgeHealth }
      setBridgeHealth(newHealth)
      
      // Trigger updates
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
      
      return result
    } catch (e) {
      console.error('Failed to add bridge', e)
      // Fallback: optimistic local add with BQI 100
      const fallback = { 
        id: b.id || (`BRIDGE-${String(Date.now()).slice(-6)}`), 
        name: b.name, 
        latitude: parseFloat(b.lat || b.latitude), 
        longitude: parseFloat(b.lng || b.longitude), 
        status: 'EXCELLENT',
        bqi: 100,
        updatedAt: new Date().toISOString()
      }
      setBridges((s) => [fallback, ...s])
      
      // Also save health data
      const healthData = {
        bqi: 100,
        status: 'EXCELLENT',
        updatedAt: new Date().toISOString(),
        hasSensorData: false
      }
      const newHealth = { ...bridgeHealth, [fallback.id]: healthData }
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
      // Trigger updates
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
      
      return fallback
    }
  }

  // Update a bridge
  const updateBridge = async (id, updates) => {
    // Do not calculate BQI locally anymore. Send only the fields that changed
    const payload = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.latitude !== undefined || updates.lat !== undefined) payload.latitude = parseFloat(updates.latitude ?? updates.lat)
    if (updates.longitude !== undefined || updates.lng !== undefined) payload.longitude = parseFloat(updates.longitude ?? updates.lng)
    if (updates.description !== undefined) payload.description = updates.description

    try {
      if (!apiConnected) {
        // Local update: merge changes but do not (re)calculate BQI locally
        const mapped = { updatedAt: new Date().toISOString() }
        if (payload.name !== undefined) mapped.name = payload.name
        if (payload.latitude !== undefined) mapped.latitude = payload.latitude
        if (payload.longitude !== undefined) mapped.longitude = payload.longitude

        setBridges((s) => s.map(b => b.id === id ? { ...b, ...mapped } : b))

        window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
        return { id, ...mapped }
      } else {
        await api.updateBridge(id, payload)

        // Reload bridges from API (API should include bqi/status)
        const data = await api.getBridges()
        if (Array.isArray(data)) setBridges(data)

        window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
        return
      }
    } catch (e) {
      console.error('Failed to update bridge', e)
      
      // Fallback local update
      const mapped = { 
        name: finalUpdates.name, 
        latitude: parseFloat(finalUpdates.latitude ?? finalUpdates.lat), 
        longitude: parseFloat(finalUpdates.longitude ?? finalUpdates.lng), 
        status: finalUpdates.status || 'EXCELLENT',
        bqi: finalUpdates.bqi || calculateDefaultBQI(id),
        updatedAt: new Date().toISOString()
      }
      
      setBridges((s) => s.map(b => b.id === id ? { ...b, ...mapped } : b))
      
      // Also update health data
      if (shouldRecalcBQI || finalUpdates.bqi) {
        const healthData = {
          bqi: finalUpdates.bqi || mapped.bqi,
          status: finalUpdates.status || mapped.status,
          updatedAt: new Date().toISOString(),
          hasSensorData: true
        }
        const newHealth = { ...bridgeHealth, [id]: healthData }
        setBridgeHealth(newHealth)
        localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
        
        // Trigger UI updates
        window.dispatchEvent(new CustomEvent('bqi-health-updated', {
          detail: { bridgeId: id, bqi: healthData.bqi, status: healthData.status }
        }))
      }
      
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
    }
  }

  // Delete a bridge
  const deleteBridge = async (id) => {
    try {
      if (apiConnected) {
        await api.deleteBridge(id)
      }
      
      setBridges((s) => s.filter(b => b.id !== id))
      
      // Also remove health data
      const newHealth = { ...bridgeHealth }
      delete newHealth[id]
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
      
      return
    } catch (e) {
      console.error('Failed to delete bridge', e)
      setBridges((s) => s.filter(b => b.id !== id))
      
      // Also remove health data locally
      const newHealth = { ...bridgeHealth }
      delete newHealth[id]
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
      window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
    }
  }

  // Manually update BQI (for admin/testing)
  const updateBridgeBQI = async (bridgeId, bqi) => {
    // Simple status mapping from numeric BQI (used only for manual overrides)
    const statusFromBqi = (val) => {
      if (val >= 80) return 'EXCELLENT'
      if (val >= 60) return 'GOOD'
      if (val >= 40) return 'FAIR'
      if (val >= 20) return 'POOR'
      return 'CRITICAL'
    }

    const status = statusFromBqi(bqi)

    // Update local state (optimistic)
    setBridges(prev => prev.map(bridge => 
      bridge.id === bridgeId 
        ? { ...bridge, bqi, status, updatedAt: new Date().toISOString() }
        : bridge
    ))

    // Update health data
    const healthData = {
      bqi,
      status,
      updatedAt: new Date().toISOString(),
      hasSensorData: false,
      manualUpdate: true
    }

    const newHealth = { ...bridgeHealth, [bridgeId]: healthData }
    setBridgeHealth(newHealth)
    localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))

    // Try to update on server (server side will accept manual override if supported)
    if (apiConnected) {
      try {
        await api.updateBridge(bridgeId, { bqi, status })
      } catch (error) {
        console.warn('Could not update BQI on server:', error)
      }
    }

    // Trigger UI updates
    window.dispatchEvent(new CustomEvent('bqi-health-updated', {
      detail: { bridgeId, bqi, status }
    }))

    window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))

    return healthData
  }

  // Refresh all bridges and recalculate BQI
  const refreshBridges = async () => {
    try {
      setIsLoading(true)
      let data = []
      
      if (apiConnected) {
        data = await api.getBridges()
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        data = getFallbackBridges()
      }
      
      if (data && data.length > 0) {
        // Fetch latest health for all bridges from API (do not calculate locally)
        const enhancedBridges = await Promise.all(
          data.map(async (bridge) => {
            const health = await calculateBridgeBQI(bridge.id)
            return {
              ...bridge,
              bqi: health?.bqi ?? bridge.bqi,
              status: health?.status ?? bridge.status,
              updatedAt: health?.updatedAt ?? bridge.updatedAt
            }
          })
        )

        setBridges(enhancedBridges)
      }
    } catch (error) {
      console.error('Error refreshing bridges:', error)
      // Use fallback on error
      const fallbackBridges = getFallbackBridges()
      setBridges(fallbackBridges)
    } finally {
      setIsLoading(false)
    }
  }

  // Get bridge by ID
  const getBridgeById = (id) => {
    return bridges.find(b => b.id === id)
  }

  // Context value
  const contextValue = {
    bridges,
    addBridge,
    updateBridge,
    deleteBridge,
    user,
    setUser,
    bridgeHealth,
    calculateBridgeBQI,
    updateBridgeBQI,
    refreshBridges,
    isLoading,
    getBridgeById,
    apiConnected
  }

  return (
    <BridgesContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          
          {/* API Connection Status Banner */}
          {!apiConnected && (
            <div style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '8px 16px',
              textAlign: 'center',
              fontSize: '14px',
              borderBottom: '1px solid #FBBF24',
              zIndex: 9999,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>Using offline mode. Some data may be simulated.</span>
            </div>
          )}
          
          <main className="container">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/maps" element={<MapsPage />} />
              <Route path="/reports" element={<ReportsNew />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={(user?.role || '').toString().toLowerCase() === 'admin' ? <Admin /> : <Navigate to="/login" />} />
              <Route path="/admin/reports" element={(user?.role || '').toString().toLowerCase() === 'admin' ? <AdminReports /> : <Navigate to="/login" />} />
              <Route path="/admin/users" element={(user?.role || '').toString().toLowerCase() === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} />
              <Route path="/admin/bridges" element={(user?.role || '').toString().toLowerCase() === 'admin' ? <AdminBridgeManagement /> : <Navigate to="/login" />} />
              <Route path="/admin/health-logs" element={(user?.role || '').toString().toLowerCase() === 'admin' ? <HealthLogs /> : <Navigate to="/login" />} />
              <Route path="/user/*" element={<UserLayout /> }>
                <Route index element={<UserDashboard />} />
                <Route path="reports" element={<UserReports />} />
                <Route path="tips" element={<SafetyTips />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </BridgesContext.Provider>
  )
}

export default App