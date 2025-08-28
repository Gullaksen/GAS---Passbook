
import React from 'react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">
      {message}
    </div>
  );
};
