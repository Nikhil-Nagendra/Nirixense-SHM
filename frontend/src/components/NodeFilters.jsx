import React from 'react';
<<<<<<< HEAD
=======
import { Filter } from 'lucide-react';
>>>>>>> bc8a547 (latest changes)
import './NodeFilters.css';

export default function NodeFilters({ onFilterChange }) {
  return (
<<<<<<< HEAD
    <div className="glass-panel filters-panel">
      <div className="filter-group">
        <label>Client</label>
        <select onChange={(e) => onFilterChange('client', e.target.value)}>
          <option value="All">All Clients</option>
          <option value="Acme Corp">Acme Corp</option>
          <option value="Globex Labs">Globex Labs</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Project</label>
        <select onChange={(e) => onFilterChange('project', e.target.value)}>
          <option value="All">All Projects</option>
          <option value="Bridge Alpha">Bridge Alpha</option>
          <option value="Project Beta">Project Beta</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Status</label>
        <select onChange={(e) => onFilterChange('status', e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="MONITOR">MONITOR</option>
          <option value="SLEEP">SLEEP</option>
          <option value="NOT_CONFIGURED">NOT_CONFIGURED</option>
        </select>
=======
    <div className="glass-panel filters-panel premium-shadow">
      <div className="filters-header">
        <Filter size={16} className="filter-icon" />
        <span>Hardware Filters</span>
      </div>
      <div className="filters-controls">
        <div className="filter-group">
          <select onChange={(e) => onFilterChange('client', e.target.value)}>
            <option value="All">All Clients</option>
            <option value="Acme Corp">Acme Corp</option>
            <option value="Globex Labs">Globex Labs</option>
          </select>
        </div>
        <div className="filter-group">
          <select onChange={(e) => onFilterChange('zone', e.target.value)}>
            <option value="All">All Zones</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
          </select>
        </div>
        <div className="filter-group">
          <select onChange={(e) => onFilterChange('status', e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="MONITOR">Monitor</option>
            <option value="SLEEP">Sleep</option>
            <option value="CONFIGURED">Configured</option>
            <option value="NOT_CONFIGURED">Unconfigured</option>
          </select>
        </div>
>>>>>>> bc8a547 (latest changes)
      </div>
    </div>
  );
}
