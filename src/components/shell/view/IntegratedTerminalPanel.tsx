import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, RotateCcw, Terminal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  IntegratedTerminalTab,
  Project,
  ProjectSession,
  TerminalTabStatus,
} from '../../../types/app';
import type { ShellStatusSnapshot } from '../types/types';
import StandaloneShell from '../../standalone-shell/view/StandaloneShell';

type IntegratedTerminalPanelProps = {
  currentProject: Project | null;
  boundProject: Project | null;
  boundSession: ProjectSession | null;
  terminalTabs: IntegratedTerminalTab[];
  activeTerminalTabId: string | null;
  isOpen: boolean;
  focusVersion: number;
  height: number;
  isMobile: boolean;
  onClose: () => void;
  onNewTerminalTab: () => void;
  onSelectTerminalTab: (tabId: string) => void;
  onCloseTerminalTab: (tabId: string) => void;
  onRestartTerminalTab: (tabId: string) => void;
  onTerminalTabStatusChange: (
    tabId: string,
    nextStatus: {
      status: TerminalTabStatus;
      canRetry: boolean;
      exitCode: number | null;
    },
  ) => void;
  onHeightChange: (height: number) => void;
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

const getTabStatusClassName = (status: TerminalTabStatus, canRetry: boolean): string => {
  switch (status) {
    case 'live':
      return 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20';
    case 'disconnected':
      return canRetry
        ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/20'
        : 'bg-slate-500/10 text-slate-200 ring-1 ring-slate-300/20';
    case 'exited':
      return 'bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/20';
    default:
      return 'bg-slate-500/10 text-slate-200 ring-1 ring-slate-300/20';
  }
};

export default function IntegratedTerminalPanel({
  currentProject,
  boundProject,
  boundSession,
  terminalTabs,
  activeTerminalTabId,
  isOpen,
  focusVersion,
  height,
  isMobile,
  onClose,
  onNewTerminalTab,
  onSelectTerminalTab,
  onCloseTerminalTab,
  onRestartTerminalTab,
  onTerminalTabStatusChange,
  onHeightChange,
}: IntegratedTerminalPanelProps) {
  const { t } = useTranslation('chat');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const activeTab = terminalTabs.find((tab) => tab.id === activeTerminalTabId) ?? terminalTabs[0] ?? null;
  const title = t('shell.header.title', { defaultValue: 'Terminal' });
  const displayProject = boundProject ?? currentProject;
  const projectDisplayName = activeTab?.binding.projectDisplayName || displayProject?.displayName || '';
  const shortProjectPath = getShortProjectPath(
    activeTab?.binding.projectPath || displayProject?.fullPath || displayProject?.path || '',
  );
  const isProjectMismatch = Boolean(
    activeTab && currentProject?.name && currentProject.name !== activeTab.binding.projectName,
  );
  const getStatusLabel = (status: TerminalTabStatus) => {
    switch (status) {
      case 'live':
        return t('shell.header.statusLive', { defaultValue: 'Live' });
      case 'disconnected':
        return t('shell.header.statusDisconnected', { defaultValue: 'Disconnected' });
      case 'exited':
        return t('shell.header.statusExited', { defaultValue: 'Exited' });
      default:
        return t('shell.header.statusConnecting', { defaultValue: 'Connecting' });
    }
  };
  const activeStatusLabel = activeTab ? getStatusLabel(activeTab.status) : '';
  const activeStatusClassName = activeTab
    ? getTabStatusClassName(activeTab.status, activeTab.canRetry)
    : '';
  const handleShellStatusChange = (shellStatus: ShellStatusSnapshot) => {
    if (!activeTab) {
      return;
    }

    onTerminalTabStatusChange(activeTab.id, {
      status: shellStatus.phase === 'loading' ? 'connecting' : shellStatus.phase,
      canRetry: shellStatus.canRetry,
      exitCode: null,
    });
  };

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

  if (!activeTab || !boundProject || !isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="flex flex-shrink-0 flex-col overflow-hidden border-t border-border/60 bg-card/95 shadow-[0_-10px_35px_rgba(15,23,42,0.18)] backdrop-blur-sm"
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
                className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${activeStatusClassName}`}
                title={activeStatusLabel}
              >
                <span className="truncate">{activeStatusLabel}</span>
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
                    {t('shell.header.viewingProject', {
                      projectName: currentProject.displayName,
                      defaultValue: `Viewing ${currentProject.displayName}`,
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRestartTerminalTab(activeTab.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title={t('shell.tabs.restartTab', {
              title: activeTab.title,
              defaultValue: `Restart ${activeTab.title}`,
            })}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
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
      </div>

      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          {terminalTabs.map((tab) => {
            const isActiveTab = tab.id === activeTab.id;
            const tabStatusLabel = getStatusLabel(tab.status);

            return (
              <div
                key={tab.id}
                className={`flex min-w-[180px] max-w-[260px] items-center gap-2 rounded-md border px-2 py-1 ${
                  isActiveTab
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 bg-background/40 text-muted-foreground'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTerminalTab(tab.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="truncate text-sm font-medium">{tab.title}</span>
                  <span
                    className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getTabStatusClassName(tab.status, tab.canRetry)}`}
                    title={tabStatusLabel}
                  >
                    <span className="truncate">{tabStatusLabel}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseTerminalTab(tab.id);
                  }}
                  className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title={t('shell.tabs.closeTab', {
                    title: tab.title,
                    defaultValue: `Close ${tab.title}`,
                  })}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNewTerminalTab}
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={t('shell.tabs.newTab', { defaultValue: 'New tab' })}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <StandaloneShell
          project={boundProject}
          session={boundSession}
          showHeader={false}
          showShellHeader={false}
          isActive={isOpen}
          className="h-full min-h-0"
          onStatusChange={handleShellStatusChange}
        />
      </div>
    </div>
  );
}
