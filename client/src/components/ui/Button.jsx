// src/components/ui/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils'; // optional utility for classnames, fallback to simple join

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
};

const sizes = {
  sm: 'px-2 py-1 text-sm rounded-xl',
  md: 'px-4 py-2 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

const Button = ({ variant = 'primary', size = 'md', className = '', onClick, children, ...rest }) => {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  const classes = `${variantClass} ${sizeClass} transition-colors duration-200 ${className}`;
  return (
    <button className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;