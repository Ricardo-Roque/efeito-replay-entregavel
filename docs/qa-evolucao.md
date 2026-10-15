# Código da Reconquista: auditoria de QA da evolução do entregável

> Registro histórico da auditoria anterior. O estado corrente está em `docs/CONTINUIDADE-DESENVOLVIMENTO.md`; depois desta auditoria, as sete técnicas receberam versões editoriais próprias no aplicativo.

Data: 14/10/2026. Branch: `feat/jornada-48h-mensagens-20261013`, separada da `main`. Nada foi publicado e nada foi mesclado na `main`.

Este documento registra o que foi testado antes da publicação, o que foi encontrado, o que foi corrigido e o que ainda falta. As pendências de conteúdo detalhadas continuam em `docs/pendencias-editoriais.md`, `docs/pendencias-central-comunicacao.md`, `docs/matriz-vsl-entregavel.md` e `docs/estrutura-comercial-upsells.md`.

## Resumo

- **Produto principal:** os fluxos testados funcionam e são coerentes entre si. Nenhum erro de console apareceu em servidor limpo.
- **Problemas corrigidos nesta auditoria:** 7. O mais grave: a Pausa permitia desfazer um bloqueio registrado e liberava "Pode enviar".
- **Bloqueios para publicar:**
  - a publicidade (quiz e VSL) ainda promete o que o app não faz e contradiz as regras de segurança;
  - as compras dos três upsells atuais ainda não liberam nada no app;
  - as variáveis de ambiente de produção precisam ser conferidas.
- **Não testado:** login real pelo Supabase, compra pela Payt, aparelhos físicos (iOS e Android) e instalação como app. Ver a seção 6.

## 1. Funcionalidades entregues

| Área | O que existe | Onde |
|---|---|---|
| Diagnóstico | 6 perguntas, rascunho salvo a cada resposta, refazer sem apagar Diário nem plano | `components/jornada/diagnosis-flow.tsx`, `lib/jornada/diagnosis.ts` |
| Meu Mapa de Reconquista | Resumo, ponto de atenção, o que fazer, o que evitar, primeiro passo, 48 horas, cenário sugerido e Central | `components/jornada/map-screen.tsx`, `lib/jornada/map.ts` |
| Meu Plano de 48 Horas | 5 atividades com checklist, ferramentas e escolha do próximo passo, adaptadas ao momento dela | `components/jornada/first48-screen.tsx`, `lib/jornada/first48.ts` |
| Central de Comunicação | 38 conteúdos, busca, filtros por categoria e cenário, "Só o que posso usar agora", favoritos, copiar e levar para a Pausa | `components/comunicacao/*`, `lib/comunicacao/library.ts`, `rules.ts` |
| Ele respondeu. E agora? | 10 situações e 24 combinações de situação e resposta, com regra de segurança | `components/comunicacao/reply-guide.tsx`, `lib/comunicacao/reply.ts` |
| Plano de 21 dias | Conteúdo por momento (conversa, espaço, pausa, limite), checklist salvo e atalhos para as ferramentas | `lib/plan.ts`, `lib/plan-guide.ts`, `components/plan/*` |
| Pausa antes de enviar | Checklist que respeita o momento dela (ver as correções 1 e 2) | `components/tools/pause-tool.tsx`, `lib/guide.ts` |
| Diário e Meu progresso | Origem de cada registro, filtros, marcos e resumo do progresso | `components/diary-screen.tsx`, `components/progress-screen.tsx` |
| Meus Benefícios | Conselheiro, Círculo e Acesso Total Vitalício, em 3 estados (liberado, não adquirido, pendente) | `components/benefits-screen.tsx`, `lib/benefits.ts` |
| Reset Emocional do Ex | Mantido só para quem já comprou, com o limite do diagnóstico principal respeitado | `components/reset/*`, `lib/reset/*` |

## 2. Arquivos alterados

A branch tem dois commits sobre a `main` (`d45e1af`), além do commit deste relatório:

- `b209a3e` (feat): toda a evolução anterior à auditoria;
- `5dc50dc` (fix): as correções desta auditoria.

