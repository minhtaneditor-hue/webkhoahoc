'use client';

import React, { useEffect, useState, useRef } from 'react';

interface DynamicWatermarkProps {
  text?: string;
}

const DynamicWatermark: React.FC<DynamicWatermarkProps> = ({ text = 'STUDENT' }) => {
  const [position, setPosition] = useState({ top: '20%', left: '20%' });
  const [opacity, setOpacity] = useState(0.2);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const moveWatermark = () => {
      const top = Math.floor(Math.random() * 80) + 10;
      const left = Math.floor(Math.random() * 80) + 10;
      const newOpacity = Math.random() * 0.3 + 0.1;

      setPosition({ top: `${top}%`, left: `${left}%` });
      setOpacity(newOpacity);
    };

    timerRef.current = setInterval(moveWatermark, 7000);
    moveWatermark(); // Initial move

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-1000 ease-in-out select-none whitespace-nowrap"
      style={{
        top: position.top,
        left: position.left,
        opacity: opacity,
        color: 'white',
        fontSize: '14px',
        fontWeight: '900',
        textShadow: '0 0 4px rgba(0,0,0,0.8)',
        letterSpacing: '0.1em',
        fontFamily: 'monospace',
        transform: 'rotate(-15deg)',
      }}
    >
      {text.toUpperCase()}
    </div>
  );
};

export default DynamicWatermark;
