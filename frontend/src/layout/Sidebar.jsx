import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, ChevronLeft, ChevronRight, Layers, Users, ShieldAlert, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H8L16 20H20L4 4Z" fill="var(--brand-red)"/>
            <path d="M4 20H8L20 4H16L4 20Z" fill="var(--text-primary)"/>
          </svg>
        </div>
        {!isCollapsed && (
          <div className="brand-text-container">
            <h1 className="brand-title">NIRIXENSE</h1>
            <span className="brand-subtitle">TECHNOLOGIES</span>
          </div>
        )}
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end title="Control Tower">
          <LayoutDashboard size={18} />
          {!isCollapsed && <span>Control Tower</span>}
        </NavLink>
        <NavLink to="/nodes" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} title="Nodes">
          <Activity size={18} />
          {!isCollapsed && <span>Nodes</span>}
        </NavLink>
        
        <div className="nav-divider"></div>
        <div className="nav-section-title">{!isCollapsed && "Data Center"}</div>
        
        <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} title="Analytics">
          <Layers size={18} />
          {!isCollapsed && <span>Analytics</span>}
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} title="Clients">
          <Users size={18} />
          {!isCollapsed && <span>Clients</span>}
        </NavLink>
        <NavLink to="/alerts" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} title="Alerts">
          <ShieldAlert size={18} />
          {!isCollapsed && <span>Alerts</span>}
        </NavLink>

        <div className="nav-divider"></div>

        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} title="Settings">
          <Settings size={18} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button
          className="account-summary"
          type="button"
          onClick={() => setIsAccountOpen((prev) => !prev)}
          title="User account"
        >
          <div className="account-avatar">N</div>
          {!isCollapsed && (
            <div className="account-text">
              <span className="account-name">Nikhil</span>
              <span className="account-role">Platform Engineer · Nirixense</span>
            </div>
          )}
        </button>

        {!isCollapsed && isAccountOpen && (
          <div className="account-menu glass-panel">
            <div className="account-detail">
              <span className="account-detail-label">Name</span>
              <span className="account-detail-value">Nikhil</span>
            </div>
            <div className="account-detail">
              <span className="account-detail-label">Role</span>
              <span className="account-detail-value">Platform Engineer</span>
            </div>
            <div className="account-detail">
              <span className="account-detail-label">Company</span>
              <span className="account-detail-value">Nirixense Technologies</span>
            </div>
            <button className="account-signout" type="button">
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
