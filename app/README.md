# Código da Reconquista

Webapp mobile-first do protocolo personalizado de reconquista. A experiência principal está organizada em quatro áreas: **Meu Protocolo Personalizado**, **Mensagens e Técnicas**, **O Que Fazer Depois** e **Situações Especiais**.

A base técnica é React 19, TanStack Start, Tailwind 4 e TypeScript. A entrada usa o e-mail da compra e o Supabase confere o acesso. Diagnóstico, favoritos e outros dados de uso continuam salvos no `localStorage`, separados por e-mail e sem sincronização entre aparelhos.

O plano de 21 dias, o Diário, o Meu Plano de 48 Horas e o progresso continuam preservados no código e nos dados antigos, mas estão ocultos por `src/lib/features.ts`. Essa decisão mantém a entrega concentrada no que foi prometido na VSL.

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
- `npm test`: executa os testes das regras e matrizes de segurança
- `npm run format`: formata o código

### Testar localmente

Em desenvolvimento, digite um e-mail válido e use **Teste local: entrar sem conferir a compra**. Os controles de simulação ficam no Perfil e só aparecem com `npm run dev`.

Para limpar o estado local, use **Perfil > Apagar os dados deste aparelho**.

## Onde fica cada coisa

| Caminho | O que é |
|---|---|
| `src/components/reconquista-app.tsx` | Shell do app: abas, pilha de camadas, celebração e aviso (toast) |
| `src/components/home/` | Home enxuta, navegação inferior e cards existentes |
| `src/components/jornada/` | Diagnóstico, Mapa e Plano de 48 Horas preservado (oculto) |
| `src/components/comunicacao/` | Central de Comunicação, mensagens e assistente de respostas |
| `src/components/scenarios/` | Situações especiais e orientação detalhada por cenário |
| `src/components/tools/` | Pausa antes de enviar e Regras de ouro |
| `src/components/plan/`, `src/components/diary-screen.tsx`, `src/components/progress-screen.tsx` | Experiências antigas preservadas e ocultas |
| `src/components/reset/` | Reset Emocional do Ex, legado e visível somente para quem já comprou |
| `src/lib/features.ts` | Flags que ocultam as experiências fora do escopo atual |
| `src/lib/jornada/` | Diagnóstico, Mapa, técnicas da VSL e persistência local |
| `src/lib/comunicacao/` | Conteúdos e regras da Central e do assistente |
| `src/lib/scenarios.ts` | Os seis cenários e suas orientações |
| `src/lib/store.tsx` | Login, permissões e dados locais separados por e-mail |
| `src/lib/config.ts` | Links que vêm do `.env` (`VITE_SUPPORT_WHATSAPP`) |
| `src/styles.css` | Tokens do design system, no mesmo formato do Calm Kids (Nunito, cards arredondados, tints) |
| `src/lib/illustrations.ts` + `src/assets/emoji/` | Emojis 3D (Fluent Emoji, MIT, os mesmos do GoodKids) usados nos tiles, cards e celebrações |

As sete técnicas anunciadas estão disponíveis como versões editoriais próprias do aplicativo. Elas não reproduzem um material original externo: foram criadas para esta entrega, estão marcadas como `rascunho` e seguem as mesmas regras de limite e Pausa da Central. Consulte `docs/CONTINUIDADE-DESENVOLVIMENTO.md` e `docs/pendencias-central-comunicacao.md`.

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

O login por e-mail da compra já está implementado em `cr-login`. Esta etapa de simplificação não alterou autenticação, banco, RLS, webhook ou regras de compra.

## Upsell #01: Reset Emocional do Ex

Módulo premium legado dentro do app. A entrada aparece no Perfil somente para quem já comprou. O código está em `src/components/reset/` e `src/lib/reset/`.

- **Permissão:** só quem tem compra paga de um produto com `grants_reset` vê a entrada e o conteúdo. Quem comprou apenas o Código da Reconquista não vê o módulo.
  - O app lê a permissão por `cr_my_entitlements()`.
  - Migration: `supabase/migrations/20261008180000_cr_reset_entitlement.sql`.
  - Enquanto essa migration não estiver aplicada no banco, o Reset fica bloqueado para todas.
- **Liberação pela Payt:** quando chega um upsell novo cujo nome tem "reset", ele já entra liberando o módulo. Se o nome do produto na Payt for outro, rode:
  `update public.cr_products set grants_reset = true where code = '<código>';`
- **Botão de compra:** `VITE_RESET_CHECKOUT_URL` (checkout da Payt). Vazio = a tela do produto não mostra botão de compra.
- **Conteúdo:** diagnóstico de 6 perguntas com regras de personalização (`diagnosis.ts`), 5 módulos e a jornada de 7 etapas (`content.ts`). É **rascunho** e precisa de revisão.
- **Limite:** se ela responder que ele pediu para não haver contato ou bloqueou, o app não recomenda contato e não mostra o botão de copiar o pedido de desculpas.
- **Áudios:** coloque os arquivos em `src/assets/audio/reset/` (ver o `LEIA-ME.md` da pasta). Sem arquivo, o player mostra "Áudio em gravação" e a transcrição, sem simular reprodução.
- **Progresso:** no aparelho, separado por e-mail (mesma limitação do Diário: não sincroniza entre aparelhos). O histórico de diagnósticos é guardado.
- **Teste local:** em `npm run dev`, Perfil > Teste local > "Simular compra do Reset".

## Plano de 21 dias preservado

O plano está oculto na interface atual, mas o código, os dados existentes e a liberação manual continuam preservados. Para abrir todos os dias para uma cliente caso a funcionalidade volte a ser exibida:

```sql
update public.cr_clients set unlock_all = true where email = '<e-mail>';
```

O app lê a flag por `cr_my_entitlements()` (`all_days`). Migration: `supabase/migrations/20261008210000_cr_unlock_all_days.sql`.
