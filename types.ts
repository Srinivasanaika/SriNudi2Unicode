export interface ConversionHistoryItem {
  id: string;
  original: string;
  converted: string;
  timestamp: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export enum AppState {
  IDLE = 'IDLE',
  CONVERTING = 'CONVERTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}