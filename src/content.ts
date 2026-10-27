/**
 * ORFEU ÁUDIO — conteúdo do site
 * ------------------------------------------------------------------
 * TODO o texto, números, links e dados do site moram aqui.
 * Tudo é FICTÍCIO: troque à vontade e o site (e o PDF da ficha técnica)
 * se atualizam no próximo `npm run dev` / `npm run build`.
 *
 * Convenção: *palavra* entre asteriscos vira itálico nos títulos.
 */

export const site = {
  url: 'https://orfeuaudio.example',
  lang: 'pt-BR',
  title: 'Orfeu Áudio — amplificadores valvulados feitos à mão em São Paulo',
  description:
    'Ateliê paulistano que projeta e monta à mão amplificadores valvulados 300B, pré-amplificadores e caixas acústicas de alta fidelidade. 40 peças por ano. Audição com hora marcada em Pinheiros.',
  ogImage: '/og.jpg',
  themeColor: '#06141B',
}

export const brand = {
  name: 'ORFEU',
  sub: 'ÁUDIO',
  legalName: 'Orfeu Áudio (marca fictícia)',
}

export const contact = {
  whatsappNumber: '5511900000000', // DDI + DDD + número, só dígitos
  whatsappMessage: 'Olá! Gostaria de agendar uma audição na Orfeu.',
  email: 'atelie@orfeuaudio.example',
  phoneDisplay: '+55 11 90000-0000',
  address: {
    street: 'Rua Fictícia dos Ateliês, 120',
    district: 'Pinheiros',
    city: 'São Paulo — SP',
    zip: '05422-000',
  },
  hours: 'Terça a sábado, 10h–19h · apenas com hora marcada',
  instagram: '#',
  coords: '23°34′S · 46°41′W',
}

export const whatsappUrl = (msg = contact.whatsappMessage) =>
  `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(msg)}`
