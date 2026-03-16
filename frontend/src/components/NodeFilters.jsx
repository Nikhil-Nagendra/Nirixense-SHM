import { Filter } from 'lucide-react';
import React from 'react';
import './NodeFilters.css';

export default function NodeFilters({ onFilterChange }) {
  return (
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
      </div>
    </div>
  );
}
