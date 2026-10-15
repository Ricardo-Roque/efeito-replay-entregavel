# Código da Reconquista: divergências entre a VSL e o entregável

Este documento serve para revisar a VSL. Ele lista o que a publicidade promete e o que o app pode entregar com honestidade. O app não muda sua copy para acompanhar essas promessas.

## Alegações que o produto não pode garantir

| Alegação na VSL | Problema | Sugestão para a VSL |
|---|---|---|
| Reconquista em 48 horas | o resultado depende da outra pessoa e não pode ser prometido. No app, "48 horas" é um protocolo de estabilização emocional dela | "Um plano para as primeiras 48 horas depois do término" |
| Reconquista em 7 dias | mesmo problema | "Os primeiros 7 dias sem agir por impulso" (meta real da Fase 1) |
| Garantia vinculada a 30 dias | se a garantia for de satisfação ou reembolso (CDC, 7 dias no mínimo para compra online), deixar claro que não depende de ele voltar | explicitar o tipo e as condições da garantia |
| Controle dos sentimentos dele, despertar interesse e saudade "com certeza" | ninguém controla o que outra pessoa sente, e o app não interpreta o que ele sente | "Como se comunicar de forma leve e respeitosa" |
| Protocolo personalizado | o diagnóstico de 6 perguntas já está no app e ajusta Mapa, 48 horas, Central, Pausa e plano por regras explícitas. O resultado (reconquista) continua não dependendo do app | "Um plano personalizado para a sua situação" (ver `docs/matriz-vsl-entregavel.md`, linha 1) |
| Técnicas com nome próprio (lista abaixo) | o app entrega versões editoriais próprias, e não uma reprodução de material original da VSL | descrever como ferramentas do aplicativo e revisar as frases da venda contra o conteúdo real |

## Técnicas citadas, com versões editoriais no aplicativo

As sete técnicas foram criadas como conteúdo editorial próprio do Código da Reconquista. No código, estão em `app/src/lib/jornada/messages.ts` (`vslTechniques`) com `status: "rascunho"` e abrem módulos completos na Home. Como o material original da VSL não foi fornecido, a interface informa a origem editorial e não apresenta os textos como reprodução de um método anterior.

| Técnica | Versão entregue no app |
|---|---|
| Mensagem de três palavras | “Lembrei de você.”, somente com contato aberto e lembrança verdadeira |
| Mensagem que começa com H | lembrança concreta iniciada por “Hoje”, com campos para lugar e lembrança |
| Mensagem "pensando aqui" | reconhecimento de uma conversa recente, sem pedido ou cobrança |
| Frase número 3 | “Entendi. Vamos com calma.”, usada apenas como resposta |
| Frase do Replay | fechamento respeitoso de uma conversa recente e recíproca |
| Técnica do buraco negro emocional | pausa de 30 minutos para absorver o próprio impulso, sem sumiço calculado |
| Técnica noturna mencionada na oferta | prática de encerramento da noite, distinta do módulo noturno do Reset |

Critérios aplicados às versões editoriais:

- A técnica não contorna bloqueio nem pedido de distância.
- Não usa terceiros para chegar até ele.
- Não promete efeito sobre ele.
- Passa pela Pausa antes de enviar.

## O que o app entrega na experiência principal

- Meu Protocolo Personalizado: diagnóstico de seis perguntas e Mapa com situação, orientações, o que fazer primeiro e o que evitar.
- Mensagens e Técnicas: Central de Comunicação e sete módulos editoriais completos, com mensagens condicionadas ao diagnóstico e práticas de autorregulação.
- O Que Fazer Depois: o guia "Ele respondeu. E agora?", com dez situações e caminhos práticos, além da Pausa antes de enviar.
- Situações Especiais: seis cenários com o que fazer, o que evitar, sinais e quando parar.
- Regras de ouro e orientações de segurança continuam acessíveis no Perfil e nos fluxos relacionados.
- O plano de 21 dias, o Diário, o Meu Plano de 48 Horas e o progresso estão preservados no código e nos dados locais, mas ocultos na experiência atual.
- O Reset Emocional do Ex não é mais uma oferta atual: continua só para quem já comprou. As ofertas atuais estão em `docs/estrutura-comercial-upsells.md`.
