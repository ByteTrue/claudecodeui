import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectSession, TerminalBindingContext } from '../../../types/app';
import StandaloneShell from '../../standalone-shell/view/StandaloneShell';

type IntegratedTerminalPanelProps = {
  currentProject: Project | null;
  terminalBinding: TerminalBindingContext | null;
  boundProject: Project | null;
  boundSession: ProjectSession | null;
  isOpen: boolean;
  focusVersion: number;
  height: number;
  isMobile: boolean;
  onClose: () => void;
  onHeightChange: (height: number) => void;
};

export default function IntegratedTerminalPanel({
  currentProject,
  terminalBinding,
  boundProject,
  boundSession,
  isOpen,
  focusVersion,
  height,
  isMobile,
  onClose,
  onHeightChange,
}: IntegratedTerminalPanelProps) {
  const { t } = useTranslation(['common', 'chat']);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const title = useMemo(() => t('tabs.shell'), [t]);
  const displayProject = boundProject ?? currentProject;
  const projectDisplayName = terminalBinding?.projectDisplayName || displayProject?.displayName || '';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTerminal = () => {
      const textarea = panelRef.current?.querySelector('.xterm-helper-textarea');
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    };

    const animationFrameId = window.requestAnimationFrame(focusTerminal);
    const timeoutId = window.setTimeout(focusTerminal, 0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [focusVersion, isOpen]);

  useEffect(() => {
    if (!isResizing || isMobile) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const workspaceContainer = panelRef.current?.parentElement;
      if (!workspaceContainer) {
        return;
      }

      const containerRect = workspaceContainer.getBoundingClientRect();
      const minHeight = 220;
      const maxHeight = Math.max(minHeight, containerRect.height - 140);
      const nextHeight = containerRect.bottom - event.clientY;

      onHeightChange(Math.round(Math.max(minHeight, Math.min(maxHeight, nextHeight))));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isMobile, isResizing, onHeightChange]);

  if (!boundProject || !isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="border-border/60 bg-card/95 flex-shrink-0 overflow-hidden border-t shadow-[0_-10px_35px_rgba(15,23,42,0.18)] backdrop-blur-sm"
      style={{ height }}
    >
      {!isMobile && (
        <div
          onMouseDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          className="group bg-border/40 hover:bg-primary/60 h-1 cursor-row-resize transition-colors"
          title="Drag to resize terminal"
        >
          <div className="mx-auto mt-0.5 h-[2px] w-12 rounded-full bg-muted-foreground/50 transition-colors group-hover:bg-primary-foreground/80" />
        </div>
      )}

      <div className="border-border/50 flex items-center justify-between border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{title}</div>
            <div className="truncate text-[11px] text-muted-foreground">{projectDisplayName}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors"
          title="Hide terminal panel"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Hide</span>
        </button>
      </div>

      <div className="h-[calc(100%-49px)] min-h-0">
        <StandaloneShell
          project={boundProject}
          session={boundSession}
          showHeader={false}
          showShellHeader={false}
          isActive={isOpen}
          className="h-full"
        />
      </div>
    </div>
  );
}
