import React from 'react';

const LoadingSpinner = ({ size = 40, color = 'border-blue-600', text = '', className = '' }) => (
  <div className={`flex flex-col justify-center items-center py-8 ${className}`} role="status" aria-busy="true">
    <div
      className={`animate-spin rounded-full border-b-2 ${color}`}
      style={{ width: size, height: size, borderWidth: size / 10 }}
    ></div>
    {text && <span className="mt-2 text-gray-600 text-sm">{text}</span>}
  </div>
);

export default LoadingSpinner; 