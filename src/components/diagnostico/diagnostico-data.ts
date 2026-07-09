export type Dimension =
  | 'urgencia'
  | 'vulnerabilidade'
  | 'bemestar'
  | 'modulador'
  | 'contexto';
export type QuestionType = 'scale' | 'scaleInv' | 'choice';
export type Tier = 'verde' | 'amarelo' | 'vermelho';

export interface Option {
  label: string;
  /** Identidade única da opção dentro da pergunta (o que fica em answers). */
  value: number | string;
  /** Pontuação quando difere de `value` — permite opções distintas com score igual. */
  score?: number;
}

export interface Question {
  id: string;
  dim: Dimension;
  type: QuestionType;
  text: string;
  options?: Option[];
  conditionOn?: { id: string; value: number };
  unscored?: boolean;
}

export const questions: Question[] = [
  { id: 'u1', dim: 'urgencia', type: 'scale', text: 'Eu pago apenas o valor mínimo (ou parcial) da fatura do cartão de crédito.' },
  { id: 'u2', dim: 'urgencia', type: 'scale', text: 'Eu faço novas dívidas (ou uso novos cartões) para conseguir pagar dívidas e faturas antigas.' },
  { id: 'u3', dim: 'urgencia', type: 'scale', text: 'Nos últimos 6 meses, tive dificuldade para pagar contas básicas essenciais (água, luz, aluguel, alimentação).' },
  { id: 'u4', dim: 'urgencia', type: 'scale', text: 'Eu utilizo o cartão de crédito para fazer saques em dinheiro para pagar outras contas.' },
  { id: 'u5', dim: 'urgencia', type: 'scale', text: 'Recebo cobranças de credores ou possuo restrições no meu nome (SPC/Serasa) por não conseguir quitar meus compromissos.' },
  { id: 'v1', dim: 'vulnerabilidade', type: 'scale', text: 'Dependo do cartão de crédito para pagar gastos essenciais do dia a dia (supermercado, farmácia) por falta de dinheiro na conta.' },
  { id: 'v2', dim: 'vulnerabilidade', type: 'scale', text: 'Se surgisse hoje uma emergência equivalente a um mês da minha renda, eu não teria como pagar.' },
  { id: 'v3', dim: 'vulnerabilidade', type: 'scale', text: 'Meu dinheiro costuma acabar antes do fim do mês, mesmo sem contas em atraso.' },
  { id: 'v4', dim: 'vulnerabilidade', type: 'scale', text: 'O assunto "dinheiro" e "contas a pagar" me causa estresse ou ansiedade frequentes.' },
  { id: 'b1', dim: 'bemestar', type: 'scaleInv', text: 'No geral, considerando bens, dívidas e poupança, quão satisfeito(a) você está com sua situação financeira atual?' },
  { id: 'b2', dim: 'bemestar', type: 'scaleInv', text: 'Qual seu nível de satisfação com o valor atual das suas dívidas (caso possua alguma)?' },
  { id: 'b3', dim: 'bemestar', type: 'scaleInv', text: 'Quão satisfeito(a) você está com sua capacidade atual de poupar e construir seu futuro financeiro?' },
  {
    id: 'q4', dim: 'urgencia', type: 'choice',
    text: 'Nos últimos 12 meses, com que frequência você precisou de novos empréstimos (incluindo cheque especial) só para pagar contas ou dívidas antigas?',
    options: [
      { label: 'Nunca precisei', value: 0 },
      { label: 'Raramente (1 ou 2 vezes no ano)', value: 1 },
      { label: 'Algumas vezes (entre 2 e 5 vezes no ano)', value: 2 },
      { label: 'Frequentemente (mais de 6 vezes no ano)', value: 3 },
      { label: 'Tentei fazer isso, mas tive o crédito negado', value: 4 },
    ],
  },
  {
    id: 'q5', dim: 'modulador', type: 'choice',
    text: 'Você sente que precisa de ajuda externa para sua vida financeira hoje? Se sim, qual o principal motivo?',
    options: [
      { label: 'Não sinto necessidade de ajuda no momento', value: 'nenhuma', score: 0 },
      { label: 'Sim, para aprender a investir e multiplicar patrimônio', value: 'investir', score: 0 },
      { label: 'Sim, para organização financeira e planejamento', value: 'organizar', score: 2 },
      { label: 'Sim, para sair de dívidas e renegociações urgentes', value: 'dividas', score: 4 },
    ],
  },
  {
    id: 'q6', dim: 'bemestar', type: 'choice',
    text: 'Quando você pensa em dinheiro, qual frase mais reflete seu estado?',
    options: [
      { label: 'Me sinto confiante e em paz com minhas finanças', value: 0 },
      { label: 'Lido bem na maior parte do tempo', value: 1 },
      { label: 'Fico tenso(a) às vezes, mas consigo me acalmar', value: 2 },
      { label: 'Frequentemente fico estressado(a) com o assunto', value: 3 },
      { label: 'Sinto ansiedade ou medo constantes', value: 4 },
    ],
  },
  {
    id: 'q7a', dim: 'urgencia', type: 'choice',
    text: 'Atualmente, você tem contas básicas, faturas ou prestações em atraso?',
    options: [
      { label: 'Não, tudo em dia', value: 0 },
      { label: 'Sim, tenho contas em atraso', value: 1 },
    ],
  },
  {
    id: 'q7b', dim: 'urgencia', type: 'choice',
    text: 'Qual o tamanho aproximado dessas contas atrasadas em relação à sua renda mensal?',
    conditionOn: { id: 'q7a', value: 1 },
    options: [
      { label: 'Menor que a renda de 1 mês', value: 1 },
      { label: 'Entre 1 e 3 meses de renda', value: 2 },
      { label: 'Entre 3 e 6 meses de renda', value: 3 },
      { label: 'Maior que 6 meses de renda', value: 4 },
    ],
  },
  {
    id: 'q8', dim: 'contexto', type: 'choice', unscored: true,
    text: 'Qual é o principal motivo de você buscar orientação financeira hoje?',
    options: [
      { label: 'Sair de dívidas', value: 'dividas' },
      { label: 'Organização financeira', value: 'organizar' },
      { label: 'Aprender a investir', value: 'investir' },
      { label: 'Não sei ao certo, só quero entender minha situação', value: 'entender' },
    ],
  },
];

