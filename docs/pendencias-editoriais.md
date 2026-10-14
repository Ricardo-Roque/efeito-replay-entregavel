# Código da Reconquista: pendências editoriais

Este documento reúne o que falta obter, gravar, revisar ou aprovar no conteúdo do app. As pendências da Central de Comunicação e do "Ele respondeu. E agora?" seguem em `docs/pendencias-central-comunicacao.md`. A relação entre a venda e o app está em `docs/matriz-vsl-entregavel.md`.

## 1. Áudios do Reset Emocional do Ex

### Situação

- O projeto não tem nenhum arquivo de áudio. Foram procurados `.mp3`, `.m4a`, `.wav` e `.ogg` no repositório inteiro.
- O player já existe. Sem arquivo, ele mostra "Áudio ainda não disponível" e manda para o roteiro. Não há player falso nem reprodução simulada.
- Enquanto o áudio não existe, o roteiro de cada sessão já vem aberto, com o título "Roteiro para leitura".
- O ritual noturno guiado (passo a passo na tela) funciona sem áudio.

### Arquivos a produzir

Basta colocar cada arquivo na pasta indicada, com o nome exato. O app passa a tocar sem mudar código, porque `lib/reset/audio.ts` detecta os arquivos no build.

| Arquivo | Sessão | Roteiro (em `app/src/lib/reset/content.ts`) | Duração prevista |
|---|---|---|---|
| `app/src/assets/audio/reset/seguranca.mp3` | Módulo 02 · A voz que transmite segurança | `audioSessions[0].transcript` | cerca de 7 min |
| `app/src/assets/audio/reset/defensividade.mp3` | Módulo 02 · Como conversar sem despertar defensividade | `audioSessions[1].transcript` | cerca de 8 min |
| `app/src/assets/audio/reset/confianca.mp3` | Módulo 02 · Construindo uma comunicação de confiança | `audioSessions[2].transcript` | cerca de 8 min |
| `app/src/assets/audio/reset/noturno.mp3` | Módulo 04 · Técnica de Reversão Noturna | `nightScript` | cerca de 10 min |

Formato aceito: `.mp3` ou `.m4a`, com o mesmo nome. Recomendação: mono, 64 a 96 kbps, sem música alta de fundo (o roteiro noturno pede pausas longas).

### Regras para a gravação

- **Voz de pessoa real só com autorização por escrito.** Não gerar com IA a voz do autor do método nem de qualquer outra pessoa real sem esse documento.
- Uma voz sintética genérica (que não imite ninguém) é possível, mas a decisão é do dono do produto. Se for usada, a tela deve dizer que a voz é sintética.
- Gravar exatamente o roteiro aprovado. Se o texto mudar na gravação, atualizar o roteiro no código, porque a cliente pode ler em vez de ouvir.
- Depois de gravar, conferir se a duração real bate com a da tela (`minutes` em `audioSessions`, e `minutes={10}` no módulo noturno).

## 2. Técnicas citadas na VSL

Continuam sem material: mensagem de três palavras, mensagem com H, "pensando aqui", frase número 3, frase do Replay e buraco negro emocional. O que pedir ao autor, os critérios de aprovação e como incluir estão em `docs/pendencias-central-comunicacao.md`, seção 1. O roteiro da VSL também não está no repositório e é necessário para fechar a matriz.

## 3. Revisão de conteúdo

Tudo abaixo é rascunho e precisa de revisão editorial antes de ser tratado como versão final.

