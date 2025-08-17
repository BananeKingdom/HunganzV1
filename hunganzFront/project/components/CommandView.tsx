import React, { useRef, useEffect, useState } from 'react';

interface CommandViewProps {
  children: React.ReactNode;
  showTextbox: boolean;
  showTypewriter: boolean;
  input: string;
  shake: boolean;
  redBlink: boolean;
  hasEnteredHunga: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function CommandView({
  children,
  showTextbox,
  showTypewriter,
  input,
  shake,
  redBlink,
  hasEnteredHunga,
  onInputChange,
  onInputSubmit,
  onClose
}: CommandViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Focus input when textbox appears
  useEffect(() => {
    if (showTextbox) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showTextbox]);

  // Handle arrow key scrolling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!contentRef.current || !showTextbox) return;

      const scrollAmount = 50;
      const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newPosition = Math.max(0, scrollPosition - scrollAmount);
        setScrollPosition(newPosition);
        contentRef.current.scrollTop = newPosition;
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
        setScrollPosition(newPosition);
        contentRef.current.scrollTop = newPosition;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTextbox, scrollPosition]);

  if (!showTextbox) return null;

  return (
    <div className="opacity-100">
      {/* Background Content with Blur */}
      <div className="fixed inset-0 z-20">
        <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-teal-900/40">
          <div 
            ref={contentRef}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="p-8 pb-96">
              {children}
            </div>
          </div>
          
          {/* Blur gradient overlay - fixed at bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none z-10"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitMask: 'linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 80%, transparent 85%)',
              mask: 'linear-gradient(to top, black 0%, black 40%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 80%, transparent 85%)'
            }}
          ></div>
        </div>
      </div>

      {/* Command Textbox Overlay - Always on top */}
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative transition-all duration-700 ease-in-out transform pointer-events-auto ${
          showTypewriter ? 'translate-y-64' : 'translate-y-0'
        }`}>
          <form onSubmit={onInputSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={onInputChange}
              placeholder={hasEnteredHunga ? "/help" : "/hunga to start"}
              className={`
                w-96 px-6 py-4 text-xl font-bold bg-amber-900 bg-opacity-80 
                border-2 rounded-lg text-amber-100 placeholder-amber-300 placeholder-opacity-70
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                transition-all duration-300
                ${shake ? 'animate-bounce' : ''}
                ${redBlink ? 'border-red-500 animate-pulse' : 'border-amber-600 border-opacity-50'}
              `}
            />
          </form>
        </div>
      </div>
    </div>
  );
}