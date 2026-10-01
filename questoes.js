// SOMENTE CONTEÚDO DAS QUESTÕES. O GABARITO, a explicação e a fonte ficam no backend (aba QUESTOES).
// Os "id" daqui devem ser iguais aos "questao_id" da planilha.
// ATENÇÃO: as questões abaixo são EXEMPLOS de formato, para testar o sistema.
// Substitua pelas questões reais. Não atribua banca/concurso sem comprovação.
const QUESTOES = [
  {
    id: "Q001", tipo: "objetiva", tema: "Instrumentos", dificuldade: "difícil",
    enunciado: "[EXEMPLO] Qual instrumento manual é utilizado para remover dentina cariada amolecida em cavidades profundas?",
    alternativas: { A: "Cureta de dentina (colher)", B: "Sonda exploradora nº 5", C: "Espelho clínico", D: "Pinça clínica", E: "Cinzel reto" }
  },
  {
    id: "Q002", tipo: "objetiva", tema: "Classificação de cavidades", dificuldade: "difícil",
    enunciado: "[EXEMPLO] Na classificação de Black, a cavidade Classe II envolve:",
    alternativas: { A: "Fóssulas e fissuras de pré-molares e molares", B: "Superfícies proximais de pré-molares e molares", C: "Proximais de incisivos e caninos sem ângulo incisal", D: "Proximais de incisivos e caninos com ângulo incisal", E: "Terço cervical das faces vestibular e lingual" }
  },
  {
    id: "Q003", tipo: "discursiva", tema: "Princípios de Black",
    enunciado: "[EXEMPLO] Explique a diferença entre forma de resistência e forma de retenção no preparo cavitário."
  }
];
