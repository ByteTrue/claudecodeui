import { useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectSession } from '../../../types/app';
import StandaloneShell from '../../standalone-shell/view/StandaloneShell';

type IntegratedTerminalPanelProps = {
  project: Project | null;
  session: ProjectSession | null;
  isOpen: boolean;
  focusVersion: number;
  height: number;
  onClose: () => void;
};

export default function IntegratedTerminalPanel({
  project,
  session,
  isOpen,
  focusVersion,
  height,
  onClose,
}: IntegratedTerminalPanelProps) {
  const { t } = useTranslation(['common', 'chat']);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => t('tabs.shell'), [t]);

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

  if (!project || !isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="border-border/60 bg-card/95 flex-shrink-0 overflow-hidden border-t shadow-[0_-10px_35px_rgba(15,23,42,0.18)] backdrop-blur-sm"
      style={{ height }}
    >
      <div className="border-border/50 flex items-center justify-between border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{title}</div>
            <div className="truncate text-[11px] text-muted-foreground">{project.displayName}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors"
          title={t('chat:shell.actions.disconnectTitle', { defaultValue: 'Hide terminal panel' })}
        >
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Hide</span>
        </button>
      </div>

      <div className="min-h-0 h-[calc(100%-45px)]">
        <StandaloneShell
          project={project}
          session={session}
          showHeader={false}
          showShellHeader={false}
          isActive={isOpen}
          className="h-full"
        />
      </div>
    </div>
  );
}
