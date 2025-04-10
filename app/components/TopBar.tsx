'use client';

import React from 'react';
import Image from 'next/image';
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
    <div className="bg-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
              <div className="ml-4">
              <h2 className="uppercase  font-bold text-white font-jost">Sons of the American Legion<br/> Detachment of Florida</h2>
              
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white">{currentTime}</span>
            <span className="text-sm text-white">{currentDate}</span>
            <span className="text-sm text-white">v1.0.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 