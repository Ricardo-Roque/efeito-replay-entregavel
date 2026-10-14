# Central de Comunicação: pendências editoriais

Este documento lista o que precisa ser obtido, escrito ou aprovado para fechar o conteúdo da Central de Comunicação. O código já está pronto para receber cada item sem mudar a interface: os dados ficam em `app/src/lib/comunicacao/library.ts` e em `app/src/lib/jornada/messages.ts`.

## 1. Técnicas citadas na VSL

### O que foi procurado

Foram verificados o repositório do app, as páginas de venda (`codigo-da-reconquista`, `codigo-da-reconquista-b`), o quiz de referência (`docs/quiz-referencia.md`), a TSL do upsell e os documentos de produto.

O material só **menciona** as técnicas. O quiz cita "uma mensagem de 3 palavras" e "mensagem psicológica" como promessa. Em nenhum lugar existe o texto das mensagens, o contexto de uso ou a definição das técnicas.

### O que foi feito

- Nenhum texto foi inventado para as técnicas, e nenhum exemplo da Central foi apresentado como sendo uma delas.
- As seis técnicas estão em `vslTechniques` (`lib/jornada/messages.ts`) com `status: "aguardando_material"`. Esse status nunca aparece para a cliente.
- Os 38 conteúdos da Central levam `origin: "exemplo_novo"`. A tela de detalhe informa que se trata de um "exemplo novo, escrito para o Código da Reconquista".
- Um teste automático (`lib/comunicacao/rules.test.ts`) falha se algum texto da biblioteca usar os nomes das técnicas ou atribuir efeito científico ou comprovado a uma mensagem.

### O que precisa ser obtido

| Técnica | O que pedir ao autor do método | Observação |
|---|---|---|
| Mensagem de três palavras | O texto exato, quando usar, quando não usar e o que fazer depois | O quiz diz que ela "reativa o lado emocional" do cérebro dele. Essa alegação não pode ir para o app sem fonte |
| Mensagem com H | O texto e o significado do "H" | |
| Mensagem "pensando aqui" | O texto completo e o contexto | O exemplo novo "Uma lembrança concreta e leve" tem tom parecido, mas não é essa técnica |
| Frase número 3 | O texto e a lista de que ela faz parte | Se a lista existir, enviar a lista inteira |
| Frase do Replay | O texto e o contexto | O nome vem da marca anterior (Efeito Replay) |
| Técnica do buraco negro emocional | A definição completa e os passos | Se envolver sumir para provocar ansiedade, ciúme ou culpa, **não entra** no app |

### Critérios para aprovar o material

O material só entra no app se cumprir todos os critérios abaixo:

1. Não contorna bloqueio nem pedido de distância, e não usa outras pessoas ou outros perfis.
2. Não manipula: nada de provocar ciúme, culpa, medo de perder ou ansiedade.
3. Não promete efeito sobre ele ("ele vai voltar", "ativa o cérebro dele") nem cita ciência sem fonte.
4. Funciona com as regras de segurança do app: com limite (bloqueio, pedido de não contato, outra relação) não aparece como ação, e passa pela Pausa antes de enviar.
5. Tem todos os campos da biblioteca: objetivo, contexto, tom, quando usar, quando evitar, o que fazer com e sem resposta, e limites.

### Como incluir quando chegar

1. Acrescentar o item em `commMessages` (`lib/comunicacao/library.ts`), com id novo e a categoria adequada.
2. Ligar o item à técnica: hoje o tipo `CommMessage` tem `origin: "exemplo_novo"`. Para a técnica, acrescentar `origin: "metodo"` e `technique: VslTechniqueId` em `lib/comunicacao/types.ts`, e mostrar o selo correspondente no detalhe.
3. Trocar o `status` da técnica em `vslTechniques` para `aprovado`.
4. Ajustar o teste de nomes proibidos em `rules.test.ts`, que hoje barra os nomes das técnicas, para aceitar os itens com `origin: "metodo"`.

## 2. Revisão editorial dos 38 conteúdos

Todos estão com `status: "rascunho"`. Por isso, é preciso revisar:

- O tom e a naturalidade de cada texto ilustrativo, de preferência com leitoras do público.
- Os prazos citados nos textos: "duas ou três semanas" (primeiro contato), "pelo menos um mês" (depois de um bom tempo sem falar) e "três semanas" (porta aberta). Eles são orientações de bom senso, não regras do método, e precisam do aval do autor.
- As orientações de segurança: o Ligue 180 em "Quando ele passa do limite" e na raiva, e o CVV 188 na carta. Elas precisam de validação de alguém da área de saúde mental.
- Os trechos entre colchetes (`[lugar]`, `[nome]`). Falta decidir se ficam assim ou se a tela da Pausa deve destacá-los.

Depois de aprovado, trocar o `status` para `aprovado`. A tela não muda.

## 3. Assistente "Ele respondeu. E agora?"

- São 10 situações e 23 caminhos, em `replySituations` (`app/src/lib/comunicacao/reply.ts`). Tudo é rascunho. A arquitetura e as regras estão em `docs/evolucao-entregavel.md`, na etapa "Ele respondeu. E agora?".
- É preciso revisar a "Interpretação cuidadosa" de cada caminho, porque ela não pode soar como interpretação do que ele sente.
- Também é preciso validar, com alguém da área, as orientações de segurança: a raiva com ameaça (180 e 190) e a respiração 4-4-6 em "Visualizou e não respondeu".
- Decisão tomada que precisa de aprovação: em "Pediu para eu parar" e "Mencionou outra pessoa → está num relacionamento", o assistente oferece registrar o limite no diagnóstico (com confirmação). Isso coloca o app inteiro em modo limite.

## 4. Decisões que precisam de aprovação

| Decisão tomada | Alternativa |
|---|---|
| Com limite, a Central abre só para leitura e o atalho "Mensagens" some do Início, mas continua no Perfil, nos cenários e no plano | Esconder a Central inteira nesse caso |
| Com pausa (ele pediu tempo) ou espaço (sem reciprocidade), só ficam disponíveis as respostas, e apenas se ele escrever primeiro | Bloquear também as respostas |
| Sem diagnóstico, tudo fica disponível, com aviso e com a Pausa | Exigir o diagnóstico antes de liberar a cópia |
| O atalho "Ele respondeu?" do Início abre o guia "Ele respondeu. E agora?" em vez do cenário "Ele respondeu" | Manter o cenário |
