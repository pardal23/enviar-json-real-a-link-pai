
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};
