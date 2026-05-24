import React from 'react';
import './ProjectCard.css';

interface ProjectCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isVisible: boolean;
  isSoon?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, icon, index, isVisible, isSoon }) => {
  return (
    <div 
      className={`project-card ${isVisible ? 'visible' : ''} ${isSoon ? 'soon-card' : ''}`}
      style={{ '--index': index } as React.CSSProperties}
    >
      <div className="card-sketchy-bg"></div>
      <div className="card-content">
        {isSoon && (
          <div className="card-soon-badge">
            <div className="badge-sketchy-bg"></div>
            <span>SOON</span>
          </div>
        )}
        <div className="card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