export const scaleOptions: Option[] = [
  { label: 'Nada', value: 0 },
  { label: 'Pouco', value: 1 },
  { label: 'Mais ou menos', value: 2 },
  { label: 'Muito', value: 3 },
  { label: 'Totalmente', value: 4 },
];

export const scaleInvOptions: Option[] = [
  { label: 'Totalmente satisfeito(a)', value: 0 },
  { label: 'Muito satisfeito(a)', value: 1 },
  { label: 'Mais ou menos', value: 2 },
  { label: 'Pouco satisfeito(a)', value: 3 },
  { label: 'Nada satisfeito(a)', value: 4 },
];

export const DIM_MAX = { urgencia: 29, vulnerabilidade: 16, bemestar: 16 } as const;
export const TOTAL_MAX = 65;

export const dimLabels: Record<Dimension, string> = {
  urgencia: 'Urgência',
  vulnerabilidade: 'Vulnerabilidade',
  bemestar: 'Bem-estar',
  modulador: 'Contexto',
  contexto: 'Contexto',
};

export interface TierContent {
  flagLabel: string;
  zoneWord: string;
  title: (name: string) => string;
  text: string;
  cta: string;
}

export const tierContent: Record<Tier, TierContent> = {
  verde: {
    flagLabel: 'Zona Verde · Bem-estar',
    zoneWord: 'bem-estar',
    title: (name) =>
      name ? `${name}, sua base financeira está sólida.` : 'Sua base financeira está sólida.',
    text: 'Você não demonstra sinais de risco iminente. O momento agora é de proteger o que foi construído e fazer o dinheiro trabalhar por você — organização de investimentos, metas de longo prazo e blindagem patrimonial tendem a trazer mais retorno do que qualquer ajuste emergencial.',
    cta: 'Uma consultoria neste momento serve para otimizar decisões e acelerar seus objetivos — não para apagar incêndio. Vale a conversa.',
  },
  amarelo: {
    flagLabel: 'Zona Amarela · Atenção',
    zoneWord: 'vulnerabilidade',
    title: (name) =>
      name ? `${name}, suas finanças estão no limite do orçamento.` : 'Suas finanças estão no limite do orçamento.',
    text: 'Você ainda não está em colapso, mas vive perto da margem: pequenos imprevistos podem desorganizar tudo rapidamente. Esse é o momento ideal para agir — antes que vire uma emergência. Organização de orçamento, priorização de dívidas e um colchão de segurança são os próximos passos.',
    cta: 'Essa é exatamente a fase em que uma consultoria financeira evita que a situação piore. Vamos conversar sobre um plano de organização?',
  },
  vermelho: {
    flagLabel: 'Zona Vermelha · Urgência',
    zoneWord: 'urgência',
    title: (name) =>
      name ? `${name}, sua situação pede atenção prioritária.` : 'Sua situação pede atenção prioritária.',
    text: 'Os sinais indicam um momento de aperto real — dívidas em aberto, uso recorrente de crédito para cobrir crédito, ou desconforto financeiro constante. Isso não é falta de força de vontade, é uma questão técnica que tem solução: renegociação estratégica e um plano de estancamento de dívidas.',
    cta: 'Quanto antes você buscar orientação, menor o custo (financeiro e emocional) de resolver isso. Vamos conversar ainda essa semana?',
  },
};
