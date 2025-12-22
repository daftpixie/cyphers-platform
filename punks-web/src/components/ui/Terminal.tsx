'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  isTyping?: boolean;
  typingLines?: string[];
  onTypingComplete?: () => void;
}

export function Terminal({
  title = 'terminal',
  children,
  className,
  showHeader = true,
  isTyping = false,
  typingLines = [],
  onTypingComplete,
}: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping || typingLines.length === 0) return;

    const currentLine = typingLines[currentLineIndex];
    
    if (currentCharIndex < currentLine?.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 30 + Math.random() * 20);
      
      return () => clearTimeout(timeout);
    } else if (currentLineIndex < typingLines.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else if (onTypingComplete) {
      const timeout = setTimeout(onTypingComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, typingLines, currentLineIndex, currentCharIndex, onTypingComplete]);

  // Reset on new typing lines
  useEffect(() => {
    if (isTyping) {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
    }
  }, [typingLines, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('terminal-window', className)}
    >
      {showHeader && (
        <div className="terminal-header">
          <span className="terminal-dot bg-red-500" />
          <span className="terminal-dot bg-yellow-500" />
          <span className="terminal-dot bg-green-500" />
          <span className="ml-4 text-xs text-text-muted font-mono">{title}</span>
        </div>
      )}
      
      <div className="terminal-content">
        {isTyping ? (
          <div className="space-y-2">
            <AnimatePresence mode="sync">
              {displayedLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-neon-cyan select-none">{'>'}</span>
                  <span className="text-neon-green">
                    {line}
                    {index === currentLineIndex && currentCharIndex < typingLines[index]?.length && (
                      <span className="animate-pulse">▌</span>
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {currentLineIndex >= typingLines.length - 1 && currentCharIndex >= typingLines[typingLines.length - 1]?.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-4"
              >
                <span className="text-neon-cyan">{'>'}</span>
                <span className="cursor-blink" />
              </motion.div>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// Subcomponent for terminal lines
export function TerminalLine({
  children,
  prefix = '>',
  color = 'cyan',
  className,
}: {
  children: React.ReactNode;
  prefix?: string;
  color?: 'cyan' | 'green' | 'magenta' | 'orange' | 'white';
  className?: string;
}) {
  const colors = {
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    magenta: 'text-neon-magenta',
    orange: 'text-neon-orange',
    white: 'text-text-primary',
  };

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="text-neon-cyan select-none">{prefix}</span>
      <span className={colors[color]}>{children}</span>
    </div>
  );
}

// Loading dots component
export function TerminalLoader({ text = 'Loading' }: { text?: string }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <TerminalLine color="cyan">
      {text}{dots}
    </TerminalLine>
  );
}
export default Terminal;
