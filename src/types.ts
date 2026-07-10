export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SearchIndicatorState {
  type: 'searching' | 'found' | 'error';
  text: string;
}
