// SUBSTITUÍDO na Fase 1A por app/src/lib/plan.ts, scenarios.ts e guide.ts (fonte da verdade).
// Mantido só para o style guide.
//
// Conteúdo de referência do Código da Reconquista, como dado (não HTML), no mesmo formato do
// src/lib/plan.ts do CalmBaby. RASCUNHO: serve para o style guide e para semear, na Fase 2,
// src/lib/plan.ts, src/lib/scenarios.ts e src/lib/pause.ts. O texto final de cada dia ainda
// precisa ser escrito e revisado.
//
// Regras de conteúdo (valem para tudo que sair daqui):
// - Nada de contornar bloqueio, usar terceiros, perfis falsos, insistir ou pressionar.
// - "Não" e pedido de distância são respostas: o app orienta a parar.
// - O foco é autocontrole, presença e comunicação leve. Nenhuma promessa de que ele volta.
//
// Carregado por <script> (não módulo) para o style-guide.html funcionar abrindo o arquivo direto.

window.CR_CONTENT = {
  phases: [
    {
      phase: 1,
      numeral: "I",
      title: "Reset emocional",
      days: [1, 7],
      objective: "Sair do modo reação antes de qualquer mensagem.",
      goal: "7 dias sem agir por impulso",
      icon: "wind",
    },
    {
      phase: 2,
      numeral: "II",
      title: "Nova comunicação",
      days: [8, 13],
      objective: "Menos explicação, mais presença. Menos pedido, mais leveza.",
      goal: "Uma mensagem curta, leve e aberta, sem esperar resposta",
      icon: "message-square-text",
    },
    {
      phase: 3,
      numeral: "III",
      title: "Reconexão",
      days: [14, 18],
      objective: "Quando ele responde, criar uma experiência boa de falar com você.",
      goal: "Conversas leves que terminam antes de cansar",
      icon: "messages-square",
    },
    {
      phase: 4,
      numeral: "IV",
      title: "Do contato ao reencontro",
      days: [19, 21],
      objective: "Um convite simples, só quando a conversa flui. Aceitar qualquer resposta.",
      goal: "Convidar sem pressão, ou decidir que ainda não é hora",
      icon: "coffee",
    },
  ],

  // tool: ferramenta que o dia abre (como PlanTool no CalmBaby)
  days: [
    {
      day: 1,
      phase: 1,
      title: "Seu ponto de partida",
      minutes: 3,
      lesson: [
        "Este protocolo não é sobre manipular ninguém. É sobre mudar a sua forma de agir e de se comunicar.",
        "Cada fase prepara a seguinte. Pular etapas é o motivo mais comum de a reaproximação não funcionar.",
      ],
      action: "Escolha o cenário que mais parece com o seu hoje e registre como você está no Diário.",
      checklist: ["Escolher meu cenário", "Fazer o primeiro registro no Diário", "Ler o meu compromisso"],
      tool: "diary",
    },
    { day: 2, phase: 1, title: "Sair do modo reação", minutes: 3, tool: "pause" },
    { day: 3, phase: 1, title: "Contato zero consciente", minutes: 3 },
    { day: 4, phase: 1, title: "Parar de checar o perfil dele", minutes: 2 },
    { day: 5, phase: 1, title: "Um plano para as horas vulneráveis", minutes: 3, tool: "pause" },
    { day: 6, phase: 1, title: "Rotina e autocuidado", minutes: 2 },
    { day: 7, phase: 1, title: "Revisão: 7 dias no seu centro", minutes: 3, tool: "diary" },
    { day: 8, phase: 2, title: "Por que menos explica mais", minutes: 3 },
    {
      day: 9,
      phase: 2,
      title: "Curta, leve e aberta",
      minutes: 3,
      lesson: [
        "Uma mensagem nova não explica o passado. Ela mostra, em uma ou duas linhas, que você está bem.",
        "Curta: uma ou duas linhas bastam. Leve: sem peso emocional, sem cobrança. Aberta: deixa espaço para ele responder só se quiser.",
      ],
      action: "Escreva um rascunho na Pausa antes de enviar e passe pelo checklist. Hoje você não precisa enviar nada.",
      checklist: [
        "Ler os três critérios",
        "Escrever um rascunho na Pausa",
        "Passar pelo checklist da mensagem",
      ],
      tool: "pause",
    },
    { day: 10, phase: 2, title: "O que nunca enviar", minutes: 2 },
    { day: 11, phase: 2, title: "Sua primeira mensagem leve", minutes: 3, tool: "pause" },
    { day: 12, phase: 2, title: "Depois de enviar, solte o celular", minutes: 2 },
    { day: 13, phase: 2, title: "Observar sem interpretar demais", minutes: 3, tool: "diary" },
    { day: 14, phase: 3, title: "Quando ele responde", minutes: 3 },
    { day: 15, phase: 3, title: "Encerrar antes de cansar", minutes: 2 },
    { day: 16, phase: 3, title: "Sinais de abertura e de alerta", minutes: 3, tool: "diary" },
    { day: 17, phase: 3, title: "Ajustar, não insistir", minutes: 2 },
    { day: 18, phase: 3, title: "Revisão: o que mudou em você", minutes: 3 },
    { day: 19, phase: 4, title: "Quando um convite faz sentido", minutes: 3 },
    { day: 20, phase: 4, title: "Um convite simples, sem pressão", minutes: 3, tool: "pause" },
    { day: 21, phase: 4, title: "Qualquer resposta, e o seu próximo passo", minutes: 3 },
  ],

  milestones: [
    { day: 7, badge: "sem-impulso-7", title: "7 dias no seu centro", description: "A meta do Reset emocional foi cumprida. Tudo o que vem depois se apoia nisso." },
    { day: 13, badge: "fase-2-concluida", title: "Nova comunicação", description: "Você aprendeu a escrever menos e dizer mais." },
    { day: 18, badge: "fase-3-concluida", title: "Reconexão", description: "Conversas leves, observadas com calma." },
    { day: 21, badge: "dia-21", title: "21 dias completos", description: "Você não perdeu a conexão com você. Aprendeu a reconstruí-la." },
  ],

  // safety: "block" (bloqueio) e "other" (outra pessoa) mostram o alerta e não têm modelos de mensagem.
  scenarios: [
    {
      id: "bloqueou",
      label: "Ele me bloqueou",
      short: "Um limite que pede respeito",
      icon: "ban",
      safety: "block",
      description:
        "O bloqueio costuma ser uma barreira emocional. Seja qual for o motivo, é um limite que ele colocou, e o seu plano é cuidar de você.",
      alert:
        "Respeite o bloqueio. Não use outros perfis, números, amigos ou familiares para chegar até ele, e não apareça onde ele está.",
      do: ["Respeitar o limite", "Investir em você durante os 21 dias", "Escrever no Diário o que você queria dizer"],
      avoid: ["Criar outro perfil ou número", "Mandar recado por terceiros", "Checar se ele desbloqueou"],
      messages: [],
      noMessages: "Aqui não existe mensagem para enviar. O seu trabalho é o Reset emocional.",
      stop: "Se o bloqueio continuar, essa é a resposta dele. Seguir o plano continua valendo, por você.",
      days: [2, 3, 4, 5],
    },
    {
      id: "frio",
      label: "Ele está frio e distante",
      short: "Mudar o clima muda a resposta",
      icon: "snowflake",
      description:
        "A frieza costuma aparecer quando a conversa virou fonte de cobrança. Mudar o clima muda a resposta.",
      do: ["Respostas curtas e leves", "Assuntos neutros e agradáveis", "Dar espaço entre as mensagens"],
      avoid: ["Reclamar da frieza", "Insistir em conversar sobre o término", "Perguntar o que ele sente"],
      messages: [
        "Lembrei de uma coisa engraçada de quando a gente foi àquele show. Espero que você esteja bem.",
        "Passando só para desejar uma boa semana.",
      ],
      stop: "Se ele pedir para você parar, agradeça e pare. Um \"não\" também é resposta.",
      days: [8, 9, 10, 11],
    },
    {
      id: "outra",
      label: "Ele está com outra pessoa",
      short: "Sem disputa, sem comparação",
      icon: "users-round",
      safety: "other",
      description:
        "Um novo envolvimento muda o cenário. Comparação e disputa só aumentam a distância e machucam você.",
      alert:
        "Ele está em outra relação. Não procure a outra pessoa, não compare e não mande mensagens para testar.",
      do: ["Cuidar da sua vida e de quem está perto", "Silenciar perfis se isso te ajudar", "Seguir o Reset emocional"],
      avoid: ["Competir ou comparar", "Criticar a outra pessoa", "Mandar mensagem para testar"],
      messages: [],
      noMessages: "Enquanto ele estiver em outra relação, o plano não sugere mensagens.",
      stop: "Quem se mantém inteira não precisa disputar.",
      days: [3, 4, 6],
    },
    {
      id: "desinteresse",
      label: "Ele perdeu o interesse",
      short: "Novidade, não insistência",
      icon: "flame",
      description:
        "Quando o interesse diminui, insistir costuma afastar mais. O que muda o quadro é uma mudança real no seu jeito de estar presente.",
      do: ["Parar de repetir o mesmo padrão", "Viver uma rotina mais leve, por você", "Se houver conversa, trazer algo novo"],
      avoid: ["Cobrar atenção", "Mandar várias mensagens seguidas", "Explicar a relação de novo"],
      messages: ["Vi algo hoje que me lembrou de você. Fiquei com um sorriso aqui."],
      stop: "Mudança percebida vale mais que mil explicações. Se ele não responder, não insista.",
      days: [6, 8, 12],
    },
    {
      id: "respondeu",
      label: "Ele respondeu",
      short: "Leve, curta, sem peso",
      icon: "message-circle-heart",
      description:
        "Quando ele responde, o objetivo não é resolver o passado. É criar uma experiência boa de falar com você.",
      do: ["Responder leve e curto", "Encerrar antes de ele cansar", "Observar os sinais no Diário"],
      avoid: ["Resolver o passado agora", "Transformar em conversa sobre a relação", "Cobrar a demora da resposta"],
      messages: ["Tudo ótimo por aqui! E por aí?", "Que bom falar com você. Preciso ir agora, depois a gente se fala."],
      stop: "Se a conversa esfriar ou ele pedir espaço, respeite e volte ao seu ritmo.",
      days: [14, 15, 16],
    },
    {
      id: "encontro",
      label: "Quero chamar para um encontro",
      short: "Convite leve, sem cobrança",
      icon: "coffee",
      description:
        "Quando a conversa flui e ele mostra sinais de abertura, um convite simples abre a porta. Sem dramas, sem cobranças.",
      do: ["Convidar com leveza, num lugar público", "Deixar claro que tudo bem se não der", "Aceitar a resposta, qualquer que seja"],
      avoid: ["Ultimatos e \"última chance\"", "Insistir depois de um não", "Transformar o encontro em DR"],
      messages: ["Fui àquele café que você gosta e lembrei de você. Quer tomar um qualquer dia desses?"],
      stop: "Se ele recusar, agradeça e encerre com leveza. Recusa não é convite para insistir.",
      days: [19, 20, 21],
    },
  ],

  signals: {
    open: ["Responde mais rápido", "Faz perguntas sobre a sua vida", "Prolonga a conversa", "Sugere encontro ou ligação"],
    alert: ["Respostas secas e demoradas", "Evita qualquer assunto pessoal", "Só aparece quando precisa de algo"],
    stop: ["Pediu para você parar", "Bloqueou ou pediu distância"],
  },

  // Pausa antes de enviar. hardStop: se a resposta for "não", o resultado é sempre "não envie".
  pause: [
    { id: "curta", label: "É curta?", hint: "Uma ou duas linhas bastam." },
    { id: "leve", label: "É leve?", hint: "Sem cobrança, sem peso, sem \"você me ama?\"." },
    { id: "aberta", label: "Deixa ele livre para não responder?", hint: "Nada de pergunta que exige resposta." },
    { id: "semResposta", label: "Você ficaria bem sem resposta?", hint: "Se precisa da resposta para ficar bem, ainda não é hora." },
    { id: "horario", label: "Não é madrugada nem um momento de impulso?", hint: "Mensagem de madrugada quase sempre é impulso." },
    { id: "limite", label: "Ele não te bloqueou nem pediu distância?", hint: "Bloqueio e pedido de distância são limites.", hardStop: true },
  ],

  rules: {
    errors: [
      { title: "Mandar mensagens longas e emocionais", text: "Quanto mais você explica, menos espaço ele tem para sentir falta." },
      { title: "Cobrar resposta", text: "A cobrança transforma você em obrigação, não em desejo." },
      { title: "Aparecer disponível demais", text: "Disponibilidade total elimina a saudade." },
    ],
    neverSend: [
      "Textões explicando seus sentimentos",
      "Ultimatos e \"última chance\"",
      "Mensagens de madrugada",
      "Comparações com outras pessoas",
      "Perguntas do tipo \"você me ama?\"",
    ],
    relapse: [
      "Quando bater a ansiedade, espere 24 horas",
      "Releia o protocolo antes de agir",
      "Converse com uma amiga, não com ele",
      "Lembre por que você está fazendo isso",
    ],
  },

  support: {
    // Rede de apoio sempre visível em Mais. Números públicos, não dependem de configuração.
    lines: [
      { label: "CVV, apoio emocional 24h", value: "188" },
      { label: "Central de Atendimento à Mulher", value: "180" },
    ],
  },
};
