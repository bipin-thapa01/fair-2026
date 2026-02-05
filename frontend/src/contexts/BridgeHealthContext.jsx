import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../lib/api';
import { calculateBQIFromSensors, getStatusFromBQI } from '../lib/bqiCalculator';

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
    // Skip if already calculating or recently calculated (unless forced)
    if (isCalculating) return;
    
    const existingHealth = bridgeHealth[bridgeId];
    if (existingHealth && !forceRecalc) {
      const lastUpdated = new Date(existingHealth.updatedAt);
      const now = new Date();
      const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
      
      // Don't recalc if updated in last hour
      if (hoursSinceUpdate < 1) return existingHealth;
    }

    setIsCalculating(true);
    
    try {
      // Try to get latest sensor data
      const sensorLogs = await api.getSensorLogs(bridgeId);
      
      let bqi, status;
      
      if (sensorLogs && sensorLogs.length > 0) {
        // Get most recent sensor data
        const latestLog = sensorLogs.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        // Calculate BQI from sensor data
        bqi = calculateBQIFromSensors(latestLog);
        status = getStatusFromBQI(bqi);
      } else {
        // No sensor data - use default or existing
        if (existingHealth) {
          bqi = existingHealth.bqi;
          status = existingHealth.status;
        } else {
          // New bridge - start with 100
          bqi = 100;
          status = 'EXCELLENT';
        }
      }
      
      const healthData = {
        bqi,
        status,
        updatedAt: new Date().toISOString(),
        hasSensorData: !!(sensorLogs && sensorLogs.length > 0)
      };
      
      // Update state
      setBridgeHealth(prev => ({
        ...prev,
        [bridgeId]: healthData
      }));
      
      // Try to update on server
      await api.updateBridgeBQI(bridgeId, bqi, status);
      
      return healthData;
      
    } catch (error) {
      console.error(`Error calculating health for ${bridgeId}:`, error);
      
      // Return existing data or default
      return existingHealth || {
        bqi: 100,
        status: 'EXCELLENT',
        updatedAt: new Date().toISOString(),
        hasSensorData: false,
        error: true
      };
    } finally {
      setIsCalculating(false);
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
    const status = getStatusFromBQI(bqi);
    const healthData = {
      bqi,
      status,
      updatedAt: new Date().toISOString(),
      manualUpdate: true
    };
    
    setBridgeHealth(prev => ({
      ...prev,
      [bridgeId]: healthData
    }));
    
    // Try to update server
    api.updateBridgeBQI(bridgeId, bqi, status).catch(console.error);
    
    return healthData;
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