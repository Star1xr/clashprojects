import React, { useState } from 'react';
import './Dashboard.css';
import GetInTouchButton from '../Buttons/GetInTouchButton';
import TeamsView from './TeamsView';
import FindDevelopersView from './FindDevelopersView';
import ThemeSwitch from '../ThemeSwitch/ThemeSwitch';

interface Repo {
  name: string;
  stars: number;
}

interface Commit {
  msg: string;
  repo: string;
  date: string;
  url: string;
}

interface DashboardProps {
  userData: {
    login: string;
    avatar_url: string;
    bio: string;
  };
  repos: Repo[];
  commits: Commit[];
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, repos, commits, isDarkMode, toggleTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'find'>('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const sortedByStars = [...repos].sort((a, b) => b.stars - a.stars);
  const mostStarred = sortedByStars.slice(0, 3);
  const leastStarred = [...repos].sort((a, b) => a.stars - b.stars).slice(0, 3);

  const renderDashboard = () => (
    <main className="dashboard-grid">
      <section className="dashboard-panel commits">
        <div className="panel-sketchy-bg"></div>
        <div className="panel-content">
          <h3>Last Commits</h3>
          <ul className="activity-list">
            {commits.map((c, i) => (
              <li key={i}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="commit-link">
                  <strong>{c.repo}</strong>: {c.msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dashboard-panel most-starred">
        <div className="panel-sketchy-bg"></div>
        <div className="panel-content">
          <h3>Most Starred (Top 3)</h3>
          <div className="repo-list">
            {mostStarred.map((r, i) => (
              <div key={i} className="repo-item">
                <span>{r.name}</span>
                <span className="repo-stars highlight">★ {r.stars}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-panel actions">
        <div className="panel-sketchy-bg"></div>
        <div className="panel-content action-center">
          <h3>Management</h3>
          <GetInTouchButton text="Add project to clashprojects" />
        </div>
      </section>

      <section className="dashboard-panel least-starred">
        <div className="panel-sketchy-bg"></div>
        <div className="panel-content">
          <h3>Least Starred (Bottom 3)</h3>
          <div className="repo-list">
            {leastStarred.map((r, i) => (
              <div key={i} className="repo-item">
                <span>{r.name}</span>
                <span className="repo-stars">★ {r.stars}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );

  return (
    <div className="dashboard-wrapper" onClick={() => setShowProfileMenu(false)}>
      <header className="dashboard-header">
        <div className="header-nav">
          <div className="logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>clashprojects</div>
          <nav className="dashboard-menu">
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            <button className={activeTab === 'teams' ? 'active' : ''} onClick={() => setActiveTab('teams')}>Teams</button>
            <button className={activeTab === 'find' ? 'active' : ''} onClick={() => setActiveTab('find')}>Find Devs (AI)</button>
          </nav>
        </div>
        
        <div className="user-profile-section">
          <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          
          <div className="profile-container">
            <div 
              className={`profile-info clickable ${showProfileMenu ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
            >
              <img src={userData.avatar_url} alt={userData.login} className="user-avatar" />
              <div className="user-text">
                <span className="user-name">{userData.login}</span>
                <span className="user-bio">{userData.bio}</span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-sketchy-bg"></div>
                <div className="dropdown-content">
                  <button className="fancy-logout-btn" onClick={onLogout}>
                    Logout
                    <div className="btn-sketchy-border"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'teams' && <TeamsView />}
      {activeTab === 'find' && <FindDevelopersView />}
    </div>
  );
};

export default Dashboard;