**Novos:**

- `components/`:
  - `benefits-screen.tsx`, `progress-screen.tsx`, `tool-links.tsx`, `use-resolve-link.ts`;
  - `comunicacao/`: `central-screen.tsx`, `hooks.ts`, `message-detail.tsx`, `reply-guide.tsx`, `shared.tsx`;
  - `home/personal-plan-card.tsx`;
  - `jornada/`: `diagnosis-flow.tsx`, `first48-screen.tsx`, `map-screen.tsx`.
- `lib/`:
  - `app-link.ts`, `benefits.ts`, `plan-guide.ts`, `progress-summary.ts`;
  - `comunicacao/`: `library.ts`, `reply.ts`, `rules.ts`, `types.ts`;
  - `jornada/`: `diagnosis.ts`, `first48.ts`, `map.ts`, `messages.ts`, `persist.ts`, `store.tsx`, `types.ts`.
- Testes:
  - `lib/`: `benefits.test.ts`, `plan.test.ts`, `refinement.test.ts`, `qa.test.ts`;
  - `lib/comunicacao/`: `reply.test.ts`, `rules.test.ts`;
  - `lib/jornada/first48.test.ts`.
- Configuração: `app/vitest.config.ts`.
- Documentação: os 6 arquivos em `docs/`, mais este.

**Alterados:**

- `components/`:
  - `common.tsx`, `diary-screen.tsx`, `more-screen.tsx`, `reconquista-app.tsx`;
  - `home/`: `cards.tsx`, `home-screen.tsx`;
  - `plan/`: `day-panel.tsx`, `journey.tsx`;
  - `reset/`: 10 arquivos;
  - `scenarios/scenario-panel.tsx`;
  - `tools/pause-tool.tsx`.
- `lib/`:
  - `config.ts`, `guide.ts`, `icons.ts`, `plan.ts`, `scenarios.ts`, `store.tsx`;
  - `reset/`: `audio.ts`, `content.ts`, `diagnosis.ts`.
- Configuração: `app/.env.example`, `app/package.json` (vitest e o script `test`), `app/tsconfig.json`, `.gitignore` (cache `.vite/`).

**Removido:** `lib/reset/access.ts`, o pedido de acesso ao Reset pelo WhatsApp.

**Não alterados:**

- `app/supabase/` (Edge Functions `cr-login` e `cr-payt-webhook`, e as migrations);
- `lib/supabase.ts`, `wrangler.jsonc`, `routes/`, `server.ts`;
- as chamadas ao banco em `lib/store.tsx`: login, `cr_clients` e `cr_my_entitlements`. Só passaram a ser lidas as chaves novas de benefício.

## 3. Testes realizados e resultados

### 3.1 Auditoria técnica

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | Passou, sem erros |
| `npm run lint` | Passou: 0 erros e 15 avisos `react-refresh/only-export-components`, todos de hooks e constantes exportados em arquivos de componente. Nenhuma regra foi desativada |
| `npm test` | Passou: 108 testes em 7 arquivos (104 antes da auditoria e 4 novos em `lib/qa.test.ts`) |
| `npm run build` | Passou (cliente, SSR e Nitro para Cloudflare) |
| Bundle de produção | Passou: não contém as simulações de desenvolvimento ("Teste local", `dev-email`, "Simular compra") |
| Servidor de produção local | Não executado: `vite preview` não serve a saída da Cloudflare, e o `wrangler` não está instalado no projeto |

### 3.2 Testes de experiência

Os testes rodaram no Chrome headless, controlado pelo DevTools Protocol, com o servidor de desenvolvimento. O login foi o de teste local, e os dados antigos foram gravados no formato da `main`.

