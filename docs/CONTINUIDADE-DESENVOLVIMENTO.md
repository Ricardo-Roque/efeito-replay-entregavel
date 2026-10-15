# Continuidade do desenvolvimento — Código da Reconquista

Atualizado em 14/10/2026 na branch `feat/jornada-48h-mensagens-20261013`, a partir do commit `f352d40`.

## Objetivo atual

A experiência principal deve entregar somente o núcleo prometido pela VSL, organizado em quatro áreas visíveis:

1. **Meu Protocolo Personalizado** — diagnóstico de seis perguntas, resultado e Mapa personalizado.
2. **Mensagens e técnicas** — Central de Comunicação e catálogo das sete técnicas prometidas.
3. **O que fazer depois** — atalhos por situação para o assistente "Ele respondeu. E agora?" e para a Central.
4. **Situações especiais** — orientações existentes para bloqueio, frieza, falta de resposta, outra pessoa, retomada de conversa e encontro. Término antigo, traição e conflitos anteriores entram no diagnóstico personalizado.

Os cards dos upsells continuam na Home e mantêm a lógica de acesso existente.

## Estado implementado

- A Home foi reorganizada nas quatro áreas acima sem criar um segundo fluxo ou alterar a identidade visual.
- A navegação inferior exibe **Início**, **Situações** e **Mais**.
- Plano de 21 dias, Diário, Meu Plano de 48 Horas e progresso estão ocultos por flags em `app/src/lib/features.ts`.
- Código, estado local e dados dessas áreas antigas foram preservados. Reativar uma área exige apenas decisão de produto e alteração consciente da flag correspondente.
- A Central e o assistente reaproveitam o conteúdo existente. Em situações de limite, a Central continua acessível para consulta, mas não oferece texto para envio.
- As sete técnicas da VSL têm versões editoriais próprias em `app/src/lib/jornada/messages.ts`, com estado `rascunho`, módulos clicáveis e integração com a Pausa. A interface informa que não são reprodução de um material original externo.
- O apoio emocional continua disponível em **Mais/Perfil**.

## Limites respeitados nesta etapa

Não houve alteração em autenticação, banco de dados, migrations, RLS, webhooks, pagamentos ou configuração de produção. Também não houve merge em `main`, reset, rebase, stash ou publicação.

O diretório de trabalho já continha mudanças não commitadas produzidas na etapa anterior. Elas fazem parte do estado atual e não devem ser descartadas.

## Arquivos centrais

- `app/src/components/home/home-screen.tsx`: composição das quatro áreas e manutenção dos cards de upsell.
- `app/src/components/reconquista-app.tsx`: rotas internas e aplicação das flags.
- `app/src/components/home/bottom-nav.tsx`: três destinos visíveis.
- `app/src/components/home/personal-plan-card.tsx`: entrada do protocolo personalizado.
- `app/src/components/jornada/diagnosis-flow.tsx` e `map-screen.tsx`: diagnóstico e resultado.
- `app/src/components/comunicacao/`: Central e assistente de respostas.
- `app/src/components/scenarios/`: lista e detalhe das situações especiais.
- `app/src/lib/features.ts`: flags das áreas preservadas e ocultas.
- `app/src/lib/jornada/messages.ts`: catálogo das técnicas da VSL.
- `app/src/components/jornada/technique-detail.tsx`: detalhe reutilizável das sete técnicas e aplicação dos limites do diagnóstico.
- `app/src/lib/lean.test.ts`: proteção do recorte enxuto e contra referências às áreas ocultas.
- `docs/pendencias-central-comunicacao.md`: material necessário para liberar as técnicas.
- `docs/pendencias-editoriais.md` e `docs/revisao-vsl.md`: pendências e correspondência com a oferta.

## Estado do diretório de trabalho

O worktree final reúne as mudanças que já estavam em andamento com o fechamento desta etapa. Há alterações não commitadas nos seguintes grupos:

