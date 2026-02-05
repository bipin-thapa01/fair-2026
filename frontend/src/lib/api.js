const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`
  
  try {
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers
      }
    })
    
    // First, get the response as text to see what we got
    const text = await res.text()
    
    // Check if response is HTML (starts with <!DOCTYPE or <html)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error(`API returned HTML instead of JSON for ${path}:`, text.substring(0, 200))
      
      // Check for common HTML responses
      if (text.includes('404') || text.includes('Not Found')) {
        throw new Error(`Endpoint not found: ${path}`)
      } else if (text.includes('login') || text.includes('sign in')) {
        throw new Error('Authentication required. Please login.')
      } else if (text.includes('500') || text.includes('Internal Server Error')) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(`Server returned HTML instead of JSON. Check endpoint: ${path}`)
      }
    }
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text)
      
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      
      return data
    } catch (jsonError) {
      console.error(`Failed to parse JSON from ${path}:`, jsonError, 'Text:', text.substring(0, 200))
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText} - Response: ${text.substring(0, 100)}`)
      }
      
      // If response is empty but successful (like DELETE)
      if (res.status === 204 || res.status === 205) {
        return null
      }
      
      throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`)
    }
    
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server. Make sure the backend is running.')
    }
    
    throw error
  }
}

// Bridge endpoints - Get bridges with BQI and status from API
export async function getBridges() {
  try {
    // Get bridges directly from API - it already includes BQI and status
    const bridges = await request('/api/bridge')
    
    // Ensure BQI and status are present (fallback if API doesn't provide)
    return bridges.map(bridge => ({
      ...bridge,
      bqi: bridge.bqi !== undefined ? bridge.bqi : null,
      status: bridge.status || 'UNKNOWN'
    }))
  } catch (error) {
    console.warn('Using fallback bridge data due to API error:', error.message)
    
    // Fallback data for development WITH BQI
    const fallbackBridges = [
      {
        id: 'BRIDGE-001',
        name: 'Karnali Bridge',
        status: 'EXCELLENT',
        latitude: 28.6412172,
        longitude: 81.283269,
        bqi: 81
      },
      {
        id: 'BRIDGE-002',
        name: 'Bagmati Bridge',
        status: 'GOOD',
        latitude: 27.7172,
        longitude: 85.3240,
        bqi: 72
      },
      {
        id: 'BRIDGE-003',
        name: 'Kaligandaki Bridge',
        status: 'FAIR',
        latitude: 27.9833,
        longitude: 83.7667,
        bqi: 65
      }
    ]
    
    // Check if error is "Endpoint not found" - might mean API structure is different
    if (error.message.includes('Endpoint not found') || error.message.includes('404')) {
      console.warn('API endpoint /api/bridge not found. Using fallback data for development.')
      return fallbackBridges
    }
    
    // For other errors, try alternative endpoint
    try {
      console.warn('Trying alternative endpoint /bridges...')
      return await request('/bridges')
    } catch (secondError) {
      console.warn('Both API endpoints failed. Using fallback data:', secondError.message)
      return fallbackBridges
    }
  }
}

// Get single bridge - returns with BQI from API
export async function getBridge(id) {
  try {
    const bridge = await request(`/api/bridge/${id}`)
    // Ensure BQI and status are included
    return {
      ...bridge,
      bqi: bridge.bqi !== undefined ? bridge.bqi : null,
      status: bridge.status || 'UNKNOWN'
    }
  } catch (error) {
    console.error(`Error fetching bridge ${id}:`, error.message)
    throw error
  }
}

export async function addBridge(payload) {
  try {
    return await request('/api/bridge/addNew', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Error adding bridge:', error.message)
    throw error
  }
}

export async function updateBridge(id, payload) {
  try {
    // Try PUT first
    return await request(`/api/bridge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    // If PUT fails, try PATCH
    if (error.message.includes('405') || error.message.includes('Method not allowed')) {
      console.warn('PUT not supported, trying PATCH...')
      return await request(`/api/bridge/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })
    }
    throw error
  }
}

export async function deleteBridge(id) {
  try {
    return await request(`/api/bridge/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error(`Error deleting bridge ${id}:`, error.message)
    
    // If DELETE is not supported, we might not be able to delete via API
    if (error.message.includes('405') || error.message.includes('Method not allowed')) {
      throw new Error('Delete operation not supported by backend API')
    }
    
    throw error
  }
}

