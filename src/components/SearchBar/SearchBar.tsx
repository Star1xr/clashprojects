import React from 'react';
import './SearchBar.css';

const SearchBar: React.FC = () => {
  return (
    <div className="search-wrapper">
      <div className="search-container">
        {/* Sketchy background layer - only this part gets the filter */}
        <div className="search-sketchy-bg"></div>
        
        {/* Content layer - needs to stay sharp */}
        <div className="search-content">
          <input
            type="text"
            className="search-input"
            placeholder="Search projects, developers..."
            aria-label="Search"
          />
          <button className="search-icon-btn" aria-label="Submit Search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
