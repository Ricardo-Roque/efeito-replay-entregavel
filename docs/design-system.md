# Código da Reconquista: design system (Fase 0)

> **Atualização (Fase 1A, visual):** o app passou a seguir o visual do Calm Kids e do GoodKids, a pedido do dono.
> - Fonte Nunito (black/extrabold nos títulos).
> - Cards bem arredondados, tiles com ilustração 3D, card de meta em degradê e trilha com nós grandes.
> - Emojis 3D Fluent (MIT) no lugar dos ícones de traço.
> - Cores do funil: vinho no texto, framboesa #B3123F na ação, fundo rosado #FDF5F4 e mel de destaque.
>
> A fonte da verdade agora é `app/src/styles.css`. O que segue abaixo (serifa Playfair, dourado, emblemas em numeral romano) documenta a proposta da Fase 0 e não vale mais para o app.

A ideia é manter a UX que já funciona no CalmBaby e no Calm Kids e trocar só três coisas: a identidade visual, o conteúdo e a lógica de produto. A referência visual de tudo é `design/style-guide.html`. Para ver cada tela inteira, sem precisar rolar dentro do celular, abra com `?inteiras` no fim do endereço.

## Arquivos

| Arquivo | O que é | Destino na Fase 1 |
|---|---|---|
| `design/tokens.css` | Fontes, cores, sombras e raios, com os mesmos nomes semânticos do `styles.css` do CalmBaby | `src/styles.css` |
| `design/icons.ts` | Mapa de ícones lucide: abas, cenários, fases, ferramentas e menu | `src/lib/icons.ts` |
| `design/content-draft.js` | Conteúdo como dado: fases, 21 dias, marcos, cenários, sinais, checklist da Pausa e regras | ponto de partida de `src/lib/plan.ts`, `scenarios.ts` e `pause.ts` |
| `design/style-guide.html` | Mockups das telas, montados a partir de `content-draft.js` | só referência, não vai para o app |
| `design/scripts/build-brand.py` | Gera logo, monograma, ícones do PWA, emblemas e medalhas | rodar de novo se a marca mudar |
| `brand/` | Fontes (woff2), SVGs com o texto em contorno e PNGs do PWA | `public/` e `src/assets/` |

## Cores

Os valores ficam em `oklch` (padrão do CalmBaby). Os hex abaixo servem de referência.

| Token | Hex | Uso |
|---|---|---|
| `--brand-wine` / `--primary` | #5A1426 | botões, títulos, item ativo da navegação |
| `--brand-wine-deep` | #3D0D1A | cards de ênfase (degradê com o vinho) e faixa lateral da marca |
| `--brand-gold` | #B08A4F | filetes, ícones, títulos grandes, trilha percorrida |
| `--brand-gold-light` | #D9B97A | dourado em cima do vinho |
| `--gold-ink` | #8A6A35 | rótulos pequenos em dourado (4.7:1 sobre o fundo) |
| `--background` | #FBF7F1 | fundo |
| `--brand-cream` / `--muted` | #F3EADF | superfícies, blocos, estado bloqueado |
| `--card` | #FFFDF9 | cards |
| `--foreground` | #2A1419 | texto |
| `--muted-foreground` | #6E5A5E | texto de apoio |
| `--success` | sálvia | concluído e sinais de abertura |
| `--primary-soft` | #F4E4E6 | alertas de cenário e sinais de alerta |
| `--destructive` | #B4232C | só erro de sistema |

Regras:

- Não use dourado `--brand-gold` em texto pequeno, porque o contraste fica em 3:1. Para isso existe o `--gold-ink`.
- "Alerta" no conteúdo (bloqueio, outra pessoa, sinais de alerta) é sempre vinho suave, nunca vermelho de erro.
- Não espalhe cores pelos componentes. Use os tokens.

## Tipografia

- **Playfair Display** (700) para títulos, numerais e citações (no itálico). É a serifa de alto contraste do PDF.
- **Figtree** para o texto, a mesma fonte do funil.
- Texto de leitura com 15 a 16px no mínimo e entrelinha de 1.55 a 1.6.
- Rótulos em Figtree 700, caixa alta, espaçamento de 0.18em e cor `--gold-ink`.
- Títulos em duas cores, como no PDF: a primeira parte em vinho e a segunda em dourado. Use só em títulos grandes (hero, cabeçalhos de seção).
- As fontes ficam salvas no projeto (`brand/fonts/`), para o PWA funcionar sem internet.

