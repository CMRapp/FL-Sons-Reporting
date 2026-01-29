'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format time as H:MM AM/PM
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
      
      // Format date as MM/DD/YY
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      setCurrentDate(`${month}/${day}/${year}`);
    };

    // Update time immediately and then every minute
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="uppercase text-xl font-jost font-bold hover:text-blue-200">
            Detachment of Florida Reporting Portal
          </Link>
          <span className="text-sm text-blue-200">v1.0.5</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-200">{currentDate}</span> 
          <span className="text-sm text-blue-200">{currentTime}</span>
          {!isHome && (
            <Link 
              href="/" 
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 