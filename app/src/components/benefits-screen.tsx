import type { ReactNode } from "react";
import { ArrowRight, Check, ChevronRight, RefreshCw } from "lucide-react";

import { EmojiBadge, Overlay, SectionTitle } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  BENEFITS,
  CIRCLE_RULES,
  COUNSELOR_NOTE,
  LIFETIME_ITEMS,
  accessLabel,
  benefitAccess,
  benefitConfig,
  counselorLink,
  type BenefitAccess,
  type BenefitId,
  type LifetimeItemStatus,
} from "@/lib/benefits";
import { checkoutLink, whatsappLink } from "@/lib/config";
import type { EmojiName } from "@/lib/illustrations";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const pillClass: Record<BenefitAccess, string> = {
  liberado: "bg-tint-sage",
  nao_adquirido: "bg-muted text-muted-foreground",
  pendente: "bg-tint-honey",
};

function Pill({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6">
          <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[13px] leading-5 text-muted-foreground">{children}</p>;
}

/** Card de um benefício: cabeçalho com status e o conteúdo de cada estado. */
function BenefitCard({
  id,
  emoji,
  tint,
  access,
  children,
}: {
  id: BenefitId;
  emoji: EmojiName;
  tint: "rose" | "honey" | "sage" | "lavender";
  access: BenefitAccess;
  children: ReactNode;
}) {
  const info = BENEFITS[id];
  return (
    <section className="mt-4 rounded-card bg-card p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <EmojiBadge name={emoji} tint={tint} size="lg" />
        <div className="min-w-0 flex-1">
          <Pill className={pillClass[access]}>{accessLabel[id][access]}</Pill>
          <h2 className="mt-2 font-display text-[17px] font-extrabold leading-tight">
            {info.title}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{info.description}</p>
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-[12px] font-bold leading-5 text-muted-foreground">
        {info.format}
      </p>
      {children}
    </section>
  );
}

/** Sem compra confirmada: o que a oferta inclui e, se houver checkout configurado, o link. */
function OfferView({ id, access }: { id: BenefitId; access: BenefitAccess }) {
  const { email, reload } = useStore();
  const buy = checkoutLink(benefitConfig[id].checkoutUrl, email);
  const support = whatsappLink(
    `Olá! Comprei o ${BENEFITS[id].name} e quero confirmar o meu acesso. Meu e-mail de acesso é ${email}.`,
  );
  return (
    <>
      <List items={BENEFITS[id].promises} />
      {access === "pendente" && (
        <Note>
          O app ainda não consegue confirmar este benefício. Se você adquiriu, fale com o suporte
          informando o e-mail da compra.
        </Note>
      )}
      <div className="mt-4 space-y-2">
        {buy && (
          <Button asChild className="h-11 w-full rounded-xl font-bold">
            <a href={buy} target="_blank" rel="noreferrer">
              Conhecer a oferta <ArrowRight />
            </a>
          </Button>
        )}
        {access === "pendente" && (
          <>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl bg-card font-bold"
              onClick={reload}
            >
              <RefreshCw /> Já comprei: atualizar meu acesso
            </Button>
            {support && (
              <Button asChild variant="ghost" className="h-11 w-full font-bold text-primary">
                <a href={support} target="_blank" rel="noreferrer">
                  Falar com o suporte
                </a>
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function CounselorCard({ access }: { access: BenefitAccess }) {
  const { email } = useStore();
  const { whatsapp, hours } = benefitConfig.conselheiro;
  const chat = counselorLink(whatsapp, email);
  return (
    <BenefitCard id="conselheiro" emoji="escrever" tint="rose" access={access}>
      {access === "liberado" ? (
        <>
          <p className="mt-4 text-sm font-extrabold">Como funciona</p>
          <List
            items={[
              "Conte a sua história com calma: o que aconteceu, como está o contato e o que você já tentou.",
              "Peça ajuda para entender uma resposta ou uma atitude dele antes de reagir.",
              "Antes de enviar uma mensagem, pergunte se é o momento e quais palavras usar.",
              "Conforme a situação muda, os próximos passos são ajustados com você.",
            ]}
          />
          <Note>
            {hours ||
              "Os horários e as condições do atendimento serão informados aqui assim que forem definidos."}
          </Note>
          <Note>{COUNSELOR_NOTE}</Note>
          {chat ? (
            <Button asChild className="mt-4 h-11 w-full rounded-xl font-bold">
              <a href={chat} target="_blank" rel="noreferrer">
                Conversar no WhatsApp <ArrowRight />
              </a>
            </Button>
          ) : (
            <Note>
              O canal de atendimento ainda está sendo configurado e aparece aqui em breve.
            </Note>
          )}
        </>
      ) : (
        <>
          <OfferView id="conselheiro" access={access} />
          <Note>{COUNSELOR_NOTE}</Note>
        </>
      )}
    </BenefitCard>
  );
}

function CircleCard({ access }: { access: BenefitAccess }) {
  const { url } = benefitConfig.circulo;
  return (
    <BenefitCard id="circulo" emoji="estrela" tint="lavender" access={access}>
      {access === "liberado" ? (
        <>
          <p className="mt-4 text-sm font-extrabold">Como entrar</p>
          <Note>
            Toque em "Acessar comunidade" e siga as instruções da plataforma. Você não precisa usar
            o seu nome completo nem contar nada que não queira.
          </Note>
          <p className="mt-4 text-sm font-extrabold">Combinados do Círculo</p>
          <List items={CIRCLE_RULES} />
          {url ? (
            <Button asChild className="mt-4 h-11 w-full rounded-xl font-bold">
              <a href={url} target="_blank" rel="noreferrer">
                Acessar comunidade <ArrowRight />
              </a>
            </Button>
          ) : (
            <Note>O acesso à comunidade ainda está sendo configurado e aparece aqui em breve.</Note>
          )}
        </>
      ) : (
        <OfferView id="circulo" access={access} />
      )}
    </BenefitCard>
  );
}

const itemPill: Record<LifetimeItemStatus, { label: string; className: string }> = {
  disponivel: { label: "Disponível", className: "bg-tint-sage" },
  nao_cadastrado: { label: "Ainda não cadastrado", className: "bg-tint-honey" },
  futuro: { label: "Em breve", className: "bg-muted text-muted-foreground" },
};

function LifetimeCard({ access, onClose }: { access: BenefitAccess; onClose: () => void }) {
  return (
    <BenefitCard id="vitalicio" emoji="trofeu" tint="honey" access={access}>
      {access === "liberado" ? (
        <>
          <p className="mt-4 text-sm font-extrabold">Seus materiais</p>
          <ul className="mt-3 space-y-2">
            {LIFETIME_ITEMS.map((item) => (
              <li key={item.title} className="rounded-xl border border-border px-4 py-3">
                <Pill className={itemPill[item.status].className}>
                  {itemPill[item.status].label}
                </Pill>
                <p className="mt-1.5 text-sm font-extrabold">{item.title}</p>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{item.detail}</p>
                {item.status === "disponivel" && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[12px] font-extrabold text-primary"
                  >
                    Abrir <ChevronRight className="size-3.5" strokeWidth={3} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <Note>
            Seu acesso atual: o Código da Reconquista está liberado pela sua compra. O Acesso Total
            Vitalício é uma modalidade à parte, sem mensalidade nem renovação.
          </Note>
          <OfferView id="vitalicio" access={access} />
        </>
      )}
    </BenefitCard>
  );
}

/**
 * Meus Benefícios: os três upsells atuais, cada um com o estado que o servidor confirma.
 * O Reset Emocional do Ex (oferta antiga) só aparece para quem já comprou.
 */
export function BenefitsScreen({
  onClose,
  openReset,
}: {
  onClose: () => void;
  openReset: () => void;
}) {
  const { entitlements } = useStore();
  const access = (id: BenefitId) => benefitAccess(entitlements.benefits[id]);

  return (
    <Overlay eyebrow="Perfil" title="Meus Benefícios" onClose={onClose}>
      <p className="text-sm leading-6 text-muted-foreground">
        Os benefícios adicionais da sua conta. Cada um é liberado separadamente, pelo e-mail da
        compra.
      </p>
      <CounselorCard access={access("conselheiro")} />
      <CircleCard access={access("circulo")} />
      <LifetimeCard access={access("vitalicio")} onClose={onClose} />

      {entitlements.reset && (
        <>
          <SectionTitle>Outros conteúdos da sua conta</SectionTitle>
          <button
            type="button"
            onClick={openReset}
            className="flex w-full cursor-pointer items-center gap-4 rounded-card bg-card p-5 text-left shadow-soft"
          >
            <EmojiBadge name="brilho" tint="lavender" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-extrabold">
                Reset Emocional do Ex
              </span>
              <span className="mt-0.5 block text-[13px] text-success">Liberado</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </>
      )}
    </Overlay>
  );
}
