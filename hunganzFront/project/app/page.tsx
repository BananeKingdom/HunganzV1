"use client";

import React, { useState, useEffect, useRef } from 'react';
import CommandView from '@/components/CommandView';
import TypewriterView from '@/components/TypewriterView';

export default function Home() {
  const [showTextbox, setShowTextbox] = useState(false);
  const [input, setInput] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [loremText, setLoremText] = useState('');
  const [shake, setShake] = useState(false);
  const [redBlink, setRedBlink] = useState(false);
  const [hasEnteredHunga, setHasEnteredHunga] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({
    ctrl: false,
    shift: false,
    h: false
  });

  // Load lorem ipsum text
  useEffect(() => {
    fetch('/lorem.txt')
      .then(response => response.text())
      .then(text => setLoremText(text))
      .catch(err => console.error('Error loading lorem text:', err));
  }, []);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Update pressed keys state
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        h: event.code === 'KeyH'
      }));

      if (event.ctrlKey && event.shiftKey && event.code === 'KeyH') {
        event.preventDefault();
        setShowTextbox(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Update pressed keys state on key release
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        h: event.code === 'KeyH' ? false : prev.h
      }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.toLowerCase().trim() === '/hunga') {
      setShowTypewriter(true);
      setHasEnteredHunga(true);
      setInput('');
    } else {
      // Shake and red blink animation
      setShake(true);
      setRedBlink(true);
      
      setTimeout(() => {
        setShake(false);
        setRedBlink(false);
      }, 600);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const resetInterface = () => {
    setShowTextbox(false);
    setShowTypewriter(false);
    setInput('');
    setShake(false);
    setRedBlink(false);
    setHasEnteredHunga(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Jungle Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1172617/pexels-photo-1172617.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        
        <div className={showTextbox ? "opacity-0 pointer-events-none transition-opacity duration-1000" : "opacity-100 transition-opacity duration-1000"}>
          {/* Keyboard Keys */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.ctrl ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-1'}`}>
              ctrl
            </div>
            <span className="text-amber-100 text-2xl">+</span>
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.shift ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-2'}`}>
              shift
            </div>
            <span className="text-amber-100 text-2xl">+</span>
            <div className={`bg-amber-100 text-amber-900 px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-semibold transition-all duration-150 ${pressedKeys.h ? 'transform scale-110 shadow-2xl' : 'shadow-lg float-3'}`}>
              H
            </div>
          </div>
        </div>

        {/* Command View Overlay */}
        <div className={showTextbox ? "opacity-100 transition-opacity duration-1000" : "opacity-0 pointer-events-none transition-opacity duration-1000"}>
          <CommandView
            showTextbox={showTextbox}
            showTypewriter={showTypewriter}
            input={input}
            shake={shake}
            redBlink={redBlink}
            hasEnteredHunga={hasEnteredHunga}
            onInputChange={handleInputChange}
            onInputSubmit={handleInputSubmit}
            onClose={resetInterface}
          >
            {showTypewriter && (
              <TypewriterView text={loremText} speed={5} />
            )}
          </CommandView>
        </div>
      </div>
    </div>
  );
}