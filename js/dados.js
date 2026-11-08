/*
 * DADOS DO NEGÓCIO — único arquivo que precisa ser editado para um novo cliente.
 *
 * É um script comum (não módulo ES) para que o site abra com duplo clique:
 * navegadores bloqueiam `import` em páginas abertas como arquivo (file://).
 * O objeto fica disponível como `window.DADOS` para o main.js.
 */
window.DADOS = {
  nome: "Panificadora Bom Fermento", // fictício
  aviso: "Site de demonstração — negócio fictício", // deixe "" para esconder a faixa

  // Exibido como "Av. Exemplo, 000 — Setor Campinas, Goiânia – GO".
  // Separado em partes para alimentar também o JSON-LD (schema.org).
  endereco: {
    logradouro: "Av. Exemplo, 000",
    bairro: "Setor Campinas",
    cidade: "Goiânia",
    uf: "GO",
    cep: "" // opcional
  },
  // O que o mapa embutido e o botão "Abrir no Google Maps" procuram.
  // No demo é o bairro em geral; para um cliente real, use o nome da loja como aparece no Google Maps.
  consultaMapa: "Setor Campinas, Goiânia - GO",

  apoio: "Padaria de bairro no Setor Campinas, em Goiânia. Bolo, salgado e docinho por encomenda.",

  telefone: "(62) 0000-0000", // placeholder, não use número real
  whatsapp: "5562900000000", // placeholder, formato internacional só com dígitos
  instagram: "", // usuário sem @; vazio esconde o link

  horarios: {
    // 0 = domingo … 6 = sábado. Dia fechado: null
    0: { abre: "06:00", fecha: "12:00" },
    1: { abre: "05:30", fecha: "20:00" },
    2: { abre: "05:30", fecha: "20:00" },
    3: { abre: "05:30", fecha: "20:00" },
    4: { abre: "05:30", fecha: "20:00" },
    5: { abre: "05:30", fecha: "20:00" },
    6: { abre: "05:30", fecha: "19:00" }
  },

  // Fornadas de pão francês. Em dias que a loja fecha antes de um horário, ele não aparece.
  fornadas: ["06:00", "11:00", "16:00"],

  encomendas: {
    antecedenciaMinimaDias: 1,
    itens: [
      "Bolo de aniversário",
      "Salgados para festa (cento)",
      "Docinhos (cento)",
      "Torta salgada",
      "Pão de queijo congelado (kg)"
    ]
  },

  precosIlustrativos: true, // mostra a nota "Preços ilustrativos de exemplo"
  cardapio: [
    { categoria: "Pães", itens: [
      { nome: "Pão francês", detalhe: "kg", preco: "15,90" },
      { nome: "Pão de queijo", detalhe: "unidade", preco: "1,50" },
      { nome: "Pão doce caseiro", detalhe: "unidade", preco: "6,00" } ] },
    { categoria: "Café da manhã", itens: [
      { nome: "Pingado + pão na chapa", detalhe: "", preco: "9,00" },
      { nome: "Café coado", detalhe: "copo", preco: "4,00" },
      { nome: "Misto quente", detalhe: "", preco: "10,00" } ] },
    { categoria: "Lanche da tarde", itens: [
      { nome: "Empadão goiano", detalhe: "fatia", preco: "14,00" },
      { nome: "Bolo de fubá", detalhe: "fatia", preco: "6,00" },
      { nome: "Suco natural", detalhe: "300 ml", preco: "8,00" } ] }
  ],

  credito: { texto: "Site por Rafael Morais", link: "#" }
};
