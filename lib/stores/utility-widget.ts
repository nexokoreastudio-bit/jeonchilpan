import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UtilityWidgetState {
  // Timer (seconds remaining)
  timerSeconds: number
  timerStartedAt: number | null
  setTimer: (minutes: number) => void
  clearTimer: () => void
  tick: () => number // returns remaining seconds

  // Random Picker
  pickerNames: string[]
  pickerResult: string | null
  setPickerNames: (names: string[]) => void
  addPickerName: (name: string) => void
  removePickerName: (index: number) => void
  pickRandom: () => string | null
  clearPickerResult: () => void
}

export const useUtilityWidgetStore = create<UtilityWidgetState>()(
  persist(
    (set, get) => ({
      timerSeconds: 0,
      timerStartedAt: null,

      setTimer: (minutes: number) => {
        const totalSeconds = minutes * 60
        set({
          timerSeconds: totalSeconds,
          timerStartedAt: Date.now(),
        })
      },

      clearTimer: () => set({ timerSeconds: 0, timerStartedAt: null }),

      tick: () => {
        const { timerSeconds, timerStartedAt } = get()
        if (timerSeconds <= 0 || !timerStartedAt) return 0
        const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000)
        const remaining = Math.max(0, timerSeconds - elapsed)
        set({
          timerSeconds: remaining,
          timerStartedAt: remaining > 0 ? timerStartedAt : null,
        })
        return remaining
      },

      pickerNames: [],
      pickerResult: null,

      setPickerNames: (names: string[]) =>
        set({ pickerNames: names, pickerResult: null }),

      addPickerName: (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set((s) => ({
          pickerNames: [...s.pickerNames, trimmed],
          pickerResult: null,
        }))
      },

      removePickerName: (index: number) =>
        set((s) => ({
          pickerNames: s.pickerNames.filter((_, i) => i !== index),
          pickerResult: null,
        })),

      pickRandom: () => {
        const { pickerNames } = get()
        if (pickerNames.length === 0) return null
        const idx = Math.floor(Math.random() * pickerNames.length)
        const result = pickerNames[idx]
        set({ pickerResult: result })
        return result
      },

      clearPickerResult: () => set({ pickerResult: null }),
    }),
    { name: 'nexo-utility-widget' }
  )
)
