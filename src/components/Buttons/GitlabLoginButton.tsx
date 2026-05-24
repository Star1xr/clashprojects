import React from 'react';
import '../LoginModal/LoginModal.css';
import './GitlabLoginButton.css';

interface GitlabLoginButtonProps {
  onClick?: () => void;
}

const GitlabLoginButton: React.FC<GitlabLoginButtonProps> = ({ onClick }) => {
  return (
    <button className="login-btn gitlab" onClick={onClick}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0l-2.664 8.189H7.574L4.91.263c-.135-.417-.724-.417-.859 0L1.387 8.452.045 12.587c-.171.527.014 1.111.459 1.434l11.496 8.354 11.496-8.354c.445-.323.63-.907.459-1.434z"
          fill="currentColor"
        />
      </svg>
      Continue with GitLab
    </button>
  );
};

export default GitlabLoginButton;