## Correspondência de componentes

| CalmBaby / Calm Kids | Código da Reconquista |
|---|---|
| `BottomNav` com 4 abas | 3 abas visíveis: Início, Situações e Mais. Plano e Diário continuam implementados, mas ocultos por `src/lib/features.ts` |
| `CalmBabyBrand` | `brand/logo-inline.svg` no cabeçalho e `logo-wordmark.svg` no login |
| `ProfileAvatar` | Inicial em Playfair, com anel dourado |
| Calminho (ilustrações) | Emblema da fase (`brand/emblems/fase-N.svg`). Não há personagem |
| Card "Meu Protocolo Personalizado" | Diagnóstico de 6 perguntas, resumo da situação e acesso ao Mapa personalizado |
| `SleepButtons` | Card vinho "Vontade de mandar mensagem?", que abre a Pausa |
| `CategoryTile` | Técnicas da VSL em espera e atalhos contextuais para o assistente "Ele respondeu. E agora?" |
| Card "Meta da semana" | "Meta da fase", com a meta do PDF |
| Card "Horários de hoje" | "Seu cenário" |
| "Pequenos avanços" | Igual, com a medalha e os dias sem impulso |
| `FeaturedCard` | Igual. Card de oferta só aparece com link configurado |
| `WeekHeader` | Cabeçalho da fase, com emblema sobre vinho |
| `JourneyPath` | Mesma trilha em zigue-zague, com linha fina: dourado no trecho percorrido, vinho no trecho até o dia atual, pontilhado no resto |
| `FloatingMissionCard`, `MissionSheet`, `MilestoneCelebration` | Iguais, com emblema e medalhas no lugar do Calminho |
| `DayPanel` | Igual: lição, ação de hoje, checklist e "Marcar como concluído" |
| `situation-screen` (Calm Kids) | Detalhe do cenário: faça / evite, modelos, quando parar e os dias ligados |
| `diary-screen` | Preservado no código e oculto por `src/lib/features.ts` |
| `profile-screen` | Mesmo menu em lista |
| `Overlay` + pilha de camadas | Pausa antes de enviar, Regras de ouro, dia do plano e detalhe do cenário |

## Estados do dia

| Estado | Visual | Regra (`progress.ts`) |
|---|---|---|
| Concluído | círculo dourado com check | dia em `completed` |
| Atual | círculo vinho com anel dourado e brilho | primeiro dia não concluído, já liberado |
| Amanhã | círculo claro com contorno dourado tracejado e relógio | anterior concluído hoje |
| Bloqueado | círculo creme com cadeado | anterior não concluído |

## Regras de produto que o visual precisa garantir

- Nenhum botão sem destino. Item sem link configurado não aparece (no CalmBaby aparecia "Em breve").
- Nos cenários de bloqueio e de outra pessoa:
  - o alerta aparece sempre;
  - não há modelos de mensagem;
  - a Pausa responde "não envie".
- O app nunca envia mensagem nenhuma: no máximo copia o texto.
- "Agi por impulso" recomeça o contador sem linguagem de falha.
- A aba Mais sempre mostra Apoio emocional (CVV 188 e 180), sem depender de configuração.
- O Diário é privado. Os dados dele não vão para Make, anúncios nem planilhas.

## Assets

- `brand/logo-wordmark.svg` e `logo-wordmark-on-wine.svg`: logo em duas linhas.
- `brand/logo-inline.svg`: logo em uma linha, para o cabeçalho.
- `brand/monogram.svg`, `brand/favicon.svg`: monograma "CR" sobre vinho, com a faixa lateral do PDF.
- `brand/icons/`: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-180.png`, `favicon-32.png`.
- `brand/emblems/fase-1..4.svg` e as versões `-on-wine`: emblemas das fases (I a IV).
- `brand/badges/`: `sem-impulso-7.svg`, `fase-1..4-concluida.svg`, `dia-21.svg`.
- Fotos do PDF: ainda não usadas, aguardando a confirmação dos direitos de uso.
