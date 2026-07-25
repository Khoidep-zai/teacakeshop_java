import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const Badge: React.FC<BadgeProps> = ({ status, variant }) => {
  let mappedVariant = variant;

  if (!mappedVariant) {
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('delivered') || s.includes('active') || s.includes('approved')) {
      mappedVariant = 'success';
    } else if (s.includes('pending') || s.includes('processing') || s.includes('warning')) {
      mappedVariant = 'warning';
    } else if (s.includes('cancelled') || s.includes('failed') || s.includes('danger') || s.includes('rejected')) {
      mappedVariant = 'danger';
    } else if (s.includes('info') || s.includes('ready')) {
      mappedVariant = 'info';
    } else {
      mappedVariant = 'default';
    }
  }

  const variantStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${variantStyles[mappedVariant]}`}>
      {status}
    </span>
  );
};

export default Badge;
