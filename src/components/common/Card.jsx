import React from 'react';

const Card = ({ children, className = '', variant = 'shadow', hoverable = false, ...props }) => {
  const variants = {
    shadow: 'bg-white rounded-lg shadow p-6',
    border: 'bg-white rounded-lg border border-gray-200 p-6',
    flat: 'bg-white rounded-lg p-6',
  };
  return (
    <div
      className={`${variants[variant] || variants.shadow} ${hoverable ? 'transition-shadow hover:shadow-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 