"use client";

import React, { useState, useEffect } from 'react';

interface TypewriterViewProps {
  text: string;
  speed?: number;
}

export default function TypewriterView({ text, speed = 5 }: TypewriterViewProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (text) {
      let index = 0;
      setDisplayText('');
      
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [text, speed]);

  return (
    <div className="text-amber-100 text-2xl leading-relaxed tracking-wide whitespace-pre-wrap h-full">
      {displayText}
      <span className="animate-pulse text-amber-200">|</span>
    </div>
  );
}