# Estrutura comercial e upsells do Código da Reconquista

Atualizado em 14/10/2026. Este documento substitui qualquer referência anterior ao Reset Emocional do Ex como "upsell #01".

## 1. Produto principal

**Código da Reconquista.** Diagnóstico, Meu Mapa de Reconquista, Meu Plano de 48 Horas, Central de Comunicação, "Ele respondeu. E agora?", protocolo de 21 dias, cenários, Diário e ferramentas.

- Acesso: compra `paid` de um produto com `grants_app` (`cr_current_client_id`, `cr_my_entitlements.app`).
- Reembolso, chargeback e cancelamento tiram o acesso pelo webhook da Payt.
- Nenhuma regra de duração existe no banco hoje. O acesso dura enquanto a compra estiver `paid`. O app **não** apresenta esse acesso como "vitalício".

## 2. Os três upsells oficiais

| # | Oferta | Preço | Formato de entrega | O que **não** é |
|---|---|---|---|---|
| 01 | Conselheiro da Reconquista | R$ 19,90 | Acompanhamento individual pelo WhatsApp | Curso, módulo ou aulas gravadas |
| 02 | Círculo da Reconquista | R$ 14,90 | Acesso a uma comunidade de mulheres | Produto digital ou módulo educacional |
| 03 | Código da Reconquista: Acesso Total Vitalício | R$ 19,90 | Modalidade de acesso e pacote de produtos digitais | Curso novo ou assinatura recorrente |

As três permissões são **independentes**. Nenhuma inclui as outras, salvo uma regra de pacote confirmada por escrito.

### 01 · Conselheiro da Reconquista

O que a oferta promete:

- contar a história e receber orientação personalizada;
- ajuda para interpretar as respostas e as atitudes do ex;
- orientação sobre o momento de enviar mensagens;
- ajuda para escolher as palavras de uma mensagem;
- ajuste dos próximos passos conforme a situação evoluir;
- acompanhamento individual "até a reconquista", como anunciado na oferta.

O app sempre mostra junto: "O acompanhamento oferece orientação. A reconciliação também depende da vontade dele."

**Análise comercial:** a expressão "acompanhamento até reconquistar" está na oferta e foi preservada aqui. As condições operacionais reais ainda não foram definidas: duração, critério de encerramento, prazo de resposta e limite de mensagens. O app não promete nenhuma duração. Ver seção 6.

### 02 · Círculo da Reconquista

O que a oferta promete: compartilhar dúvidas, acolhimento, conversas sobre experiências parecidas, troca de experiências sobre o método, celebração de avanços e apoio em momentos de saudade e insegurança.

Combinados exibidos no app: respeito entre participantes, privacidade dos relatos, proibição de divulgar dados pessoais de terceiros, nada de incentivar perseguição, insistência ou contato contra a vontade da outra pessoa, e acolhimento sem promessas de resultado (`CIRCLE_RULES` em `app/src/lib/benefits.ts`).

### 03 · Código da Reconquista: Acesso Total Vitalício

O que a oferta promete: acesso vitalício ao Código da Reconquista, todos os produtos digitais da linha, todas as futuras atualizações e acesso contínuo, sem mensalidade nem renovação.

**Não inclui** o Conselheiro nem o Círculo, a menos que isso seja confirmado. A oferta fala só em produtos digitais.

O app separa três tipos de item (`LIFETIME_ITEMS`):

| Item | Status no app |
|---|---|
| Código da Reconquista | Disponível |
| Outros produtos digitais da linha | Ainda não cadastrado: a lista não foi definida |
| Atualizações do Código da Reconquista | Em breve: nenhuma foi publicada |

## 3. O que aparece no app

**No Início**, em Conteúdos complementares, cada oferta tem o seu card: Conselheiro da Reconquista, Círculo da Reconquista e Acesso Total Vitalício. Com o benefício liberado pelo servidor, o card mostra "Liberado" e "Abrir". Sem ele, mostra "Extra", o cadeado e "Conhecer". Cada card abre a tela daquele benefício.

**Meus Benefícios** (`components/benefits-screen.tsx`) abre pelo Perfil, com as três ofertas juntas. A tela mostra um card por oferta, cada um com um destes estados:

| Estado | Quando | O que aparece |
|---|---|---|
| **Acesso liberado** (no vitalício, "Acesso vitalício ativo") | o servidor devolve `true` para o benefício | Conselheiro: como funciona, horários, aviso e "Conversar no WhatsApp". Círculo: como entrar, combinados e "Acessar comunidade". Vitalício: lista de materiais com status |
| **Não adquirido** | o servidor devolve `false` | O que a oferta inclui e "Conhecer a oferta", só se houver checkout configurado |
| **Acesso pendente de configuração** | o servidor não informa o benefício (situação atual) | O que a oferta inclui, "Conhecer a oferta" (se houver checkout), "Já comprei: atualizar meu acesso" e "Falar com o suporte" (se houver número configurado) |

Regras:

- O botão do WhatsApp do Conselheiro e o botão da comunidade só existem no estado "liberado".
- O estado "liberado" vem só de `cr_my_entitlements`. Estado local, parâmetro de URL e nome de produto nunca liberam nada. Um teste cobre esses casos (`lib/benefits.test.ts`).
- A mensagem pronta para o Conselheiro leva só o e-mail da compra, para identificar a cliente.
- Nenhuma tela diz "seu acompanhamento individual está confirmado" a quem não tem o Conselheiro liberado.

