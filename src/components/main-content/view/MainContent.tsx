import React, { useEffect, useMemo } from 'react';
import ChatInterface from '../../chat/view/ChatInterface';
import FileTree from '../../file-tree/view/FileTree';
import GitPanel from '../../git-panel/view/GitPanel';
import PluginTabContent from '../../plugins/view/PluginTabContent';
import type { MainContentProps } from '../types/types';
import { useTaskMaster } from '../../../contexts/TaskMasterContext';
import { useTasksSettings } from '../../../contexts/TasksSettingsContext';
import { useUiPreferences } from '../../../hooks/useUiPreferences';
import { useEditorSidebar } from '../../code-editor/hooks/useEditorSidebar';
import EditorSidebar from '../../code-editor/view/EditorSidebar';
import type { Project, ProjectSession } from '../../../types/app';
import { TaskMasterPanel } from '../../task-master';
import IntegratedTerminalPanel from '../../shell/view/IntegratedTerminalPanel';
import MainContentHeader from './subcomponents/MainContentHeader';
import MainContentStateView from './subcomponents/MainContentStateView';
import ErrorBoundary from './ErrorBoundary';

type TaskMasterContextValue = {
  currentProject?: Project | null;
  setCurrentProject?: ((project: Project) => void) | null;
};

type TasksSettingsContextValue = {
  tasksEnabled: boolean;
  isTaskMasterInstalled: boolean | null;
  isTaskMasterReady: boolean | null;
};

const getProjectSessions = (project: Project): ProjectSession[] => {
  return [
    ...(project.sessions ?? []),
    ...(project.codexSessions ?? []),
    ...(project.cursorSessions ?? []),
    ...(project.geminiSessions ?? []),
  ];
};

