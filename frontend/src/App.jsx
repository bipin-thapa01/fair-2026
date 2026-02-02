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
import UserReports from './pages/user/Reports'
import SafetyTips from './pages/user/SafetyTips'
import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/Dashboard'
import sampleBridges from './data/sampleBridges'
import mockApi from './lib/mockApi'
import Footer from './components/Footer'


function App() {
  const [bridges, setBridges] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    // load bridges via mock API (localStorage-backed)
    mockApi.fetchBridges().then(data => { if (mounted) setBridges(data) })
    const u = localStorage.getItem('bqi_user')
    if (u) setUser(JSON.parse(u))
    return ()=>{ mounted = false }
  }, [])

  // keep storage synced via mockApi on change; operations use api helpers
  const addBridge = async (b) => {
    const created = await mockApi.createBridge(b)
    setBridges((s) => [created, ...s])
  }
  const updateBridge = async (id, updates) => {
    const updated = await mockApi.updateBridge(id, updates)
    setBridges((s) => s.map(b => b.id === id ? {...b, ...updated} : b))
  }
  const deleteBridge = async (id) => {
    await mockApi.deleteBridge(id)
    setBridges((s) => s.filter(b => b.id !== id))
  }

  return (
    <BridgesContext.Provider value={{bridges, addBridge, updateBridge, deleteBridge, user, setUser}}>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/maps" element={<MapsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
              <Route path="/admin/reports" element={user?.role === 'admin' ? <AdminReports /> : <Navigate to="/login" />} />
              <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} />
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
