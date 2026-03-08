import '@xterm/xterm/css/xterm.css';
import { useEffect } from 'react';
import type { TerminalProps } from '../types/types';
import { useTerminal } from '../hooks/useTerminal';

export default function Terminal({ className = '', onHeightChange }: TerminalProps) {
  const { terminalContainerRef, isConnected, connectToTerminal, fit } = useTerminal();

  // Auto-connect on mount
  useEffect(() => {
    connectToTerminal();
  }, [connectToTerminal]);

  // Fit terminal when height changes
  useEffect(() => {
    if (onHeightChange) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        fit();
      }, 100);
    }
  }, [onHeightChange, fit]);

  return (
    <div className={`flex h-full w-full flex-col ${className}`}>
      {!isConnected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="text-sm text-muted-foreground">Connecting to terminal...</div>
        </div>
      )}
      <div ref={terminalContainerRef} className="h-full w-full" />
    </div>
  );
}
