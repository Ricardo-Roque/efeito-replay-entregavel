# Código da Reconquista: evolução do entregável

- **Etapa 1:** fundação técnica para o diagnóstico de entrada, as primeiras 48 horas e a central de mensagens. Nada mudou na tela.
- **Etapa 2 (seção 6):** diagnóstico de seis perguntas, motor de personalização, tela "Meu Mapa de Reconquista" e nova hierarquia do Início. As perguntas e as regras da etapa 1 foram substituídas. Onde as seções 1 a 5 divergem da seção 6, vale a seção 6.

- **Branch:** `feat/jornada-48h-mensagens-20261013`. Ela já existia no remoto, apontando para o mesmo commit da `main`, e foi reaproveitada.
- **Fora do escopo (P0):** login, autenticação, webhooks, Payt, compras, RLS, banco, sincronização entre aparelhos e permissões do upsell. Nenhum arquivo dessas áreas foi alterado.

---

## 1. Arquitetura atual

### Stack

- React 19, TypeScript estrito (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`).
- TanStack Start/Router, com uma rota só (`/`).
- Tailwind 4, com os tokens em `src/styles.css`.
- Supabase, usado só para acesso: sessão, `cr_clients` e `cr_my_entitlements`.
- Deploy em Cloudflare Workers (`wrangler.jsonc`) e PWA (`public/manifest.webmanifest`).

### Estrutura

```
app/src/
  routes/index.tsx            ClientOnly > StoreProvider > ReconquistaApp
  components/
    reconquista-app.tsx       shell: estado de acesso, abas, pilha de camadas, toast, marcos
    home/  plan/  scenarios/  tools/  reset/   telas por área
    common.tsx                peças visuais compartilhadas
    ui/                       shadcn: button, dialog, drawer, input, label
  lib/
    store.tsx                 sessão, permissões, AppData (perfil, dias, diário), ações
    progress.ts               regras puras de progresso (dayState, planProgress, impulseFreeDays)
    plan.ts                   fases, 21 dias e marcos (conteúdo como dado)
    scenarios.ts              6 cenários (conteúdo como dado, com regras de segurança)
    guide.ts                  compromisso, sinais, checklist da Pausa, regras, rede de apoio, humores
    reset/                    upsell: conteúdo, diagnóstico próprio, store próprio, acesso
    config.ts                 links vindos de VITE_*
```

### Navegação

O app não usa rotas para as telas. A navegação acontece dentro de `ReconquistaApp`:

- **Abas** (`AppTab`): `home`, `plan`, `scenarios`, `diary` e `more`. O Plano é uma tela própria, sem a navegação inferior.
- **Camadas** (`Layer[]`): uma pilha que abre por cima da aba. Hoje existem `day`, `scenario`, `pause`, `rules`, `commitment` e `reset`. Fechar uma camada volta para a anterior.
- Cada tela é um chunk `lazy`, pré-carregado quando o navegador fica ocioso (`loaders`).

### Fluxos existentes

1. **Acesso.** A cliente informa o e-mail. A Edge Function `cr-login` gera um `verifyOtp` e o app confere `cr_clients`. A partir daí, o status pode ser `ready`, `no-access` ou `error`. As permissões vêm de `cr_my_entitlements`: `reset` e `allDays`.
2. **Primeiro acesso.** `loadAccount` cria o `Profile` com o nome da compra e `scenario: null`. Não existe onboarding (o quiz foi removido em `bbea051`).
3. **Plano.** `dayState` libera o dia N quando o dia N-1 foi concluído num dia de calendário anterior, ou quando `allDays` está ligado. `completeDay` registra a conclusão e dispara a celebração nos dias 7, 14 e 21.
4. **Cenários.** A cliente escolhe o cenário com `setScenario`. Cada cenário tem o que fazer, o que evitar, modelos de mensagem e o momento de parar. Nos cenários `bloqueou` e `outra` não há modelos.
5. **Diário.** Os tipos de entrada são `mood` (um por dia), `held`, `acted`, `contact`, `draft`, `signal` e `note`. A entrada `acted` zera o contador de dias sem impulso.
6. **Pausa antes de enviar.** Rascunho, checklist (`pauseQuestions`, com `hardStop`) e resultado. O rascunho fica guardado por 24h como entrada `draft` com `readyAt`.
7. **Reset (upsell).** Diagnóstico próprio, mapa de reconstrução, módulos e jornada, com store separado (`codigo-reconquista:reset:v1:<email>`). Sem a compra, o botão abre o WhatsApp.

### Persistência

| Dado | Onde | Chave |
|---|---|---|
| Sessão Supabase | localStorage (supabase-js) | gerida pela lib |
| Perfil, dias concluídos, Diário | localStorage | `codigo-reconquista:v1:<email>` |
| Reset | localStorage | `codigo-reconquista:reset:v1:<email>` |
| Simulações de desenvolvimento | localStorage | `codigo-reconquista:dev-*` |
| **Novo: jornada** | localStorage | `codigo-reconquista:jornada:v1:<email>` |

No banco existem só `cr_products`, `cr_clients`, `cr_purchases` e `cr_webhook_events`, mais as funções de acesso. O progresso **não** está no servidor: ele não sincroniza entre aparelhos e se perde se o navegador for limpo. Essa limitação é conhecida e pertence ao P0.

### Estado compartilhado

- **`StoreProvider` / `useStore()`.** É o contexto único da conta. Guarda `status`, `email`, `entitlements`, `data`, `toast` e as ações. As ações gravam de forma síncrona e devolvem `boolean`: com `false`, a tela não muda e aparece um aviso de erro. As leituras usam `dataRef`, o que evita closures velhas.
- **`ResetProvider` / `useReset()`.** É montado só dentro de `ResetScreen` e depende de `useStore()` (para `email` e `showToast`).
- Entre abas do navegador, o evento `storage` recarrega o store principal.
- Não há biblioteca de estado nem React Query. As regras puras ficam em `lib/*.ts` e recebem `AppData`.

### Componentes reutilizáveis

| Componente | Arquivo | Uso nas novas telas |
|---|---|---|
| `Overlay` | `components/common.tsx` | casca de toda camada nova (diagnóstico, 48h, mensagens) |
| `SectionTitle`, `Highlight` | `components/common.tsx` | títulos e destaques |
| `GoalProgress`, `PhaseBar` | `components/common.tsx` | progresso das 48h |
| `EmojiBadge`, `Emoji`, `Character`, `tintClass` | `components/common.tsx` | ilustração e tints |
| `ScenarioArt`, `ScenarioBadge` | `components/common.tsx` | resultado do diagnóstico (cenário sugerido) |
| `CategoryTile`, `FeaturedCard` | `components/home/cards.tsx` | entrada das novas áreas no Início |
| `CheckRow`, `NoteField`, `SectionLabel`, `LimitNotice` | `components/reset/reset-common.tsx` | tarefas das 48h e aviso de limite. Hoje moram dentro de `reset/`; se forem reaproveitados, convém mover para `common` (ver riscos) |
| Passo a passo com opções | `components/reset/diagnosis-flow.tsx` | modelo de UX para o diagnóstico novo (não importar: as perguntas e os tipos são outros) |
| `Button`, `Dialog`, `Drawer`, `Input`, `Label` | `components/ui/` | base |
| `copyText` | `lib/clipboard.ts` | copiar modelo de mensagem |
| `whatsappLink`, `config` | `lib/config.ts` | suporte |
| `careLines`, `commitment`, `pauseQuestions`, `signals` | `lib/guide.ts` | rede de apoio, limites e Pausa |

---

## 2. Arquitetura das novas funcionalidades

### Princípios

1. **Aditiva.** Usa uma chave de armazenamento nova e um provider novo. `AppData`, `Profile`, `JournalEntry` e o store do Reset não mudam de formato.
2. **Regras puras, conteúdo como dado.** Mesmo padrão de `plan.ts` e `scenarios.ts`. As telas só leem o resultado.
3. **Segurança antes de personalização.** O `ContactMode` é calculado primeiro e filtra todo o resto. Com `sem_contato`, nenhuma mensagem e nenhum guia de resposta aparecem em parte alguma.
4. **Nada de texto inventado para as técnicas da VSL.** Elas existem como `VslTechnique` com `status: "aguardando_material"` e nunca aparecem para a cliente.
5. **Local-first, como o resto do app.** Tudo é pronto para migrar para tabela no futuro (os registros têm `id`, `at` e `version`), mas a migração faz parte do P0 e não entra agora.

### Arquivos criados

```
app/src/lib/jornada/
  types.ts        modelos e interfaces (conteúdo, diagnóstico, 48h, mensagens, persistência)
  diagnosis.ts    6 perguntas + regras: contactModeOf, scenarioOf, focusOf, buildDiagnosisResult, isValidAnswers
  first48.ts      3 janelas, 9 tarefas, tasksFor(mode), first48Progress(state, mode, now)
  messages.ts     catálogo (cenários + central), guias de resposta, técnicas VSL, filtros por modo/cenário/foco
  store.tsx       JornadaProvider / useJornada, com a chave codigo-reconquista:jornada:v1:<email>
docs/
  evolucao-entregavel.md   este documento
  revisao-vsl.md           divergências entre a VSL e o que o produto entrega
```

### Fluxo previsto

```
login ─► Início
          │ (sem diagnóstico) card "Comece por aqui"
          ▼
   [camada diagnosis] 6 perguntas ─► resultado
          │   contactMode · cenário sugerido · foco · motivos · rede de apoio se crise
          │   "Usar este cenário" ─► useStore().setScenario(result.scenario)   (só com confirmação)
          ▼
   [camada first48] startFirst48 ─► janelas 0–6h, 6–24h, 24–48h
          │   cada tarefa abre ferramenta existente (pause, diary, rules, scenario, plan)
          │   ou nova (messages) ou rede de apoio (care)
          ▼
   Plano de 21 dias (sem mudança de regra)

   [camada messages]  disponível a qualquer momento se contactMode !== "sem_contato"
          categorias ordenadas pelo foco ─► modelo ─► copiar | "Levar para a Pausa" (openPause(text))
          "Ele mandou mensagem" ─► guia por IncomingKind ─► modelos sugeridos
```

### Diagnóstico (`lib/jornada/diagnosis.ts`)

- As respostas são `DiagnosisAnswers`, com 6 campos fechados. O histórico fica em `JornadaData.diagnoses`, e o último registro é o atual.
- O **resultado não é gravado**: é recalculado a partir das respostas (`buildDiagnosisResult`). Assim, ajustar uma regra vale também para quem já respondeu.
- `contactModeOf`:
  - `bloqueou`, `pediu_sem_contato` ou `outra_pessoa` levam a `sem_contato`.
  - `pediu_tempo` ou estado emocional `crise` levam a `pausa`.
  - Os demais casos ficam em `aberto`.
- `scenarioOf` mapeia as respostas para os 6 cenários existentes. O cenário `encontro` nunca é sugerido: fica como escolha dela.
- O cenário sugerido **não** sobrescreve `profile.scenario` sozinho. A tela de resultado pede confirmação e chama `setScenario`, que já existe.
- É um diagnóstico separado do diagnóstico do Reset (`lib/reset/diagnosis.ts`), que é pago e trata da reconstrução de confiança. Os dois coexistem; não há leitura cruzada.

### Primeiras 48 horas (`lib/jornada/first48.ts`)

- É um protocolo de **estabilização**: atravessar o pico emocional, organizar o que sente e entender o cenário. Não promete reconciliação.
- O relógio começa quando ela inicia o protocolo (`startedAt`), não na data do término.
- Termina por qualquer um destes caminhos: 48h corridas, todas as tarefas feitas ou `closeFirst48`.
- As tarefas filtram por `onlyFor`. A tarefa de limite só aparece em `sem_contato`; a da central de mensagens, só em `aberto`.
- Não interfere em `dayState` nem em `completeDay`. O plano de 21 dias continua sendo a espinha do produto.

### Central de mensagens (`lib/jornada/messages.ts`)

- O catálogo junta `scenarioTemplates` e `centralTemplates`:
  - `scenarioTemplates` é derivado de `scenarios.ts` em tempo de execução, sem duplicar texto. O id é `cenario-<id>-<índice>`.
  - `centralTemplates` traz os modelos novos por categoria (rascunho).
- `templatesFor(mode, scenario)` retorna lista vazia em `sem_contato`. Nos outros modos, só mostra conteúdo visível (nunca `aguardando_material`).
- `orderedCategories(result)` ordena as categorias pelo foco do diagnóstico.
- `replyGuides` responde a "o que responder quando ele entra em contato". São 6 tipos de mensagem; `pede_espaco` tem `stop: true`.
- `vslTechniques` lista as 6 técnicas da VSL, todas aguardando material.
- Toda mensagem sai pela Pausa existente (`openPause(text)`). O uso fica marcado em `messages.usedAt` e os favoritos em `messages.favorites`.

### Modelos TypeScript

Todos estão em `app/src/lib/jornada/types.ts`:

| Tipo | Papel |
|---|---|
| `ContentStatus` | `rascunho`, `aprovado` ou `aguardando_material` (este nunca é exibido) |
| `ContactMode` | `sem_contato`, `pausa` ou `aberto`: o filtro de segurança |
| `DiagnosisAnswers`, `DiagnosisQuestion`, `DiagnosisRecord`, `DiagnosisResult`, `Focus` | diagnóstico |
| `First48Window`, `First48Task`, `First48State`, `JourneyTool` | primeiras 48h |
| `MessageCategory`, `MessageTemplate`, `ReplyGuide`, `IncomingKind`, `VslTechnique`, `MessagesState` | central de mensagens |
| `JornadaData` | o que é gravado (`version: 1`) |

API do store (`useJornada()`): `data`, `current`, `result`, `update`, `saveDiagnosis`, `startFirst48`, `toggleFirst48Task`, `closeFirst48`, `toggleFavorite`, `markUsed` e `clear`. Assim como `useStore`, todas as ações devolvem `boolean`.

### Pontos de integração (próxima etapa)

| Onde | Mudança |
|---|---|
| `routes/index.tsx` ou `reconquista-app.tsx` | montar `<JornadaProvider>` dentro do `StoreProvider`, só com `status === "ready"` (o provider lê `email`) |
| `reconquista-app.tsx` → `Layer` | novas camadas `{ kind: "diagnosis" }`, `{ kind: "first48" }` e `{ kind: "messages"; category?: MessageCategory }`, mais entradas em `loaders` |
| `reconquista-app.tsx` → `openTool` | resolver `JourneyTool`: `plan` vai para a aba Plano, `scenario` vai para `openScenario(profile.scenario ?? result.scenario)`, `care` abre a rede de apoio |
| `home/home-screen.tsx` | um card condicional: sem diagnóstico mostra "Comece por aqui"; com as 48h em andamento mostra o progresso; no modo aberto, atalho para a central |
| `more-screen.tsx` | "Refazer diagnóstico"; `resetAll` também deve chamar `useJornada().clear()` |
| `tools/pause-tool.tsx` | já aceita `initialDraft`; a central só chama `openPause(text)` |
| `scenarios/scenario-panel.tsx` | link "Ver mais modelos na Central" quando o cenário tem mensagens |

Componentes previstos, a criar na próxima etapa:

- `components/jornada/diagnosis-screen.tsx`
- `components/jornada/first48-screen.tsx`
- `components/jornada/messages-screen.tsx`
- `components/jornada/reply-guide.tsx`

---

## 3. Riscos de compatibilidade

| Risco | Impacto | Mitigação |
|---|---|---|
| Clientes atuais já têm `profile.scenario` escolhido | o diagnóstico poderia sobrescrever a escolha | o resultado só sugere; trocar o cenário exige confirmação (`setScenario`) |
| Clientes atuais nunca fizeram o diagnóstico | a central sem `result` não sabe o modo de contato | sem diagnóstico, derivar o modo do cenário (`bloqueou` e `outra` dão `sem_contato`; os demais dão `aberto`) ou exigir o diagnóstico antes de abrir a central. **Decidir na próxima etapa** |
| `resetAll` apaga só a chave principal | os dados da jornada sobreviveriam ao "apagar tudo" | incluir `useJornada().clear()` no fluxo de `resetAll` na integração |
| `shiftDays` (simulação de desenvolvimento) não desloca `first48.startedAt` | testar as 48h localmente exige outra ferramenta | adicionar uma simulação própria no painel de desenvolvimento, sem mexer no `shiftDays` |
| Dois diagnósticos (app e Reset) | confusão para a cliente | nomes diferentes na tela ("Seu momento" e "Diagnóstico emocional"); sem prefill cruzado nesta fase |
| `CheckRow`, `NoteField` e `LimitNotice` dentro de `reset/` | importar de `reset/` acopla o app principal ao chunk do upsell | mover para `components/common.tsx` (ou `components/shared/`) ao integrar, mantendo os re-exports em `reset-common.tsx` |
| Mudar as perguntas do diagnóstico | respostas antigas inválidas | `DIAGNOSIS_VERSION` e `isValidAnswers`: um registro de versão antiga é descartado e o diagnóstico é refeito |
| Ids derivados dos modelos de cenário (`cenario-<id>-<índice>`) | reordenar `scenario.messages` desloca favoritos e `usedAt` | não reordenar; para remover um modelo, preferir trocar o texto. Se precisar, migrar os ids |
| localStorage cheio ou modo anônimo | gravação falha | mesmo padrão do app: a ação devolve `false` e aparece o toast de erro |
| Sem sincronização | progresso da jornada preso a um aparelho | igual ao Diário e ao Reset hoje; está no P0 |
| Tamanho do bundle | Início mais pesado | as telas novas como chunks `lazy`; os módulos de `lib/jornada` só entram nesses chunks (e no Início, se o card precisar do `first48Progress`) |
| Promessas da VSL (48h, controle de sentimentos) | expectativa errada e risco de reembolso | conteúdo neutro e sem promessa; divergências em `docs/revisao-vsl.md` |

---

## 4. Decisões tomadas

1. Uma chave de localStorage nova (`jornada:v1`) em vez de estender `AppData`, para não arriscar o parse de quem já usa o app.
2. O resultado do diagnóstico é calculado, não gravado.
3. `ContactMode` é a regra de segurança única, aplicada no diagnóstico, nas 48h e na central.
4. A central reaproveita os modelos dos cenários por derivação, sem copiar o texto.
5. As técnicas da VSL ficam catalogadas sem texto até chegar o material de origem.
6. O provider ainda não está montado: a etapa 1 não muda a experiência visual.
7. O conteúdo novo (perguntas, tarefas, modelos e guias) é rascunho e precisa de revisão.

## 5. Pendências

- Material de origem das 6 técnicas da VSL (ver `docs/revisao-vsl.md`).
- Decidir o comportamento da central para quem não fez o diagnóstico (ver riscos).
- Revisar a copy das perguntas, das tarefas das 48h, dos modelos e dos guias de resposta.
- O projeto não tem testes automatizados. As regras de `lib/jornada` são puras e fáceis de cobrir; vale adicionar Vitest numa etapa própria.

---

## 6. Etapa 2: diagnóstico e Início

Escopo: diagnóstico personalizado no produto principal e Início com o status dele. Fora do escopo, sem nenhuma alteração: P0 (login, autenticação, webhooks, Payt, compras, RLS, banco), integrações financeiras e permissões do upsell. A tela das 48 horas com relógio e marcação de tarefas e a central de mensagens ficam para a próxima etapa.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/jornada/types.ts` | novos tipos do diagnóstico: `Elapsed`, `ContactStatus`, `BreakupReason`, `OtherPerson`, `TriedAction`, `Difficulty`, `DiagnosisDraft`, `AttentionId`, `StepTarget`, `FirstStep`; `DiagnosisResult` ampliado; `JornadaData.diagnosisDraft` opcional |
| `lib/jornada/diagnosis.ts` | reescrito: 6 perguntas (a 5 é múltipla, com "Ainda não tentei nada" exclusiva), validação e as regras `contactModeOf`, `scenarioOf`, `attentionOf` e `focusOf` |
| `lib/jornada/map.ts` | novo: `buildDiagnosisResult`, que monta o Mapa (resumo, ponto de atenção, o que fazer, o que evitar, primeiro passo e nota do cenário) |
| `lib/jornada/store.tsx` | lê e grava o rascunho; `saveDraft` e `discardDraft`; `saveDiagnosis` apaga o rascunho |
| `components/jornada/diagnosis-flow.tsx` | novo: uma pergunta por tela |
| `components/jornada/map-screen.tsx` | novo: "Meu Mapa de Reconquista" |
| `components/home/personal-plan-card.tsx` | novo: card "Meu Plano Pessoal" |
| `components/home/home-screen.tsx` | nova hierarquia |
| `components/home/cards.tsx` | `CategoryTile` aceita `icon` e `soon` (apagado, com "Em breve" e sem botão) |
| `components/reconquista-app.tsx` | monta o `JornadaProvider`; camadas `diagnosis` e `map`; `openStep(target)` |
| `components/more-screen.tsx` | item "Meu Mapa de Reconquista"; "Recomeçar do zero" também apaga a jornada |
| `lib/icons.ts` | ícone do item novo do Perfil |

### Diagnóstico

- Uma pergunta por tela, barra de progresso, cards com estado marcado (borda e fundo na cor primária, radio ou checkbox) e transição deslizante nos dois sentidos. Para voltar, use o cabeçalho ou o botão "Voltar".
- A escolha única avança sozinha após 280 ms. A múltipla avança com "Próxima".
- **Rascunho:** cada resposta grava `diagnosisDraft` (pergunta atual e respostas). Se ela fechar no meio, ao voltar continua de onde parou, e o Início mostra "Em andamento".
- **Refazer:** pelo Início, pelo Mapa ou pelo Perfil. As respostas anteriores já vêm marcadas. Cada diagnóstico concluído é acrescentado ao histórico (`diagnoses`), e o último é o que vale.
- `DIAGNOSIS_VERSION = 2`. A versão 1 nunca foi publicada (o provider não estava montado), então nenhuma cliente perde nada.

### Motor de personalização

As regras são puras e determinísticas: sem sorteio e sem pontuação oculta.

**Modo de contato (segurança):**

| Resposta | Modo |
|---|---|
| bloqueou, pediu para não haver contato ou outra pessoa = sim | `sem_contato` |
| pediu um tempo | `pausa` |
| demais | `aberto` |

**Ponto de atenção, em ordem de prioridade** (`attentionOf`):

1. bloqueio;
2. pedido de não contato;
3. outra relação;
4. pedido de tempo;
5. insistência: respostas frias, raras ou ausentes depois de mensagens, pedido de nova chance ou conversa pessoal, sem contato zero;
6. término com menos de 7 dias;
7. quebra de confiança ou traição;
8. silêncio;
9. frieza;
10. conversa aberta.

**Cenário sugerido** (`scenarioOf`):

- bloqueio e pedido de não contato: "Ele me bloqueou" (cenário sem mensagens, com uma nota explicando a escolha);
- outra pessoa: "Ele está com outra pessoa";
- conversa normal: "Ele respondeu";
- não responde: "Ele perdeu o interesse";
- frio, raro ou pediu tempo: "Ele está frio e distante".

"Quero chamar para um encontro" nunca é sugerido.

**Listas do Mapa** (`map.ts`): "O que fazer" e "O que evitar" juntam blocos nesta ordem: limite, insistência, tentativas, tempo, dificuldade e motivo. Não repetem itens e param em 5.

- Com `sem_contato` ou `pausa`, nenhuma sugestão envolve escrever para ele.
- Com padrão de insistência ou sem resposta dele, a dificuldade "Saber o que dizer" vira escrever no Diário em vez de usar modelos.

**Primeiro passo:**

| Situação | Destino |
|---|---|
| `sem_contato` | Diário |
| `pausa` | Meu compromisso |
| insistência, ansiedade ou dúvida sobre o contato | Pausa |
| interpretar as respostas | Sinais |
| o que dizer | cenário |
| frieza ou silêncio | Nunca enviar |
| confiança | Regras de ouro |
| afastamento | Meu compromisso |

**Linguagem:** o texto descreve o que ela contou ("Para você, o principal motivo foi…") e o que ela pode fazer. Não afirma o que ele pensa ou sente. O Mapa termina com o aviso de que são orientações, não certezas nem garantia.

**Verificação das regras.** Foram rodadas as 22.050 combinações possíveis (todas as respostas de escolha única, cruzadas com 5 combinações da pergunta múltipla):

- todas geram um resultado válido;
- toda combinação com bloqueio ou pedido de não contato sai com `sem_contato` e com o ponto de atenção correspondente;
- em `sem_contato` não há modelos (`templatesFor`) nem primeiro passo de comunicação;
- "encontro" nunca é sugerido.

### Meu Mapa de Reconquista

1. Resumo da situação: uma frase por resposta.
2. Principal ponto de atenção.
3. O que fazer agora.
4. O que evitar.
5. Primeiro passo recomendado, com botão para a ferramenta.
6. Suas primeiras 48 horas: as tarefas de `first48.ts` filtradas pelo modo e agrupadas por janela, cada uma com botão para a ferramenta. Tarefas sem destino no app (a da central de mensagens) não aparecem. Nesta etapa não há relógio nem marcação.
7. Seu cenário: abre o cenário sugerido. "Usar este cenário no meu plano" troca `profile.scenario`, e só com o toque dela.

Além disso, a tela tem:

- aviso de limite (em `sem_contato`) ou de pausa;
- rede de apoio (CVV 188 e 180), em destaque quando ela relata ansiedade ou término com menos de 7 dias e no fim da tela nos outros casos;
- as respostas dadas e o botão de refazer.

### Início

1. Saudação e personagem (sem mudança).
2. **Meu Plano Pessoal:** status "Pendente", "Em andamento" ou "Feito em dd/mm". Depois de feito, mostra a situação, o ponto de atenção, o primeiro passo (com botão) e o acesso ao Mapa e ao refazer.
3. **Atalhos:**
   - "Ele respondeu?" abre o cenário "Ele respondeu".
   - "Mensagens" aparece apagado, com "Em breve", e não é botão. Some em `sem_contato`.
   - "Pausa".
   - "Meu cenário" abre o cenário do perfil; sem ele, o sugerido; sem nenhum dos dois, a aba Cenários.
4. Jornada de 21 dias: Plano de hoje, meta da fase e caminho completo.
5. Ferramentas e Diário: Regras de ouro, Sinais, Nunca enviar, Meu diário e Pequenos avanços.
6. Seu cenário, Reset Emocional do Ex (mesma regra de acesso), Regras de ouro e Meu compromisso.

O botão grande "Vontade de mandar mensagem?" saiu porque a Pausa virou atalho no item 3. O destino é o mesmo.

### Persistência e compatibilidade

- Tudo do diagnóstico fica em `codigo-reconquista:jornada:v1:<email>`. `AppData` (perfil, dias e Diário) e o store do Reset não mudaram de formato.
- Cliente antiga: sem a chave nova, o Início mostra o diagnóstico como pendente e todo o resto funciona igual. O cenário que ela já escolheu continua valendo.
- Refazer o diagnóstico não toca no Diário nem nos dias concluídos (verificado no teste abaixo).
- "Recomeçar o plano do zero", que é um pedido explícito dela, agora também apaga o diagnóstico. O texto do aviso foi atualizado.

### Verificações

- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e os mesmos 12 avisos `react-refresh/only-export-components` de antes.
- `npm run build`: concluído.
- Teste no Chrome, com tela de 375 px, numa conta antiga simulada (cenário escolhido, 2 dias concluídos e 1 entrada no Diário). Passou em:
  - Início sem diagnóstico e as 6 perguntas;
  - voltar mantendo a seleção e a opção exclusiva da pergunta múltipla;
  - rascunho gravado;
  - Mapa do cenário frio;
  - refazer, que veio pré-preenchido, trocando para bloqueio: Mapa sem mensagens e atalho "Mensagens" escondido;
  - 2 diagnósticos no histórico, com Diário e dias intactos;
  - sem rolagem horizontal e sem erro no console.

### Como testar

1. Rode `cd app && npm run dev`. Em desenvolvimento, dá para entrar com qualquer e-mail, sem servidor.
2. No Início, toque em "Fazer meu diagnóstico". Responda e confira a barra, o voltar e a pergunta múltipla.
3. Feche no meio: o card mostra "Em andamento", e "Continuar diagnóstico" retoma de onde parou.
4. No Mapa, confira as 7 partes e os botões. Refaça mudando só o contato (por exemplo, "Ele me bloqueou" ou "Ele pediu um tempo") e compare o ponto de atenção, as listas e o primeiro passo.
5. Volte ao Início: o status, o primeiro passo e os atalhos refletem o último diagnóstico.
6. Conta antiga: com dados já salvos na chave `codigo-reconquista:v1:<email>`, o app abre normalmente e o diagnóstico aparece como pendente.

### Pendências desta etapa

- Revisar a copy das perguntas, do Mapa e das tarefas das 48 horas (ainda é rascunho).
- ~~A tarefa "Comece o Dia 1 do plano" das 48 horas diz "Dia 1" mesmo para quem já está mais adiante no plano.~~ Resolvido na etapa 3: a continuação mostra o dia atual do plano.
- O diagnóstico do app e o do Reset continuam separados, sem preenchimento cruzado.

---

## 7. Etapa 3: Meu Plano de 48 Horas

Escopo: orientações personalizadas e utilizáveis logo depois do diagnóstico, sem esperar o dia 11 do protocolo. 48 horas é a duração desta etapa inicial, não uma garantia de reconciliação. A central de mensagens continua fora do escopo (próxima fase). Nada do P0 foi alterado.

As 3 janelas e as 9 tarefas da fundação (`first48Windows`, `first48Tasks`, `tasksFor`) foram substituídas pelo modelo abaixo. Elas nunca tiveram tela própria, e marcações antigas são ignoradas na leitura.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/jornada/types.ts` | tipos novos: `First48StageId`, `First48ActivityId`, `First48Path`, `First48ChoiceId`, `First48Tool`, `First48Activity`, `First48Block`, `First48CheckItem`, `First48Exercise`, `First48NextStep`, `First48Plan`, `First48Done`; `First48State` reescrito |
| `lib/jornada/first48.ts` | reescrito: etapas, `pathOf`, `buildFirst48Plan`, `first48Progress`, `diagnosisChange`, `reviewOf`, `canComplete` |
| `lib/jornada/persist.ts` | novo: leitura do localStorage sem `window` (`parseJornada`) e as transições puras das 48h, usadas pelo store e pelos testes |
| `lib/jornada/store.tsx` | usa `persist.ts`; ações `startFirst48`, `toggleFirst48Check`, `toggleFirst48Activity` e `setFirst48Choice` |
| `lib/jornada/first48.test.ts` | novo: testes (Vitest) |
| `components/jornada/first48-screen.tsx` | novo: visão geral, as 5 atividades e a tela de conclusão |
| `components/jornada/map-screen.tsx` | a seção 6 virou a entrada do plano (progresso e botão); a lista de tarefas saiu |
| `components/home/personal-plan-card.tsx` | progresso das 48h e próximo passo enquanto o plano não termina |
| `components/home/home-screen.tsx`, `components/reconquista-app.tsx` | camada `first48` (com atividade inicial opcional) e `openFirst48` |
| `components/more-screen.tsx`, `lib/icons.ts` | item "Meu Plano de 48 Horas" no Perfil; simulação de 24h no painel de desenvolvimento; o aviso de "Recomeçar" cita o plano |
| `components/common.tsx` | recebe `CheckRow` (antes em `reset/`, que agora reexporta) e `CareLines` (antes dentro do Mapa); `GoalProgress` ganha `tone="primary"` para fundo claro |
| `package.json`, `vitest.config.ts`, `tsconfig.json` | `vitest` (dev) e `npm test` |

### Estrutura

| Etapa | Atividade | Conteúdo | Integração |
|---|---|---|---|
| A · primeiras 24h | 1. Entenda sua situação | resumo, o que merece atenção, erros a evitar, sinais para observar, o que está sob o controle dela | cenário; Sinais (só no caminho conversa) |
| | 2. Interrompa os padrões | impulso, cobrança, insistência e comunicação reativa, com o mais provável para ela em destaque e o "em vez disso" de cada um | Pausa, Nunca enviar |
| | 3. Prepare-se emocionalmente | respiração de 1 minuto, nomear o que sente, humor do dia e reflexão guiada | Diário (humor e anotação vão para o Diário, não para a jornada) |
| B · 24 a 48h | 4. Escolha seu próximo passo | caminhos por situação; no caminho conversa, orientações, exemplos e critérios | Pausa ("Adaptar na Pausa"), Meu compromisso, Diário, plano |
| | 5. Organize a continuação | o que ela leva das 48h, ferramentas e o dia atual do plano de 21 dias | Pausa, Diário, Sinais ou Compromisso, Regras, cenário, Mapa, plano |

Cada atividade tem blocos curtos, checklist marcável, botões de ferramentas e "Concluir atividade". O checklist ajuda, mas não é obrigatório. Ao concluir, a tela leva para a próxima pendente; com as 5 feitas, para a conclusão.

### Personalização

O caminho (`pathOf`) define o tom de tudo, com a mesma prioridade do Mapa:

| Situação | Caminho | Escolhas da atividade 4 |
|---|---|---|
| bloqueio, pedido de não contato ou outra relação | `limite` | respeitar, escrever no Diário, focar em mim |
| pedido de tempo | `pausa` | respeitar, escrever no Diário, focar em mim |
| não responde ou padrão de insistência | `espaco` | parar as tentativas, escrever no Diário, focar em mim |
| conversa (normal, ou frio e raro sem insistência) | `conversa` | responder com leveza, esperar, focar em mim; "mandar uma mensagem curta" só com conversa normal e término com mais de 7 dias |

Além do caminho, entram o motivo (traição, quebra de confiança, discussões), outra pessoa (sim ou não sei), o tempo do término, o que ela já tentou e a dificuldade. Eles mudam a ordem dos padrões, os sinais, as perguntas de reflexão, os exemplos (`templatesFor`, sem duplicar texto), os critérios e os itens do checklist. Nos caminhos `limite`, `pausa` e `espaco` não há exemplos, critérios nem escolha que envolva contato.

### Acesso e tempo

- Nada é travado pelo relógio. As duas etapas só sugerem um ritmo (selo "Agora" na etapa sugerida). Todas as atividades abrem desde o primeiro minuto e continuam abertas depois das 48 horas.
- O relógio começa quando ela abre o plano pela primeira vez (`startedAt`).
- Nenhuma atividade depende de ele responder. Só a 4 pede algo para concluir: escolher um caminho, e sempre há um sem contato.
- A central de mensagens não depende das 48 horas. Quando for construída, não deve consultar `first48`.

### Mudança de diagnóstico

O plano não é gravado: é recalculado a partir do diagnóstico atual, como o Mapa. O que é gravado é o progresso, e ele nunca é apagado por um diagnóstico novo.

- Cada conclusão guarda o `diagnosisId` que valia na hora.
- **Mudança significativa** (`diagnosisChange`): mudou o caminho (`limite`, `pausa`, `espaco`, `conversa`) ou o principal ponto de atenção. Qualquer outra diferença é pequena.
- Com mudança significativa, as atividades concluídas continuam concluídas e ganham o selo "Atualizada", com um aviso na visão geral para reler. O progresso (x de 5) não muda.
- Se a escolha da atividade 4 não existir no caminho novo (por exemplo, "Responder com leveza" e agora há bloqueio), ela deixa de valer: um aviso pede nova escolha e o resumo mostra "ainda a escolher". A atividade continua concluída.
- Itens de checklist ficam guardados pelo id. Os que não existem no plano novo só deixam de aparecer e voltam se o caminho voltar.
- Mudança pequena não gera aviso, e a escolha continua valendo.

### Persistência

Na mesma chave `codigo-reconquista:jornada:v1:<email>`, em `first48`: `startedAt`, `done` (atividade, data e diagnóstico), `checks`, `choice` e `completedAt`. O humor e as reflexões da atividade 3 vão para o Diário (`addEntry`), na chave principal, sem cópia na jornada. "Recomeçar do zero" apaga tudo junto, como antes.

### Verificações

- `npm test`: 16 testes passando. Cobrem contato aberto, bloqueio, pedido de não contato, término recente, traição, outra relação, refazer o diagnóstico (mudança significativa e pequena), recarregar o navegador no meio (gravar, serializar e ler de novo), dados corrompidos ou da fundação, etapa B concluída na primeira hora, plano depois das 48h, conclusão gravada uma vez só e as 22.050 combinações do diagnóstico. Em todas as combinações: sempre existe um caminho sem contato, nenhuma atividade depende de terceiros, limites nunca recebem sugestão de contato e os ids de checklist são únicos.
- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e os mesmos 12 avisos `react-refresh/only-export-components` de antes.
- `npm run build`: concluído (`first48-screen` em chunk próprio, 6,6 kB gzip).
- Teste visual no navegador: não foi feito nesta etapa (sem navegador disponível na sessão). Roteiro abaixo.

### Como testar

1. Rode `cd app && npm run dev` e entre com qualquer e-mail.
2. Faça o diagnóstico. No Mapa, a seção 6 abre o plano; no Início, o card mostra o progresso e o próximo passo.
3. Percorra as 5 atividades: marque itens, abra a Pausa e o Diário pelos botões, registre o humor e uma reflexão (aparecem no Diário), escolha um caminho e conclua.
4. Recarregue a página no meio: progresso, checklist e escolha continuam.
5. Refaça o diagnóstico trocando para "Ele me bloqueou": as concluídas seguem concluídas, com o selo "Atualizada", e a atividade 4 pede nova escolha, só com caminhos sem contato.
6. Perfil > painel de teste: "Simular 24 horas" muda a etapa sugerida, e nada fica travado.

### Pendências desta etapa

- Revisar a copy das atividades, das perguntas de reflexão, dos critérios e dos caminhos (rascunho).
- Teste visual em aparelho real (375 px), principalmente a atividade 4 no caminho conversa, que é a mais longa.

---

## 8. Etapa 4: Central de Comunicação

Escopo: biblioteca de mensagens, orientações e exemplos de conversa, com critérios de uso e com a regra de quando não enviar nada. Nada do P0 foi alterado. Pendências editoriais e técnicas da VSL: `docs/pendencias-central-comunicacao.md`.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/comunicacao/types.ts` | novo: `CommCategory`, `CommMessage`, `CommKind` (modelo, reflexão, evitar), `CommInitiative` (dela, resposta), `CommStance`, `CommContext`, `CommAvailability`, `CommFilters` |
| `lib/comunicacao/library.ts` | novo: 10 categorias e 38 conteúdos (conteúdo como dado, sem React) |
| `lib/comunicacao/rules.ts` | novo: `contextOf`, `availabilityOf`, `availabilityNote`, `stanceNotice`, `matchesQuery`, `filterMessages`, `highlightsFor`, `dayCategory`, `relatedOf` |
| `lib/comunicacao/rules.test.ts` | novo: 25 testes |
| `lib/jornada/messages.ts` | virou a ponte com a jornada: `centralTemplates` vem da biblioteca, `replyGuides` ganhou `evaluate` e dois tipos novos, e os 4 modelos provisórios da fundação saíram |
| `lib/jornada/types.ts` | `MessageCategory` passa a ser `CommCategoryId`; `IncomingKind` ganha `pergunta_relacao` e `convida`; `ReplyGuide.evaluate` |
| `lib/jornada/first48.ts` | os exemplos da atividade 4 apontam para os ids novos |
| `components/comunicacao/central-screen.tsx` | novo: tela principal |
| `components/comunicacao/message-detail.tsx` | novo: detalhe do conteúdo |
| `components/comunicacao/reply-guide.tsx` | novo: "Ele respondeu. E agora?" |
| `components/comunicacao/shared.tsx`, `hooks.ts` | card, selo e listas; `useCommContext` e `useMessageActions` |
| `components/reconquista-app.tsx` | camadas `central` (com categoria ou cenário inicial), `message` e `reply` |
| Início, Perfil, Mapa, 48 horas, cenário, dia do plano, Pausa | integrações (abaixo) |

### O momento dela (`contextOf`)

É a regra de segurança da Central. Usa o mesmo caminho das 48 horas (`pathOf`):

| Momento | Quando | O que pode virar ação (copiar ou levar para a Pausa) |
|---|---|---|
| `limite` | bloqueio, pedido de não contato, outra relação, **ou** cenário do perfil "bloqueou"/"outra" | nada |
| `pausa` | ele pediu um tempo | só respostas, e só se ele escrever primeiro |
| `espaco` | não responde ou padrão de insistência | só respostas, e só se ele escrever primeiro |
| `conversa` | há conversa | modelos do cenário dela; os de outro cenário ficam como leitura |
| `sem_diagnostico` | sem diagnóstico e sem cenário de limite | tudo, com aviso para fazer o diagnóstico |

- O cenário do perfil só deixa o momento mais restrito, nunca mais livre.
- Reflexões (texto para o Diário) e exemplos a evitar nunca são copiáveis, em nenhum momento.
- O filtro de cenário só muda o que aparece na lista. Ele não libera nada: a disponibilidade continua sendo a do momento dela.

### Telas

**Central de Comunicação:** cabeçalho com o subtítulo pedido e aviso do momento dela (com "Fazer meu diagnóstico" quando falta), além de atalhos para a Pausa e para "Ele respondeu. E agora?". Também mostra os destaques do diagnóstico ("Para o seu momento", ou "Comece por aqui" fora da conversa), a busca (sem acento e com todas as palavras), filtros por categoria (com contagem) e por cenário (com "seu" no dela), "Só o que posso usar agora", "Favoritos", contagem de resultados, "Limpar filtros" e lista agrupada por categoria. Os filtros ficam guardados ao abrir um detalhe e voltar.

**Detalhe:** selo da situação e nota explicando o porquê, favoritar, "O que esta mensagem pretende comunicar", "Modelo de mensagem" e as ações de cada tipo:

- modelo: "Copiar" e "Levar para a Pausa";
- reflexão: "Guardar no Diário";
- exemplo a evitar: "O que fazer no lugar".

Depois vêm "Por que este tom", "Quando faz sentido", "Quando não enviar", "Se ele responder", "Se ele não responder", "Limites", "Próximo passo" (Pausa e "Ele respondeu. E agora?") e "Veja também".

**Ele respondeu. E agora?:** oito tipos de mensagem. Para cada um, mostra o objetivo, como ler o que ele mandou, o que fazer, o que evitar, exemplos da Central e o botão "Escrever a resposta na Pausa". Em "Pediu espaço", a orientação é respeitar e atualizar o diagnóstico. Com limite, não sugere resposta: pede para atualizar o diagnóstico antes.

### Integrações

| Onde | O quê |
|---|---|
| Início | o atalho "Mensagens" saiu do "Em breve" e abre a Central (fica escondido com limite). "Ele respondeu?" abre o guia novo |
| Perfil | item "Central de Comunicação", com a contagem de favoritos |
| Mapa | seção 8 com o aviso do momento dela e o botão para a Central |
| Plano de 48 horas | na atividade 4, os exemplos vêm da biblioteca, mais "Ver mais exemplos e orientações na Central" |
| Cenários | "Mais orientações na Central" abre a Central filtrada pelo cenário (também nos cenários sem modelos) |
| Plano de 21 dias | dias 8 a 21 (exceto o 18) com "Central: <categoria>" na ação do dia (`dayCategory`) |
| Pausa | o texto chega pronto. O limite já vem marcado quando o diagnóstico registra bloqueio ou pedido de não contato (antes, só com o cenário "bloqueou") |
| Diagnóstico | define o momento, o foco e os destaques |

Persistência: favoritos e último uso em `messages` da chave `codigo-reconquista:jornada:v1:<email>`, que já existia. Não houve mudança de formato. "Guardar no Diário" usa `addEntry` (nota) na chave principal.

### Verificações

- `npm test`: 41 testes passando (16 das 48h e 25 da Central). A Central cobre a integridade da biblioteca (30 a 40 itens, campos completos, textos únicos, relacionados válidos, ausência dos nomes das técnicas da VSL e de alegação científica), o momento por diagnóstico e por cenário do perfil, a disponibilidade em cada momento, todas as combinações do diagnóstico cruzadas com os 7 estados de cenário do perfil, a busca, os filtros, a ordem, os destaques, os dias do plano, a ponte com a jornada, o guia de resposta e a persistência dos favoritos sem afetar as 48 horas.
- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e os mesmos 12 avisos de antes.
- `npm run build`: concluído. Central, detalhe e guia em chunks próprios (3,0, 2,0 e 2,0 kB gzip). A biblioteca entra no pacote do Início, porque o atalho consulta o momento dela.
- Teste visual no navegador: não foi feito (sem navegador disponível na sessão). Roteiro abaixo.

### Como testar

1. Rode `cd app && npm run dev` e entre com qualquer e-mail.
2. Sem diagnóstico, abra Perfil > Central de Comunicação. Deve aparecer o aviso "Faça o diagnóstico" e tudo deve estar disponível.
3. Faça o diagnóstico com conversa normal. A Central mostra "Para o seu momento". Teste a busca ("magoa", "convite cafe"), as categorias, os cenários, "Só o que posso usar agora" e "Favoritos".
4. Abra um modelo e use Copiar, Levar para a Pausa (o texto chega preenchido), Favoritar, Veja também e Próximo passo.
5. Abra um exemplo a evitar ("O textão de madrugada"): não há Copiar, só "O que fazer no lugar". Numa reflexão, use "Guardar no Diário" e confira no Diário.
6. Refaça o diagnóstico com "Ele me bloqueou". O atalho some do Início, a Central mostra "Hoje, o recomendado é não enviar nada" e nenhum conteúdo tem Copiar ou Pausa com texto. "Ele respondeu. E agora?" pede para atualizar o diagnóstico, e a Pausa abre com o limite marcado.
7. Refaça com "Ele pediu um tempo" e depois com "Não responde". Só as respostas ficam disponíveis, com o selo "Só se ele escrever".
8. Abra os dias 9 e 19 do plano, um cenário e a atividade 4 das 48 horas, e confira os links para a Central.

### Pendências desta etapa

Ver `docs/pendencias-central-comunicacao.md`: material das técnicas da VSL, revisão editorial dos 38 conteúdos e do guia, e decisões a aprovar.

---

## Etapa: "Ele respondeu. E agora?" (assistente por regras)

O guia antigo, com 8 tipos de mensagem (`replyGuides` e `IncomingKind` em `lib/jornada`), foi substituído por um assistente de decisão. Ele não usa IA: o conteúdo é fixo e as regras são funções puras e testadas.

### Fluxo

1. **Tela inicial.** Título, subtítulo "Entenda sua situação e descubra qual próximo passo faz sentido." e a pergunta "O que aconteceu depois da última mensagem?", com 10 cards (emoji, frase e uma linha de explicação).
2. **Pergunta de refinamento.** Nove das dez situações fazem uma pergunta curta. Por exemplo, "Ele respondeu friamente" pergunta se há reciprocidade, e "Ele demonstrou raiva" pergunta se houve ameaça ou medo. "Ele pediu para eu parar" não tem pergunta.
3. **Resultado.** Mostra, nesta ordem:
   - um selo: "Responder pode fazer sentido", "Responder é opcional" ou "Hoje, nenhuma mensagem";
   - o caminho em uma frase e os alertas;
   - a **interpretação cuidadosa**;
   - **o que fazer agora** e **o que evitar**, cada item com o seu "Por quê";
   - quando há abertura, o **exemplo de resposta** em balões de conversa (a mensagem dele é ilustrativa e a resposta é um modelo da Central);
   - o **próximo passo** em destaque, depois "Também pode ajudar" e "Mais na Central".
4. **Saídas.** "Mudar a resposta da pergunta", "Escolher outra situação" e o Voltar, que retorna um passo de cada vez.

São 10 situações e 23 caminhos (cada situação combinada com cada resposta da pergunta).

| Situação | Pergunta | Caminhos |
|---|---|---|
| Respondeu friamente | Ele tem respondido e puxado assunto? | recíproco: resposta curta, com exemplo · unilateral: dar espaço e ir ao Diário |
| Sente saudade | Em que momento escreveu? | de dia: acolher sem cobrar definição · à noite: não decidir de madrugada · repete e some: olhar o padrão |
| Fez uma pergunta | Sobre o quê? | como estou · se estou com alguém · sentimentos · por quê · assunto prático |
| Demonstrou mágoa | Ele quer desabafar ou entender? | desabafo: reconhecer sem justificar · explicação: reconhecer e levar a conversa para o vivo. Os dois ligam a "Reconstruir confiança" |
| Demonstrou raiva | Houve ameaça ou medo? | não: não entrar na briga · sim: segurança primeiro, sem exemplo, com 180, 190 e CVV em destaque |
| Sugeriu conversar | Você está pronta? | pronta: aceitar e se preparar · ainda não: pedir tempo com gentileza |
| Interesse em encontro | Como você se sente? | quero ir: lugar público, de dia, avisar alguém · insegura: Diário antes de responder · não quero: recusar sem culpa |
| Visualizou e não respondeu | Como você está agora? | com impulso: Pausa só para ela, respiração e celular longe · calma: Diário e seguir o dia. Nunca sugere mensagem |
| Pediu para eu parar | (nenhuma) | interrompe o contato e oferece registrar o limite no diagnóstico |
| Mencionou outra pessoa | Ele está num relacionamento? | sim: sem disputa, com a opção de registrar o limite · não sei: não investigar |

### Regras de segurança e coerência (`resolveReply`)

O assistente usa o mesmo momento da Central (`useCommContext` e `contextOf`). Diagnóstico, Central e assistente partem da mesma informação.

- **Limite** (bloqueio, pedido de não contato ou outra relação, vindo do diagnóstico ou do cenário do perfil). Vale para todas as situações:
  - o selo vira "Hoje, nenhuma mensagem" e o título deixa de falar em responder;
  - o exemplo some;
  - "O que fazer agora" passa a tratar do limite. A exceção são os caminhos que já eram de não enviar, como a raiva com ameaça, que mantêm as orientações de segurança;
  - o próximo passo vira o Diário, e "Atualizar meu diagnóstico" aparece na lista de passos;
  - "Mais na Central" mostra só reflexões e exemplos do que evitar.
- **Pausa ou espaço.** Como ele escreveu primeiro, responder continua possível. Um aviso lembra de não reabrir a relação nem cobrar o silêncio, e o exemplo segue a regra "Só se ele escrever" da Central.
- **Sem diagnóstico.** Aparece um aviso e o passo "Fazer meu diagnóstico".
- **Exemplo na Pausa.** O exemplo só vai para a Pausa quando a regra da Central permite (`canSend(availabilityOf(...))`), então as duas telas nunca discordam.
- **Registrar o limite.** Em "Pediu para eu parar" e "Mencionou outra pessoa → está num relacionamento", o próximo passo grava um diagnóstico novo com `contact: "pediu_sem_contato"` ou `otherPerson: "sim"`, mantendo as outras respostas (`answersWithLimit`). O app pede confirmação antes de gravar.
  - Depois disso, a Central, a Pausa, o Mapa e as 48 horas entram em modo limite.
  - O histórico de diagnósticos continua, e o Diário e os dias concluídos não mudam.
  - Como acontece com qualquer diagnóstico salvo, um diagnóstico em andamento é descartado.
- **Linguagem.** As leituras falam em possibilidades ("pode ser", "não dá para saber"), e a tela repete "São possibilidades, não certezas". Um teste barra frases de previsão ou promessa ("com certeza", "ele vai voltar", "garante", "comprovado" e outras).

### Integrações

| Com | Como |
|---|---|
| Diagnóstico | Define o momento dela. "Fazer meu diagnóstico", "Atualizar meu diagnóstico" e "Registrar o limite" gravam no mesmo histórico |
| Central de Comunicação | Os exemplos são modelos da biblioteca, sem texto duplicado. "Ver detalhes do modelo" e "Mais na Central" abrem os modelos, e os passos de categoria abrem a Central já filtrada. O card da Central abre o assistente |
| Cenários | Os passos abrem os cenários frio, respondeu, encontro, outra e bloqueou. Os painéis de frio, desinteresse, respondeu e encontro ganharam o botão "Ele respondeu. E agora?" (`scenarioReply`) |
| Diário | "Registrar no Diário" grava uma anotação com a situação, o caminho e "O que eu senti:". No Diário, depois de tocar em "Ele fez contato", aparece "Ele escreveu? Veja o que fazer agora" |
| Pausa | "Adaptar esta resposta na Pausa" leva o texto do exemplo. Sem exemplo enviável, a Pausa abre em branco |
| Plano de 21 dias | Os passos abrem os dias 2, 3, 5, 12 a 17, 19 e 21. Os dias 12 a 17 e 19 a 21 ganharam o atalho "Ele respondeu. E agora?", que abre direto a situação ligada ao dia (`dayReply`) |
| Regras | "Sinais de abertura e de alerta" abre a seção correspondente |

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/comunicacao/types.ts` | Tipos `ReplySituation`, `ReplyOutcome`, `ReplyPoint`, `ReplyAction`, `ResolvedReply` e relacionados |
| `lib/comunicacao/reply.ts` | Novo. Conteúdo das 10 situações, `resolveReply`, `answersWithLimit`, `dayReply` e `scenarioReply` |
| `lib/comunicacao/reply.test.ts` | Novo. 26 testes |
| `components/comunicacao/reply-guide.tsx` | Reescrito: lista, pergunta e resultado |
| `components/reconquista-app.tsx` | A camada `reply` aceita uma situação inicial e recebe Central, cenário, dia e regras |
| `components/plan/day-panel.tsx`, `components/scenarios/scenario-panel.tsx`, `components/diary-screen.tsx` | Atalhos para o assistente |
| `lib/jornada/messages.ts`, `lib/jornada/types.ts`, `lib/comunicacao/rules.test.ts` | Saíram `replyGuides`, `replyGuidesFor`, `replyGuideOf`, `ReplyGuide`, `IncomingKind` e o teste do guia antigo |

### Verificações (14/10/2026)

- `npm test`: 67 testes passando (16 das 48 horas, 25 da Central e 26 do assistente). Os testes do assistente percorrem os 23 caminhos nos 5 momentos (conversa, sem diagnóstico, pausa, espaço e limite) e conferem que:
  - todo caminho tem leitura, orientações com "Por quê", o que evitar e próximo passo;
  - os exemplos são modelos de resposta que existem na Central;
  - os dias, cenários e categorias citados existem;
  - caminho de "não enviar" nunca traz exemplo enviável nem a Pausa preenchida;
  - o exemplo enviável segue a mesma regra da Central;
  - com limite, nenhuma situação sugere resposta, inclusive quando o limite vem do cenário do perfil;
  - "Visualizou e não respondeu" nunca sugere mensagem;
  - registrar o limite deixa o app inteiro em modo limite;
  - não há linguagem de previsão nem passos repetidos.
- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros. Os 12 avisos já existiam e estão em arquivos que esta etapa não alterou.
- `npm run build`: concluído.
- Teste visual (Chromium headless, 390 px de largura, modo dev), sem nenhum erro no console. Caminhos percorridos:
  - a lista inicial;
  - "Encontro → Quero ir", com diagnóstico de conversa;
  - "Saudade → Durante o dia", com bloqueio;
  - "Pediu para eu parar → Registrar": depois do registro, a tela passa para o modo limite;
  - "Pergunta → Como eu estou", com espaço.

  O teste encontrou dois problemas, já corrigidos: com limite, o título ainda dizia "Acolha a abertura", e alguns passos repetiam o título do dia do plano.

### Como testar

1. Rode `cd app && npm run dev`, entre com qualquer e-mail e faça o diagnóstico com "conversa normal".
2. No Início, toque em "Ele respondeu?". Percorra as situações e as respostas da pergunta, e use "Mudar a resposta da pergunta", "Escolher outra situação" e o Voltar.
3. Em "Ele demonstrou raiva → Sim", confira que não há exemplo e que o 180, o 190 e o CVV aparecem.
4. Em "Ele pediu para eu parar", toque em "Registrar o pedido dele no meu diagnóstico" e confirme. A tela muda para o modo limite, e a Central passa a mostrar "Hoje, o recomendado é não enviar nada".
5. Refaça o diagnóstico com "Ele pediu um tempo" e depois com "Não responde". Confira o aviso de cuidado e o selo "Só se ele escrever" no exemplo.
6. Abra os dias 14 e 19 do plano, os cenários "frio" e "encontro", e o Diário (toque em "Ele fez contato"). Confira os atalhos.

### Pendências

Ver a seção 3 de `docs/pendencias-central-comunicacao.md`: revisão editorial dos 23 caminhos, validação das orientações de segurança e aprovação do registro de limite pelo assistente.

---

## Etapa: Plano de 21 Dias e Cenários aprofundados

Escopo: reescrever as 21 lições e os 6 cenários como conteúdo educativo completo, personalizado pelo diagnóstico e ligado às ferramentas do app. Fases, marcos, regras de liberação e progresso foram preservados. Nada do P0 foi alterado. A próxima fase não foi iniciada.

### O que mudou para a cliente

**Cada dia do plano** agora mostra, nesta ordem:

1. **Objetivo do dia** e tempo estimado (5 a 7 minutos).
2. **Para o seu momento:** orientação conforme o diagnóstico, com observações extras para traição ou quebra de confiança e para término recente. Sem diagnóstico, aparece o botão "Fazer meu diagnóstico".
3. **Entenda:** o conceito, com pontos-chave. No Dia 9, por exemplo: o que é leveza, o que é cobrança, quando não enviar e como avaliar a reciprocidade.
4. **Exemplo:** situação ilustrativa (nunca depoimento), muitas vezes com o contraste "evite / prefira". Alguns dias também mostram exemplos "evitar" da Central ao lado da alternativa de cada um, sem copiar o texto.
5. **Na prática:** passos concretos.
6. **O que evitar.**
7. **Ação de hoje**, com o botão da ferramenta principal.
8. **Exercício:** passos e perguntas com campo de texto. "Guardar no Diário" grava uma anotação. Nada é enviado.
9. **Checklist** marcável e gravado, com contagem. Ele não é condição para concluir o dia.
10. **Ferramentas relacionadas**, rede de apoio (quando o diagnóstico pede) e "Marcar como concluído", como antes.

**Cada cenário** agora tem: explicação, principais desafios, o que fazer e o que evitar (cada item com o porquê), exemplos, sinais de abertura, sinais de limite, mensagens da Central, quando parar, próximos passos, conteúdos relacionados e dias do plano.

### Personalização (`lib/plan-guide.ts`)

O momento vem do mesmo `contextOf` usado pela Central e pelo "Ele respondeu. E agora?", então as três telas nunca discordam. O cenário do perfil só deixa o momento mais restrito.

| Momento | Quando | O que o plano faz nos dias de comunicação |
|---|---|---|
| `conversa` | há conversa | conteúdo-base: critérios, modelos da Central e envio só depois da Pausa |
| `espaco` | não responde ou padrão de insistência | escrever e guardar; "se ele escrever, responda curto" |
| `pausa` | ele pediu um tempo | escrever, guardar e reler depois |
| `limite` | pedido de não contato | carta sem envio |
| `bloqueio` | bloqueio (no diagnóstico ou no perfil) | carta sem envio, sem nenhum outro caminho até ele |
| `outra` | outra relação | não interferência |
| `sem_diagnostico` | sem diagnóstico | versão geral, sem envio, e convite para fazer o diagnóstico |

- Todo dia tem variante para `conversa`, `espaco`, `pausa` e `limite`. `bloqueio` e `outra` existem onde o texto muda (por exemplo, nos dias 2, 3, 4, 11 e 19). Nos outros dias, valem as orientações de `limite`.
- Uma variante pode trocar a ação, a prática, o exemplo, o exercício e o checklist, e pode acrescentar ferramentas.
- Com limite, saem da lista os atalhos que levam a escrever, convidar ou responder: modelos, categorias de contato e os cenários "respondeu" e "encontro" (`isContactLink`).
- O Dia 11 segue o pedido:
  - com contato bem-vindo, critérios, Central e checklist antes de enviar;
  - com bloqueio, escrita sem envio e respeito ao limite;
  - com traição, reflexão sobre responsabilidade e confiança (só quando há conversa);
  - com outra relação, orientação de não interferência.
- Nenhum dia exige resposta dele, e nenhuma tarefa pede ação arriscada ou que ultrapasse um limite.

### Integração com as ferramentas

Os atalhos são dados (`lib/app-link.ts`), e quem resolve o destino é o app (`openLink` em `reconquista-app.tsx`). Os destinos são:

- Pausa e Diário;
- Regras de ouro, por seção;
- Meu compromisso;
- Central, por categoria, ou um conteúdo específico dela;
- "Ele respondeu. E agora?", por situação;
- cenário, dia do plano, Mapa e diagnóstico.

Sem diagnóstico, o Mapa vira o diagnóstico (`use-resolve-link.ts`).

| Tema | Dias | Abre |
|---|---|---|
| Impulso | 2 e 5 | Pausa |
| Interpretação | 12 e 13 | "Ele respondeu. E agora?" |
| Comunicação | 8 a 11 | Central |
| Reconhecimento emocional | 1, 7, 18 e 21 | Diário |
| Reencontro | 19 | cenário do encontro |

`dayCategory` (`lib/comunicacao/rules.ts`), `dayReply` e `scenarioReply` (`lib/comunicacao/reply.ts`) saíram. Os atalhos de cada dia e de cada cenário agora ficam no próprio conteúdo.

### Mensagens sem duplicação

- Os cenários não têm mais textos de mensagem próprios. `messages` aponta para ids da Central, e o painel usa o card e a regra de disponibilidade da Central (com limite, por exemplo, aparece o selo "Não é para agora").
- Os 7 textos antigos dos cenários equivaliam a modelos que já existiam na Central e foram trocados por eles. `scenarioTemplates` (ids `cenario-*`) saiu de `lib/jornada/messages.ts`. Esses ids nunca foram gravados como favoritos nem como uso, porque só a Central grava. Nenhuma cliente perde dados.
- As 48 horas passaram a usar os ids dos cenários (`scenario.messages`) como exemplos preferidos.

### Persistência e compatibilidade

- **Dias concluídos:** continuam em `AppData.completed` (chave principal), com a mesma regra (`dayState`). Os números e as fases dos dias não mudaram, então o progresso antigo vale sem migração.
- **Checklist:** novo campo opcional `plan.checks` na chave `codigo-reconquista:jornada:v1:<email>`, com o id do item e a data da marcação.
  - Fica ausente em quem nunca marcou, e valores inválidos são ignorados na leitura.
  - Marcar ou desmarcar não muda o progresso.
  - Antes o checklist não era gravado, então nada se perde.
- **Ids do checklist:** são estáveis (`d<dia>-<item>`). Itens que só existem numa variante continuam guardados se o diagnóstico mudar, e voltam a aparecer se o momento voltar.
- **Exercício:** grava no Diário (`addEntry`, tipo `note`), sem cópia na jornada.
- **"Recomeçar do zero":** já apagava a chave da jornada, então também apaga o checklist.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/plan.ts` | reescrito: novo formato do dia (`goal`, `concept`, `points`, `example`, `compare`, `practice`, `avoid`, `exercise`, `checklist` com id, `tools`, `guide`) e as 21 lições |
| `lib/plan-guide.ts` | novo: `guideKeysOf`, `resolveDay` e `isContactLink` |
| `lib/app-link.ts` | novo: `AppLink`, `LabeledLink` e `linkLabel` |
| `lib/scenarios.ts` | reescrito: seções novas e mensagens por id da Central |
| `lib/plan.test.ts` | novo: 19 testes |
| `lib/jornada/types.ts`, `persist.ts`, `store.tsx` | `plan.checks`, `planToggleCheck` e `togglePlanCheck` |
| `lib/jornada/messages.ts`, `first48.ts` | sem `scenarioTemplates`; as 48 horas usam `scenario.messages` |
| `lib/comunicacao/rules.ts`, `reply.ts`, `rules.test.ts` | saem `dayCategory`, `dayReply`, `scenarioReply` e o teste de `dayCategory` |
| `components/plan/day-panel.tsx` | reescrito |
| `components/scenarios/scenario-panel.tsx` | reescrito |
| `components/tool-links.tsx`, `components/use-resolve-link.ts` | novos: lista de atalhos e resolução do destino |
| `components/reconquista-app.tsx` | `openLink`; novas props do dia e do cenário |
| `components/plan/journey.tsx` | a gaveta do dia mostra o objetivo |

### Verificações (14/10/2026)

**`npm test`:** 85 testes passando. São os 66 anteriores, menos o de `dayCategory` (substituído), mais 19 novos. Os testes novos cobrem:

- as 4 fases, os 21 dias, os marcos e as 9 partes de cada lição;
- o tempo de leitura (entre 300 palavras e 7 minutos);
- checklists com ids estáveis, do próprio dia e sem repetição;
- atalhos e comparações que apontam para conteúdos existentes;
- a ligação entre tema e ferramenta;
- o Dia 11 em cada situação, a confiança e o término recente;
- o cenário do perfil;
- as 22.050 combinações do diagnóstico cruzadas com os 7 estados do perfil (reduzidas às situações distintas). Em nenhuma delas aparece:
  - instrução de envio fora da conversa;
  - com limite, instrução de resposta, atalho de contato ou exemplo de envio;
  - tarefa que dependa dele;
- progresso antigo, gravação e leitura do checklist, e dados corrompidos;
- os 6 cenários completos, com mensagens da Central compatíveis e nenhuma mensagem nos cenários de limite;
- linguagem: sem promessa, sem pseudociência e sem textos repetidos.

**Demais verificações:**

- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e os mesmos 12 avisos de antes.
- `npm run build`: concluído (`day-panel` com 3,8 kB gzip e `scenario-panel` com 2,4 kB gzip).
- Teste visual (Chromium headless, 390 px, modo dev, conta simulada com 10 dias concluídos): Dia 11 com conversa, com bloqueio e sem diagnóstico, e o cenário frio com bloqueio. Nenhum erro no console e nenhuma rolagem horizontal.
  - O teste encontrou um problema, já corrigido: com bloqueio, o exemplo do Dia 11 mostrava alguém enviando uma mensagem. Agora as variantes podem trocar o exemplo, e um teste confere que, com limite, nenhum exemplo fala em enviar.

### Como testar

1. Rode `cd app && npm run dev` e entre com qualquer e-mail.
2. Faça o diagnóstico com conversa normal e abra o Dia 1. Percorra as seções, marque o checklist, escreva no exercício e use "Guardar no Diário". Recarregue a página: o checklist continua marcado e a anotação está no Diário.
3. No Perfil, use o painel de teste para liberar os dias e abra o Dia 11. Refaça o diagnóstico com cada uma destas respostas: "Ele me bloqueou", "Ele pediu um tempo", "Não responde" e "outra pessoa: sim". Compare "Para o seu momento", a ação, o exemplo, o exercício, o checklist e as ferramentas.
4. Com traição e conversa normal, confira a reflexão de confiança no Dia 11.
5. Abra os 6 cenários. Com bloqueio no diagnóstico, as mensagens da Central aparecem com "Não é para agora".

### Pendências

- Revisão editorial das 21 lições, das variantes e dos 6 cenários (ainda é rascunho).
- O tempo indicado é uma estimativa: cerca de 200 palavras por minuto, mais o exercício. Vale cronometrar com clientes reais.
- Variantes próprias de `bloqueio` e `outra` existem só onde o texto muda. Nos demais dias, vale a de `limite`. Se a revisão pedir textos mais específicos, basta acrescentar a variante no dia.

---

## Etapa: refinamento funcional, visual e editorial

Escopo: hierarquia do Início, integração do Diário, tela de progresso, revisão do Reset Emocional do Ex, estado dos áudios, consistência entre as áreas e documentação editorial. Não houve redesign: as telas novas usam os componentes, os tokens e os cards que já existiam. Nada do P0 foi alterado (login, Payt, banco, RLS e permissões do upsell). A etapa final de validação não foi iniciada.

### Início

Nova ordem:

1. **Meu Plano Pessoal**: situação, ponto de atenção, Mapa e refazer. Com as 48 horas concluídas, mostra também o primeiro passo do Mapa.
2. **Próxima atividade**: a atividade pendente do Meu Plano de 48 Horas; depois dela, o dia atual do plano de 21 dias.
3. **Precisa de ajuda agora?**: Pausa ("Vontade de escrever"), "Ele respondeu?", "Meu cenário" e "Apoio emocional" (CVV 188 e 180, num diálogo).
4. **Central de Comunicação**: card próprio, com o subtítulo do momento dela. Continua escondido com limite.
5. **Sua jornada de 21 dias**: meta da fase e caminho. O "Plano de hoje" só aparece aqui quando a próxima atividade é das 48 horas, para não repetir.
6. **Diário e ferramentas**: Meu diário, Regras de ouro, Sinais e Nunca enviar, mais "Pequenos avanços", que abre o Meu progresso.
7. **Conteúdos complementares**: Reset Emocional do Ex (mesma regra de acesso) e Meu compromisso.

Saíram as repetições:

- o card "Regras de ouro", que já está nas ferramentas;
- o card "Seu cenário", que já está no atalho;
- o andamento das 48 horas no card pessoal, que já está na próxima atividade;
- o botão "Rever meu plano de 48 horas", que está no Perfil e no progresso.

### Diário

- `JournalEntry` ganhou o campo opcional `source`: `diagnostico`, `first48`, `cenario`, `contato`, `nao_enviar`, `progresso`, `plano` ou `central`.
  - Os tipos (`type`) são os mesmos, e as regras continuam lendo o tipo.
  - Entradas antigas não têm o campo e aparecem como antes. Não há migração.
- Registros novos:

| Evento | Tipo | Origem |
|---|---|---|
| Diagnóstico concluído ou refeito (situação e ponto de atenção) | `note` | `diagnostico` |
| Atividade das 48 horas concluída | `note` | `first48` |
| Escolha do próximo passo nas 48 horas | `note` | `nao_enviar` nos caminhos sem mensagem; `first48` nos outros |
| Meu Plano de 48 Horas concluído | `note` | `progresso` |
| Troca de cenário (de qual para qual) | `note` | `cenario` |
| Marcos dos dias 7, 14 e 21 | `note` | `progresso` |
| Registro pelo "Ele respondeu. E agora?" | `contact` (antes `note`) | `contato` |
| Pausa: guardar 24 horas ou não enviar | `draft` / `note` | `nao_enviar` |
| Exercício do dia, reflexão das 48 horas, Central | `note` / `mood` | `plano`, `first48`, `central` |

- **Gravação.** A troca de cenário e os marcos são gravados na mesma escrita da ação (`withEntry`). O `commit` atualiza a referência na hora, então duas ações no mesmo toque não leem dados velhos.
- **Tela.** Mostra rótulo e ícone pela origem, filtros (Tudo, Reflexões, Contato, Não enviei, Progresso) e o botão "Ver registros anteriores". Antes, só os 20 últimos apareciam. Agora nenhum registro antigo fica inacessível.

### Meu progresso

Camada nova (`progress`), aberta pelo "Pequenos avanços" do Início e pelo Perfil. Mostra:

- marcos alcançados;
- diagnóstico;
- Meu Plano de 48 Horas;
- plano de 21 dias por fase, com os dias sem impulso;
- ferramentas utilizadas (só as usadas, com estado vazio);
- progresso do Reset, só para quem comprou;
- lista de marcos.

As regras ficam em `lib/progress-summary.ts` e são puras. A tela afirma que nenhum marco depende da resposta dele nem é promessa de reconciliação, e um teste barra essa linguagem nos marcos.

### Reset Emocional do Ex

- **Compra e permissões:** sem mudança.
- **Limite compartilhado.** `buildMap` e `buildTrustMap` recebem `appLimit`. O hook `useResetLimit` junta o limite do diagnóstico do Reset ao do app principal (`contextOf`).
  - Antes, quem estava bloqueada no app, mas tinha respondido "conversamos" no Reset, recebia "mandar uma mensagem curta e leve".
  - O aviso de limite passou a aparecer também no Guia (O Que Dizer e O Que Evitar), nos áudios e nas etapas da jornada.
- **Diagnóstico.** As opções da primeira pergunta deixam claro quando o erro foi dela ("Uma traição minha") e oferecem "Outro motivo (inclusive algo que ele fez)". Os valores gravados são os mesmos.
- **Conteúdo.**
  - As 3 lições do Módulo 1 passaram de 2 para 4 parágrafos.
  - As 7 etapas da jornada ganharam conteúdo prático.
  - O Guia ganhou 3 cartões.
  - Os subtítulos dos módulos agora descrevem o que cada um é.
  - Ids, categorias e quantidade de itens de checklist foram mantidos, para o progresso salvo continuar valendo.

### Áudios

- Não existe nenhum arquivo de áudio no projeto.
- O player diz "Áudio ainda não disponível" e aponta para o roteiro. Antes dizia "em gravação", sem garantia de que isso estava acontecendo.
- Sem áudio, o roteiro da sessão já vem aberto, com o título "Roteiro para leitura".
- A tela do produto bloqueado descreve o Módulo 2 como roteiro para leitura.
- Lista de arquivos a produzir e regras de voz: `docs/pendencias-editoriais.md`, seção 1.

### Consistência

- **Pausa e outra relação.** A Pausa usava uma regra própria e não marcava o limite quando havia outra relação, ao contrário da Central, dos cenários e do assistente. Agora usa o mesmo `contextOf`, com texto e cenário próprios para outra relação, e o checklist cita a outra relação.
- **Teste que nunca falhava.** Em `plan.test.ts`, o `\b` de uma expressão tinha virado um caractere de controle. Por isso, o teste "exemplo com envio, com limite" nunca falhava. Corrigido, ele achou um defeito real: com limite, o exemplo do Dia 13 falava de uma mensagem enviada a ele. O Dia 13 ganhou um exemplo próprio para o limite.
- **Nomes.** Foram conferidos em todas as áreas: "Meu Plano Pessoal", "Meu Mapa de Reconquista", "Meu Plano de 48 Horas", "Central de Comunicação", "Ele respondeu. E agora?", "Pausa antes de enviar", "plano de 21 dias" e "Jornada de Reconexão" (só no Reset).
- **Upsell.** Nenhum conteúdo do app principal depende do Reset. Nenhum atalho do plano, dos cenários, das 48 horas ou da Central leva a ele.
- **Botões.** Todos os botões novos têm destino real. Os cards sem destino continuam sem aparecer.

### Interface

- **Carregamento.** As trocas de tela e as camadas ganharam um indicador discreto, que só aparece depois de 400 ms (em conexão boa, nada pisca). A tela inicial também ganhou o indicador, junto do "Carregando…".
- **Estados vazios novos:** nos filtros do Diário e nas ferramentas do progresso.
- **Estados selecionados:** nos filtros do Diário (`aria-pressed`).

### Arquivos

| Arquivo | Mudança |
|---|---|
| `lib/store.tsx` | `EntrySource`, `source`, `withEntry`; registro de cenário e marcos; `commit` atualiza a referência |
| `lib/progress-summary.ts` | novo |
| `lib/refinement.test.ts` | novo: 11 testes |
| `components/progress-screen.tsx` | novo |
| `components/home/home-screen.tsx`, `personal-plan-card.tsx` | nova hierarquia |
| `components/diary-screen.tsx` | rótulos, filtros e paginação |
| `components/reconquista-app.tsx`, `more-screen.tsx`, `lib/icons.ts` | camada e item "Meu progresso"; carregamento |
| `lib/jornada/store.tsx`, `components/jornada/first48-screen.tsx`, `comunicacao/reply-guide.tsx`, `comunicacao/hooks.ts`, `plan/day-panel.tsx`, `tools/pause-tool.tsx` | registros no Diário |
| `components/tools/pause-tool.tsx`, `lib/guide.ts` | limite pelo `contextOf` |
| `lib/reset/diagnosis.ts`, `lib/reset/content.ts`, `components/reset/*` | limite compartilhado, conteúdo e áudios |
| `lib/plan.ts`, `lib/plan.test.ts` | exemplo do Dia 13 com limite; teste corrigido |
| `docs/matriz-vsl-entregavel.md`, `docs/pendencias-editoriais.md` | novos |

### Verificações (14/10/2026)

**`npm test`:** 96 testes passando (os 85 anteriores e 11 novos). Os novos cobrem:

- o progresso com conta vazia, conta completa e registros antigos sem origem;
- a ausência de linguagem de reconciliação nos marcos;
- as 22.500 combinações do diagnóstico do Reset, com e sem o limite do app. Com limite, nenhum primeiro passo, etapa ou próximo passo sugere contato;
- o conteúdo do Reset: sem promessa nem alegação científica, com profundidade mínima e sem parágrafos repetidos;
- ids e checklists estáveis;
- a nova pergunta do motivo.

**Demais verificações:**

- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e 15 avisos `react-refresh/only-export-components`. Os 3 avisos a mais vêm de `useResetLimit`, `withEntry` e `ENTRY_SOURCES`, que moram em arquivos de componente, como os hooks que já existiam.
- `npm run build`: concluído (`progress-screen` com 3,4 kB gzip).
- Teste visual (Chrome headless, 375 px, modo dev, conta simulada com 2 dias concluídos e registros antigos). Telas percorridas:
  - o Início com as 48 horas em andamento, com as 48 horas concluídas e com bloqueio (a Central some);
  - o diálogo de apoio;
  - o Meu progresso;
  - o Diário com o filtro "Não enviei";
  - a entrada do Reset, com a compra simulada;
  - a Pausa com o cenário "outra pessoa", que mostra "Não envie" com o texto de outra relação.

  Não houve erro no console nem rolagem horizontal. O teste encontrou um problema, já corrigido: o andamento das 48 horas aparecia duas vezes no Início.

### Como testar

1. Rode `cd app && npm run dev` e entre com qualquer e-mail.
2. Sem diagnóstico, confira o Início: o card pessoal pede o diagnóstico, e a próxima atividade é o Dia 1.
3. Faça o diagnóstico. No Diário, aparece o registro "Diagnóstico". No Início, a próxima atividade passa a ser a das 48 horas.
4. Conclua uma atividade das 48 horas e escolha um caminho na atividade 4. As duas ações aparecem no Diário, e o filtro "Não enviei" mostra a escolha sem mensagem.
5. Troque de cenário. O Diário registra a troca.
6. Abra "Pequenos avanços" e confira o Meu progresso.
7. Refaça o diagnóstico com "Ele me bloqueou". Depois:
   - no Perfil, simule a compra do Reset;
   - abra o Guia, os áudios e uma etapa da jornada: o aviso de limite aparece;
   - no Mapa de Reconstrução da Confiança, o próximo passo é "Não enviar nada".
8. No Módulo 2, confira o aviso "Áudio ainda não disponível" e o roteiro já aberto.

### Pendências

Ver `docs/pendencias-editoriais.md` (áudios, revisão de conteúdo e decisões a aprovar) e `docs/matriz-vsl-entregavel.md` (promessas da venda).

---

## Etapa: correção de escopo dos upsells (Meus Benefícios)

Escopo: trocar o Reset Emocional do Ex pelas três ofertas atuais (Conselheiro da Reconquista, Círculo da Reconquista e Código da Reconquista: Acesso Total Vitalício). A estrutura comercial completa está em `docs/estrutura-comercial-upsells.md`. Não houve redesign, e nada do P0 foi alterado: login, Payt, webhooks, banco, RLS e migrations ficaram como estavam.

### O que mudou

- **`lib/benefits.ts` (novo):** camada tipada dos três benefícios: textos oficiais, formato de entrega, combinados do Círculo, materiais do Vitalício, links por variável de ambiente e o estado de acesso (`liberado`, `nao_adquirido` ou `pendente`).
- **`lib/store.tsx`:** `Entitlements.benefits` lê `conselheiro`, `circulo` e `vitalicio` de `cr_my_entitlements`. Hoje o servidor não devolve essas chaves, então os três aparecem como "Acesso pendente de configuração". `devSetBenefit` só funciona em desenvolvimento.
- **`components/benefits-screen.tsx` (novo):** tela Meus Benefícios.
- **Perfil:** novo item "Meus Benefícios". O item do Reset só aparece para quem comprou.
- **Início:** em Conteúdos complementares, quem não comprou o Reset vê o card "Meus Benefícios" no lugar dele. Quem comprou continua vendo o card do Reset, com um atalho para Meus Benefícios logo abaixo.
- **Removidos:** `lib/reset/access.ts` (pedido de acesso ao Reset pelo WhatsApp) e `VITE_RESET_WHATSAPP`.
- **`.env.example`:** variáveis novas das três ofertas.

### Verificações (14/10/2026)

- `npm run typecheck`: sem erros.
- `npm run lint`: 0 erros e os mesmos 15 avisos `react-refresh/only-export-components`.
- `npm test`: 104 testes passando (96 anteriores e 8 novos em `lib/benefits.test.ts`).
- `npm run build`: concluído (`benefits-screen` com 2,5 kB gzip).
- Teste visual (Chrome headless, 375 px, modo dev), nos três estados e com e sem o Reset. Telas conferidas: Início e Meus Benefícios. Não houve erro no console nem rolagem horizontal.

### Como testar

1. Rode `cd app && npm run dev` e entre com qualquer e-mail.
2. Abra Meus Benefícios pelo Início ou pelo Perfil. Os três cards aparecem como "Acesso pendente de configuração".
3. No Perfil, na área de teste local, toque no botão de cada benefício para alternar entre pendente, liberado e não adquirido. Depois confira:
   - **liberado:** o Conselheiro mostra como funciona e o aviso de canal em configuração (ou o botão do WhatsApp, se `VITE_CONSELHEIRO_WHATSAPP` estiver preenchido);
   - **liberado:** o Círculo mostra os combinados;
   - **liberado:** o Vitalício lista os materiais com status;
   - **não adquirido:** só a oferta, com "Conhecer a oferta" apenas se houver checkout configurado.
4. Toque em "Simular compra do Reset". O card do Reset volta ao Início e ao Perfil, e aparece em "Outros conteúdos da sua conta".

---

## Etapa: auditoria de QA antes da publicação

O relatório completo está em `docs/qa-evolucao.md`. Ele reúne os testes feitos, os resultados, os problemas corrigidos, os problemas restantes classificados por gravidade e as recomendações antes de publicar.

O que mudou no app nesta etapa:

- **Pausa com limite registrado:** a pergunta do limite fica travada e o resultado é sempre "Não envie".
- **Pausa com pedido de tempo ou sem reciprocidade:** o checklist pergunta "Ele escreveu primeiro?".
- **Plano de 21 dias com limite:** os atalhos de reencontro não aparecem mais.
- **Telas de 320 px:** três ajustes de layout.

---

## Etapa: Meu compromisso removido e um card por upsell

- **Meu compromisso:** a tela saiu do app, assim como o card do Início, o item do Perfil e o tipo de link `commitment`. Os pontos do conteúdo que levavam a ela agora levam a outras ferramentas:
  - Dia 1: Regras de ouro;
  - Dia 6: "Como não voltar ao padrão";
  - Dia 11: o limite no próprio cenário;
  - Mapa: a Pausa (pedido de tempo) ou o Diário (afastamento);
  - 48 horas: Regras de ouro, o cenário ou "O que nunca enviar".
  
  Os ids dos checklists não mudaram, então o progresso salvo continua valendo.
- **Conteúdos complementares:** um card para cada upsell atual (Conselheiro, Círculo e Acesso Total Vitalício). Cada card abre a tela daquele benefício (`BenefitsScreen` com `only`). O card do Reset Emocional do Ex saiu do Início. Quem comprou o Reset continua acessando pelo Perfil, por Meus Benefícios e por Meu progresso.
