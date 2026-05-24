import React from 'react';

const FindDevelopersView: React.FC = () => {
  return (
    <div className="view-container ai-finder-view">
      {/* Blurred Content */}
      <div className="ai-content-blurred">
        <div className="view-header">
          <h2>Find Developers (AI Powered)</h2>
          <p>Our AI analyzes your project's stack and goals to find the perfect developer match.</p>
        </div>

        <div className="dashboard-panel ai-search-panel" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <div className="panel-sketchy-bg"></div>
          <div className="panel-content" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="ai-status">
              <span style={{ fontSize: '3rem' }}>🤖</span>
              <h3>Ready to Scan</h3>
            </div>
            <p>Connect a repository to let the AI find collaborators based on code style and expertise.</p>
            
            <div className="ai-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="get-in-touch-button" style={{ height: '45px' }}>Scan My Repos</button>
              <button className="github-star-button" style={{ height: '45px' }}>Match by Skills</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sharp Soon! Overlay */}
      <div className="soon-overlay">
        <div className="soon-text">Coming Soon!</div>
      </div>
    </div>
  );
};

export default FindDevelopersView;
