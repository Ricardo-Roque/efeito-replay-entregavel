# Código da Reconquista: app (Fase 1A)

Webapp mobile-first do protocolo de 21 dias. A base técnica é a mesma do CalmBaby: React 19, TanStack Start, Tailwind 4 e TypeScript.

Nesta fase o app funciona **sem backend**. Não há login, Supabase, Payt nem deploy. Tudo fica salvo no `localStorage` do navegador.

## Rodar localmente

Precisa do Node 20 ou mais recente.

```bash
cd app
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal (normalmente http://localhost:5173). Para ver no celular, use o endereço "Network" com o celular na mesma rede Wi-Fi.

Outros comandos:

- `npm run build`: gera a versão de produção (`.output/`)
- `npm run typecheck`: confere os tipos
- `npm run lint`: roda o lint
- `npm run format`: formata o código

### Testar a jornada sem esperar

Um dia do plano libera no dia seguinte ao que o anterior foi concluído (mesma regra do CalmBaby). Para testar, use **Mais > Teste local > Simular a passagem de 1 dia**. Esse botão só aparece com `npm run dev`; ele recua todas as datas salvas em um dia.

Para começar do zero, use **Mais > Recomeçar do zero**.

## Onde fica cada coisa

| Caminho | O que é |
|---|---|
| `src/components/reconquista-app.tsx` | Shell do app: abas, pilha de camadas, celebração e aviso (toast) |
| `src/components/home/` | Início, navegação inferior e cards |
| `src/components/plan/` | Plano 21 dias (trilha, cabeçalho da fase, card flutuante, gaveta), detalhe do dia e celebração |
| `src/components/scenarios/` | Grade de cenários e detalhe do cenário |
| `src/components/diary-screen.tsx` | Diário |
| `src/components/more-screen.tsx` | Mais (perfil, menu, diálogos) |
| `src/components/tools/` | Pausa antes de enviar, Regras de ouro e Meu compromisso |
| `src/components/onboarding.tsx` | Primeiro acesso: nome, quando terminaram, cenário e compromisso |
| `src/lib/plan.ts` | Fases, os 21 dias e os marcos (7, 14 e 21), guardados como dado |
| `src/lib/scenarios.ts` | Os 6 cenários e o banco de respostas de cada um |
| `src/lib/guide.ts` | Regras de ouro, sinais, checklist da Pausa, compromisso e apoio |
| `src/lib/store.tsx` | Estado e gravação no localStorage (mesma API que a versão com Supabase vai usar) |
| `src/lib/progress.ts` | Liberação dos dias, progresso e contador de dias sem impulso |
| `src/lib/config.ts` | Links que vêm do `.env` (`VITE_SUPPORT_WHATSAPP`) |
| `src/styles.css` | Tokens do design system, no mesmo formato do Calm Kids (Nunito, cards arredondados, tints) |
| `src/lib/illustrations.ts` + `src/assets/emoji/` | Emojis 3D (Fluent Emoji, MIT, os mesmos do GoodKids) usados nos tiles, cards e celebrações |

O conteúdo de `plan.ts`, `scenarios.ts` e `guide.ts` ainda é **rascunho** e precisa de revisão antes de ir para clientes.

## Publicação (Cloudflare)

Igual ao CalmBaby: no painel da Cloudflare, **Workers & Pages → Create → Import a repository**:

- **Root directory:** `app`
- **Build command:** `npm run build`
- **Variáveis (opcional):** `VITE_SUPPORT_WHATSAPP`

Cada push na `main` publica de novo.

O que já está ajustado para produção:
- **Carregamento:** só o Início entra no carregamento inicial. As outras abas e ferramentas carregam sob demanda e são pré-carregadas quando o navegador fica ocioso.
- **Imagens:** sempre como arquivo, nunca embutidas no JS, com cache de 1 ano.
- **Fonte:** Nunito reduzida aos caracteres latinos (33 KB).
- **Segurança:** cabeçalhos aplicados tanto nos arquivos (`public/_headers`) quanto na página (`src/server.ts`).
- **Buscadores:** `noindex` e `robots.txt`, porque é área de clientes.
- **Celular:** meta tags para o app instalado na tela inicial (iPhone e Android).

Para testar a build de produção localmente: `npm run build` e depois, dentro de `.output`,
`npx wrangler dev -c server/wrangler.json`. O `vite preview` não funciona com essa saída.

## Payt (postback de vendas)

URL do postback, a ser cadastrada nos produtos do Código da Reconquista na Payt:

```
https://bionetfauvpcwlhqvvum.supabase.co/functions/v1/cr-payt-webhook
```

- Supabase do Grupo RME, tabelas com prefixo `cr_` (migration em `supabase/migrations/`, função em `supabase/functions/cr-payt-webhook/`).
- A chave de integração é a mesma da conta Payt já usada pelo Calm Kids (`PAYT_INTEGRATION_KEY`). Para usar outra chave, crie o segredo `CR_PAYT_INTEGRATION_KEY`.
- Produto novo é cadastrado sozinho em `cr_products`: o pedido principal (`type=order`) já libera o app, e upsell entra sem liberar nada.
- Reembolso, chargeback e cancelamento tiram o acesso automaticamente.
- Os eventos de teste da Payt são ignorados. Para aceitá-los, crie o segredo `CR_PAYT_ACCEPT_TEST=true`.
- Tudo que chega fica registrado em `cr_webhook_events`.

O app ainda não tem login: as compras ficam registradas e com acesso liberado no banco, mas a entrada por e-mail (`cr-login`) é a próxima etapa.
