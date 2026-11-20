import React from 'react';

const Avatar = ({ src, name = '', size = 32 }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return src ? (
    <img src={src} alt={name} title={name}
      style={{ width: size, height: size }} className="rounded-full object-cover" />
  ) : (
    <div title={name} style={{ width: size, height: size }}
      className="rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
      {initials || '?'}
    </div>
  );
};

export default Avatar;