- Base e configuração: `app/README.md` e `app/vitest.config.ts`.
- Shell e experiência principal: `app/src/components/reconquista-app.tsx`, `login-screen.tsx`, `more-screen.tsx`, `tool-links.tsx`, `home/bottom-nav.tsx`, `home/home-screen.tsx` e `home/personal-plan-card.tsx`.
- Diagnóstico, Mapa e técnicas: `app/src/components/jornada/diagnosis-flow.tsx`, `jornada/map-screen.tsx`, o novo `jornada/technique-detail.tsx`, `app/src/lib/jornada/map.ts`, `messages.ts` e `types.ts`.
- Comunicação: `app/src/components/comunicacao/message-detail.tsx`, `reply-guide.tsx`, `shared.tsx`, `app/src/lib/comunicacao/library.ts`, `reply.ts`, `reply.test.ts` e `rules.ts`.
- Situações e ferramentas: `app/src/components/scenarios/scenario-panel.tsx`, `scenarios-screen.tsx`, `tools/pause-tool.tsx` e `app/src/lib/scenarios.ts`.
- Benefícios e recorte enxuto: `app/src/lib/benefits.ts`, o novo `app/src/lib/features.ts` e o novo `app/src/lib/lean.test.ts`.
- Documentação: `docs/design-system.md`, `matriz-vsl-entregavel.md`, `pendencias-central-comunicacao.md`, `pendencias-editoriais.md`, `revisao-vsl.md` e este novo documento.

Não há mudanças em `app/supabase`.

## Revisão ainda necessária

As sete técnicas estão entregues como versões editoriais do aplicativo, mas permanecem em `rascunho`. O responsável pelo produto ainda deve revisar:

1. naturalidade e adequação das cinco mensagens;
2. duração de 30 minutos da prática “buraco negro emocional”;
3. distinção entre a técnica noturna principal e a Técnica de Reversão Noturna do Reset;
4. correspondência entre os módulos e as frases usadas na VSL;
5. origem editorial apresentada na interface.

A transcrição original da VSL continua ausente. Se ela aparecer, comparar o material com as versões atuais sem substituição automática. Os roteiros da Central e do assistente também continuam pedindo revisão editorial. Links, permissões e operação comercial dos upsells permanecem fora deste recorte.

## Como continuar

1. Permanecer nesta branch e revisar `git status` e `git diff` antes de editar.
2. Preservar todas as mudanças existentes no diretório de trabalho.
3. Tratar `vslTechniques` como fonte única das versões editoriais e manter a indicação de origem no detalhe.
4. Depois da revisão de produto, trocar apenas os itens aprovados de `rascunho` para `aprovado`. Se o material original chegar, comparar conteúdo e limites antes de qualquer substituição.
5. Reativar áreas antigas somente por decisão explícita de produto, alterando as flags em `app/src/lib/features.ts` e verificando toda a navegação associada.
6. Não alterar autenticação, Supabase, banco, RLS, webhooks ou pagamentos sem um novo escopo explícito.
7. Antes de entregar outra etapa, executar dentro de `app`: `npm test`, `npm run lint`, `npm run typecheck` e `npm run build`.

## Validação desta etapa

Executada em 14/10/2026 dentro de `app`:

- `npm test`: **8 arquivos e 114 testes aprovados**.
- `npm run lint`: **aprovado, sem erros**; permanecem 15 avisos antigos de `react-refresh/only-export-components` em arquivos não alterados por este recorte.
- `npm run typecheck`: **aprovado**.
- `npm run build`: **aprovado** para o preset Cloudflare/Nitro.
- Servidor local: respondeu HTTP 200 em `http://127.0.0.1:8081/`.
- `git diff --check`: sem erros de whitespace; o Git apenas avisou sobre a conversão futura de LF para CRLF no Windows.
- `app/supabase`: sem arquivos modificados.

O ambiente não disponibilizou um navegador para a revisão visual interativa. A estrutura usa os mesmos componentes, tokens, cards, botões, ilustrações e padrões de navegação existentes; ainda assim, fazer uma passagem manual em viewport móvel antes de publicar.
