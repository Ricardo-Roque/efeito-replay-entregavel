# Código da Reconquista: divergências entre a VSL e o entregável

Este documento serve para revisar a VSL. Ele lista o que a publicidade promete e o que o app pode entregar com honestidade. O app não muda sua copy para acompanhar essas promessas.

## Alegações que o produto não pode garantir

| Alegação na VSL | Problema | Sugestão para a VSL |
|---|---|---|
| Reconquista em 48 horas | o resultado depende da outra pessoa e não pode ser prometido. No app, "48 horas" é um protocolo de estabilização emocional dela | "Um plano para as primeiras 48 horas depois do término" |
| Reconquista em 7 dias | mesmo problema | "Os primeiros 7 dias sem agir por impulso" (meta real da Fase 1) |
| Garantia vinculada a 30 dias | se a garantia for de satisfação ou reembolso (CDC, 7 dias no mínimo para compra online), deixar claro que não depende de ele voltar | explicitar o tipo e as condições da garantia |
| Controle dos sentimentos dele, despertar interesse e saudade "com certeza" | ninguém controla o que outra pessoa sente, e o app não interpreta o que ele sente | "Como se comunicar de forma leve e respeitosa" |
| Protocolo personalizado | só é verdade depois que o diagnóstico for integrado (etapa seguinte) | manter apenas quando o diagnóstico estiver no ar |
| Técnicas com nome próprio (lista abaixo) | o app ainda não tem o conteúdo que as define | não citar na VSL uma técnica que o app não entrega |

## Técnicas citadas, aguardando material

Nenhum texto foi inventado para estas técnicas. No código, elas estão em `app/src/lib/jornada/messages.ts` (`vslTechniques`) com `status: "aguardando_material"` e não aparecem para a cliente. O que foi procurado, o que pedir ao autor e como incluir: `docs/pendencias-central-comunicacao.md`.

| Técnica | O que falta |
|---|---|
| Mensagem de três palavras | o texto e o contexto de uso |
| Mensagem que começa com H | o texto e o contexto de uso |
| Mensagem "pensando aqui" | o texto e o contexto de uso |
| Frase número 3 | o texto, e de que lista ela é a número 3 |
| Frase do Replay | o texto e o contexto de uso |
| Técnica do buraco negro emocional | a definição. Se envolver manipular os sentimentos dele, provocar ciúme ou culpa, não entra no app |

Critérios para aceitar o material:

- A técnica não contorna bloqueio nem pedido de distância.
- Não usa terceiros para chegar até ele.
- Não promete efeito sobre ele.
- Passa pela Pausa antes de enviar.

## O que o app entrega e pode ser anunciado

- O plano de 21 dias em 4 fases, com meta de 7 dias sem agir por impulso.
- A ferramenta Pausa antes de enviar, com a proteção de 24h no pico emocional.
- Os 6 cenários, cada um com o que fazer, o que evitar e quando parar.
- O Diário emocional, com os sinais de abertura, alerta e pare.
- As Regras de ouro.
- Assim que forem integrados: o diagnóstico de entrada, as primeiras 48 horas (estabilização) e a central de mensagens, com o guia do que responder quando ele entra em contato.
- O Reset Emocional do Ex (upsell).
