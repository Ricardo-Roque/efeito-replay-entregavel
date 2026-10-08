// Emojis 3D (Fluent Emoji, licença MIT), os mesmos do funil GoodKids. Fazem o papel das
// ilustrações 3D do Calm Kids: tiles, cards, trilha e celebrações. Ver src/assets/emoji/LICENSE.md.

import eBrilho from "@/assets/emoji/brilho.webp";
import eCelular from "@/assets/emoji/celular.webp";
import eCompromisso from "@/assets/emoji/compromisso.webp";
import eContato from "@/assets/emoji/contato.webp";
import eDiario from "@/assets/emoji/diario.webp";
import eEscrever from "@/assets/emoji/escrever.webp";
import eEscudo from "@/assets/emoji/escudo.webp";
import eEstrela from "@/assets/emoji/estrela.webp";
import eFase1 from "@/assets/emoji/fase1.webp";
import eFase2 from "@/assets/emoji/fase2.webp";
import eFase3 from "@/assets/emoji/fase3.webp";
import eFase4 from "@/assets/emoji/fase4.webp";
import eHumor1 from "@/assets/emoji/humor1.webp";
import eHumor2 from "@/assets/emoji/humor2.webp";
import eHumor3 from "@/assets/emoji/humor3.webp";
import eHumor4 from "@/assets/emoji/humor4.webp";
import eHumor5 from "@/assets/emoji/humor5.webp";
import eMedalha from "@/assets/emoji/medalha.webp";
import eNunca from "@/assets/emoji/nunca.webp";
import eOk from "@/assets/emoji/ok.webp";
import ePausa from "@/assets/emoji/pausa.webp";
import eRegras from "@/assets/emoji/regras.webp";
import eSinais from "@/assets/emoji/sinais.webp";
import eTrofeu from "@/assets/emoji/trofeu.webp";
import personagemAcenando from "@/assets/ilustracoes/personagem-acenando.webp";
import personagemComemorando from "@/assets/ilustracoes/personagem-comemorando.webp";
import personagemIndoCafe from "@/assets/ilustracoes/personagem-indo-cafe.webp";
import personagemMaoPeito from "@/assets/ilustracoes/personagem-mao-peito.webp";
import personagemPensativa from "@/assets/ilustracoes/personagem-pensativa.webp";
import personagemRespirando from "@/assets/ilustracoes/personagem-respirando.webp";
import personagemSorrindoCelular from "@/assets/ilustracoes/personagem-sorrindo-celular.webp";
import personagemNeutra from "@/assets/ilustracoes/personagem.webp";
import cenarioBloqueou from "@/assets/ilustracoes/cenario-bloqueou.webp";
import cenarioDesinteresse from "@/assets/ilustracoes/cenario-desinteresse.webp";
import cenarioEncontro from "@/assets/ilustracoes/cenario-encontro.webp";
import cenarioFrio from "@/assets/ilustracoes/cenario-frio.webp";
import cenarioOutra from "@/assets/ilustracoes/cenario-outra.webp";
import cenarioRespondeu from "@/assets/ilustracoes/cenario-respondeu.webp";

export const emoji = {
  brilho: eBrilho,
  celular: eCelular,
  compromisso: eCompromisso,
  contato: eContato,
  diario: eDiario,
  escrever: eEscrever,
  escudo: eEscudo,
  estrela: eEstrela,
  fase1: eFase1,
  fase2: eFase2,
  fase3: eFase3,
  fase4: eFase4,
  humor1: eHumor1,
  humor2: eHumor2,
  humor3: eHumor3,
  humor4: eHumor4,
  humor5: eHumor5,
  medalha: eMedalha,
  nunca: eNunca,
  ok: eOk,
  pausa: ePausa,
  regras: eRegras,
  sinais: eSinais,
  trofeu: eTrofeu,
};

export type EmojiName = keyof typeof emoji;
// Ilustrações próprias (personagem e cenários). Originais em _originais/, fora do app; aqui ficam
// as versões recortadas e otimizadas (WebP).

/** Poses da protagonista (papel do Calminho no Calm Kids). Imagens em pé, mais altas que largas. */
export const personagem = {
  acenando: personagemAcenando,
  comemorando: personagemComemorando,
  indoCafe: personagemIndoCafe,
  maoNoPeito: personagemMaoPeito,
  pensativa: personagemPensativa,
  respirando: personagemRespirando,
  sorrindoCelular: personagemSorrindoCelular,
  neutra: personagemNeutra,
};

export type Pose = keyof typeof personagem;

/** Arte de cada cenário (quadrada, fundo transparente). */
export const cenarioArte = {
  bloqueou: cenarioBloqueou,
  desinteresse: cenarioDesinteresse,
  encontro: cenarioEncontro,
  frio: cenarioFrio,
  outra: cenarioOutra,
  respondeu: cenarioRespondeu,
};
