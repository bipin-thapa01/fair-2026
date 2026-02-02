import sampleBridges from '../data/sampleBridges'

const STORAGE_KEY = 'bqi_bridges'

function readStorage(){
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch(e){ return null }
}

function writeStorage(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function ensureSeed(){
  if (!readStorage()) {
    writeStorage(sampleBridges)
  }
}

function delay(ms=200){
  return new Promise(r=>setTimeout(r, ms))
}

export async function fetchBridges(){
  ensureSeed()
  await delay(150)
  return readStorage() || []
}

export async function createBridge(bridge){
  const list = readStorage() || []
  const b = {...bridge}
  list.unshift(b)
  writeStorage(list)
  await delay(100)
  return b
}

export async function updateBridge(id, updates){
  const list = readStorage() || []
  const next = list.map(b => b.id === id ? {...b, ...updates} : b)
  writeStorage(next)
  await delay(100)
  return next.find(b=>b.id===id)
}

export async function deleteBridge(id){
  const list = readStorage() || []
  const next = list.filter(b=>b.id !== id)
  writeStorage(next)
  await delay(80)
  return id
}

export default {
  fetchBridges, createBridge, updateBridge, deleteBridge
}