export const mailUrl = (subject = 'Contato pelo site') =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`

export const nav = {
  links: [
    { label: 'Linha', href: '#linha' },
    { label: 'Ateliê', href: '#atelie' },
    { label: 'Especificações', href: '#especificacoes' },
    { label: 'Audição', href: '#audicao' },
  ],
  cta: { label: 'Agendar', href: 'whatsapp' },
}

export const hero = {
  label: '00 — ATELIÊ DE ALTA FIDELIDADE · SÃO PAULO',
  title: 'O som que você lembra nasceu de uma válvula *acesa*',
  subtitle:
    'A Orfeu é um ateliê paulistano que projeta e monta à mão amplificadores valvulados e caixas acústicas de alta fidelidade — uma peça por vez, para uma sala por vez.',
  ctaPrimary: { label: 'Desmontar', href: '#desmontagem' },
  ctaSecondary: { label: 'Agendar audição', href: 'whatsapp' },
  stats: [
    { value: '120', unit: 'H', caption: 'de bancada por peça' },
    { value: '300B', unit: '', caption: 'triodo de potência' },
    { value: '8', unit: 'W', caption: 'por canal, classe A' },
  ],
  scrollHint: 'ROLE PARA DESMONTAR',
}

/** Etapas da vista explodida. `anchor` aponta para peças do modelo 3D. */
export const disassembly = {
  label: '01 — UM INSTRUMENTO DE SOM',
  srTitle: 'O Orfeu I-300 desmontado, peça por peça',
  steps: [
    {
      key: 'montado',
      short: 'Montado',
      title: 'Um *instrumento* de som',
      text: 'Antes de ser um aparelho, o I-300 é um instrumento: alumínio escovado, quatro válvulas e três transformadores em equilíbrio sobre um chassi de 44 cm.',
      meta: 'ALUMÍNIO 6061 · 24 KG · 440 MM',
      callouts: [] as { anchor: string; text: string }[],
    },
    {
      key: 'desmontar',
      short: 'Desmontar',
      title: 'Peça por *peça*',
      text: 'Ele se abre. Cada componente tem um lugar exato e um motivo para estar ali — nada é decorativo, nada é genérico.',
      meta: '7 CONJUNTOS · 212 PONTOS DE SOLDA',
      callouts: [],
    },
    {
      key: 'valvulas',
      short: 'As válvulas',
      title: 'Por que *300B*',
      text: 'Criada nos anos 1930 para a telefonia, a 300B é um triodo de aquecimento direto: um único estágio, poucos watts e uma linearidade que nenhum transistor imita. É ela que acende o âmbar.',
      meta: '2× 300B · 2× 6SN7 · SEM REALIMENTAÇÃO',
      callouts: [
        { anchor: 'tube300', text: '300B · triodo de aquecimento direto' },
        { anchor: 'tubeDriver', text: '6SN7 · estágio de entrada' },
      ],
    },
    {
      key: 'transformadores',
      short: 'Os transformadores',
      title: 'Bobinados à *mão*',
      text: 'Os transformadores são enrolados um a um no ateliê, camada por camada, em núcleo de grão orientado. São eles que decidem quanto grave e quanto ar chegam à caixa.',
      meta: '3 TRANSFORMADORES · 1 POR BANCADA',
      callouts: [
        { anchor: 'opt', text: 'Saída · 3,5 kΩ : 8 Ω' },
        { anchor: 'ptCoil', text: 'Força · cobre esmaltado' },
      ],
    },
    {
      key: 'circuito',
      short: 'O circuito',
      title: 'Ponto a *ponto*',
      text: 'Nenhuma placa de produção em massa. Cada componente é soldado direto em terminais de torre, com fios curtos e trajetos pensados para o menor ruído possível.',
      meta: 'TERMINAIS DE TORRE · COBRE OFC · PRATA',
      callouts: [
        { anchor: 'board', text: 'Terminais de torre · solda com prata' },
        { anchor: 'boardCaps', text: 'Capacitores de filme' },
      ],
    },
    {
      key: 'remontado',
      short: 'Remontado',
      title: 'Então ele se *fecha*, e só resta a música',
      text: 'Depois de 120 horas de bancada e 72 de amaciamento, o I-300 sai do ateliê com o nome de quem o montou gravado no chassi.',
      meta: '120 H DE MONTAGEM · 72 H DE AMACIAMENTO',
      callouts: [],
    },
  ],
}

export const line = {
  label: '02 — A LINHA',
  title: 'Quatro peças. *Nenhuma* em série.',
  intro:
    'Cada modelo é projetado no ateliê e montado sob encomenda, com acabamento e ajustes definidos para a sua sala.',
  priceLabel: 'Sob consulta',
  ctaLabel: 'Consultar',
  products: [
    {
      id: 'i300',
      name: 'Orfeu I-300',
      type: 'Integrado valvulado',
      phrase: 'Oito watts que enchem uma sala inteira.',
      specs: [
        { label: 'Topologia', value: 'Single-ended 300B' },
        { label: 'Potência', value: '8 W/canal' },
        { label: 'Classe', value: 'A, sem realimentação' },
      ],
      art: 'amp',
    },
    {
      id: 'p1',
      name: 'Orfeu P-1',
      type: 'Pré de linha valvulado',
      phrase: 'O silêncio antes da primeira nota.',
      specs: [
        { label: 'Válvulas', value: '2× 6SN7' },
        { label: 'Ganho', value: '12 dB' },
        { label: 'Entradas', value: '4× RCA · 1× XLR' },
      ],
      art: 'pre',
    },
    {
      id: 'phono',
      name: 'Orfeu Phono MC',
      type: 'Pré de phono para cápsulas MC',
      phrase: 'Para quem ainda vira o disco.',
      specs: [
        { label: 'Ganho', value: '66 dB (MC)' },
        { label: 'RIAA', value: 'Passiva · ±0,2 dB' },
        { label: 'Step-up', value: 'Bobinado à mão' },
      ],
      art: 'phono',
    },
    {
      id: 'monitor8',
      name: 'Orfeu Monitor 8',
      type: 'Caixa acústica de 2 vias',
      phrase: 'Madeira maciça, nenhum excesso.',
      specs: [
        { label: 'Woofer', value: '8″ em papel' },
        { label: 'Sensibilidade', value: '92 dB/W/m' },
        { label: 'Gabinete', value: 'Freijó maciço' },
      ],
      art: 'speaker',
    },
  ],
}

export const process = {
  label: '03 — O ATELIÊ',
  title: 'Do primeiro disco ouvido à *última* calibração',
  intro:
    'Cada peça passa pelas mesmas cinco etapas, sempre com a mesma pessoa responsável do início ao fim.',
  media: {
    caption: 'LOOP · BANCADA DO ATELIÊ, PINHEIROS',
    alt: 'Bancada do ateliê com um amplificador aberto sob luz baixa (imagem ilustrativa)',
  },
  steps: [
    {
      title: 'Escuta inicial',
      duration: '1 encontro',
      text: 'Ouvimos seus discos, medimos a sala e entendemos o que você quer sentir.',
    },
    {
      title: 'Projeto sob medida',
      duration: '2 semanas',
      text: 'Definimos acabamento, entradas, impedância e o casamento com as suas caixas.',
    },
    {
      title: 'Montagem',
      duration: '≈ 120 h',
      text: 'Um único técnico monta a peça do primeiro ao último ponto de solda.',
    },
    {
      title: 'Amaciamento',
      duration: '72 h',
      text: 'A peça toca sem parar por três dias, com medições a cada 12 horas.',
    },
    {
      title: 'Entrega e calibração',
      duration: '1 visita',
      text: 'Instalamos e ajustamos o sistema na sua sala, com você ouvindo.',
    },
  ],
}

export const numbers = {
  label: '04 — EM NÚMEROS',
  items: [
    { value: 40, suffix: '', caption: 'PEÇAS POR ANO' },
    { value: 12, suffix: '', caption: 'ANOS DE ATELIÊ' },
    { value: 100, suffix: '%', caption: 'MONTADO EM SÃO PAULO' },
  ],
  note: 'Uma agenda curta é escolha, não limitação: cada peça ocupa uma bancada por semanas.',
}

export const specs = {
  label: '05 — ESPECIFICAÇÕES',
  product: 'Orfeu I-300',
  title: 'Orfeu I-300, *em detalhe*',
  intro:
    'Integrado single-ended com 300B, sem realimentação global e fiação ponto a ponto. Os números abaixo são medidos em cada unidade antes da entrega.',
  download: {
    label: 'Baixar ficha técnica',
    href: '/downloads/orfeu-i300-ficha-tecnica.pdf',
    meta: 'PDF · 1 PÁGINA',
  },
  rows: [
    { label: 'Topologia', value: 'Single-ended, classe A' },
    { label: 'Válvulas de potência', value: '2× 300B' },
    { label: 'Válvulas de pré', value: '2× 6SN7' },
    { label: 'Potência', value: '8 W por canal (8 Ω)' },
    { label: 'Resposta de frequência', value: '18 Hz – 45 kHz (−1 dB)' },
    { label: 'Distorção (THD)', value: '< 1% a 1 W' },
    { label: 'Relação sinal/ruído', value: '> 92 dB' },
    { label: 'Realimentação global', value: 'Nenhuma' },
    { label: 'Sensibilidade de entrada', value: '750 mV' },
    { label: 'Impedância de entrada', value: '100 kΩ' },
    { label: 'Entradas', value: '3× RCA' },
    { label: 'Saídas', value: '4 Ω e 8 Ω, bornes' },
    { label: 'Fiação', value: 'Ponto a ponto, OFC e prata' },
    { label: 'Transformadores', value: 'Bobinados à mão no ateliê' },
    { label: 'Consumo', value: '180 W' },
    { label: 'Dimensões (L × A × P)', value: '440 × 220 × 340 mm' },
    { label: 'Peso', value: '24 kg' },
    { label: 'Garantia', value: '5 anos (válvulas: 1 ano)' },
  ],
}

export const listen = {
  label: '06 — AUDIÇÃO',
  title: 'Escute *antes* de decidir',
  intro:
    'Nenhuma ficha técnica substitui uma tarde de discos. Receba-nos em casa ou venha ouvir a linha completa na nossa sala.',
  options: [
    {
      kicker: 'SALA DE AUDIÇÃO',
      title: 'Pinheiros, São Paulo',
      text: 'Sala tratada acusticamente, com a linha completa montada. Duas horas, só você e seus discos.',
      detail: 'address',
    },
    {
      kicker: 'DEMONSTRAÇÃO EM CASA',
      title: 'Grande São Paulo',
      text: 'Levamos um I-300 e um par de Monitor 8 até a sua sala e montamos o sistema no seu espaço.',
      detail: 'Agendamento com 10 dias de antecedência',
    },
  ],
  ctaPrimary: { label: 'Agendar audição', href: 'whatsapp' },
  ctaSecondary: { label: 'Falar com o ateliê', href: 'mail' },
  media: {
    caption: 'SALA DE AUDIÇÃO · PINHEIROS',
    alt: 'Sala de audição com um par de caixas Monitor 8 e uma poltrona (ilustração)',
  },
}

export const testimonials = {
  label: '07 — QUEM OUVIU',
  items: [
    {
      quote: 'Desliguei o streaming e voltei aos discos. Não sei explicar de outro jeito.',
      name: 'Marina A.',
      place: 'Pinheiros, SP',
      product: 'I-300 + Monitor 8',
    },
    {
      quote: 'Esperei sete meses. Na primeira noite, ouvi o mesmo disco três vezes.',
      name: 'Ricardo T.',
      place: 'Campinas, SP',
      product: 'I-300',
    },
    {
      quote: 'O que me convenceu foi a calibração na minha sala. Ninguém tinha feito isso antes.',
      name: 'Helena S.',
      place: 'Alphaville, SP',
      product: 'P-1 + Phono MC',
    },
  ],
}

export const footer = {
  tagline: 'Feito à mão em São Paulo · 40 peças por ano',
  columns: [
    {
      title: 'Produtos',
      links: [
        { label: 'Orfeu I-300', href: '#linha' },
        { label: 'Orfeu P-1', href: '#linha' },
        { label: 'Orfeu Phono MC', href: '#linha' },
        { label: 'Orfeu Monitor 8', href: '#linha' },
      ],
    },
    {
      title: 'Ateliê',
      links: [
        { label: 'Processo', href: '#atelie' },
        { label: 'Desmontagem', href: '#desmontagem' },
        { label: 'Depoimentos', href: '#depoimentos' },
        { label: 'Sala de audição', href: '#audicao' },
      ],
    },
    {
      title: 'Suporte',
      links: [
        { label: 'Ficha técnica (PDF)', href: '/downloads/orfeu-i300-ficha-tecnica.pdf' },
        { label: 'Garantia', href: '#especificacoes' },
        { label: 'Troca de válvulas', href: 'mail' },
        { label: 'Manutenção', href: 'mail' },
      ],
    },
    {
      title: 'Contato',
      links: [
        { label: 'WhatsApp', href: 'whatsapp' },
        { label: 'E-mail', href: 'mail' },
        { label: 'Instagram', href: '#' },
        { label: 'Pinheiros, São Paulo', href: '#audicao' },
      ],
    },
  ],
  legal: [
    { label: 'Privacidade', href: '#privacidade' },
    { label: 'Termos de uso', href: '#termos' },
  ],
  copyright: '© 2026 Orfeu Áudio · marca e conteúdo fictícios',
}