| Fluxo | Passos verificados | Resultado |
|---|---|---|
| **Nova cliente** | Entrada; diagnóstico com recarga no meio (o rascunho volta em "Continuar diagnóstico"); Mapa; troca de cenário pelo Mapa; 48 horas (atividade 1 concluída e atividade 2 aberta); Central; Dia 1 do plano com exercício salvo no Diário, checklist e "Marcar como concluído"; recarga | Passou. Encontrou as correções 2 e 5 |
| **Cliente antiga** | Dados da `main`: perfil, 5 dias concluídos e 7 registros de todos os tipos, sem `source`. Início; Diário; diagnóstico novo | Passou. Os 7 registros aparecem, o contador de impulso continua certo e os 5 dias seguem concluídos. O diagnóstico acrescentou só 1 registro, e nenhuma chave antiga foi reescrita |
| **Cliente bloqueada** | Diagnóstico "Ele me bloqueou"; Mapa; Central (os 38 conteúdos abertos um a um); assistente (as 24 combinações); os 6 painéis de cenário; Pausa; os 21 dias do plano | Passou depois das correções 1 e 3. Nenhum conteúdo oferece "Copiar" nem "Levar para a Pausa". Nenhuma combinação do assistente sugere resposta. Os painéis de cenário não têm ação de envio. A Pausa sempre dá "Não envie" |
| **Cliente que recebeu mensagem** | Conversa aberta. Assistente → "Ele fez uma pergunta" → "Como eu estou" → orientações → "Ver detalhes do modelo" → "Levar para a Pausa" (o texto chega no rascunho) → fechar → voltar ao assistente → "Adaptar esta resposta na Pausa" → voltar | Passou. "Voltar" no assistente volta um passo interno antes de fechar |
| **Cliente com upsell (Reset)** | Store do Reset no formato antigo, com diagnóstico, mágoa, nota, noite, etapas e histórico. Início, Perfil, Meus Benefícios e os 5 módulos, a jornada e o Mapa | Passou. O progresso aparece (23%, etapa 2) e o store não foi alterado ao abrir os módulos |
| **Cliente sem upsell** | Mesmo store do Reset salvo no aparelho, mas sem a compra | Passou. O Reset não aparece no Início, no Perfil, em Meus Benefícios nem em Meu progresso. A tela do Reset tem trava própria (`entitlements.reset`) |

### 3.3 Auditoria de funcionalidades

| Verificação | Resultado |
|---|---|
| Todos os botões funcionam | Passou. Foram clicados 177 botões em 10 telas (Início, Perfil, Diário, Cenários, Plano, Mapa, 48 horas, Central, Meus Benefícios e Meu progresso), recarregando a tela a cada clique. Nenhum ficou sem efeito e nenhum gerou erro. Ficaram de fora os destrutivos (Sair, Recomeçar) e os de simulação |
| Links têm destino | Passou. Todos os `href` dependem de configuração e não aparecem vazios. Os links de benefício só aceitam `https://` |
| Filtros | Passou. Os 10 filtros de categoria batem com o número exibido. Os 7 de cenário, "Só o que posso usar agora" (some com limite), Favoritos (com estado vazio) e os filtros do Diário também funcionam |
| Busca | Passou. "saudade" dá 4 conteúdos, um termo inexistente mostra o estado vazio e "Limpar busca" volta aos 38 |
| Cópia de mensagens | Passou. Com um clique real, a área de transferência recebe exatamente o texto do modelo e aparece o aviso "Copiado" |
| Diagnóstico persistido | Passou. O rascunho e o diagnóstico concluído continuam depois de recarregar |
| Recomendações mudam com o cenário | Passou para conversa, espaço, pausa, bloqueio e outra relação: o Mapa, as 48 horas, a Central, o assistente, a Pausa e o plano mudam juntos |
| Progresso mantido | Passou. Os dias concluídos, as atividades das 48 horas e o checklist do plano continuam depois de recarregar |
| Diário preserva registros | Passou. Um humor por dia, sinal liga e desliga, "Agi por impulso" zera o contador e tudo continua depois de recarregar |
| Permissões do upsell | Passou. O Reset só aparece com `entitlements.reset`. Os 3 benefícios novos ficam em "pendente", porque o servidor ainda não informa essas chaves |
| Banco e pagamentos | Não alterados (seção 2). Não testados de ponta a ponta |

