import React from 'react';
import './ThemeSwitch.css';

interface ThemeSwitchProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="theme-switch">
      <input
        type="checkbox"
        id="theme-checkbox"
        className="theme-switch__checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
      />
      <label 
        htmlFor="theme-checkbox" 
        className="theme-switch__container"
        aria-label="Toggle dark mode"
      >
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
            </div>
          </div>
        </div>
        <div className="theme-switch__clouds"></div>
        <div className="theme-switch__stars-container">
          <div className="theme-switch__stars-cluster">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
          <div className="theme-switch__shooting-star"></div>
          <div className="theme-switch__shooting-star-2"></div>
          <div className="theme-switch__meteor"></div>
          <div className="theme-switch__aurora"></div>
          <div className="theme-switch__comets">
            <div className="comet"></div>
            <div className="comet"></div>
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeSwitch;
