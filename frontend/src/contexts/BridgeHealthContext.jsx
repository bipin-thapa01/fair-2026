import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../lib/api';
// import { calculateBQIFromSensors, getStatusFromBQI } from '../lib/bqiCalculator';

export const BridgeHealthContext = createContext();

export function BridgeHealthProvider({ children }) {
  const [bridgeHealth, setBridgeHealth] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Load health data from localStorage on init
  useEffect(() => {
    const savedHealth = localStorage.getItem('bqi_health_data');
    if (savedHealth) {
      try {
        setBridgeHealth(JSON.parse(savedHealth));
      } catch (e) {
        console.error('Error loading saved health data:', e);
      }
    }
  }, []);

  // Save health data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bqi_health_data', JSON.stringify(bridgeHealth));
  }, [bridgeHealth]);

  /**
   * Calculate and update BQI for a single bridge
   */
  const calculateBridgeHealth = useCallback(async (bridgeId, forceRecalc = false) => {
    if (isCalculating) return;

    const existingHealth = bridgeHealth[bridgeId]
    if (existingHealth && !forceRecalc) {
      const lastUpdated = new Date(existingHealth.updatedAt)
      const now = new Date()
      const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60)
      if (hoursSinceUpdate < 1) return existingHealth
    }

    setIsCalculating(true)
    try {
      const data = await api.getBridge(bridgeId)
      const bqi = data?.bqi ?? (existingHealth && existingHealth.bqi) ?? 100
      const status = data?.status ?? (existingHealth && existingHealth.status) ?? 'EXCELLENT'

      const healthData = { bqi, status, updatedAt: new Date().toISOString(), hasSensorData: false }

      setBridgeHealth(prev => ({ ...prev, [bridgeId]: healthData }))

      return healthData
    } catch (error) {
      console.error(`Error fetching health for ${bridgeId}:`, error)
      return existingHealth || { bqi: 100, status: 'EXCELLENT', updatedAt: new Date().toISOString(), hasSensorData: false, error: true }
    } finally {
      setIsCalculating(false)
    }
  }, [bridgeHealth, isCalculating]);

  /**
   * Calculate health for all bridges
   */
  const calculateAllBridgesHealth = useCallback(async (bridgeIds) => {
    setIsCalculating(true);
    
    try {
      const promises = bridgeIds.map(bridgeId => calculateBridgeHealth(bridgeId));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error calculating all bridges health:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [calculateBridgeHealth]);

  /**
   * Get health data for a bridge
   */
  const getBridgeHealth = useCallback((bridgeId) => {
    return bridgeHealth[bridgeId] || {
      bqi: 100,
      status: 'EXCELLENT',
      updatedAt: new Date().toISOString(),
      hasSensorData: false,
      isDefault: true
    };
  }, [bridgeHealth]);

  /**
   * Update BQI manually (for testing/admin)
   */
  const updateBridgeHealthManually = useCallback((bridgeId, bqi) => {
    const statusFromBqi = (val) => {
      if (val >= 80) return 'EXCELLENT'
      if (val >= 60) return 'GOOD'
      if (val >= 40) return 'FAIR'
      if (val >= 20) return 'POOR'
      return 'CRITICAL'
    }

    const status = statusFromBqi(bqi)
    const healthData = { bqi, status, updatedAt: new Date().toISOString(), manualUpdate: true }

    setBridgeHealth(prev => ({ ...prev, [bridgeId]: healthData }))

    // Try to update server via general update endpoint
    api.updateBridge(bridgeId, { bqi, status }).catch(console.error)

    return healthData
  }, []);

  return (
    <BridgeHealthContext.Provider value={{
      bridgeHealth,
      isCalculating,
      calculateBridgeHealth,
      calculateAllBridgesHealth,
      getBridgeHealth,
      updateBridgeHealthManually,
      refreshAll: () => {
        const bridgeIds = Object.keys(bridgeHealth);
        if (bridgeIds.length > 0) {
          calculateAllBridgesHealth(bridgeIds);
        }
      }
    }}>
      {children}
    </BridgeHealthContext.Provider>
  );
}