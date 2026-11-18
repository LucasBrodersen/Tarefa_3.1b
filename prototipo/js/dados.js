// dados.js - dados de teste guardados no localStorage

const CHAVE = "animalec-prototipo-v1";

const SEMENTE = {
  animais: [
    { id: 1, nome: "cão", grupo: "mamífero", nivel: 1, descricao: "Companheiro do ser humano há milhares de anos." },
    { id: 2, nome: "gato", grupo: "mamífero", nivel: 1, descricao: "Pequeno felino doméstico, caçador noturno." },
    { id: 3, nome: "pardal", grupo: "ave", nivel: 2, descricao: "Ave comum em cidades e aldeias." },
    { id: 4, nome: "cavalo", grupo: "mamífero", nivel: 2, descricao: "Herbívoro de grande porte, domesticado há 5000 anos." },
    { id: 5, nome: "lince-ibérico", grupo: "mamífero", nivel: 3, descricao: "Felino endémico da Península Ibérica, em recuperação." },
    { id: 6, nome: "lobo-ibérico", grupo: "mamífero", nivel: 3, descricao: "Subespécie de lobo do noroeste da Península." },
    { id: 7, nome: "cegonha-branca", grupo: "ave", nivel: 2, descricao: "Ave migratória que nidifica em postes e torres." },
    { id: 8, nome: "tartaruga-comum", grupo: "réptil", nivel: 3, descricao: "Tartaruga marinha presente na costa portuguesa." },
    { id: 9, nome: "salamandra-de-pintas", grupo: "anfíbio", nivel: 2, descricao: "Anfíbio de manchas amarelas, ativo em noites húmidas." }
  ],
  patrocinadores: [
    { id: 1, nome: "Mar Limpo, ONGA", tipo: "ONG", email: "parcerias@marlimpo.example", website: "https://marlimpo.example",
      modalidade: "apadrinhamento", valorAnual: 1200, inicio: "2026-01-01", fim: "2026-12-31",
      animais: [8], mostrarNaApp: true, ativo: true, notas: "Apadrinha a ficha e os quizzes da tartaruga-comum." },
    { id: 2, nome: "Clínica Veterinária Quatro Patas", tipo: "Empresa", email: "geral@quatropatas.example", website: "",
      modalidade: "quiz", valorAnual: 400, inicio: "2026-03-01", fim: "2027-02-28",
      animais: [1, 2], mostrarNaApp: true, ativo: true, notas: "Patrocina o quiz \"Animais de companhia\"." },
    { id: 3, nome: "Agrupamento de Escolas do Vale", tipo: "Escola", email: "direcao@aevale.example", website: "",
      modalidade: "donativo", valorAnual: 150, inicio: "2026-05-15", fim: "2026-05-15",
      animais: [7, 3], mostrarNaApp: false, ativo: true, notas: "Donativo do projeto \"Aves da nossa terra\"." },
    { id: 4, nome: "Herdade do Lince", tipo: "Empresa", email: "info@herdadelince.example", website: "https://herdadelince.example",
      modalidade: "apadrinhamento", valorAnual: 2500, inicio: "2025-01-01", fim: "2025-12-31",
      animais: [5], mostrarNaApp: true, ativo: false, notas: "Contrato terminado; renovação em negociação." }
  ],
  especialistas: [
    { id: 1, nome: "Ana Ribeiro", titulo: "Doutora", instituicao: "Universidade de Évora", especialidade: "mamífero",
      email: "ana.ribeiro@uevora.example", orcid: "0000-0002-1825-0097", animais: [5, 6],
      revisoes: { "5": "2026-10-02", "6": "2025-06-11" }, validaQuizzes: true, ativo: true,
      bio: "Ecóloga de carnívoros; acompanha o programa de reintrodução do lince." },
    { id: 2, nome: "Rui Matos", titulo: "Mestre", instituicao: "Centro de Estudos de Aves", especialidade: "ave",
      email: "rui.matos@cea.example", orcid: "", animais: [3, 7],
      revisoes: { "3": "2026-09-20", "7": "2026-09-20" }, validaQuizzes: false, ativo: true,
      bio: "Anilhador certificado; coordena censos de cegonha-branca." },
    { id: 3, nome: "Marta Sousa", titulo: "Doutora", instituicao: "Aquário Vasco da Gama", especialidade: "réptil",
      email: "m.sousa@aquario.example", orcid: "0000-0001-5109-3700", animais: [8],
      revisoes: {}, validaQuizzes: true, ativo: true,
      bio: "Bióloga marinha; recupera tartarugas encontradas na costa." }
  ],
  outros: { utilizadores: 128, quizzes: 6, questoes: 54 }
};

export const MODALIDADES = {
  apadrinhamento: "Apadrinhamento anual",
  donativo: "Donativo pontual",
  quiz: "Patrocínio de quiz"
};
export const TIPOS = ["Empresa", "ONG", "Escola", "Particular"];
export const GRUPOS = ["mamífero", "ave", "réptil", "anfíbio", "peixe", "invertebrado"];
export const TITULOS = ["Doutora", "Doutor", "Mestre", "Licenciada", "Licenciado"];
export const VALIDADE_REVISAO_DIAS = 365;

export function carregar() {
  try {
    const guardado = localStorage.getItem(CHAVE);
    if (guardado) return JSON.parse(guardado);
  } catch (e) { /* fallback */ }
  return structuredClone(SEMENTE);
}

export function guardar(bd) {
  try { localStorage.setItem(CHAVE, JSON.stringify(bd)); } catch (e) { }
}

export function repor() {
  try { localStorage.removeItem(CHAVE); } catch (e) {}
}

export function proximoId(lista) {
  return lista.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}

export function diasDesde(dataIso) {
  if (!dataIso) return Infinity;
  return Math.floor((Date.now() - new Date(dataIso + "T00:00:00").getTime()) / 86400000);
}

export function formatarData(dataIso) {
  if (!dataIso) return "—";
  const [a, m, d] = dataIso.split("-");
  return `${d}/${m}/${a}`;
}

export function euros(v) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

// sessao
export function autenticado() {
  try { return sessionStorage.getItem("animalec-admin") === "1"; } catch (e) { return true; }
}
export function entrar() { try { sessionStorage.setItem("animalec-admin", "1"); } catch (e) {} }
export function sair() { try { sessionStorage.removeItem("animalec-admin"); } catch (e) {} }
