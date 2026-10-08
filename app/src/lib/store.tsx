import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { SignalKind } from "@/lib/guide";
import type { ScenarioId } from "@/lib/scenarios";

// Fase 1A: tudo fica no localStorage deste aparelho, sem login nem servidor.
// A API (data + ações que devolvem true/false) é a mesma do store do CalmBaby, para trocar
// o armazenamento por tabelas cr_* no Supabase sem mexer nas telas.

export interface Profile {
  name: string;
  breakup: string;
  scenario: ScenarioId;
  /** ISO: quando terminou o onboarding (início do contador de dias sem impulso). */
  startedAt: string;
}

export type EntryType = "mood" | "held" | "acted" | "contact" | "draft" | "signal" | "note";

export interface JournalEntry {
  id: string;
  type: EntryType;
  /** ISO */
  at: string;
  mood?: string;
  text?: string;
  /** Rascunho guardado pela Pausa: ISO de quando completa 24h. */
  readyAt?: string;
  signalKind?: SignalKind;
  signal?: string;
}

export interface AppData {
  profile: Profile | null;
  /** dia do plano -> ISO de quando foi concluído */
  completed: Record<number, string>;
  journal: JournalEntry[];
}

export type NewEntry = Omit<JournalEntry, "id" | "at"> & { at?: string };

interface Toast {
  kind: "error" | "info";
  text: string;
}

const STORAGE_KEY = "codigo-reconquista:v1";
const EMPTY: AppData = { profile: null, completed: {}, journal: [] };

/** uuid v4. crypto.randomUUID só existe em HTTPS/localhost; getRandomValues funciona em qualquer origem. */
export const newId = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Lê o que está salvo. Qualquer formato inesperado volta para o estado vazio, sem quebrar o app. */
function load(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY;
    const profile = isRecord(parsed["profile"]) ? (parsed["profile"] as unknown as Profile) : null;
    const completed = isRecord(parsed["completed"])
      ? (parsed["completed"] as Record<number, string>)
      : {};
    const journal = Array.isArray(parsed["journal"])
      ? (parsed["journal"] as JournalEntry[]).filter(
          (entry) =>
            isRecord(entry) && typeof entry.id === "string" && typeof entry.at === "string",
        )
      : [];
    return { profile, completed, journal };
  } catch {
    return EMPTY;
  }
}

function persist(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const sortJournal = (journal: JournalEntry[]) =>
  [...journal].sort((a, b) => a.at.localeCompare(b.at));

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

interface StoreValue {
  data: AppData;
  toast: Toast | null;
  showToast: (text: string, kind?: Toast["kind"]) => void;
  clearToast: () => void;
  saveProfile: (profile: Profile) => boolean;
  setScenario: (scenario: ScenarioId) => boolean;
  completeDay: (day: number) => boolean;
  addEntry: (entry: NewEntry) => boolean;
  deleteEntry: (id: string) => boolean;
  /** Liga/desliga um sinal no registro de hoje. */
  toggleSignal: (kind: SignalKind, signal: string) => boolean;
  resetAll: () => boolean;
  /** Só para teste local: empurra todas as datas N dias para trás, como se o tempo tivesse passado. */
  shiftDays: (days: number) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [toast, setToast] = useState<Toast | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const showToast = useCallback(
    (text: string, kind: Toast["kind"] = "info") => setToast({ kind, text }),
    [],
  );
  const clearToast = useCallback(() => setToast(null), []);

  // Mesmo comportamento do CalmBaby: se não der para gravar, a tela não muda e aparece o aviso.
  const commit = useCallback((next: AppData) => {
    try {
      persist(next);
    } catch {
      setToast({
        kind: "error",
        text: "Não foi possível salvar neste aparelho. Confira se o navegador não está em modo anônimo ou sem espaço.",
      });
      return false;
    }
    setData(next);
    return true;
  }, []);

  // Outra aba do mesmo navegador mudou os dados: recarrega.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setData(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value: StoreValue = {
    data,
    toast,
    showToast,
    clearToast,
    saveProfile: (profile) => commit({ ...dataRef.current, profile }),
    setScenario: (scenario) => {
      const profile = dataRef.current.profile;
      if (!profile) return false;
      return commit({ ...dataRef.current, profile: { ...profile, scenario } });
    },
    completeDay: (day) => {
      if (dataRef.current.completed[day]) return true;
      return commit({
        ...dataRef.current,
        completed: { ...dataRef.current.completed, [day]: new Date().toISOString() },
      });
    },
    addEntry: (entry) => {
      const { at, ...rest } = entry;
      const created: JournalEntry = { ...rest, id: newId(), at: at ?? new Date().toISOString() };
      let journal = dataRef.current.journal;
      // Um humor por dia: o novo substitui o de hoje.
      if (created.type === "mood") {
        const now = new Date(created.at);
        journal = journal.filter(
          (item) => !(item.type === "mood" && sameDay(new Date(item.at), now)),
        );
      }
      return commit({ ...dataRef.current, journal: sortJournal([...journal, created]) });
    },
    deleteEntry: (id) =>
      commit({
        ...dataRef.current,
        journal: dataRef.current.journal.filter((item) => item.id !== id),
      }),
    toggleSignal: (kind, signal) => {
      const now = new Date();
      const existing = dataRef.current.journal.find(
        (item) =>
          item.type === "signal" && item.signal === signal && sameDay(new Date(item.at), now),
      );
      if (existing) return value.deleteEntry(existing.id);
      return value.addEntry({ type: "signal", signalKind: kind, signal });
    },
    resetAll: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        setToast({ kind: "error", text: "Não foi possível apagar os dados deste aparelho." });
        return false;
      }
      setData(EMPTY);
      return true;
    },
    shiftDays: (days) => {
      const ms = days * 24 * 60 * 60 * 1000;
      const back = (iso: string) => new Date(new Date(iso).getTime() - ms).toISOString();
      const current = dataRef.current;
      return commit({
        profile: current.profile
          ? { ...current.profile, startedAt: back(current.profile.startedAt) }
          : null,
        completed: Object.fromEntries(
          Object.entries(current.completed).map(([day, iso]) => [day, back(iso)]),
        ),
        journal: current.journal.map((item) => ({
          ...item,
          at: back(item.at),
          ...(item.readyAt ? { readyAt: back(item.readyAt) } : {}),
        })),
      });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore precisa estar dentro de StoreProvider");
  return context;
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
export const initialsOf = (name: string) => name.trim().charAt(0).toUpperCase() || "C";
