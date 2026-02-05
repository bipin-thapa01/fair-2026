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

// Import BQI utilities
import { calculateBQIFromSensors, getStatusFromBQI } from './lib/bqiCalculator'

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

  // Helper function for default BQI calculation
  const calculateDefaultBQI = (bridgeId) => {
    // Generate consistent BQI based on bridge ID
    const hash = bridgeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    // Return BQI between 40-100
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
          // 2. For each bridge, calculate or load health data
          const enhancedBridges = await Promise.all(
            apiBridges.map(async (bridge) => {
              // Check if we have existing health data in localStorage
              const existingHealth = bridgeHealth[bridge.id]
              
              if (existingHealth && existingHealth.bqi !== undefined) {
                // Use existing health data
                return {
                  ...bridge,
                  bqi: existingHealth.bqi,
                  status: existingHealth.status || bridge.status || 'EXCELLENT',
                  updatedAt: existingHealth.updatedAt
                }
              } else {
                // Calculate new health data
                let bqi, status
                
                try {
                  // Try to get sensor data for BQI calculation
                  const sensorLogs = await api.getSensorLogs(bridge.id)
                  
                  if (sensorLogs && sensorLogs.length > 0) {
                    // Calculate BQI from latest sensor data
                    const latestLog = sensorLogs.sort((a, b) => 
                      new Date(b.createdAt) - new Date(a.createdAt)
                    )[0]
                    
                    bqi = calculateBQIFromSensors({
                      strainMicrostrain: latestLog.strainMicrostrain || 0,
                      vibrationMs2: latestLog.vibrationMs2 || 0,
                      temperatureC: latestLog.temperatureC || 20
                    })
                    status = getStatusFromBQI(bqi)
                  } else {
                    // No sensor data - use default or calculate based on bridge ID
                    bqi = calculateDefaultBQI(bridge.id)
                    status = getStatusFromBQI(bqi)
                  }
                } catch (sensorError) {
                  console.warn(`No sensor data for bridge ${bridge.id}:`, sensorError.message)
                  bqi = calculateDefaultBQI(bridge.id)
                  status = getStatusFromBQI(bqi)
                }
                
                // Save health data locally
                const healthData = {
                  bqi,
                  status,
                  updatedAt: new Date().toISOString(),
                  hasSensorData: false
                }
                
                // Update local storage
                const newHealth = { ...bridgeHealth, [bridge.id]: healthData }
                setBridgeHealth(newHealth)
                localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
                
                return {
                  ...bridge,
                  bqi,
                  status,
                  updatedAt: healthData.updatedAt
                }
              }
            })
          )
          
          setBridges(enhancedBridges)
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
  const calculateBridgeBQI = async (bridgeId) => {
    try {
      // Try to get sensor data
      const sensorLogs = await api.getSensorLogs(bridgeId)
      
      let bqi, status
      
      if (sensorLogs && sensorLogs.length > 0) {
        // Calculate BQI from latest sensor data
        const latestLog = sensorLogs.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
        
        bqi = calculateBQIFromSensors({
          strainMicrostrain: latestLog.strainMicrostrain || 0,
          vibrationMs2: latestLog.vibrationMs2 || 0,
          temperatureC: latestLog.temperatureC || 20
        })
        status = getStatusFromBQI(bqi)
      } else {
        // No sensor data - check existing or use default
        const existingHealth = bridgeHealth[bridgeId]
        if (existingHealth && existingHealth.bqi) {
          bqi = existingHealth.bqi
          status = existingHealth.status
        } else {
          bqi = calculateDefaultBQI(bridgeId)
          status = getStatusFromBQI(bqi)
        }
      }
      
      // Update health data
      const healthData = {
        bqi,
        status,
        updatedAt: new Date().toISOString(),
        hasSensorData: !!(sensorLogs && sensorLogs.length > 0)
      }
      
      const newHealth = { ...bridgeHealth, [bridgeId]: healthData }
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
      // Update bridge in state
      setBridges(prev => prev.map(bridge => 
        bridge.id === bridgeId 
          ? { ...bridge, bqi, status, updatedAt: healthData.updatedAt }
          : bridge
      ))
      
      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('bqi-health-updated', {
        detail: { bridgeId, bqi, status }
      }))
      
      return healthData
    } catch (error) {
      console.error(`Error calculating BQI for bridge ${bridgeId}:`, error)
      
      // Fallback to default BQI
      const bqi = calculateDefaultBQI(bridgeId)
      const status = getStatusFromBQI(bqi)
      const healthData = {
        bqi,
        status,
        updatedAt: new Date().toISOString(),
        hasSensorData: false,
        error: true
      }
      
      const newHealth = { ...bridgeHealth, [bridgeId]: healthData }
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
      setBridges(prev => prev.map(bridge => 
        bridge.id === bridgeId 
          ? { ...bridge, bqi, status, updatedAt: healthData.updatedAt }
          : bridge
      ))
      
      return healthData
    }
  }

  // Add a new bridge
  const addBridge = async (b) => {
    try {
      // New bridges start with default BQI
      const bqi = 100 // Start with perfect score
      const status = 'EXCELLENT'
      
      const payload = { 
        name: b.name, 
        latitude: parseFloat(b.latitude ?? b.lat ?? b.latitude), 
        longitude: parseFloat(b.longitude ?? b.lng ?? b.longitude),
        bqi: bqi,
        status: status
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
        // Reload bridges to get the new one with ID
        const data = await api.getBridges()
        if (Array.isArray(data)) {
          const enhancedData = data.map(bridge => {
            if (!bridge.bqi) {
              return { ...bridge, bqi: calculateDefaultBQI(bridge.id), status: getStatusFromBQI(calculateDefaultBQI(bridge.id)) }
            }
            return bridge
          })
          setBridges(enhancedData)
        }
      }
      
      // Save health data
      const healthData = {
        bqi,
        status,
        updatedAt: new Date().toISOString(),
        hasSensorData: false
      }
      const newHealth = { ...bridgeHealth, [result.id]: healthData }
      setBridgeHealth(newHealth)
      localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
      
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
    // Check if BQI needs recalculation
    const shouldRecalcBQI = updates.strainMicrostrain !== undefined || 
                           updates.vibrationMs2 !== undefined ||
                           updates.temperatureC !== undefined
    
    let finalUpdates = updates
    
    if (shouldRecalcBQI) {
      // Recalculate BQI
      const bqi = calculateBQIFromSensors({
        strainMicrostrain: updates.strainMicrostrain || 0,
        vibrationMs2: updates.vibrationMs2 || 0,
        temperatureC: updates.temperatureC || 20
      })
      const status = getStatusFromBQI(bqi)
      
      finalUpdates = {
        ...updates,
        bqi,
        status
      }
    }
    
    // Map frontend keys to backend parameter names
    const payload = {
      name: finalUpdates.name,
      latitude: parseFloat(finalUpdates.latitude ?? finalUpdates.lat),
      longitude: parseFloat(finalUpdates.longitude ?? finalUpdates.lng),
      status: finalUpdates.status,
      bqi: finalUpdates.bqi,
      description: finalUpdates.description
    }

    try {
      if (!apiConnected) {
        // Local update
        const mapped = { 
          name: finalUpdates.name, 
          latitude: parseFloat(finalUpdates.latitude ?? finalUpdates.lat), 
          longitude: parseFloat(finalUpdates.longitude ?? finalUpdates.lng), 
          status: finalUpdates.status || 'EXCELLENT',
          bqi: finalUpdates.bqi || calculateDefaultBQI(id),
          updatedAt: new Date().toISOString()
        }
        
        setBridges((s) => s.map(b => b.id === id ? { ...b, ...mapped } : b))
        
        // Update health data
        const healthData = {
          bqi: mapped.bqi,
          status: mapped.status,
          updatedAt: mapped.updatedAt,
          hasSensorData: shouldRecalcBQI
        }
        const newHealth = { ...bridgeHealth, [id]: healthData }
        setBridgeHealth(newHealth)
        localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
        
        // Trigger UI updates
        window.dispatchEvent(new CustomEvent('bqi-health-updated', {
          detail: { bridgeId: id, bqi: healthData.bqi, status: healthData.status }
        }))
        
        window.dispatchEvent(new CustomEvent('bqi-bridges-updated'))
        
        return { id, ...mapped }
      } else {
        await api.updateBridge(id, payload)
        
        // Reload bridges
        const data = await api.getBridges()
        if (Array.isArray(data)) {
          // Enhance with BQI if missing
          const enhancedData = data.map(bridge => {
            if (!bridge.bqi) {
              // Check if we have health data for this bridge
              const health = bridgeHealth[bridge.id]
              return health 
                ? { ...bridge, bqi: health.bqi, status: health.status }
                : { ...bridge, bqi: calculateDefaultBQI(bridge.id), status: getStatusFromBQI(calculateDefaultBQI(bridge.id)) }
            }
            return bridge
          })
          setBridges(enhancedData)
        }
        
        // Update health data if BQI was recalculated
        if (shouldRecalcBQI) {
          const healthData = {
            bqi: finalUpdates.bqi,
            status: finalUpdates.status,
            updatedAt: new Date().toISOString(),
            hasSensorData: true
          }
          const newHealth = { ...bridgeHealth, [id]: healthData }
          setBridgeHealth(newHealth)
          localStorage.setItem('bqi_health_data', JSON.stringify(newHealth))
          
          // Trigger UI updates
          window.dispatchEvent(new CustomEvent('bqi-health-updated', {
            detail: { bridgeId: id, bqi: finalUpdates.bqi, status: finalUpdates.status }
          }))
        }
        
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
    const status = getStatusFromBQI(bqi)
    
    // Update local state
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
    
    // Try to update on server
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
        // Recalculate BQI for all bridges
        const enhancedBridges = await Promise.all(
          data.map(async (bridge) => {
            const health = await calculateBridgeBQI(bridge.id)
            return {
              ...bridge,
              bqi: health?.bqi || calculateDefaultBQI(bridge.id),
              status: health?.status || getStatusFromBQI(calculateDefaultBQI(bridge.id)),
              updatedAt: health?.updatedAt || new Date().toISOString()
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