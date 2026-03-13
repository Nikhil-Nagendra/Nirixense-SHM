import React from 'react';
import {
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

export default function Charts({ activeNodeId, batteryData, signalData }) {
  const displayBat = batteryData && batteryData.length > 0 ? batteryData : [{ time: '...', level: 0 }];
  const displaySig = signalData && signalData.length > 0 ? signalData : [{ time: '...', strength: -100 }];

  return (
    <div className="charts-container">
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
          </ResponsiveContainer>
        </div>
      </div>
      
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
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