### 3.4 Auditoria visual

Larguras verificadas: 320, 375, 390 e 430 px, com emulação móvel, e 1280 px no desktop. Foram 23 telas, incluindo o diálogo de apoio, o drawer do dia, o Reset e os 7 módulos do Reset a 320 px.

Cada tela passou por uma checagem automática:

- rolagem horizontal da página;
- elementos para fora da tela;
- texto cortado;
- botões com conteúdo maior que a largura;
- contraste WCAG, a 375 px.

As telas de 320 px também foram revisadas uma a uma em capturas.

| Item | Resultado |
|---|---|
| Overflow e rolagem horizontal | Nenhuma rolagem horizontal em nenhuma largura |
| Textos cortados e botões sobrepostos | 3 problemas a 320 px, corrigidos (correções 4, 5 e 6). Sobra 1 caso baixo (seção 5) |
| Cards e espaçamento | Alinhados. No desktop, o app fica numa coluna de 430 px centralizada |
| Navegação | Abas, pilha de camadas, voltar e fechar funcionam. Nenhuma camada fica presa |
| Modais e overlays | O diálogo de apoio, o drawer do dia, a Pausa e as camadas sobrepostas abrem e fecham bem |
| Área segura | O código usa `env(safe-area-inset-*)` nos cabeçalhos, na navegação inferior e no cartão do plano, com `viewport-fit=cover`. **Não verificável em headless**: os valores são 0 fora de um aparelho real |
| Contraste | A maior parte passa. Abaixo do mínimo AA: os selos verdes de 10 px ("Para o seu momento", 3,69:1). Ver a seção 5 |

## 4. Problemas encontrados e corrigidos

| # | Gravidade | Problema | Correção |
|---|---|---|---|
| 1 | **Crítico** | Na Pausa, com bloqueio, pedido de não contato ou outra relação registrados, o "Não" do limite vinha marcado, mas podia virar "Sim". O resultado então era "Pode enviar, com calma", com o botão Copiar. A Pausa virava um caminho para contornar o bloqueio | A pergunta do limite fica travada quando o limite já está registrado, com a explicação "Registrado no seu diagnóstico ou no seu cenário. Se a situação mudou, atualize por lá". O resultado é sempre "Não envie" (`pause-tool.tsx`) |
| 2 | **Alto** | Com pedido de tempo ou sem reciprocidade, as 48 horas diziam "No seu momento, o resultado é sempre guardar", e a Central dizia "Nada de iniciativa sua". Mesmo assim, a Pausa respondia "Pode enviar" a uma mensagem iniciada por ela | Nesses momentos, o checklist ganha a pergunta "Ele escreveu primeiro, e você está respondendo?". "Não" leva a guardar por 24 horas, e responder a ele continua possível, como na Central. O texto das 48 horas foi ajustado. Ver `pauseQuestionsFor` em `lib/guide.ts` e `lib/jornada/first48.ts` |
| 3 | Médio | Com limite, o Dia 20 do plano mostrava o atalho "Preparar o encontro", uma reflexão de reencontro com ele. A regra só escondia os conteúdos do tipo modelo | `isContactLink` passa a esconder também as reflexões das categorias de contato: primeiro contato, perguntas, convites e reencontro (`lib/plan-guide.ts`) |
| 4 | Médio | A 320 px, os 4 atalhos de "Precisa de ajuda agora?" e de "Diário e ferramentas" se sobrepunham: o quadro tem 68 px e a coluna, 59 | O quadro acompanha a largura da coluna, até 68 px, e abaixo de 360 px o card tem padding e texto um pouco menores. Acima de 360 px, nada muda (`home/cards.tsx`, `home-screen.tsx`) |
| 5 | Médio | A 320 px, o botão "Levar para a Pausa" do detalhe da mensagem cortava o texto | Abaixo de 360 px, os dois botões ficam um embaixo do outro (`message-detail.tsx`) |
| 6 | Baixo | A 320 px, os botões "Abrir [módulo]" do Reset cortavam o nome do módulo | O botão quebra a linha (`reset/diagnosis-flow.tsx`, `reset/journey-view.tsx`) |
| 7 | Baixo | No Início, "1 de 7 dias" logo abaixo de "7 dias sem agir por impulso" contava os dias concluídos da fase. O Diário mostrava 0 dias sem impulso | O texto passa a ser "1 de 7 dias da fase", e "Meta da fase cumprida!" virou "Todos os dias da fase concluídos!" (`home-screen.tsx`) |
| 8 | Baixo (doc) | A matriz da VSL ainda dizia que o card do Reset abre o WhatsApp para quem não comprou, e não tinha o Acesso Total Vitalício. `revisao-vsl.md` tratava o diagnóstico como "a integrar" e o Reset como upsell atual | Documentos atualizados. A matriz ganhou a linha 35 |

