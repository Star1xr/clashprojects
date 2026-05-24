import React from 'react';

const TeamsView: React.FC = () => {
  const mockTeams = [
    { name: "Frontend Wizards", stack: "React, TypeScript", lookingFor: "UI/UX Designer", sketchy: true },
    { name: "Cloud Ninjas", stack: "Python, AWS", lookingFor: "DevOps Engineer", sketchy: false },
    { name: "Mobile Rebels", stack: "Flutter, Firebase", lookingFor: "Backend Dev", sketchy: true }
  ];

  return (
    <div className="view-container ai-finder-view">
      {/* Blurred Content */}
      <div className="ai-content-blurred">
        <div className="view-header">
          <h2>Teams Looking for Developers</h2>
          <p>Find your next big project and join a team that matches your passion.</p>
        </div>
        
        <div className="dashboard-grid">
          {mockTeams.map((team, i) => (
            <section key={i} className="dashboard-panel">
              <div className="panel-sketchy-bg"></div>
              <div className="panel-content">
                <h3>{team.name}</h3>
                <p><strong>Stack:</strong> {team.stack}</p>
                <p><strong>Hiring:</strong> {team.lookingFor}</p>
                <button className="get-in-touch-button" style={{ width: '100%', marginTop: '1rem', height: '40px' }}>Apply to Join</button>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sharp Soon! Overlay */}
      <div className="soon-overlay">
        <div className="soon-text">Coming Soon!</div>
      </div>
    </div>
  );
};

export default TeamsView;
