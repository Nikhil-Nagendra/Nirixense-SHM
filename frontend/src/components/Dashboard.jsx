import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import NodeCard from './NodeCard';
import NodeFilters from './NodeFilters';
import Charts from './Charts';
import './Dashboard.css';

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [filters, setFilters] = useState({ client: 'All', project: 'All', status: 'All' });
  const [history, setHistory] = useState({});
  const [activeNodeId, setActiveNodeId] = useState(1);

  useEffect(() => {
    fetch('http://localhost:8000/api/nodes/')
      .then(res => res.json())
      .then(data => {
        // Mocking the relational data for the UI since the API doesn't join it
        const nodesWithContext = data.map(n => ({
          ...n,
          client: n.id % 2 === 0 ? 'Globex Labs' : 'Acme Corp',
          project: n.id % 2 === 0 ? 'Project Beta' : 'Bridge Alpha'
        }));
        setNodes(nodesWithContext);
      })
      .catch(err => console.error("Failed to load initial nodes", err));
  }, []);

  const { data: wsData, isConnected } = useWebSocket('ws://localhost:8000/ws/nodes');

  useEffect(() => {
    if (wsData && wsData.type === 'NODE_UPDATE') {
      const updatedNode = wsData.data;
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });

      setNodes(prev => {
        const index = prev.findIndex(n => n.id === updatedNode.id);
        const contextualData = {
          client: updatedNode.id % 2 === 0 ? 'Globex Labs' : 'Acme Corp',
          project: updatedNode.id % 2 === 0 ? 'Project Beta' : 'Bridge Alpha'
        };

        if (index >= 0) {
          const newNodes = [...prev];
          newNodes[index] = { ...newNodes[index], ...updatedNode, ...contextualData };
          return newNodes;
        }
        return [...prev, { ...updatedNode, ...contextualData }];
      });

      setHistory(prev => {
         const nodeHist = prev[updatedNode.id] || { battery: [], signal: [] };
         const newBat = [...nodeHist.battery, { time: timeStr, level: Math.round(updatedNode.battery_level) }].slice(-15);
         const newSig = [...nodeHist.signal, { time: timeStr, strength: Math.round(updatedNode.signal_strength) }].slice(-15);
         return { ...prev, [updatedNode.id]: { battery: newBat, signal: newSig } };
      });
    }
  }, [wsData]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredNodes = nodes.filter(node => {
     if (filters.client !== 'All' && node.client !== filters.client) return false;
     if (filters.project !== 'All' && node.project !== filters.project) return false;
     if (filters.status !== 'All' && node.status !== filters.status) return false;
     return true;
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="brand-text">Nirixense SHM</h1>
        <div className="connection-status">
          <div className={`indicator ${isConnected ? 'online' : 'offline'}`}></div>
          {isConnected ? 'Live' : 'Connecting...'}
        </div>
      </header>

      <main className="dashboard-main">
        <NodeFilters onFilterChange={handleFilterChange} />
        <div className="node-grid">
          {filteredNodes.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              isActive={node.id === activeNodeId} 
              onClick={() => setActiveNodeId(node.id)} 
            />
          ))}
          {filteredNodes.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No nodes match filters.</p>}
        </div>
        <Charts 
          activeNodeId={activeNodeId}
          batteryData={history[activeNodeId]?.battery} 
          signalData={history[activeNodeId]?.signal} 
        />
      </main>
    </div>
  );
}
