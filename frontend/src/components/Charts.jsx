import React from 'react';
import {
<<<<<<< HEAD
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Charts.css';

const mockBatteryData = [
  { time: '10:00', level: 100 },
  { time: '11:00', level: 98 },
  { time: '12:00', level: 95 },
  { time: '13:00', level: 90 },
  { time: '14:00', level: 85 },
];

const mockSignalData = [
  { time: '10:00', strength: -45 },
  { time: '11:00', strength: -48 },
  { time: '12:00', strength: -50 },
  { time: '13:00', strength: -42 },
  { time: '14:00', strength: -45 },
];
=======
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Zap, Activity } from 'lucide-react';
import './Charts.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip glass-panel">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-stat">
            <span 
              className="tooltip-dot" 
              style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
            ></span>
            <span className="tooltip-value" style={{ color: entry.color }}>
              {entry.value} {entry.name === "level" ? "%" : "dBm"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
>>>>>>> bc8a547 (latest changes)

export default function Charts({ activeNodeId, batteryData, signalData }) {
  const displayBat = batteryData && batteryData.length > 0 ? batteryData : [{ time: '...', level: 0 }];
  const displaySig = signalData && signalData.length > 0 ? signalData : [{ time: '...', strength: -100 }];

  return (
    <div className="charts-container">
<<<<<<< HEAD
      <div className="glass-panel chart-box">
        <h3>Node #{activeNodeId || '?'} Battery Trend (Live)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayBat}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="level" stroke="var(--status-green)" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
=======
      <div className="glass-panel chart-card premium-shadow">
        <div className="chart-header">
           <div className="chart-title-group">
              <div className="chart-icon-box" style={{ color: 'var(--brand-emerald)', background: 'var(--brand-emerald-dim)' }}>
                 <Zap size={18} />
              </div>
              <div>
                 <h3>Battery Depletion Curve</h3>
                 <span className="chart-subtitle">Node NRX-000{activeNodeId || '?'} Live Stream</span>
              </div>
           </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayBat} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-emerald)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--brand-emerald)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="var(--brand-emerald)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBat)" 
                isAnimationActive={false} 
              />
            </AreaChart>
>>>>>>> bc8a547 (latest changes)
          </ResponsiveContainer>
        </div>
      </div>
      
<<<<<<< HEAD
      <div className="glass-panel chart-box">
        <h3>Node #{activeNodeId || '?'} Signal Strength Live (dBm)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displaySig}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" domain={[-100, 0]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="strength" stroke="var(--status-blue)" fill="var(--status-blue)" fillOpacity={0.2} isAnimationActive={false} />
=======
      <div className="glass-panel chart-card premium-shadow">
         <div className="chart-header">
           <div className="chart-title-group">
              <div className="chart-icon-box" style={{ color: 'var(--brand-red)', background: 'var(--brand-red-dim)' }}>
                 <Activity size={18} />
              </div>
              <div>
                 <h3>RF Signal Vibration</h3>
                 <span className="chart-subtitle">Node NRX-000{activeNodeId || '?'} Live Stream</span>
              </div>
           </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displaySig} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-red)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} domain={[-100, 0]} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="strength" 
                stroke="var(--brand-red)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSig)" 
                isAnimationActive={false} 
              />
>>>>>>> bc8a547 (latest changes)
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
