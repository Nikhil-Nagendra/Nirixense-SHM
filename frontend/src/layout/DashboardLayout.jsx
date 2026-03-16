import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="layout-root">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`layout-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