Testes de regressão das correções 2 e 3: `lib/qa.test.ts`. A correção 1 é de interface e foi conferida no navegador, assim como a 2, a 4, a 5 e a 6, todas de novo num servidor limpo.

Durante a auditoria, uma vez, apareceu o erro "useJornada precisa estar dentro de JornadaProvider". A causa foi o recarregamento em tempo real (HMR) do servidor de desenvolvimento, depois de muitas edições seguidas no mesmo arquivo. Num servidor novo, o erro não se repete, e ele não existe no build de produção.

## 5. Problemas restantes

### Crítico

| # | Problema | O que fazer |
|---|---|---|
| C1 | **A publicidade contradiz o app.** O quiz e a VSL prometem:<br>• "fazer ele te responder mesmo que tenha te bloqueado";<br>• "recuperar o ex em 48 horas";<br>• "93% das mulheres", "suas chances são de 12%";<br>• "ativar o cérebro dele";<br>• técnicas que não existem no app.<br>Ver `docs/matriz-vsl-entregavel.md`, linhas 8 a 21 | Corrigir a VSL e o quiz antes de escalar o tráfego. As linhas 17 e 20 da matriz são o maior risco de reembolso e reclamação |
| C2 | **Os upsells atuais não liberam nada.** As chaves `conselheiro`, `circulo` e `vitalicio` não existem em `cr_my_entitlements`. Quem compra vê "Acesso pendente de configuração" e precisa falar com o suporte | Antes de vender ou anunciar os upsells com o app: aprovar e aplicar a integração da seção 4 de `docs/estrutura-comercial-upsells.md` (P0, fora do escopo desta etapa). Se os upsells já estão no funil, isso é urgente |

### Alto

