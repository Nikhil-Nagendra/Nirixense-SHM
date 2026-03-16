<<<<<<< HEAD
import React from 'react'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="app-container">
      <Dashboard />
    </div>
  )
}

export default App
=======
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './components/Dashboard';
import NodesList from './pages/NodesList';
import Analytics from './pages/Analytics';
import Clients from './pages/Clients';
import Alerts from './pages/Alerts';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="nodes" element={<NodesList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="clients" element={<Clients />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
>>>>>>> bc8a547 (latest changes)
