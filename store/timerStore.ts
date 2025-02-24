import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timer, CreateTimerInput } from '@/types/timer';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface TimerStore {
  timers: Timer[];
  isLoading: boolean;
  sortBy: 'name' | 'duration' | 'status';
  searchQuery: string;
  addTimer: (input: CreateTimerInput) => Promise<void>;
  removeTimer: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  deleteAllTimers: () => Promise<void>;
  toggleTimer: (id: string) => Promise<void>;
  resetTimer: (id: string) => Promise<void>;
  updateTimer: (id: string, updates: Partial<Timer>) => Promise<void>;
  setSortBy: (sortBy: 'name' | 'duration' | 'status') => void;
  setSearchQuery: (query: string) => void;
  loadTimers: () => Promise<void>;
}

const STORAGE_KEY = '@timers';
let intervalId: NodeJS.Timeout | undefined;

const useTimerStore = create<TimerStore>((set, get) => ({
  timers: [],
  isLoading: true,
  sortBy: 'status',
  searchQuery: '',

  loadTimers: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ timers: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load timers:', error);
      set({ isLoading: false });
    }
  },

  addTimer: async (input: CreateTimerInput) => {
    try {
      const totalSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
      const newTimer: Timer = {
        id: Date.now().toString(),
        name: input.name,
        duration: totalSeconds,
        description: input.description,
        color: input.color,
        isRunning: false,
        isPaused: false,
        remainingTime: totalSeconds,
        createdAt: Date.now(),
      };

      const timers = [...get().timers, newTimer];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to add timer:', error);
    }
  },

  removeTimer: async (id: string) => {
    try {
      const timers = get().timers.filter(timer => timer.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to remove timer:', error);
    }
  },

  clearCompleted: async () => {
    try {
      const timers = get().timers.filter(timer => timer.remainingTime > 0);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to clear completed timers:', error);
    }
  },

  deleteAllTimers: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      set({ timers: [] });
    } catch (error) {
      console.error('Failed to delete all timers:', error);
    }
  },

  toggleTimer: async (id: string) => {
    try {
      const timers = get().timers.map(timer => {
        if (timer.id === id) {
          return {
            ...timer,
            isRunning: !timer.isRunning,
            isPaused: timer.isRunning ? true : timer.isPaused,
          };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });

      // Start interval if not running
      if (!intervalId) {
        intervalId = setInterval(async () => {
          const { timers } = get();
          let updated = false;

          const newTimers = timers.map(timer => {
            if (timer.isRunning && timer.remainingTime > 0) {
              updated = true;
              return {
                ...timer,
                remainingTime: timer.remainingTime - 1,
                completedAt: timer.remainingTime === 1 ? Date.now() : undefined,
              };
            }
            return timer;
          });

          if (updated) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTimers));
            set({ timers: newTimers });

            // Check for completed timers
            newTimers.forEach(timer => {
              if (timer.remainingTime === 0 && timer.isRunning) {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Audio.Sound.createAsync(
                    require('@/assets/sounds/timer-complete.mp3'),
                    { shouldPlay: true }
                  );
                }
              }
            });
          }

          // Clear interval if no running timers
          if (!newTimers.some(timer => timer.isRunning)) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to toggle timer:', error);
    }
  },

  resetTimer: async (id: string) => {
    try {
      const timers = get().timers.map(timer => {
        if (timer.id === id) {
          return {
            ...timer,
            isRunning: false,
            isPaused: false,
            remainingTime: timer.duration,
            completedAt: undefined,
          };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  },

  updateTimer: async (id: string, updates: Partial<Timer>) => {
    try {
      const timers = get().timers.map(timer => {
        if (timer.id === id) {
          return { ...timer, ...updates };
        }
        return timer;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      set({ timers });
    } catch (error) {
      console.error('Failed to update timer:', error);
    }
  },

  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export default useTimerStore;