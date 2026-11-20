// src/utils/index.js
/**
 * Join truthy class names.
 * Example: cn('a', false && 'b', ['c', undefined]) => 'a c'
 */
export const cn = (...classes) => {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
};
