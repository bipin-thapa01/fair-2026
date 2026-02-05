import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../lib/api';
import { BridgeHealthContext } from './BridgeHealthContext';

export const BridgesContext = createContext();

export function BridgesProvider({ children }) {
  const [bridges, setBridges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  
  const { calculateAllBridgesHealth, getBridgeHealth } = useContext(BridgeHealthContext);

  const fetchBridges = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setApiStatus('checking');
      
      const data = await api.getBridges();
      
      // Check if we got fallback data
      if (data && data.some(bridge => bridge.id?.startsWith?.('BRIDGE-00'))) {
        setApiStatus('fallback');
        console.warn('Using fallback bridge data. API may not be available.');
      } else {
        setApiStatus('connected');
      }
      
      // Enhance bridge data with BQI from health context
      const enhancedBridges = data.map(bridge => {
        const health = getBridgeHealth(bridge.id);
        return {
          ...bridge,
          bqi: health.bqi,
          status: health.status || bridge.status
        };
      });
      
      setBridges(enhancedBridges);
      
      // Calculate health for all bridges
      if (data.length > 0) {
        const bridgeIds = data.map(b => b.id);
        calculateAllBridgesHealth(bridgeIds);
      }
      
    } catch (error) {
      console.error('Error fetching bridges:', error);
      setError(error.message);
      setApiStatus('error');
      setBridges([]);
    } finally {
      setIsLoading(false);
    }
  }, [getBridgeHealth, calculateAllBridgesHealth]);

  useEffect(() => {
    fetchBridges();
    
    const handleBridgesUpdated = () => {
      fetchBridges();
    };

    window.addEventListener('bqi-bridges-updated', handleBridgesUpdated);
    return () => {
      window.removeEventListener('bqi-bridges-updated', handleBridgesUpdated);
    };
  }, [fetchBridges]);

  // Listen for health updates to refresh bridge status
  useEffect(() => {
    const handleHealthUpdated = (event) => {
      const { bridgeId } = event.detail || {};
      if (bridgeId) {
        // Update the specific bridge's status
        setBridges(prev => prev.map(bridge => {
          if (bridge.id === bridgeId) {
            const health = getBridgeHealth(bridgeId);
            return {
              ...bridge,
              bqi: health.bqi,
              status: health.status
            };
          }
          return bridge;
        }));
      }
    };

    window.addEventListener('bqi-health-updated', handleHealthUpdated);
    return () => {
      window.removeEventListener('bqi-health-updated', handleHealthUpdated);
    };
  }, [getBridgeHealth]);

  const addBridge = async (payload) => {
    try {
      // POST only name, latitude, longitude — backend manages bqi/status
      let result;
      if (apiStatus === 'fallback') {
        // Create a local fallback bridge object
        result = {
          id: `BRIDGE-${String(Date.now()).slice(-6)}`,
          ...payload,
          bqi: 100,
          status: 'EXCELLENT'
        };
      } else {
        result = await api.addBridge(payload);
      }
      
      await fetchBridges();
      return result;
    } catch (error) {
      console.error('Error adding bridge:', error);
      throw error;
    }
  };

  const updateBridge = async (id, payload) => {
    try {
      let result;
      if (apiStatus === 'fallback') {
        setBridges(prev => 
          prev.map(bridge => 
            bridge.id === id 
              ? { ...bridge, ...payload }
              : bridge
          )
        );
        result = { id, ...payload };
      } else {
        result = await api.updateBridge(id, payload);
      }
      
      await fetchBridges();
      return result;
    } catch (error) {
      console.error('Error updating bridge:', error);
      throw error;
    }
  };

  const deleteBridge = async (id) => {
    try {
      if (apiStatus === 'fallback') {
        setBridges(prev => prev.filter(bridge => bridge.id !== id));
      } else {
        await api.deleteBridge(id);
      }
      
      await fetchBridges();
      return true;
    } catch (error) {
      console.error('Error deleting bridge:', error);
      throw error;
    }
  };

  const refreshBridges = fetchBridges;

  const value = {
    bridges,
    isLoading,
    error,
    apiStatus,
    refreshBridges,
    addBridge,
    updateBridge,
    deleteBridge,
    getBridgeById: (id) => bridges.find(bridge => bridge.id === id),
    updateBridgeHealth: (bridgeId, bqi, status) => {
      setBridges(prev => prev.map(bridge => 
        bridge.id === bridgeId 
          ? { ...bridge, bqi, status }
          : bridge
      ));
    }
  };

  return (
    <BridgesContext.Provider value={value}>
      {/* Show API status banner if not connected */}
      {apiStatus === 'fallback' && (
        <div style={{
          background: '#FEF3C7',
          color: '#92400E',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px',
          borderBottom: '1px solid #FBBF24',
          zIndex: 9999,
          position: 'relative'
        }}>
          ⚠️ Using offline mode. API connection failed. Some features may be limited.
        </div>
      )}
      
      {apiStatus === 'error' && (
        <div style={{
          background: '#FEE2E2',
          color: '#991B1B',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px',
          borderBottom: '1px solid #F87171',
          zIndex: 9999,
          position: 'relative'
        }}>
          ❌ Cannot connect to server. Make sure backend is running at http://localhost:8080
        </div>
      )}
      
      {children}
    </BridgesContext.Provider>
  );
}