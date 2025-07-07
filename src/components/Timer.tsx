'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  startTime: Date;
  isActive: boolean;
}

export default function Timer({ startTime, isActive }: TimerProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTime(Date.now() - startTime.getTime());
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, startTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 px-4 py-2 rounded-lg">
      <div className="text-sm text-gray-600 mb-1">Tempo decorrido</div>
      <div className="text-lg font-mono font-bold text-gray-800">
        {formatTime(time)}
      </div>
    </div>
  );
}
