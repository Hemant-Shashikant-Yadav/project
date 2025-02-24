export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  description?: string;
  color: string;
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  createdAt: number;
  completedAt?: number;
}

export interface CompletedTimer {
  id: string;
  name: string;
  description?: string;
  duration: number;
  color: string;
  completedAt: number;
}

export interface CreateTimerInput {
  name: string;
  hours: number;
  minutes: number;
  seconds: number;
  description?: string;
  color: string;
}

export type TimerGroup = {
  title: string;
  data: Timer[];
  isExpanded?: boolean;
};