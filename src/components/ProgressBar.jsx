import { useEffect, useState } from 'react';

const ProgressBar = ({ progress }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prevProgress => {
        if (prevProgress < progress) {
          return Math.min(prevProgress + 1, progress);
        }
        return prevProgress;
      });
    }, 30);
    
    return () => {
      clearInterval(interval);
    };
  }, [progress]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${displayProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;