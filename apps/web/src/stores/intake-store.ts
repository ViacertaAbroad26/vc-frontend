import { create } from "zustand";

type IntakeState = {
  buffer: Record<string, unknown>;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  setAnswer: (id: string, value: unknown) => void;
  markSaved: () => void;
  markSavingStart: () => void;
  reset: () => void;
};

export const useIntakeStore = create<IntakeState>((set) => ({
  buffer: {},
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  setAnswer: (id, value) =>
    set((s) => ({ buffer: { ...s.buffer, [id]: value }, isDirty: true })),
  markSavingStart: () => set({ isSaving: true }),
  markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: Date.now() }),
  reset: () => set({ buffer: {}, isDirty: false, isSaving: false, lastSavedAt: null }),
}));
