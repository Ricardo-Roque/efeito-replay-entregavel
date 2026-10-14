import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DIAGNOSIS_VERSION } from "@/lib/jornada/diagnosis";
import { buildDiagnosisResult } from "@/lib/jornada/map";
import {
  EMPTY_JORNADA,
  first48SetChoice,
  first48Start,
  first48ToggleActivity,
  first48ToggleCheck,
  jornadaKey,
  planToggleCheck,
  parseJornada,
} from "@/lib/jornada/persist";
import type {
  DiagnosisAnswers,
  DiagnosisRecord,
  DiagnosisResult,
  First48ActivityId,
  First48ChoiceId,
  JornadaData,
} from "@/lib/jornada/types";
import { newId, useStore } from "@/lib/store";

// Dados do diagnóstico, do Meu Plano de 48 Horas, da central de mensagens e do checklist do plano. Mesmo modelo do Reset:
// localStorage deste aparelho, separado por e-mail, numa chave própria. Não mexe na chave do app
// principal (codigo-reconquista:v1:<email>) nem na do Reset, então nada do que já existe muda de
// formato. Respostas são pessoais: não vão para servidor, log ou URL.
//
// Montado em ReconquistaApp, dentro do StoreProvider, só com a conta pronta (lê o e-mail).
// Refazer o diagnóstico só acrescenta um registro aqui: Diário e dias do plano ficam na chave
// principal e nunca são tocados por este store. As atividades concluídas das 48 horas também
// ficam como estão (ver reviewOf em first48.ts).

const keyOf = jornadaKey;
const EMPTY = EMPTY_JORNADA;

function readJornada(email: string): JornadaData {
  try {
    return parseJornada(window.localStorage.getItem(keyOf(email)));
  } catch {
    return EMPTY;
  }
}

type Updater = (data: JornadaData) => JornadaData;

interface JornadaStore {
  data: JornadaData;
  /** Último diagnóstico feito, se existir. */
  current: DiagnosisRecord | null;
  /** Resultado calculado do diagnóstico atual (não é gravado: muda junto com as regras). */
  result: DiagnosisResult | null;
  update: (fn: Updater) => boolean;
  /** Grava o diagnóstico concluído e descarta o rascunho. */
  saveDiagnosis: (answers: DiagnosisAnswers) => boolean;
  /** Guarda o diagnóstico em andamento (pergunta atual e respostas até aqui). */
  saveDraft: (step: number, answers: Partial<DiagnosisAnswers>) => boolean;
  discardDraft: () => boolean;
  /** Grava a hora em que ela abriu o plano pela primeira vez (não faz nada nas outras vezes). */
  startFirst48: () => boolean;
  toggleFirst48Check: (id: string) => boolean;
  /** Marca ou desmarca a atividade, guardando o diagnóstico que valia na hora. */
  toggleFirst48Activity: (id: First48ActivityId) => boolean;
  setFirst48Choice: (id: First48ChoiceId) => boolean;
  toggleFavorite: (templateId: string) => boolean;
  /** Marca ou desmarca um item do checklist do plano de 21 dias. */
  togglePlanCheck: (id: string) => boolean;
  markUsed: (templateId: string) => boolean;
  /** Apaga só os dados da jornada deste aparelho. */
  clear: () => boolean;
}

const Ctx = createContext<JornadaStore | null>(null);

export function JornadaProvider({ children }: { children: ReactNode }) {
  const { email, showToast, addEntry } = useStore();
  const [data, setData] = useState<JornadaData>(() => readJornada(email));
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => setData(readJornada(email)), [email]);

  // Outra aba do mesmo navegador mudou os dados: recarrega (mesmo comportamento do store principal).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (email && event.key === keyOf(email)) setData(readJornada(email));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [email]);

  const update = useCallback(
    (fn: Updater) => {
      const before = ref.current;
      const next = fn(before);
      if (next === before) return true;
      try {
        if (email) window.localStorage.setItem(keyOf(email), JSON.stringify(next));
      } catch {
        showToast(
          "Não foi possível salvar neste aparelho. Confira se o navegador não está em modo anônimo ou sem espaço.",
          "error",
        );
        return false;
      }
      ref.current = next;
      setData(next);
      return true;
    },
    [email, showToast],
  );

  const current = data.diagnoses[data.diagnoses.length - 1] ?? null;
  const result = useMemo(() => (current ? buildDiagnosisResult(current.answers) : null), [current]);

  const toggleIn = (map: Record<string, string>, id: string) => {
    if (map[id]) {
      const { [id]: _removed, ...rest } = map;
      return rest;
    }
    return { ...map, [id]: new Date().toISOString() };
  };

  const value: JornadaStore = {
    data,
    current,
    result,
    update,
    // Cada diagnóstico concluído também vira um registro no Diário (situação e ponto de atenção).
    saveDiagnosis: (answers) => {
      const first = ref.current.diagnoses.length === 0;
      const ok = update(({ diagnosisDraft: _draft, ...d }) => ({
        ...d,
        diagnoses: [
          ...d.diagnoses,
          { id: newId(), at: new Date().toISOString(), version: DIAGNOSIS_VERSION, answers },
        ],
      }));
      if (ok) {
        const map = buildDiagnosisResult(answers);
        addEntry({
          type: "note",
          source: "diagnostico",
          text: `${first ? "Fiz o meu diagnóstico" : "Refiz o meu diagnóstico"}. ${map.headline}
Ponto de atenção: ${map.attention.title}.`,
        });
      }
      return ok;
    },
    saveDraft: (step, answers) =>
      update((d) => ({ ...d, diagnosisDraft: { at: new Date().toISOString(), step, answers } })),
    discardDraft: () =>
      update((d) => {
        if (!d.diagnosisDraft) return d;
        const { diagnosisDraft: _draft, ...rest } = d;
        return rest;
      }),
    startFirst48: () => update((d) => first48Start(d, new Date().toISOString())),
    toggleFirst48Check: (id) => update((d) => first48ToggleCheck(d, id, new Date().toISOString())),
    toggleFirst48Activity: (id) =>
      current
        ? update((d) => first48ToggleActivity(d, id, current.id, new Date().toISOString()))
        : false,
    setFirst48Choice: (id) =>
      current
        ? update((d) => first48SetChoice(d, id, current.id, new Date().toISOString()))
        : false,
    toggleFavorite: (templateId) =>
      update((d) => ({
        ...d,
        messages: { ...d.messages, favorites: toggleIn(d.messages.favorites, templateId) },
      })),
    togglePlanCheck: (id) => update((d) => planToggleCheck(d, id, new Date().toISOString())),
    markUsed: (templateId) =>
      update((d) => ({
        ...d,
        messages: {
          ...d.messages,
          usedAt: { ...d.messages.usedAt, [templateId]: new Date().toISOString() },
        },
      })),
    clear: () => {
      try {
        if (email) window.localStorage.removeItem(keyOf(email));
      } catch {
        showToast("Não foi possível apagar os dados deste aparelho.", "error");
        return false;
      }
      ref.current = EMPTY;
      setData(EMPTY);
      return true;
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJornada() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useJornada precisa estar dentro de JornadaProvider");
  return ctx;
}
