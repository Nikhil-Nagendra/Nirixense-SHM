import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './TopBar.css';

const TopBar = ({ title, subtitle }) => {
  const [time, setTime] = useState(new Date());
  const { isConnected } = useWebSocket('ws://localhost:8000/ws/nodes');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar glass-panel">
      <div className="topbar-title-section">
        <h2>{title}</h2>
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
      </div>

      <div className="topbar-right">
        <div className="topbar-clock">
          <span className="time">{time.toLocaleTimeString([], { hour12: false })}</span>
          <span className="date">{time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className={`topbar-live ${isConnected ? 'connected' : 'connecting'}`}>
          <span className="topbar-live-dot" />
          <span className="topbar-live-label">{isConnected ? 'Live' : 'Connecting'}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