| Área | Onde | O que revisar |
|---|---|---|
| Reset · Consciência do Perdão | `forgivenessLessons` | As 3 lições foram reescritas nesta etapa, com 4 parágrafos cada (antes eram 2). Revisar o tom e o trecho sobre agressão e violência na lição "Responsabilidade não é culpa" |
| Reset · Jornada de sete etapas | `journeySteps` | O conteúdo das 7 etapas foi ampliado para 3 parágrafos cada. Os checklists não mudaram, porque o progresso salvo depende da posição |
| Reset · O Que Dizer e O Que Evitar | `sayAvoidCategories` | Entraram 3 cartões: "acusação injusta", "pediu um tempo para pensar" e "resposta só com ok". As categorias são as mesmas |
| Reset · diagnóstico | pergunta "O que mais prejudicou a confiança" | As opções agora dizem "Uma traição minha", "Uma mentira minha" e "Outro motivo (inclusive algo que ele fez)". Antes, uma cliente que foi traída por ele recebia orientação de pedir perdão. Validar com o autor |
| Reset · áudios e ritual | `audioSessions`, `nightScript`, `nightRitual` | Revisar antes de gravar. A respiração 4-4-6 precisa de validação de alguém da área de saúde |
| Plano de 21 dias | `lib/plan.ts` | O Dia 13, com limite, ganhou exemplo próprio. O exemplo-base falava de uma mensagem enviada a ele. Revisar a redação |
| Diário | registros automáticos | Textos gravados pelo app (diagnóstico, 48 horas, cenário, marcos e decisão de não enviar). Ver a seção 4 |

## 4. Decisões tomadas nesta etapa que precisam de aprovação

| Decisão | Alternativa |
|---|---|
| A Home segue a ordem: Meu Plano Pessoal, próxima atividade, ajuda imediata, Central, jornada de 21 dias, Diário e ferramentas, conteúdos complementares. Os componentes visuais são os mesmos | Manter a ordem anterior |
| O card "Regras de ouro" saiu dos conteúdos complementares, porque repetia o atalho de Diário e ferramentas. O card "Seu cenário" saiu, porque repetia o atalho "Meu cenário" | Manter os dois cards |
| A ajuda imediata ganhou "Apoio emocional" (CVV 188 e Central da Mulher 180) já no Início | Deixar só no Perfil |
| O app grava sozinho no Diário: cada diagnóstico concluído, cada atividade das 48 horas, a escolha do próximo passo, a conclusão das 48 horas, a troca de cenário e os marcos dos dias 7, 14 e 21. Tudo pode ser apagado pela cliente | Gravar só quando ela tocar em um botão |
| Ao registrar no Diário pelo "Ele respondeu. E agora?", o registro passa a ser do tipo "Ele fez contato" (antes era anotação) | Manter como anotação |
| No Reset, o limite do diagnóstico principal (bloqueio, pedido de não contato ou outra relação) vale mesmo que o diagnóstico do Reset diga outra coisa | Pedir para refazer o diagnóstico do Reset |
| A Pausa marca o limite também para outra relação, com o texto e o cenário "Ele está com outra pessoa". A pergunta do checklist passou a citar a outra relação | Manter só bloqueio e pedido de distância |

## 5. Pontos conhecidos, não alterados

- **Mapa × cenário do perfil.** Se o diagnóstico diz "conversa normal" e o cenário escolhido no perfil é "outra pessoa", o card "Meu Plano Pessoal" mostra "Conversa em andamento", enquanto a Pausa e a Central já respeitam o limite. O cenário do perfil só deixa o app mais restrito, mas o Mapa é calculado só pelo diagnóstico. Sugestão: mostrar um aviso no Mapa quando o cenário do perfil for de limite.
- **Apagar registro do Diário.** O botão de lixeira apaga na hora, sem confirmação. Nenhuma entrada antiga é apagada pelo app, mas vale considerar um "desfazer".
- **Nomes de marca no Reset.** "Reativação Emocional", "Reconexão Subconsciente" e "Reversão Noturna" são nomes da venda. As telas descrevem o que cada módulo é de fato. Ver as linhas 27 a 29 da matriz.
- **Dois diagnósticos.** O do app ("Meu Mapa de Reconquista") e o do Reset ("Diagnóstico emocional") continuam separados, sem preenchimento cruzado. O limite agora é compartilhado.
