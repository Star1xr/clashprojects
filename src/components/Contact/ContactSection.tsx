import React from 'react';
import './ContactSection.css';
import GetInTouchButton from '../Buttons/GetInTouchButton';

interface ContactSectionProps {
  isVisible: boolean;
  onContactClick: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ isVisible, onContactClick }) => {
  return (
    <section className={`contact-section ${isVisible ? 'visible' : ''}`}>
      <div className="contact-sketchy-bg"></div>
      <div className="contact-content">
        <h2>Let's build the future together</h2>
        <p>
          Have a question or want to collaborate? We'd love to hear from you. 
          Join the clashprojects community and start your journey today.
        </p>
        <div className="contact-actions">
          <GetInTouchButton text="Contact" onClick={onContactClick} />
        </div>
        <div className="contact-info">
          <span>star1xx77ff@gmail.com</span>
          <span className="separator">•</span>
          <span>@clashprojects</span>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
