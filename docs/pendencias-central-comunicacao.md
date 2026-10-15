# Central de Comunicação: pendências editoriais

Este documento lista o que precisa ser obtido, escrito ou aprovado para fechar o conteúdo da Central de Comunicação. O código já está pronto para receber cada item sem mudar a interface: os dados ficam em `app/src/lib/comunicacao/library.ts` e em `app/src/lib/jornada/messages.ts`.

## 1. Técnicas citadas na VSL

### Origem e decisão editorial

Foram verificados o repositório do app, as páginas de venda (`codigo-da-reconquista`, `codigo-da-reconquista-b`), o quiz de referência (`docs/quiz-referencia.md`), a TSL do upsell e os documentos de produto. Essas fontes apenas mencionam os nomes; não trazem a formulação original.

Em 14/10/2026, por decisão do responsável pelo produto, foram criadas sete versões editoriais próprias do Código da Reconquista. Elas não são apresentadas como reprodução de um método anterior. Cada módulo informa sua origem editorial, permanece com `status: "rascunho"` e precisa de revisão final de produto.

| Técnica | Versão editorial criada | Regra principal |
|---|---|---|
| Mensagem de três palavras | “Lembrei de você.” | Só com contato aberto, lembrança verdadeira e nenhuma mensagem anterior aguardando resposta |
| Mensagem com H | “Hoje passei por [lugar] e lembrei de [lembrança concreta]. Espero que você esteja bem.” | Preencher apenas com fatos reais e leves |
| Mensagem "pensando aqui" | Reconhece uma conversa recente sobre um assunto concreto | Não inclui pergunta, pedido ou cobrança |
| Frase número 3 | “Entendi. Vamos com calma.” | É uma resposta; nunca inicia contato |
| Frase do Replay | Reconhece o que tornou uma conversa recente leve | Só depois de uma troca iniciada e sustentada por ele |
| Técnica do buraco negro emocional | Pausa de 30 minutos, separação entre fato e interpretação e decisão sem impulso | Absorve o impulso dela; não usa sumiço para provocar reação |
| Técnica noturna mencionada na oferta | Encerramento em cinco passos e revisão pela manhã | Não é tratamento de saúde nem a Técnica de Reversão Noturna do Reset |

### Estrutura entregue

- Objetivo, quando usar, quando evitar, limites e origem editorial.
- Mensagem exata e orientação de adaptação nos cinco módulos de comunicação.
- O que fazer com e sem resposta.
- Passo a passo nas duas práticas de autorregulação.
- Integração com a Pausa, sem cópia ou envio direto.
- Bloqueio contextual: com limite, o texto da mensagem fica oculto; sem reciprocidade, mensagens de iniciativa também ficam ocultas; respostas só são liberadas quando ele escreveu primeiro.

Os 38 conteúdos da Central continuam com `origin: "exemplo_novo"` e não foram renomeados como técnicas da VSL. Os testes mantêm essa separação.

### Revisão necessária antes de considerar aprovado

1. Validar tom, naturalidade e adequação ao público.
2. Confirmar que a venda descreve o conteúdo real, sem alegações de controle emocional ou mecanismo científico.
3. Confirmar a distinção entre a técnica noturna principal e o módulo noturno do Reset.
4. Se aprovado, trocar o `status` de cada item em `vslTechniques` de `rascunho` para `aprovado`; isso não exige mudar a interface.
5. Se o material original da VSL aparecer, comparar item por item. Não substituir automaticamente as versões atuais sem nova revisão de segurança.

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
| Com limite, a Central continua acessível na área "Mensagens e técnicas", apenas para orientações e leitura; nenhum envio é sugerido | Esconder a Central inteira nesse caso |
| Com pausa (ele pediu tempo) ou espaço (sem reciprocidade), só ficam disponíveis as respostas, e apenas se ele escrever primeiro | Bloquear também as respostas |
| Sem diagnóstico, tudo fica disponível, com aviso e com a Pausa | Exigir o diagnóstico antes de liberar a cópia |
| Na Pausa, com pedido de tempo ou sem reciprocidade, o checklist pergunta "Ele escreveu primeiro?". "Não" leva a guardar por 24 horas. Com limite registrado, a pergunta do limite fica travada (auditoria de QA, `docs/qa-evolucao.md`) | Deixar a Pausa igual para todos os momentos |
| A área "O que fazer depois" abre o mesmo guia "Ele respondeu. E agora?" já existente, com atalhos para as situações mais procuradas | Manter somente a entrada genérica do guia |
