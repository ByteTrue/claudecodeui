export type TerminalProps = {
  className?: string;
  onHeightChange?: number;
};

export type TerminalMessage = {
  type: 'init' | 'input' | 'resize';
  projectPath?: string;
  data?: string;
  cols?: number;
  rows?: number;
};
