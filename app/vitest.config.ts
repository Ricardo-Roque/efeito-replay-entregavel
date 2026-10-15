// Testes das regras puras (lib/). Config própria, sem os plugins do app (Start, Nitro, Tailwind).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // As matrizes de segurança percorrem milhares de combinações válidas do diagnóstico.
  test: { include: ["src/**/*.test.ts"], environment: "node", testTimeout: 15_000 },
});
