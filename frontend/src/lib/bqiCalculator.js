/**
 * BQI Calculator Utility
 * Formula: BQI = 100 × [0.45 × (1 − S_norm) + 0.40 × (1 − V_norm) + 0.15 × (1 − T_norm)]
 */

// Threshold values (should be calibrated per bridge type)
const THRESHOLDS = {
  STRAIN: {
    MIN: 0,      // Microstrain - 0 is perfect
    MAX: 20000,  // Maximum acceptable microstrain
  },
  VIBRATION: {
    MIN: 0,      // m/s² - 0 is perfect
    MAX: 5.0,    // Maximum acceptable vibration
  },
  TEMPERATURE: {
    IDEAL: 20,   // °C - Ideal temperature
    MIN: -10,    // °C - Minimum acceptable
    MAX: 50,     // °C - Maximum acceptable
  },
  HUMIDITY: {
    IDEAL: 50,   // % - Ideal humidity
    MIN: 30,     // % - Minimum acceptable
    MAX: 70,     // % - Maximum acceptable
  }
};

/**
 * Normalize sensor values (0 = good, 1 = bad)
 */
const normalizeValue = (value, min, max) => {
  if (value == null || isNaN(value)) return 0.5; // Default if no data
  
  // Clamp value between min and max
  const clamped = Math.max(min, Math.min(max, value));
  
  // Normalize to 0-1 range
  return (clamped - min) / (max - min);
};

/**
 * Calculate BQI from individual sensor readings
 */
// Update calculateBQIFromSensors to handle missing data
export const calculateBQIFromSensors = (sensorData) => {
  const { strainMicrostrain, vibrationMs2, temperatureC, humidityPercent } = sensorData;
  
  // Default values if data is missing
  const strain = strainMicrostrain !== undefined && strainMicrostrain !== null 
    ? strainMicrostrain 
    : 5000; // Default: moderate strain
  
  const vibration = vibrationMs2 !== undefined && vibrationMs2 !== null 
    ? vibrationMs2 
    : 0.5; // Default: low vibration
  
  const temp = temperatureC !== undefined && temperatureC !== null 
    ? temperatureC 
    : 20; // Default: ideal temperature
  
  // Normalize each parameter (0 = best, 1 = worst)
  const S_norm = normalizeValue(
    strain,
    THRESHOLDS.STRAIN.MIN,
    THRESHOLDS.STRAIN.MAX
  );
  
  const V_norm = normalizeValue(
    vibration,
    THRESHOLDS.VIBRATION.MIN,
    THRESHOLDS.VIBRATION.MAX
  );
  
  // For temperature, calculate deviation from ideal
  const tempDeviation = Math.abs(temp - THRESHOLDS.TEMPERATURE.IDEAL);
  const T_norm = normalizeValue(
    tempDeviation,
    0,
    Math.max(
      THRESHOLDS.TEMPERATURE.IDEAL - THRESHOLDS.TEMPERATURE.MIN,
      THRESHOLDS.TEMPERATURE.MAX - THRESHOLDS.TEMPERATURE.IDEAL
    )
  );
  
  // Apply the formula: BQI = 100 × [0.45 × (1 − S_norm) + 0.40 × (1 − V_norm) + 0.15 × (1 − T_norm)]
  const bqi = 100 * (
    0.45 * (1 - S_norm) + 
    0.40 * (1 - V_norm) + 
    0.15 * (1 - T_norm)
  );
  
  // Round and clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(bqi)));
};

/**
 * Determine status from BQI score
 */
export const getStatusFromBQI = (bqi) => {
  if (bqi >= 80) return 'EXCELLENT';
  if (bqi >= 60) return 'GOOD';
  if (bqi >= 40) return 'FAIR';
  if (bqi >= 20) return 'POOR';
  return 'CRITICAL';
};

/**
 * Get color for BQI/status
 */
export const getColorForBQI = (bqi) => {
  if (bqi >= 80) return '#2ecc71';    // Green
  if (bqi >= 60) return '#3498db';    // Blue
  if (bqi >= 40) return '#f1c40f';    // Yellow
  if (bqi >= 20) return '#e67e22';    // Orange
  return '#e74c3c';                   // Red
};

/**
 * Get mock BQI for development/testing
 */
export const getMockBQI = (bridgeId) => {
  // Generate consistent but varied BQI based on bridge ID
  const hash = bridgeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 61) + 40; // Returns 40-100
};