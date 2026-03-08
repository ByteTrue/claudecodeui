import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export function useTerminal() {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectToTerminal = useCallback(() => {
    if (wsRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('auth-token');

    if (!token) {
      console.error('No authentication token found for Terminal WebSocket connection');
      return;
    }

    const wsUrl = `${protocol}//${window.location.host}/terminal?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      const term = terminalRef.current;
      if (term) {
        // Send init message without project path
        ws.send(JSON.stringify({
          type: 'init',
          cols: term.cols,
          rows: term.rows,
        }));
      }
    };

    ws.onmessage = (event) => {
      const term = terminalRef.current;
      if (term && typeof event.data === 'string') {
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };

    ws.onerror = () => {
      setIsConnected(false);
      wsRef.current = null;
    };
  }, []);

  const disconnectFromTerminal = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (!terminalContainerRef.current || terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainerRef.current);

    // Use setTimeout to ensure DOM is ready before fitting
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (error) {
        console.error('Failed to fit terminal:', error);
      }
    }, 0);

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle terminal input
    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data }));
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current && terminalRef.current) {
        fitAddonRef.current.fit();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: terminalRef.current.cols,
            rows: terminalRef.current.rows,
          }));
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  const fit = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      try {
        fitAddonRef.current.fit();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: terminalRef.current.cols,
            rows: terminalRef.current.rows,
          }));
        }
      } catch (error) {
        console.error('Failed to fit terminal:', error);
      }
    }
  }, []);

  return {
    terminalContainerRef,
    isConnected,
    connectToTerminal,
    disconnectFromTerminal,
    fit,
  };
}