| # | Problema | O que fazer |
|---|---|---|
| A1 | Todo o conteúdo novo está marcado como rascunho: os 38 conteúdos da Central, o assistente, as 48 horas, as variantes do plano e o Reset revisado | Fazer a revisão editorial (`pendencias-editoriais.md`, seção 3, e `pendencias-central-comunicacao.md`, seções 2 e 3) |
| A2 | Orientações de segurança sem validação de especialista: Ligue 180 e 190 na raiva com ameaça, CVV 188, respiração 4-4-6 e o trecho sobre violência no Reset | Validar com alguém da área de saúde mental antes de publicar |
| A3 | As variáveis de produção precisam existir: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPPORT_WHATSAPP` e os checkouts. Sem `VITE_SUPPORT_WHATSAPP`, o estado "pendente" manda falar com o suporte, mas não mostra o botão | Conferir no ambiente de build da Cloudflare |
| A4 | O progresso, o Diário, o diagnóstico e o Reset ficam só no `localStorage`: não sincronizam entre aparelhos e se perdem se o navegador for limpo | É uma limitação conhecida (P0). Avisar no suporte e na tela de Privacidade, e planejar a sincronização |
| A5 | Login real, compra e webhook da Payt não foram testados nesta auditoria (seção 6) | Fazer um teste de ponta a ponta em homologação, com uma compra de teste, antes de publicar |

### Médio

| # | Problema | O que fazer |
|---|---|---|
| M1 | "O que evitar" do plano não muda conforme o momento. Com limite:<br>• Dia 11: "Uma segunda mensagem se a primeira ficar sem resposta";<br>• Dia 20: "Reforçar o convite se ele não responder", enquanto a variante fala de convidar uma amiga.<br>Não incentivam contato, mas destoam da variante | Editorial: revisar a lista base ou permitir `avoid` nas variantes (`PlanVariant`) |
| M2 | Mapa × cenário do perfil: se o diagnóstico é "conversa" e o cenário do perfil é "outra pessoa", o card pessoal mostra "Conversa em andamento". A Pausa e a Central já respeitam o limite | Já registrado em `pendencias-editoriais.md`, seção 5. Sugestão: um aviso no Mapa |
| M3 | Reset, compras antigas: as opções do motivo mudaram de rótulo, mas não de valor. Antes, "traicao" valia para "Traição ou infidelidade", de qualquer um dos dois; agora vale para "Uma traição minha". Uma cliente antiga que marcou a opção porque ele traiu continua recebendo orientação de pedir perdão | Pedir às clientes antigas do Reset que refaçam o diagnóstico (por exemplo, um aviso no topo do Reset) ou aprovar uma migração |
| M4 | O card do Conselheiro promete "orientação sobre o momento certo de enviar uma mensagem", e ele também aparece para clientes com bloqueio | Operacional: o roteiro do atendimento precisa seguir as mesmas regras de limite do app |
| M5 | Os textos das Regras de ouro ("menos espaço ele tem para sentir falta", "disponibilidade total elimina a saudade") falam em provocar falta. Isso destoa do critério "não manipular" usado na Central | Revisão editorial |

### Baixo

| # | Problema | O que fazer |
|---|---|---|
| B1 | Contraste: os selos verdes de 10 px ("Para o seu momento", "Responder pode fazer sentido") ficam em 3,69:1. "Evite", os horários do Meu progresso, os selos "Seu" e "Sair" ficam entre 4,2 e 4,5:1 | Escurecer `--success` ou o texto do selo. É mudança de token do design: aprovar antes |
| B2 | A 320 px, o Perfil fica apertado: os valores à direita ("Ver ou ref...", "Ele está frio e d...") são truncados, e os rótulos quebram em 3 linhas | Opcional: esconder o valor à direita abaixo de 360 px |
| B3 | A 320 px, o rótulo "Ele respondeu?" passa 2 px da coluna. O texto fica visível e não encosta no vizinho | Nenhuma ação necessária |
| B4 | A lixeira do Diário apaga sem confirmação | Já registrado. Considerar um "desfazer" |
| B5 | Lint: 15 avisos de fast refresh (3 vieram desta evolução) | Opcional: mover hooks e constantes para arquivos `.ts` |
| B6 | Os documentos falam em "23 caminhos" no assistente. A interface tem 24 combinações de situação e resposta (23 com pergunta, mais "Ele pediu para eu parar") | Ajustar a contagem no próximo texto de venda |
| B7 | `docs/evolucao-entregavel.md`, seção 1, ainda descreve o Reset com pedido pelo WhatsApp | É histórico da etapa 1. O estado atual está na seção "correção de escopo dos upsells" |

## 6. Limitações desta auditoria

- **Navegador:** os testes usaram o Chrome headless no Windows. Não foram testados Safari (iOS), Chrome no Android, teclado virtual, área segura real, gestos nem o app instalado (PWA).
- **Login e compras:** o login foi o de teste local. `cr-login`, `cr_clients`, `cr_my_entitlements` reais, reembolso e a volta de uma compra feita em outra aba não foram exercitados. Nenhum desses arquivos mudou.
- **Build:** o build de produção não foi servido localmente, porque falta o `wrangler`. Só o bundle foi inspecionado.
- **Leitores de tela:** foram verificados só os rótulos `sr-only` e `aria-*` vistos durante os testes. Não houve teste com leitor de tela.
- **Conteúdo:** a leitura editorial foi por amostragem: o plano em modo bloqueio, o Mapa, as 48 horas, a Central e o assistente. A revisão completa e a de especialista continuam pendentes (A1 e A2).

## 7. Auditoria editorial (resumo)

A matriz completa, atualizada nesta auditoria, está em `docs/matriz-vsl-entregavel.md`.

| Classificação | Itens |
|---|---|
| **Atendidas** (9) | Plano de 21 dias em 4 fases; não agir no impulso (Pausa e Diário); orientação por cenário; o que responder quando ele escreve; e, para quem já tem o Reset, diagnóstico emocional, Mapa de Reconstrução, Consciência do Perdão, Mapa de Reconstrução da Confiança e a jornada de 7 etapas |
| **Parcialmente atendidas** (6) | Protocolo personalizado: há personalização por regras, mas a reconquista não depende do app. Mensagens prontas: há modelos, mas não as mensagens citadas na VSL. 48 horas: é estabilização dela, não volta dele. No Reset: os áudios (só o roteiro, nada gravado), a "Reconexão Subconsciente" (é um guia prático) e a "Reversão Noturna" (é um ritual dela) |
| **Técnicas sem material original** (7) | Mensagem de 3 palavras, mensagem com H, "pensando aqui", frase número 3, frase do Replay, buraco negro emocional e o vídeo de 60 segundos. Nenhum texto foi inventado, e um teste barra esses nomes na Central |
| **Corrigir na publicidade** | Responder mesmo com bloqueio; 48 horas; 7 dias; "93%" e "12%"; "cérebro dele"; "mesmo que esteja com outra"; depoimentos sem autorização; garantia ligada ao resultado; "até reconquistar" do Conselheiro; "vitalício" sem a permissão no banco |
| **Conteúdos ainda superficiais** | Os textos-base do "Entenda" em dias com variante de limite (o Dia 11 fala da primeira mensagem antes da variante); a lista "O que evitar" sem variante (M1); o Vitalício sem a lista de produtos da linha |
| **Exigem revisão especializada** | Orientações de crise e violência (180, 188, 190), a respiração 4-4-6 (48 horas, assistente e Reset), o trecho sobre agressão em "Responsabilidade não é culpa" e os prazos de contato citados na Central |

Nenhum texto do app apresenta a reconciliação como garantida. Avisos como "não garantem um resultado" aparecem no Mapa, nas 48 horas, na Central, no assistente, no Reset e em Meu progresso, e os testes cobrem a ausência de promessa nos marcos e no Reset.

## 8. Recomendações antes da publicação

1. Resolver C1: ajustar a VSL e o quiz, com prioridade para o bloqueio e as 48 horas.
2. Resolver C2 ou tirar os upsells do funil até as permissões existirem.
3. Conferir as variáveis de produção (A3).
4. Fazer um teste em homologação (A5):
   - login com um e-mail de compra real;
   - uma compra de teste e um reembolso de teste;
   - o mesmo roteiro desta auditoria num iPhone e num Android, incluindo a área segura e a instalação como app.
5. Concluir a revisão editorial e a de especialista (A1 e A2), ou publicar deixando claro que é uma versão inicial.
6. Decidir os itens M3 (diagnóstico antigo do Reset) e B1 (contraste).

## 9. Como executar e testar localmente

```bash
cd app
npm install
npm run typecheck && npm run lint && npm test && npm run build
npm run dev          # abre na porta indicada no terminal
```

1. Na tela de entrada, digite qualquer e-mail e toque em **"Teste local (só em desenvolvimento)"**.
2. No Perfil, na área de teste local, é possível simular a passagem de 1 dia, simular a compra do Reset e alternar o estado dos três benefícios.
3. Para repetir os casos desta auditoria:
   - **cliente bloqueada:** refaça o diagnóstico com "Ele me bloqueou" e tente marcar "Sim" na pergunta do limite da Pausa. O botão está travado, e o resultado é "Não envie";
   - **sem reciprocidade:** faça o diagnóstico com "Ele responde, mas está frio" e "Enviar mensagens". A Pausa pergunta "Ele escreveu primeiro?";
   - **320 px:** no DevTools, use a largura de 320 px e confira o Início e o detalhe de uma mensagem da Central.