// Get latest BQI and status for a bridge (from the bridge data itself)
export async function getLatestHealthLog(bridgeId) {
  try {
    // Since BQI and status are now part of bridge data, get the bridge
    const bridge = await getBridge(bridgeId)
    
    if (bridge) {
      return {
        id: `health-${bridgeId}-${Date.now()}`,
        bridgeId: bridgeId,
        healthIndex: bridge.bqi || 0,
        healthState: bridge.status || 'UNKNOWN',
        recommendedAction: getRecommendation(bridge.status),
        createdAt: new Date().toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching health log for ${bridgeId}:`, error.message)
    return null
  }
}

// Helper function to get recommendation based on status
function getRecommendation(status) {
  const statusStr = (status || '').toString().toUpperCase()
  switch(statusStr) {
    case 'EXCELLENT': return 'Normal operation'
    case 'GOOD': return 'Monitor closely'
    case 'FAIR': return 'Schedule inspection'
    case 'POOR': return 'Immediate inspection required'
    case 'CRITICAL': return 'Emergency maintenance needed'
    default: return 'Status unknown'
  }
}

// --- Auth and User endpoints ---
export async function authSignup(payload) {
  try {
    return await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Error in authSignup:', error.message)
    throw error
  }
}

export async function authLogin(payload) {
  try {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Error in authLogin:', error.message)
    throw error
  }
}

export async function getUsers() {
  try {
    return await request('/api/user')
  } catch (error) {
    console.error('Error fetching users:', error.message)
    throw error
  }
}

export async function getUser(id) {
  try {
    return await request(`/api/user/${id}`)
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.message)
    throw error
  }
}

// Sensor logs - optional if needed
export async function getSensorLogs(bridgeId) {
  try {
    // Try to get ALL sensor logs and filter by bridgeId
    const allLogs = await request('/api/bridgeHealth/sensorLog');
    
    if (allLogs && Array.isArray(allLogs)) {
      // Filter logs by bridgeId
      return allLogs.filter(log => log.bridgeId === bridgeId);
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching sensor logs for ${bridgeId}:`, error.message);
    return [];
  }
}

// ML logs - optional if needed
export async function getMLLogs() {
  try {
    return await request('/api/bridgeHealth/mlLog');
  } catch (error) {
    console.error('Error fetching ML logs:', error.message);
    return [];
  }
}

// Update bridge BQI - if your API supports updating BQI
export async function updateBridgeBQI(bridgeId, bqi, status) {
  try {
    return await request(`/api/bridge/${bridgeId}/health`, {
      method: 'PATCH',
      body: JSON.stringify({ bqi, status })
    });
  } catch (error) {
    console.error(`Error updating BQI for ${bridgeId}:`, error.message);
    
    // If endpoint doesn't exist, we'll handle it in the frontend
    if (error.message.includes('404')) {
      console.warn('BQI update endpoint not available');
      return { success: false, message: 'BQI update endpoint not available' };
    }
    
    throw error;
  }
}

// Export all functions
const api = {
  // Bridge endpoints
  getBridges,
  getBridge,
  addBridge,
  updateBridge,
  deleteBridge,
  
  // Health endpoints
  getLatestHealthLog,
  getSensorLogs,
  getMLLogs,
  updateBridgeBQI,
  
  // Auth endpoints
  authSignup,
  authLogin,
  
  // User endpoints
  getUsers,
  getUser
}

export default api