function MainContent({
  projects,
  selectedProject,
  selectedSession,
  activeTab,
  setActiveTab,
  terminalPanelState,
  ws,
  sendMessage,
  latestMessage,
  isMobile,
  onMenuClick,
  onOpenTerminalPanel,
  onCloseTerminalPanel,
  onTerminalPanelHeightChange,
  isLoading,
  onInputFocusChange,
  onSessionActive,
  onSessionInactive,
  onSessionProcessing,
  onSessionNotProcessing,
  processingSessions,
  onReplaceTemporarySession,
  onNavigateToSession,
  onShowSettings,
  externalMessageUpdate,
}: MainContentProps) {
  const { preferences } = useUiPreferences();
  const { autoExpandTools, showRawParameters, showThinking, autoScrollToBottom, sendByCtrlEnter } = preferences;

  const { currentProject, setCurrentProject } = useTaskMaster() as TaskMasterContextValue;
  const { tasksEnabled, isTaskMasterInstalled } = useTasksSettings() as TasksSettingsContextValue;

  const shouldShowTasksTab = Boolean(tasksEnabled && isTaskMasterInstalled);
  const terminalBinding = terminalPanelState.binding;
  const boundProject = useMemo(() => {
    if (!terminalBinding) {
      return null;
    }

    return projects.find((project) => project.name === terminalBinding.projectName) ?? {
      name: terminalBinding.projectName,
      displayName: terminalBinding.projectDisplayName,
      fullPath: terminalBinding.projectPath,
      path: terminalBinding.projectPath,
    };
  }, [projects, terminalBinding]);
  const boundSession = useMemo(() => {
    if (!terminalBinding?.sessionId) {
      return null;
    }

    const projectSession = boundProject
      ? getProjectSessions(boundProject).find((session) => session.id === terminalBinding.sessionId)
      : null;

    return projectSession
      ? { ...projectSession, __provider: projectSession.__provider || terminalBinding.provider }
      : {
          id: terminalBinding.sessionId,
          __provider: terminalBinding.provider,
        };
  }, [boundProject, terminalBinding]);

  const {
    editingFile,
    editorWidth,
    editorExpanded,
    hasManualWidth,
    resizeHandleRef,
    handleFileOpen,
    handleCloseEditor,
    handleToggleEditorExpand,
    handleResizeStart,
  } = useEditorSidebar({
    selectedProject,
    isMobile,
  });

  useEffect(() => {
    const selectedProjectName = selectedProject?.name;
    const currentProjectName = currentProject?.name;

    if (selectedProject && selectedProjectName !== currentProjectName) {
      setCurrentProject?.(selectedProject);
    }
  }, [selectedProject, currentProject?.name, setCurrentProject]);

  useEffect(() => {
    if (!shouldShowTasksTab && activeTab === 'tasks') {
      setActiveTab('chat');
    }
  }, [shouldShowTasksTab, activeTab, setActiveTab]);

  if (isLoading) {
    return <MainContentStateView mode="loading" isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  if (!selectedProject) {
    return <MainContentStateView mode="empty" isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex h-full flex-col">
      <MainContentHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTerminalPanelOpen={terminalPanelState.isOpen}
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        shouldShowTasksTab={shouldShowTasksTab}
        isMobile={isMobile}
        onMenuClick={onMenuClick}
        onShellTrigger={onOpenTerminalPanel}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className={`flex min-h-0 min-w-[200px] flex-col overflow-hidden ${editorExpanded ? 'hidden' : ''} flex-1`}>
            <div className={`h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
              <ErrorBoundary showDetails>
                <ChatInterface
                  selectedProject={selectedProject}
                  selectedSession={selectedSession}
                  ws={ws}
                  sendMessage={sendMessage}
                  latestMessage={latestMessage}
                  onFileOpen={handleFileOpen}
                  onInputFocusChange={onInputFocusChange}
                  onSessionActive={onSessionActive}
                  onSessionInactive={onSessionInactive}
                  onSessionProcessing={onSessionProcessing}
                  onSessionNotProcessing={onSessionNotProcessing}
                  processingSessions={processingSessions}
                  onReplaceTemporarySession={onReplaceTemporarySession}
                  onNavigateToSession={onNavigateToSession}
                  onShowSettings={onShowSettings}
                  autoExpandTools={autoExpandTools}
                  showRawParameters={showRawParameters}
                  showThinking={showThinking}
                  autoScrollToBottom={autoScrollToBottom}
                  sendByCtrlEnter={sendByCtrlEnter}
                  externalMessageUpdate={externalMessageUpdate}
                  onShowAllTasks={tasksEnabled ? () => setActiveTab('tasks') : null}
                />
              </ErrorBoundary>
            </div>

            {activeTab === 'files' && (
              <div className="h-full overflow-hidden">
                <FileTree selectedProject={selectedProject} onFileOpen={handleFileOpen} />
              </div>
            )}

            {activeTab === 'git' && (
              <div className="h-full overflow-hidden">
                <GitPanel selectedProject={selectedProject} isMobile={isMobile} onFileOpen={handleFileOpen} />
              </div>
            )}

            {shouldShowTasksTab && <TaskMasterPanel isVisible={activeTab === 'tasks'} />}

            <div className={`h-full overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden'}`} />

            {activeTab.startsWith('plugin:') && (
              <div className="h-full overflow-hidden">
                <PluginTabContent
                  pluginName={activeTab.replace('plugin:', '')}
                  selectedProject={selectedProject}
                  selectedSession={selectedSession}
                />
              </div>
            )}
          </div>

          <EditorSidebar
            editingFile={editingFile}
            isMobile={isMobile}
            editorExpanded={editorExpanded}
            editorWidth={editorWidth}
            hasManualWidth={hasManualWidth}
            resizeHandleRef={resizeHandleRef}
            onResizeStart={handleResizeStart}
            onCloseEditor={handleCloseEditor}
            onToggleEditorExpand={handleToggleEditorExpand}
            projectPath={selectedProject.path}
            fillSpace={activeTab === 'files'}
          />
        </div>

        <IntegratedTerminalPanel
          currentProject={selectedProject}
          terminalBinding={terminalBinding}
          boundProject={boundProject}
          boundSession={boundSession}
          isOpen={terminalPanelState.isOpen}
          focusVersion={terminalPanelState.focusVersion}
          height={terminalPanelState.height}
          isMobile={isMobile}
          onClose={onCloseTerminalPanel}
          onHeightChange={onTerminalPanelHeightChange}
        />
      </div>
    </div>
  );
}

export default React.memo(MainContent);
