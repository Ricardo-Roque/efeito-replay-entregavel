import type { AppLink } from "@/lib/app-link";
import { useJornada } from "@/lib/jornada/store";
import { useStore } from "@/lib/store";

/**
 * Completa o destino com o que só existe dentro do JornadaProvider: o Mapa sem diagnóstico vira
 * o diagnóstico, e "meu cenário" vira o cenário do perfil (ou o sugerido).
 */
export function useResolveLink() {
  const { data } = useStore();
  const { current, result } = useJornada();
  return (link: AppLink): AppLink => {
    if (link.kind === "map" && !current) return { kind: "diagnosis" };
    if (link.kind === "scenario" && !link.id) {
      const id = data.profile?.scenario ?? result?.scenario;
      return id ? { kind: "scenario", id } : link;
    }
    return link;
  };
}
