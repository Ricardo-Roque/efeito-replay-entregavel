import { useState } from "react";
import {
  ChevronRight,
  FastForward,
  LogOut,
  Pencil,
  Phone,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { ProfileAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappLink } from "@/lib/config";
import { BENEFIT_IDS, BENEFITS, accessLabel, benefitAccess } from "@/lib/benefits";
import { careLines } from "@/lib/guide";
import { first48Progress } from "@/lib/jornada/first48";
import { useJornada } from "@/lib/jornada/store";
import { moreIcons } from "@/lib/icons";
import { planProgress } from "@/lib/progress";
import { scenarioById } from "@/lib/scenarios";
import { initialsOf, useStore } from "@/lib/store";

type Modal = "profile" | "install" | "privacy" | "care" | "reset" | "logout" | null;

const dialogClass = "w-[calc(100%-2rem)] rounded-2xl border-border sm:max-w-md";

/** Mesma aba Perfil do CalmBaby: cartão do perfil, menu em lista, diálogos e "Sair".
 * "Recomeçar do zero" apaga o progresso desta conta neste aparelho. */
export function MoreScreen({
  openScenarios,
  openRules,
  openReset,
  openDiagnosis,
  openMap,
  openFirst48,
  openCentral,
  openProgress,
  openBenefits,
}: {
  openScenarios: () => void;
  openRules: () => void;
  openReset: () => void;
  openDiagnosis: () => void;
  openMap: () => void;
  openFirst48: () => void;
  openCentral: () => void;
  openProgress: () => void;
  openBenefits: () => void;
}) {
  const {
    data,
    email,
    entitlements,
    saveProfile,
    resetAll,
    signOut,
    shiftDays,
    showToast,
    devSetReset,
    devSetBenefit,
  } = useStore();
  const jornada = useJornada();
  const profile = data.profile!;
  const progress = planProgress(data);
  const support = whatsappLink("Olá! Preciso de ajuda com o app Código da Reconquista.");
  const [modal, setModal] = useState<Modal>(null);
  const [draftName, setDraftName] = useState(profile.name);

  const menu: { label: string; icon: LucideIcon; detail?: string; onClick: () => void }[] = [
    {
      label: "Meu Mapa de Reconquista",
      icon: moreIcons.diagnosis,
      detail: jornada.current ? "Ver ou refazer" : "Fazer diagnóstico",
      onClick: jornada.current ? openMap : openDiagnosis,
    },
    // Só depois do diagnóstico: o plano das 48 horas é montado a partir dele.
    ...(jornada.current
      ? [
          {
            label: "Meu Plano de 48 Horas",
            icon: moreIcons.first48,
            detail: (() => {
              const progress = first48Progress(jornada.data.first48);
              return progress.complete ? "Concluído" : `${progress.done} de ${progress.total}`;
            })(),
            onClick: openFirst48,
          },
        ]
      : []),
    {
      label: "Meu progresso",
      icon: moreIcons.progress,
      detail: `${progress.total} de 21 dias`,
      onClick: openProgress,
    },
    {
      label: "Central de Comunicação",
      icon: moreIcons.central,
      detail: (() => {
        const count = Object.keys(jornada.data.messages.favorites).length;
        return count === 0 ? "" : count === 1 ? "1 favorito" : `${count} favoritos`;
      })(),
      onClick: openCentral,
    },
    {
      label: "Meu cenário",
      icon: moreIcons.scenario,
      detail: profile.scenario ? scenarioById(profile.scenario).label : "Escolher",
      onClick: openScenarios,
    },
    { label: "Regras de ouro", icon: moreIcons.rules, onClick: openRules },
    { label: "Meus Benefícios", icon: moreIcons.benefits, onClick: () => openBenefits() },
    // Reset Emocional do Ex: oferta antiga, fora das ofertas atuais. Só aparece para quem já comprou.
    ...(entitlements.reset
      ? [
          {
            label: "Reset Emocional do Ex",
            icon: moreIcons.reset,
            detail: "Liberado",
            onClick: openReset,
          },
        ]
      : []),
    // Suporte só aparece com número configurado (VITE_SUPPORT_WHATSAPP): nenhum botão sem destino.
    ...(support
      ? [
          {
            label: "Suporte",
            icon: moreIcons.support,
            onClick: () => window.open(support, "_blank", "noopener"),
          },
        ]
      : []),
    { label: "Instalar app", icon: moreIcons.install, onClick: () => setModal("install") },
    { label: "Privacidade", icon: moreIcons.privacy, onClick: () => setModal("privacy") },
    {
      label: "Apoio emocional",
      icon: moreIcons.care,
      detail: "CVV 188",
      onClick: () => setModal("care"),
    },
  ];

  return (
    <div className="px-5 pb-32 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-black">Perfil</h1>

      <section className="mt-6 flex items-center gap-4 rounded-card bg-card p-5 shadow-soft">
        <ProfileAvatar initials={initialsOf(profile.name)} className="size-16 text-lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold">{profile.name}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {progress.finished
              ? "Plano concluído"
              : `Dia ${progress.currentDay} de 21 · Fase ${progress.phase.phase}`}
          </p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
        <button
          type="button"
          aria-label="Editar perfil"
          onClick={() => {
            setDraftName(profile.name);
            setModal("profile");
          }}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-input bg-background text-foreground shadow-sm hover:bg-accent"
        >
          <Pencil className="size-4" />
        </button>
      </section>

      <div className="mt-5 overflow-hidden rounded-card bg-card shadow-soft">
        {menu.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex w-full cursor-pointer items-center gap-4 border-b border-border px-5 py-4 text-left last:border-b-0 hover:bg-muted"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <item.icon className="size-5" />
            </span>
            <span className="flex-1 text-sm font-bold">{item.label}</span>
            {item.detail && (
              <span className="max-w-[40%] truncate text-xs font-bold text-muted-foreground">
                {item.detail}
              </span>
            )}
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-5 h-12 w-full justify-start rounded-xl px-5 text-destructive hover:bg-destructive-soft hover:text-destructive"
        onClick={() => setModal("logout")}
      >
        <LogOut /> Sair
      </Button>
      <button
        type="button"
        onClick={() => setModal("reset")}
        className="mt-1 flex w-full cursor-pointer items-center gap-2 px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-3.5" /> Recomeçar o plano do zero neste aparelho
      </button>

      {import.meta.env.DEV && (
        <section className="mt-6 rounded-card border-2 border-dashed border-border p-4">
          <p className="eyebrow">Teste local (só aparece em desenvolvimento)</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            Os dias liberam no dia seguinte do calendário. Para testar a jornada sem esperar, simule
            a passagem de um dia.
          </p>
          <Button
            variant="outline"
            className="mt-3 h-10 w-full rounded-xl bg-card font-bold"
            onClick={() => shiftDays(1) && showToast("Um dia a mais se passou (simulação).")}
          >
            <FastForward /> Simular a passagem de 1 dia
          </Button>
          <Button
            variant="outline"
            className="mt-2 h-10 w-full rounded-xl bg-card font-bold"
            onClick={() => devSetReset(!entitlements.reset)}
          >
            {entitlements.reset ? "Remover compra simulada do Reset" : "Simular compra do Reset"}
          </Button>
          {/* Cada toque passa para o próximo estado: pendente, liberado, não adquirido. */}
          {BENEFIT_IDS.map((id) => {
            const grant = entitlements.benefits[id];
            const next = grant === null ? true : grant ? false : null;
            return (
              <Button
                key={id}
                variant="outline"
                className="mt-2 h-auto min-h-10 w-full whitespace-normal rounded-xl bg-card py-2 font-bold"
                onClick={() => devSetBenefit(id, next)}
              >
                {BENEFITS[id].name}: {accessLabel[id][benefitAccess(grant)]}
              </Button>
            );
          })}
          {jornada.data.first48.startedAt && (
            <Button
              variant="outline"
              className="mt-2 h-10 w-full rounded-xl bg-card font-bold"
              onClick={() =>
                jornada.update((d) => ({
                  ...d,
                  first48: {
                    ...d.first48,
                    startedAt: new Date(
                      new Date(d.first48.startedAt ?? Date.now()).getTime() - 24 * 60 * 60 * 1000,
                    ).toISOString(),
                  },
                })) && showToast("Plano de 48 horas: 24 horas a mais (simulação).")
              }
            >
              <FastForward /> Simular 24 horas no plano de 48 horas
            </Button>
          )}
        </section>
      )}

      <Dialog open={modal === "profile"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Editar perfil</DialogTitle>
            <DialogDescription>Como você quer ser chamada no app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Seu nome</Label>
            <Input
              id="profile-name"
              maxLength={30}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="h-11 rounded-xl text-base"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="h-11 rounded-xl">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              className="h-11 rounded-xl"
              disabled={!draftName.trim()}
              onClick={() => saveProfile({ ...profile, name: draftName.trim() }) && setModal(null)}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "install"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Instalar o app</DialogTitle>
            <DialogDescription className="leading-6">
              No iPhone, toque em Compartilhar e depois em "Adicionar à Tela de Início". No Android,
              abra o menu do navegador e escolha "Instalar app" ou "Adicionar à tela inicial".
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "privacy"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Privacidade</DialogTitle>
            <DialogDescription className="leading-6">
              Você entra com o e-mail da compra. O seu Diário, os rascunhos e o seu progresso ficam
              salvos só neste aparelho. Nada é enviado para ninguém, e o app nunca manda mensagens
              por você. Para apagar tudo, use "Recomeçar o plano do zero".
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "care"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Apoio emocional</DialogTitle>
            <DialogDescription className="leading-6">
              Se a dor estiver pesada demais, fale com alguém agora. Se você vive ou viveu uma
              relação com violência, procure ajuda especializada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5">
            {careLines.map((line) => (
              <a
                key={line.phone}
                href={`tel:${line.phone}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Phone className="size-5" />
                </span>
                <span className="flex-1 text-sm font-semibold">{line.label}</span>
                <span className="font-display text-xl font-black text-primary">{line.phone}</span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "reset"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Recomeçar do zero?</DialogTitle>
            <DialogDescription>
              Isso apaga o seu progresso, o Diário, os rascunhos, o diagnóstico e o plano de 48
              horas deste aparelho. Não dá para desfazer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="h-11 rounded-xl">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="h-11 rounded-xl"
              // O diagnóstico fica numa chave própria: apaga junto, para "do zero" valer para tudo.
              onClick={() => resetAll() && jornada.clear() && setModal(null)}
            >
              Apagar e recomeçar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "logout"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Sair do app?</DialogTitle>
            <DialogDescription>
              Seu progresso continua salvo neste aparelho. Para entrar de novo, use o e-mail da
              compra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="h-11 rounded-xl">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="h-11 rounded-xl"
              onClick={() => void signOut()}
            >
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
