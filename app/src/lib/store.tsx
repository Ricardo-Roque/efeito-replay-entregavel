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
import { SUPABASE_URL, supabase } from "@/lib/supabase";

// Entrada só com o e-mail da compra (função cr-login, igual ao CalmBaby): quem tem compra paga
// recebe uma sessão do Supabase. A cada abertura o app confere de novo se a compra continua ativa
// (reembolso tira o acesso). O progresso, o Diário e os rascunhos ainda ficam no localStorage deste
// aparelho, separados por e-mail; a API das ações é a mesma que a versão com tabelas cr_* vai usar.

export interface Profile {
  name: string;
  /** null até ela escolher um cenário (não há mais quiz na entrada). */
  scenario: ScenarioId | null;
  /** ISO: primeiro acesso (início do contador de dias sem impulso). */
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

export type StoreStatus = "loading" | "signed-out" | "no-access" | "error" | "ready";
export type LoginError = "no_access" | "invalid_email" | "failed";

const STORAGE_PREFIX = "codigo-reconquista:v1:";
/** Só em desenvolvimento: simula a compra do Reset Emocional do Ex. */
const DEV_RESET_KEY = "codigo-reconquista:dev-reset";
/** Só em desenvolvimento: entra sem servidor, para testar as telas localmente. */
const DEV_EMAIL_KEY = "codigo-reconquista:dev-email";
const EMPTY: AppData = { profile: null, completed: {}, journal: [] };

const storageKey = (email: string) => STORAGE_PREFIX + email;

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
function load(key: string): AppData {
  try {
    const raw = window.localStorage.getItem(key);
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

function persist(key: string, data: AppData) {
  window.localStorage.setItem(key, JSON.stringify(data));
}

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0]?.split(/[._-]/)[0] ?? "";
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Você";
};

/** Dados da conta: carrega do aparelho e, no primeiro acesso, cria o perfil com o nome da compra. */
function loadAccount(email: string, name: string | null): AppData {
  const key = storageKey(email);
  const data = load(key);
  if (data.profile) return data;
  const created: AppData = {
    ...data,
    profile: {
      name: name?.trim() || nameFromEmail(email),
      scenario: null,
      startedAt: new Date().toISOString(),
    },
  };
  try {
    persist(key, created);
  } catch {
    // Sem armazenamento (modo anônimo): segue só na memória.
  }
  return created;
}

/** Login só com o e-mail da compra: a função cr-login confere a compra e devolve um token que vira sessão. */
async function loginWithEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: LoginError }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/cr-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string; token_hash?: string };
    if (!body.ok || !body.token_hash) {
      return {
        ok: false,
        error: body.error === "no_access" || body.error === "invalid_email" ? body.error : "failed",
      };
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash: body.token_hash,
      type: "magiclink",
    });
    return error ? { ok: false, error: "failed" } : { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

const sortJournal = (journal: JournalEntry[]) =>
  [...journal].sort((a, b) => a.at.localeCompare(b.at));

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** O que a cliente comprou além do app (cr_my_entitlements no Supabase). */
export interface Entitlements {
  /** Upsell #01: Reset Emocional do Ex. */
  reset: boolean;
}

/** Lê as permissões. Se a função ainda não existir no banco, nada premium é liberado. */
async function loadEntitlements(): Promise<Entitlements> {
  const { data, error } = await supabase.rpc("cr_my_entitlements");
  if (error || !data) return { reset: false };
  return { reset: Boolean((data as { reset?: boolean }).reset) };
}

interface StoreValue {
  status: StoreStatus;
  email: string;
  entitlements: Entitlements;
  /** Só em desenvolvimento: liga/desliga a compra simulada do Reset. */
  devSetReset: (on: boolean) => void;
  data: AppData;
  reload: () => void;
  login: (email: string) => Promise<{ ok: true } | { ok: false; error: LoginError }>;
  /** Só em desenvolvimento (import.meta.env.DEV): entra com um e-mail sem consultar o servidor. */
  devLogin: (email: string) => void;
  signOut: () => Promise<void>;
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
  const [status, setStatus] = useState<StoreStatus>("loading");
  const [email, setEmail] = useState("");
  const [entitlements, setEntitlements] = useState<Entitlements>({ reset: false });
  const [data, setData] = useState<AppData>(EMPTY);
  const [toast, setToast] = useState<Toast | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const keyRef = useRef("");
  const loadingRef = useRef(0);

  const enter = useCallback((account: string, name: string | null) => {
    keyRef.current = storageKey(account);
    setEmail(account);
    setData(loadAccount(account, name));
    setStatus("ready");
  }, []);

  // Confere a sessão e se a compra continua ativa (o RLS só devolve o cadastro com compra paga).
  const reload = useCallback(async () => {
    const attempt = ++loadingRef.current;
    if (import.meta.env.DEV) {
      const devEmail = window.localStorage.getItem(DEV_EMAIL_KEY);
      if (devEmail) {
        setEntitlements({ reset: window.localStorage.getItem(DEV_RESET_KEY) === "1" });
        return enter(devEmail, null);
      }
    }
    const { data: session } = await supabase.auth.getSession();
    if (attempt !== loadingRef.current) return;
    if (!session.session) {
      setStatus("signed-out");
      return;
    }
    const { data: client, error } = await supabase
      .from("cr_clients")
      .select("email, name")
      .maybeSingle();
    if (attempt !== loadingRef.current) return;
    if (error) {
      console.error("Falha ao conferir o acesso", error);
      setStatus("error");
      return;
    }
    if (!client) {
      // Sessão válida mas sem compra ativa (reembolso, chargeback…).
      await supabase.auth.signOut();
      setStatus("no-access");
      return;
    }
    const granted = await loadEntitlements();
    if (attempt !== loadingRef.current) return;
    setEntitlements(granted);
    enter(String(client.email), (client.name as string | null) ?? null);
  }, [enter]);

  // Upsell comprado em outra aba (Payt): ao voltar para o app, atualiza o que foi liberado.
  useEffect(() => {
    if (status !== "ready" || import.meta.env.DEV) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadEntitlements().then(setEntitlements);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status]);

  useEffect(() => {
    void reload();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        loadingRef.current++;
        keyRef.current = "";
        setEmail("");
        setData(EMPTY);
        setStatus((current) => (current === "no-access" ? current : "signed-out"));
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [reload]);

  const showToast = useCallback(
    (text: string, kind: Toast["kind"] = "info") => setToast({ kind, text }),
    [],
  );
  const clearToast = useCallback(() => setToast(null), []);

  // Mesmo comportamento do CalmBaby: se não der para gravar, a tela não muda e aparece o aviso.
  const commit = useCallback((next: AppData) => {
    try {
      if (keyRef.current) persist(keyRef.current, next);
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
      if (keyRef.current && event.key === keyRef.current) setData(load(keyRef.current));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value: StoreValue = {
    status,
    email,
    entitlements,
    devSetReset: (on) => {
      if (!import.meta.env.DEV) return;
      if (on) window.localStorage.setItem(DEV_RESET_KEY, "1");
      else window.localStorage.removeItem(DEV_RESET_KEY);
      setEntitlements({ reset: on });
    },
    data,
    reload: () => void reload(),
    login: async (account) => {
      const result = await loginWithEmail(account);
      if (result.ok) await reload();
      return result;
    },
    devLogin: (account) => {
      if (!import.meta.env.DEV) return;
      window.localStorage.setItem(DEV_EMAIL_KEY, account);
      enter(account, null);
    },
    signOut: async () => {
      if (import.meta.env.DEV) window.localStorage.removeItem(DEV_EMAIL_KEY);
      await supabase.auth.signOut();
      keyRef.current = "";
      setEmail("");
      setEntitlements({ reset: false });
      setData(EMPTY);
      setStatus("signed-out");
    },
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
    /** Apaga o progresso, o Diário e os rascunhos desta conta neste aparelho (continua logada). */
    resetAll: () => {
      const name = dataRef.current.profile?.name ?? null;
      try {
        window.localStorage.removeItem(keyRef.current);
      } catch {
        setToast({ kind: "error", text: "Não foi possível apagar os dados deste aparelho." });
        return false;
      }
      setData(loadAccount(email, name));
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
