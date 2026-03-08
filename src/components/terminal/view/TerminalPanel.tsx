import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Terminal from './Terminal';

export default function TerminalPanel() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = dragStartY.current - e.clientY;
      const newHeight = Math.max(150, Math.min(800, dragStartHeight.current + delta));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Add padding to body when terminal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.paddingBottom = `${height}px`;
    } else {
      document.body.style.paddingBottom = '0';
    }

    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [isOpen, height]);

  const terminalEnabled = localStorage.getItem('terminalEnabled') === 'true';

  if (!terminalEnabled) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700"
          title={t('terminal.open')}
        >
          <TerminalIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('terminal.title')}</span>
        </button>
      )}

      {/* Terminal Panel - Always mounted when enabled, just hidden */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-2xl transition-transform duration-200 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: `${height}px` }}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute left-0 right-0 top-0 h-1 cursor-ns-resize hover:bg-blue-500 ${
            isDragging ? 'bg-blue-500' : 'bg-border'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('terminal.title')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHeight(Math.min(800, height + 100))}
              className="rounded p-1 hover:bg-muted"
              title={t('terminal.increaseHeight')}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setHeight(Math.max(150, height - 100))}
              className="rounded p-1 hover:bg-muted"
              title={t('terminal.decreaseHeight')}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 hover:bg-muted"
              title={t('terminal.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="h-[calc(100%-41px)] w-full">
          <Terminal onHeightChange={height} />
        </div>
      </div>
    </>
  );
}
