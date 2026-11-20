import React from 'react';

const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-indigo-100 text-indigo-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  low: 'bg-green-200 text-green-800',
  medium: 'bg-yellow-200 text-yellow-800',
  high: 'bg-red-200 text-red-800',
};

const Badge = ({ children, variant = 'default', color, className = '', ...props }) => (
  <span
    className={'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ' +
      (variants[color] || variants[variant] || variants.default) + ' ' + className}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
