import React from 'react';
import './GetInTouchButton.css';

interface GetInTouchButtonProps {
  text?: string;
  onClick?: () => void;
}

const GetInTouchButton: React.FC<GetInTouchButtonProps> = ({ text = "Get in touch", onClick }) => {
  return (
    <button className="get-in-touch-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default GetInTouchButton;
