// Normalize sensor values into 0-100 where higher is better
function normalize(value, min, max, invert=false){
  if (value == null) return 50
  const v = (value - min) / (max - min)
  const clipped = Math.max(0, Math.min(1, v))
  return Math.round((invert ? 1 - clipped : clipped) * 100)
}

export function calculateBQI(params){
  // params: {condition(0-100 higher better), age(years), traffic(0-100 higher worse), seismicRisk(0-100 higher worse), floodRisk, strain, vibration, displacement, temperature}
  // We compute normalized sub-scores (0-100), then weighted average
  const cond = params.condition ?? 50
  const ageScore = normalize(params.age ?? 30, 0, 100, true) // younger better -> invert
  const trafficScore = normalize(params.traffic ?? 50, 0, 200, true) // higher traffic worse
  const seismicScore = normalize(params.seismicRisk ?? 50, 0, 100, true)
  const floodScore = normalize(params.floodRisk ?? 30, 0, 100, true)

  // Sensor normalization ranges (domain chosen for demo)
  const strainScore = normalize(params.strain ?? 0.3, 0, 1.5, true) // lower strain better
  const vibrationScore = normalize(params.vibration ?? 2, 0, 10, true)
  const displacementScore = normalize(params.displacement ?? 0.01, 0, 0.1, true)
  const tempScore = normalize(params.temperature ?? 28, -10, 50, true) // extreme temps worse

  // weights: structural condition composite and sensor composite
  const weights = {
    condition: 0.25,
    age: 0.10,
    traffic: 0.10,
    seismic: 0.10,
    flood: 0.05,
    sensors: 0.40
  }

  const sensorComposite = (strainScore * 0.4 + vibrationScore * 0.3 + displacementScore * 0.2 + tempScore * 0.1)

  const raw = (
    cond * weights.condition +
    ageScore * weights.age +
    trafficScore * weights.traffic +
    seismicScore * weights.seismic +
    floodScore * weights.flood +
    sensorComposite * weights.sensors
  )

  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function classification(bqi){
  if (bqi >= 75) return {label:'Safe', color:'#2e7d32'}
  if (bqi >= 50) return {label:'Moderate', color:'#f9a825'}
  return {label:'Critical', color:'#c62828'}
}
