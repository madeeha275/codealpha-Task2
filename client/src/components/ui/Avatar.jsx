import React from 'react';

const Avatar = ({ src, name = '', size = 32, className = '' }) => {
  const initials = String(name).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const style = { width: size, height: size };
  return src ? (
    <img src={src} alt={name} title={name} style={style} className={'rounded-full object-cover ' + className} />
  ) : (
    <div title={name} style={style}
      className={'rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold ' + className}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;
