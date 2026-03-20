import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectSession, TerminalBindingContext } from '../../../types/app';
import type { ShellStatusSnapshot } from '../types/types';
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

const DEFAULT_SHELL_STATUS: ShellStatusSnapshot = {
  phase: 'loading',
  canRetry: false,
};

const getShortProjectPath = (projectPath: string): string => {
  const normalizedPath = projectPath.replace(/\\/g, '/').replace(/\/$/, '');
  if (!normalizedPath) {
    return '';
  }

  const segments = normalizedPath.split('/').filter(Boolean);
  if (segments.length <= 2) {
    return normalizedPath;
  }

  return `.../${segments.slice(-2).join('/')}`;
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
  const [shellStatus, setShellStatus] = useState<ShellStatusSnapshot>(DEFAULT_SHELL_STATUS);

  const title = useMemo(() => t('tabs.shell'), [t]);
  const displayProject = boundProject ?? currentProject;
  const projectDisplayName = terminalBinding?.projectDisplayName || displayProject?.displayName || '';
  const shortProjectPath = useMemo(
    () => getShortProjectPath(terminalBinding?.projectPath || displayProject?.fullPath || displayProject?.path || ''),
    [displayProject?.fullPath, displayProject?.path, terminalBinding?.projectPath],
  );
  const isProjectMismatch = Boolean(
    terminalBinding && currentProject?.name && currentProject.name !== terminalBinding.projectName,
  );
  const statusLabel = useMemo(() => {
    switch (shellStatus.phase) {
      case 'connecting':
        return t('shell.connecting');
      case 'live':
        return t('shell.header.live');
      case 'disconnected':
        return t('shell.header.disconnected');
      default:
        return t('shell.status.initializing');
    }
  }, [shellStatus.phase, t]);
  const statusClassName =
    shellStatus.phase === 'live'
      ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20'
      : shellStatus.phase === 'disconnected' && shellStatus.canRetry
        ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/20'
        : 'bg-slate-500/10 text-slate-200 ring-1 ring-slate-300/20';

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
      className="flex-shrink-0 overflow-hidden border-t border-border/60 bg-card/95 shadow-[0_-10px_35px_rgba(15,23,42,0.18)] backdrop-blur-sm"
      style={{ height }}
    >
      {!isMobile && (
        <div
          onMouseDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          className="group h-1 cursor-row-resize bg-border/40 transition-colors hover:bg-primary/60"
          title="Drag to resize terminal"
        >
          <div className="mx-auto mt-0.5 h-[2px] w-12 rounded-full bg-muted-foreground/50 transition-colors group-hover:bg-primary-foreground/80" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="text-sm font-medium text-foreground">{title}</div>
              <span
                className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClassName}`}
                title={statusLabel}
              >
                <span className="truncate">{statusLabel}</span>
              </span>
            </div>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-[11px]">
              <span className="truncate text-foreground/80">{projectDisplayName}</span>
              {shortProjectPath && (
                <span className="truncate text-muted-foreground">{shortProjectPath}</span>
              )}
              {isProjectMismatch && currentProject && (
                <span className="inline-flex max-w-full items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <span className="truncate">
                    {t('shell.header.viewingProject', { projectName: currentProject.displayName })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
          onStatusChange={setShellStatus}
        />
      </div>
    </div>
  );
}
