import React from 'react';
import './NodeFilters.css';

export default function NodeFilters({ onFilterChange }) {
  return (
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
      </div>
    </div>
  );
}
