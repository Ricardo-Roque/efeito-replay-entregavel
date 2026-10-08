import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { ReconquistaApp } from "@/components/reconquista-app";
import { StoreProvider } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Código da Reconquista" },
      {
        name: "description",
        content:
          "Protocolo de 21 dias: controle emocional, comunicação leve e reconstrução gradual.",
      },
    ],
  }),
  component: Index,
});

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted-foreground">
      Carregando…
    </div>
  );
}

// Nesta fase os dados vêm do localStorage do navegador, então a tela só renderiza no cliente.
function Index() {
  return (
    <ClientOnly fallback={<Loading />}>
      <StoreProvider>
        <ReconquistaApp />
      </StoreProvider>
    </ClientOnly>
  );
}