## 4. Permissões

### Já existentes (`cr_my_entitlements`)

| Chave | Origem | Uso no app |
|---|---|---|
| `app` | `cr_products.grants_app` (pedido principal, `type=order`) | acesso ao app (via RLS e login) |
| `reset` | `cr_products.grants_reset` (produto com "reset" no nome) | Reset Emocional do Ex (legado) |
| `all_days` | `cr_clients.unlock_all` (manual) | abre os 21 dias |

Upsell novo que chega pelo webhook é cadastrado com `grants_app = false` e sem `grants_reset`, a menos que tenha "reset" no nome. Ou seja, **uma compra do Conselheiro, do Círculo ou do Vitalício hoje não libera nada**, nem por engano.

### Ainda não implementadas (P0, fora do escopo desta etapa)

O app já lê as chaves abaixo se o servidor passar a devolvê-las. Só valor booleano conta (`parseBenefitGrants`):

| Chave esperada | Benefício |
|---|---|
| `conselheiro` | Conselheiro da Reconquista |
| `circulo` | Círculo da Reconquista |
| `vitalicio` | Acesso Total Vitalício |

Integração sugerida, a aprovar antes de mexer no backend financeiro:

1. Migration nova, sem alterar as anteriores: colunas `grants_conselheiro`, `grants_circulo` e `grants_vitalicio` (boolean, default `false`) em `cr_products`.
2. Marcar manualmente os códigos dos produtos na Payt, sem depender do nome: `update public.cr_products set grants_conselheiro = true where code = '<código>';`. Mapear os códigos reais antes.
3. `create or replace` em `cr_my_entitlements` acrescentando as três chaves com `bool_or(...)`, mantendo `app`, `reset` e `all_days` iguais.
4. Decidir se o Vitalício deve manter o acesso ao app mesmo que o pedido principal seja reembolsado. Hoje o acesso depende de `grants_app`. Não mudar sem decisão.
5. Com as chaves no servidor, o estado "pendente" some sozinho: `true` vira "liberado" e `false` vira "não adquirido". Nenhuma mudança no app.

O link da comunidade vai no código do app (variável `VITE_*`). Se o convite tiver de ficar privado, a próxima etapa é o servidor devolver o link só para quem tem `circulo = true`, por exemplo numa função `cr_my_benefit_links()`.

## 5. Configurações (`app/.env.example`)

| Variável | Uso | Vazio |
|---|---|---|
| `VITE_CONSELHEIRO_WHATSAPP` | canal oficial do Conselheiro (dígitos com DDI) | card liberado avisa que o canal está sendo configurado |
| `VITE_CONSELHEIRO_HORARIOS` | horários e condições, em texto | card avisa que serão informados |
| `VITE_CONSELHEIRO_CHECKOUT_URL` | "Conhecer a oferta" | sem botão |
| `VITE_CIRCULO_URL` | entrada da comunidade (https, com aprovação na entrada) | card liberado avisa que o acesso está sendo configurado |
| `VITE_CIRCULO_CHECKOUT_URL` | "Conhecer a oferta" | sem botão |
| `VITE_VITALICIO_CHECKOUT_URL` | "Conhecer a oferta" | sem botão |
| `VITE_SUPPORT_WHATSAPP` | "Falar com o suporte" no estado pendente | sem botão |

Só links `https://` são aceitos. Nenhum número, link ou convite foi inventado.

## 6. Pendências

### Técnicas (dependem de autorização para o P0)

- Permissões `conselheiro`, `circulo` e `vitalicio` no banco e em `cr_my_entitlements` (seção 4).
- Códigos dos três produtos na Payt.
- Link privado da comunidade servido pelo backend, se o convite não puder ficar no código do app.
- Política do Vitalício em caso de reembolso do pedido principal.

### Operacionais (comerciais)

- Número oficial do WhatsApp do Conselheiro.
- Quem atende como conselheira ou conselheiro (o app não cita ninguém).
- Horários, prazo de resposta e limite de mensagens.
- Condições reais de "acompanhamento até a reconquista": duração e critério de encerramento.
- Como o atendimento confere se quem chamou comprou o Conselheiro (o botão some para quem não comprou, mas o número em si não é secreto).
- Plataforma e link do Círculo, moderação e aprovação na entrada.
- Lista definitiva dos "produtos digitais da linha" do Vitalício.
- Checkouts das três ofertas.
- Copy do segundo upsell, que pressupõe a compra do Conselheiro: ajustar na página de venda (fora do app).

## 7. Compras antigas: Reset Emocional do Ex

- O Reset deixou de ser uma oferta atual. Não aparece mais como promoção nem como "Pedir acesso" para quem não comprou.
- O código do módulo, o conteúdo, o store (`codigo-reconquista:reset:v1:<email>`), a permissão `grants_reset`, a chave `reset` e o gatilho do webhook continuam iguais.
- Quem já comprou continua vendo o Reset no Perfil, em Meus Benefícios ("Outros conteúdos da sua conta") e em Meu progresso. O card do Reset saiu do Início.
- Saiu do app só o pedido de acesso pelo WhatsApp (`lib/reset/access.ts` e `VITE_RESET_WHATSAPP`). `VITE_RESET_CHECKOUT_URL` continua, usado apenas na tela bloqueada do Reset.
- Nenhum nome ou código de produto antigo foi renomeado. Antes de qualquer migração (por exemplo, dar o Reset a quem tem o Vitalício), é preciso aprovar uma política.
