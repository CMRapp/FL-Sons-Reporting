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
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Image
              src="/fl-sons-150.png"
              alt="FL SAL Logo"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Detachment of Florida</h1>
              <p className="text-sm text-gray-600">Sons of the American Legion</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{currentTime}</span>
            <span className="text-sm text-gray-500">{currentDate}</span>
            <span className="text-sm text-gray-500">v1.0.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 