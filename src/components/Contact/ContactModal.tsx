import React, { useState, useEffect } from 'react';
import './ContactModal.css';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    explain: '',
    captcha: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentCaptcha, setCurrentCaptcha] = useState({ question: '', answer: '' });

  // 30 Sketchy Captchas
  const captchaPool = [
    { question: "4 + 3", answer: "7" },
    { question: "10 - 2", answer: "8" },
    { question: "5 x 2", answer: "10" },
    { question: "12 / 2", answer: "6" },
    { question: "9 + 1", answer: "10" },
    { question: "15 - 5", answer: "10" },
    { question: "3 + 8", answer: "11" },
    { question: "20 - 7", answer: "13" },
    { question: "6 x 3", answer: "18" },
    { question: "14 / 2", answer: "7" },
    { question: "11 + 4", answer: "15" },
    { question: "25 - 10", answer: "15" },
    { question: "2 x 8", answer: "16" },
    { question: "30 / 5", answer: "6" },
    { question: "7 + 7", answer: "14" },
    { question: "18 - 9", answer: "9" },
    { question: "4 x 4", answer: "16" },
    { question: "40 / 10", answer: "4" },
    { question: "13 + 3", answer: "16" },
    { question: "22 - 11", answer: "11" },
    { question: "5 x 3", answer: "15" },
    { question: "16 / 4", answer: "4" },
    { question: "8 + 9", answer: "17" },
    { question: "21 - 7", answer: "14" },
    { question: "6 x 2", answer: "12" },
    { question: "24 / 3", answer: "8" },
    { question: "17 + 3", answer: "20" },
    { question: "27 - 7", answer: "20" },
    { question: "4 x 5", answer: "20" },
    { question: "45 / 5", answer: "9" }
  ];

  useEffect(() => {
    // Pick a random captcha on mount
    const random = captchaPool[Math.floor(Math.random() * captchaPool.length)];
    setCurrentCaptcha(random);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.captcha !== currentCaptcha.answer) {
      alert(`Captcha is wrong! What is ${currentCaptcha.question}?`);
      // Refresh captcha on wrong answer
      const random = captchaPool[Math.floor(Math.random() * captchaPool.length)];
      setCurrentCaptcha(random);
      setFormData({...formData, captcha: ''});
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('message', formData.explain);
    if (file) data.append('file', file);

    try {
      const apiUrl = import.meta.env.PROD ? '/api/contact' : 'http://localhost:8000/contact';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert("Failed to send. Is the backend running?");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="contact-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-sketchy-bg"></div>
          <div className="modal-content">
            <span style={{ fontSize: '4rem' }}>✉️</span>
            <h2>Thank You!</h2>
            <p>Your support request has been sent successfully. We'll get back to you soon.</p>
            <button className="get-in-touch-button" onClick={onClose} style={{ marginTop: '2rem' }}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sketchy-bg"></div>
        <div className="modal-content">
          <header className="modal-header">
            <h2>Contact Support</h2>
            <p>How can we help you today?</p>
          </header>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label>Explain your request</label>
              <textarea 
                required 
                rows={4}
                value={formData.explain}
                onChange={(e) => setFormData({...formData, explain: e.target.value})}
                placeholder="Describe what you need..."
              />
            </div>

            <div className="form-group">
              <label>Upload Document (Optional)</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="file-label">
                  {file ? file.name : "📁 Choose a file..."}
                </label>
              </div>
            </div>

            <div className="form-group captcha-group">
              <label>Sketchy Captcha: {currentCaptcha.question} = ?</label>
              <input 
                type="text" 
                required 
                value={formData.captcha}
                onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                placeholder="Answer"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="get-in-touch-button" disabled={isSending}>
                {isSending ? "Sending..." : "Send Request"}
              </button>
              <button type="button" className="close-link" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
