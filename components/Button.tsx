
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 focus:ring-gray-400",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};
