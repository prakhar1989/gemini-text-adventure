
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-4 border-t-amber-500 border-slate-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
