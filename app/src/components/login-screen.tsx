import { useState, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";

import { Brand, Character } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappLink } from "@/lib/config";
import { useStore, type LoginError } from "@/lib/store";

const loginErrors: Record<LoginError, string> = {
  no_access:
    "Não encontramos uma compra ativa com este e-mail. Use o mesmo e-mail da compra ou fale com o suporte.",
  invalid_email: "Digite um e-mail válido.",
  failed: "Não foi possível entrar agora. Confira a internet e tente de novo.",
};

const isEmail = (value: string) => value.length <= 255 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

/** Entrada só com o e-mail da compra, no mesmo formato do login do Calm Kids e do CalmBaby. */
export function LoginScreen({ notice }: { notice?: string }) {
  const { login, devLogin } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(notice ?? "");
  const [busy, setBusy] = useState(false);
  const support = whatsappLink("Olá! Preciso de ajuda para acessar o app Código da Reconquista.");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!isEmail(value)) {
      setError(loginErrors.invalid_email);
      return;
    }
    setBusy(true);
    setError("");
    const result = await login(value);
    if (!result.ok) {
      setBusy(false);
      setError(loginErrors[result.error]);
    }
  };

  return (
    <main className="min-h-dvh bg-app-shell">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] md:shadow-app">
        <Brand compact />

        <section className="relative mt-4 h-[190px]">
          <div className="relative z-10 max-w-[60%] pt-6">
            <p className="eyebrow tracking-widest">Área de membros</p>
            <h1 className="mt-1 font-display text-[26px] font-black leading-[1.12]">
              Que bom ter você aqui.
            </h1>
          </div>
          <Character
            pose="acenando"
            className="pointer-events-none absolute -bottom-6 right-2 h-[220px] drop-shadow-[0_14px_16px_rgba(90,20,38,0.14)]"
          />
        </section>

        <section className="relative z-10 rounded-card bg-card p-5 shadow-soft">
          <p className="text-sm leading-6 text-muted-foreground">
            Digite o e-mail que você usou na compra para entrar no seu plano de 21 dias.
          </p>
          <form className="mt-4" onSubmit={(event) => void submit(event)} noValidate>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={255}
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className="h-12 rounded-xl bg-background pl-10 text-base"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            {error && (
              <p
                id="login-error"
                role="alert"
                className="mt-2 text-xs font-semibold text-destructive"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="mt-5 h-12 w-full rounded-xl text-sm font-bold"
            >
              {busy ? "Entrando…" : "Entrar"} <ArrowRight />
            </Button>
          </form>
          {support && (
            <a
              href={support}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center text-[13px] font-bold text-primary"
            >
              Precisa de ajuda? Fale com o suporte
            </a>
          )}
        </section>

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => {
              const value = email.trim().toLowerCase();
              if (!isEmail(value)) return setError(loginErrors.invalid_email);
              devLogin(value);
            }}
            className="mt-4 cursor-pointer rounded-card border-2 border-dashed border-border p-3 text-xs font-bold text-muted-foreground"
          >
            Teste local (só em desenvolvimento): entrar sem conferir a compra
          </button>
        )}

        <p className="mt-auto pt-8 text-center text-xs leading-5 text-muted-foreground">
          Seu acesso é pessoal. Ninguém além de você vê o seu Diário.
        </p>
      </div>
    </main>
  );
}
