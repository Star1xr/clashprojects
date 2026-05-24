import React from 'react';
import './GetInTouchButton.css';

interface GetInTouchButtonProps {
  text?: string;
}

const GetInTouchButton: React.FC<GetInTouchButtonProps> = ({ text = "Get in touch" }) => {
  return (
    <button className="get-in-touch-button">
      {text}
    </button>
  );
};

export default GetInTouchButton;
