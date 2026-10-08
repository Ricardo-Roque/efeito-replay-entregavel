// Arquivos de áudio do Reset (src/assets/audio/reset/<id>.mp3). Só existem depois de gravados;
// enquanto não existem, o player mostra o estado "em gravação" e a transcrição.
const files = import.meta.glob("/src/assets/audio/reset/*.{mp3,m4a}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export function audioUrl(id: string): string | null {
  const match = Object.entries(files).find(
    ([path]) => path.endsWith(`/${id}.mp3`) || path.endsWith(`/${id}.m4a`),
  );
  return match ? match[1] : null;
}
