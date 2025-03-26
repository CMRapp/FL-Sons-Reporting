'use client';

import { useState, useEffect } from 'react';

const TopBar = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format time in 12-hour format
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      // Format date as MM/DD/YYYY
      const dateString = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });

      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[30px] bg-blue-800 text-white flex items-center justify-end px-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm">{currentTime}</span>
        <span className="text-sm">{currentDate}</span>
      </div>
    </div>
  );
};

export default TopBar; 