# Código da Reconquista: plano do entregável (webapp)

Este é o app que a cliente recebe depois de comprar o Código da Reconquista: um protocolo de 21 dias para agir com mais controle emocional, reconstruir a comunicação depois do término e adaptar a postura a cada cenário.

O posicionamento é autocontrole, presença, comunicação leve e reconstrução gradual. O app não promete que ele volta e nunca orienta contornar bloqueio, insistir ou pressionar.

## Referências

- **calmbaby-entregavel**: a base técnica e de UX. Tem um shell único com abas e pilha de camadas, um store com Supabase e RLS, a regra de liberação dos dias (`progress.ts`), o plano guardado como dado, `config.ts`, onboarding, diário e perfil.
- **calmkids-entregavel**: a primeira geração. Daqui vêm a tela de situação (base dos Cenários), os marcos de celebração e as lições registradas em `docs/` (botões sem destino, nenhuma métrica, todos os dias abertos).
- **Codigo_da_Reconquista_Protocolo_Digital.pdf**: a identidade visual e a lógica do conteúdo. Não é a copy final.
- **codigo-da-reconquista** (funil): o que foi prometido na venda (quiz, up1, up2, página de obrigado).

## Estrutura

Navegação: Início · Plano · Cenários · Diário · Mais. Assim como no CalmBaby, o Plano é uma tela própria com o card flutuante e sem a navegação inferior.

| Fase | Dias | Meta |
|---|---|---|
| 1 Reset emocional | 1–7 | 7 dias sem agir por impulso |
| 2 Nova comunicação | 8–13 | uma mensagem curta, leve e aberta, sem esperar resposta |
| 3 Reconexão | 14–18 | conversas leves que terminam antes de cansar |
| 4 Do contato ao reencontro | 19–21 | convidar sem pressão, ou decidir que ainda não é hora |

Cenários: ele me bloqueou, ele está frio e distante, ele está com outra pessoa, ele perdeu o interesse, ele respondeu e quero chamar para um encontro.

Ferramentas em camada: Pausa antes de enviar (rascunho, checklist e resultado), Regras de ouro, dia do plano e detalhe do cenário.

Banco (Supabase, prefixo `cr_`):

- `cr_products`, `cr_clients`, `cr_purchases`, `cr_webhook_events`
- `cr_profiles`: apelido, cenário, quando terminaram, data do compromisso
- `cr_plan_progress`
- `cr_journal_entries`: humor, impulso, contato, sinais, rascunho
- `cr_events`
- Funções `cr_current_client_id`, `cr_email_has_access` e `cr_my_entitlements`, mais as Edge Functions `cr-login` e `cr-payt-webhook`.

## Fases de implementação

| Fase | Entrega | Situação |
|---|---|---|
| 0 Assets e design system | Tokens, fontes, marca, ícones do PWA, emblemas, medalhas, mapa de ícones e mockups (`design/`, `brand/`) | concluída |
| 1A App navegável local | App React/TanStack em `app/`, sem backend: onboarding, Início, Plano, Cenários, Diário, Mais, Pausa, detalhe do dia e do cenário, marcos 7/14/21, gravação no localStorage | concluída |
| 1B Base de produção | Ver abaixo | próxima |
| 2 Backend | Supabase (`cr_*`), login por e-mail da compra, webhook da Payt, produtos | depois da 1B |
| 3 Personalização por cenário | Início e ações do dia adaptados ao cenário | |
| 4 Retenção e ofertas | `cr_events`, e-mail diário, banner de retorno, ofertas no momento certo | |

## Decisões tomadas

- **Fases:** 1–7, 8–13, 14–18 e 19–21. Os marcos de celebração ficam nos dias 7, 14 e 21.
- **Fotos do PDF:** só como referência visual, não como asset.
- **Produto principal:** Plano 21 dias, Cenários, Diário e Pausa antes de enviar.
- **"Técnica da Madrugada":** vira uma proteção dentro da Pausa: no pico emocional, guardar a mensagem, esperar 24h e não enviar.
- **"Sequência de Resposta Imediata":** pode virar banco de respostas por cenário, sem prometer manipulação. Na 1A, os modelos dos cenários já fazem esse papel e não há oferta.
- **Supabase e Payt:** ficam para depois. Prefixo `cr_` planejado.

## Decisões pendentes

1. **Up1:** confirmar a promessa exata da oferta.
2. **Promessas do quiz:** "atalho sujo" e "trazê-lo de volta em 48 horas" não serão cumpridos pelo app. A recomendação é ajustar o funil.
3. **Suporte:** número de WhatsApp (`VITE_SUPPORT_WHATSAPP`). Sem ele, o item não aparece.
4. **Conteúdo:** revisar o texto dos 21 dias, dos cenários e das regras (hoje é rascunho escrito a partir do PDF).
