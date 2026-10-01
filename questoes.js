// SOMENTE CONTEÚDO DAS QUESTÕES.
// O gabarito, explicação e fonte ficam no backend (aba QUESTOES).
//
// Os "id" daqui DEVEM ser iguais aos "questao_id" da planilha.
// Não colocar gabarito neste arquivo.
//
// Q001–Q040 — ESTUDO DIRIGIDO DENTÍSTICA — PROVA 01

const QUESTOES = [

  // ============================================================
  // Q001
  // ============================================================
  {
    id: "Q001",
    tipo: "objetiva",
    tema: "Resinas compostas — classificação",
    dificuldade: "alta",
    enunciado: "Considerando a classificação das resinas compostas segundo o tamanho e a distribuição das partículas de carga, assinale a alternativa que reúne classificações reconhecidas.",
    alternativas: {
      A: "Microparticulada, híbrida, micro-híbrida, nanoparticulada e nano-híbrida.",
      B: "Macroparticulada, híbrida, micro-híbrida e nanohíbrida.",
      C: "Apenas microparticulada, híbrida e nanoparticulada.",
      D: "Macroparticulada, microparticulada, micro-híbrida e nanohíbrida.",
      E: "Híbrida, micro-híbrida, nanoparticulada e nano-híbrida."
    }
  },

  // ============================================================
  // Q002
  // ============================================================
  {
    id: "Q002",
    tipo: "objetiva",
    tema: "Resinas compostas — tamanho de partículas",
    dificuldade: "muito alta",
    enunciado: "Em relação às resinas microparticuladas e nanoparticuladas, assinale a alternativa correta.",
    alternativas: {
      A: "As microparticuladas apresentam excelente capacidade de polimento, mas tradicionalmente menor desempenho mecânico em áreas de elevado estresse; as nanoparticuladas incorporam partículas em escala nanométrica e podem apresentar elevado conteúdo de carga e boa manutenção de lisura.",
      B: "As microparticuladas apresentam obrigatoriamente maior resistência ao desgaste que todas as nanoparticuladas.",
      C: "As nanoparticuladas não possuem partículas em escala nanométrica.",
      D: "A principal diferença entre elas é exclusivamente a cor.",
      E: "As microparticuladas são indicadas exclusivamente para dentes posteriores submetidos a altas cargas mastigatórias."
    }
  },

  // ============================================================
  // Q003
  // ============================================================
  {
    id: "Q003",
    tipo: "objetiva",
    tema: "Resinas compostas — composição e propriedades",
    dificuldade: "muito alta",
    enunciado: "Analise as afirmações sobre resinas compostas: I. A matriz orgânica pode conter monômeros como Bis-GMA, UDMA e TEGDMA. II. As partículas inorgânicas influenciam propriedades como resistência, contração de polimerização e lisura superficial. III. O silano participa da união entre determinadas partículas de carga e a matriz resinosa. Está correto o que se afirma em:",
    alternativas: {
      A: "I apenas.",
      B: "II apenas.",
      C: "I e II apenas.",
      D: "I, II e III.",
      E: "II e III apenas."
    }
  },

  // ============================================================
  // Q004
  // ============================================================
  {
    id: "Q004",
    tipo: "objetiva",
    tema: "Resinas compostas — microparticuladas",
    dificuldade: "muito alta",
    enunciado: "Em relação às resinas microparticuladas, assinale a alternativa mais compatível com suas características clássicas.",
    alternativas: {
      A: "Apresentam excelente capacidade de polimento e manutenção de lisura superficial, mas propriedades mecânicas inferiores às de compósitos com maior conteúdo de carga em situações de alta solicitação.",
      B: "Apresentam as maiores partículas disponíveis e menor capacidade de polimento.",
      C: "São indicadas exclusivamente para restaurações posteriores extensas submetidas a altas cargas.",
      D: "Não possuem matriz orgânica resinosa.",
      E: "Não podem ser utilizadas em regiões anteriores."
    }
  },

  // ============================================================
  // Q005
  // ============================================================
  {
    id: "Q005",
    tipo: "objetiva",
    tema: "Resinas compostas — micro-híbridas e nano-híbridas",
    dificuldade: "muito alta",
    enunciado: "Em relação às resinas micro-híbridas e nano-híbridas, é correto afirmar que:",
    alternativas: {
      A: "A micro-híbrida combina partículas de diferentes dimensões buscando equilíbrio entre resistência e acabamento superficial; a nano-híbrida utiliza componentes em escala nanométrica e pode apresentar bom equilíbrio entre propriedades mecânicas e estética.",
      B: "A micro-híbrida é constituída exclusivamente por nanopartículas isoladas.",
      C: "A nano-híbrida não apresenta partículas de carga.",
      D: "A micro-híbrida apresenta obrigatoriamente pior resistência mecânica que a microparticulada.",
      E: "A nano-híbrida é necessariamente uma resina flow."
    }
  },

  // ============================================================
  // Q006
  // ============================================================
  {
    id: "Q006",
    tipo: "objetiva",
    tema: "Resinas compostas — fator C",
    dificuldade: "muito alta",
    enunciado: "O Fator C, ou fator de configuração cavitária, corresponde à relação entre:",
    alternativas: {
      A: "Área livre e área aderida.",
      B: "Área aderida e área livre.",
      C: "Profundidade e largura da cavidade.",
      D: "Volume e profundidade.",
      E: "Número de cúspides e número de paredes."
    }
  },

  // ============================================================
  // Q007
  // ============================================================
  {
    id: "Q007",
    tipo: "objetiva",
    tema: "Resinas compostas — fator C e Classe I",
    dificuldade: "muito alta",
    enunciado: "Em uma cavidade Classe I oclusal convencional, considerando cinco superfícies aderidas e uma superfície livre, o Fator C é 5. Sobre essa situação, assinale a alternativa correta.",
    alternativas: {
      A: "O Fator C elevado está associado a maior potencial de desenvolvimento de tensão de contração de polimerização.",
      B: "O Fator C elevado significa menor tensão de contração.",
      C: "O Fator C não depende da configuração da cavidade.",
      D: "Classe I apresenta necessariamente menor Fator C que Classe II.",
      E: "O Fator C corresponde à quantidade de carga inorgânica da resina."
    }
  },

  // ============================================================
  // Q008
  // ============================================================
  {
    id: "Q008",
    tipo: "objetiva",
    tema: "Resinas compostas — contração de polimerização",
    dificuldade: "muito alta",
    enunciado: "A técnica incremental de inserção da resina composta em restaurações posteriores é utilizada principalmente porque pode contribuir para:",
    alternativas: {
      A: "Reduzir os efeitos relacionados à contração e ao estresse de polimerização e favorecer adaptação e anatomia.",
      B: "Aumentar propositalmente o fator C da cavidade.",
      C: "Eliminar completamente a contração de polimerização.",
      D: "Dispensar a fotoativação individual dos incrementos.",
      E: "Substituir o sistema adesivo."
    }
  },

  // ============================================================
  // Q009
  // ============================================================
  {
    id: "Q009",
    tipo: "objetiva",
    tema: "Resinas compostas — flow",
    dificuldade: "alta",
    enunciado: "As resinas compostas flow apresentam menor viscosidade que os compósitos convencionais. Considerando sua utilização clínica, assinale a alternativa correta.",
    alternativas: {
      A: "A menor viscosidade favorece adaptação e escoamento em determinadas situações, mas não significa que a flow seja universalmente indicada para substituir qualquer compósito convencional em áreas de elevada carga.",
      B: "A resina flow apresenta necessariamente maior resistência ao desgaste que qualquer resina convencional.",
      C: "A flow não sofre contração de polimerização.",
      D: "A flow não necessita de fotoativação quando fotopolimerizável.",
      E: "A flow possui indicação exclusiva para clareamento dental."
    }
  },

  // ============================================================
  // Q010
  // ============================================================
  {
    id: "Q010",
    tipo: "objetiva",
    tema: "Resinas compostas — escolha clínica",
    dificuldade: "muito alta",
    enunciado: "Em uma restauração posterior submetida a elevada carga mastigatória, a seleção do compósito deve considerar principalmente:",
    alternativas: {
      A: "Somente a cor da resina.",
      B: "Apenas a viscosidade.",
      C: "Conteúdo e tipo de carga, propriedades mecânicas, comportamento de polimerização, indicação do fabricante e características da cavidade.",
      D: "Somente o tempo de trabalho.",
      E: "Somente a capacidade de polimento."
    }
  },

  // ============================================================
  // Q011
  // ============================================================
  {
    id: "Q011",
    tipo: "objetiva",
    tema: "Fotoativação",
    dificuldade: "muito alta",
    enunciado: "Sobre aparelhos fotopolimerizadores à base de LED, assinale a alternativa correta.",
    alternativas: {
      A: "Podem utilizar menor consumo energético que aparelhos halógenos e são encontrados em modelos sem fio, dependendo do equipamento.",
      B: "Produzem exclusivamente radiação ultravioleta abaixo de 400 nm.",
      C: "Não necessitam de controle de intensidade luminosa.",
      D: "Não produzem calor em nenhuma circunstância.",
      E: "São incapazes de polimerizar materiais à base de canforoquinona."
    }
  },

  // ============================================================
  // Q012
  // ============================================================
  {
    id: "Q012",
    tipo: "objetiva",
    tema: "Adesão — condicionamento da dentina",
    dificuldade: "muito alta",
    enunciado: "O condicionamento ácido da dentina promove desmineralização superficial e exposição da rede de colágeno, permitindo posteriormente a infiltração de monômeros resinosos. Esse mecanismo está relacionado principalmente à formação de:",
    alternativas: {
      A: "Camada híbrida.",
      B: "Esmalte aprismático.",
      C: "Dentina terciária exclusivamente.",
      D: "Barreira de smear layer permanente.",
      E: "Cemento radicular."
    }
  },

  // ============================================================
  // Q013
  // ============================================================
  {
    id: "Q013",
    tipo: "objetiva",
    tema: "Adesão — sistemas autocondicionantes",
    dificuldade: "alta",
    enunciado: "Os adesivos autocondicionantes de dois passos caracterizam-se por:",
    alternativas: {
      A: "Reunir condicionamento ácido e primer em uma etapa, seguida de aplicação separada do adesivo.",
      B: "Utilizar ácido fosfórico por 60 segundos seguido obrigatoriamente de lavagem.",
      C: "Serem compostos exclusivamente por adesivo hidrofóbico.",
      D: "Não apresentar monômeros funcionais.",
      E: "Exigir sempre três aplicações independentes."
    }
  },

  // ============================================================
  // Q014
  // ============================================================
  {
    id: "Q014",
    tipo: "objetiva",
    tema: "Adesão — condicionamento seletivo",
    dificuldade: "muito alta",
    enunciado: "Em relação ao condicionamento seletivo do esmalte com ácido fosfórico associado a um adesivo universal, assinale a alternativa correta.",
    alternativas: {
      A: "O condicionamento seletivo pode ser utilizado para aumentar a microrretenção no esmalte, mantendo a dentina sob o protocolo indicado pelo adesivo.",
      B: "O condicionamento seletivo exige sempre condicionamento ácido da dentina por 60 segundos.",
      C: "É contraindicado em todos os adesivos universais.",
      D: "Elimina a necessidade de aplicação do adesivo.",
      E: "É realizado exclusivamente sobre dentina profunda."
    }
  },

  // ============================================================
  // Q015
  // ============================================================
  {
    id: "Q015",
    tipo: "objetiva",
    tema: "Adesão — smear layer",
    dificuldade: "muito alta",
    enunciado: "Considerando a dentina condicionada com ácido fosfórico, uma consequência importante do condicionamento é:",
    alternativas: {
      A: "Remoção da smear layer e desmineralização superficial, com exposição de colágeno que precisa ser adequadamente infiltrado pelo sistema adesivo.",
      B: "Formação de uma nova camada mineral espessa.",
      C: "Eliminação dos túbulos dentinários.",
      D: "Transformação imediata da dentina em esmalte.",
      E: "Remoção completa de toda água da dentina sem consequências clínicas."
    }
  },

  // ============================================================
  // Q016
  // ============================================================
  {
    id: "Q016",
    tipo: "objetiva",
    tema: "Adesão — contaminação",
    dificuldade: "muito alta",
    enunciado: "Após condicionamento e aplicação do sistema adesivo, a contaminação do campo operatório por saliva deve ser considerada porque:",
    alternativas: {
      A: "Pode comprometer a qualidade da interface adesiva e a previsibilidade da restauração.",
      B: "Melhora a energia superficial do esmalte.",
      C: "Substitui a aplicação do adesivo.",
      D: "Aumenta obrigatoriamente a resistência de união.",
      E: "Não interfere em procedimentos adesivos."
    }
  },

  // ============================================================
  // Q017
  // ============================================================
  {
    id: "Q017",
    tipo: "objetiva",
    tema: "Cárie — remoção seletiva",
    dificuldade: "muito alta",
    enunciado: "Na remoção seletiva de tecido cariado em uma lesão profunda, a preservação de dentina afetada próxima à polpa pode ser indicada principalmente para:",
    alternativas: {
      A: "Reduzir o risco de exposição pulpar e preservar estrutura dentária, desde que haja adequado selamento restaurador.",
      B: "Eliminar toda possibilidade de remineralização.",
      C: "Manter obrigatoriamente dentina infectada em todas as paredes.",
      D: "Aumentar a contaminação bacteriana deliberadamente.",
      E: "Substituir o diagnóstico pulpar."
    }
  },

  // ============================================================
  // Q018
  // ============================================================
  {
    id: "Q018",
    tipo: "objetiva",
    tema: "Cárie — dentina afetada",
    dificuldade: "muito alta",
    enunciado: "Assinale a alternativa que melhor caracteriza a dentina afetada em uma lesão cariosa profunda.",
    alternativas: {
      A: "Apresenta menor carga bacteriana e estrutura de colágeno relativamente preservada, podendo ser preservada em determinadas situações quando adequadamente selada.",
      B: "É totalmente irreversível e sem potencial de remineralização.",
      C: "É sempre mais infectada que a dentina externa.",
      D: "Deve obrigatoriamente ser removida até exposição pulpar.",
      E: "É equivalente ao esmalte hígido."
    }
  },

  // ============================================================
  // Q019
  // ============================================================
  {
    id: "Q019",
    tipo: "objetiva",
    tema: "Cárie — remoção seletiva",
    dificuldade: "alta",
    enunciado: "Segundo a abordagem contemporânea de remoção seletiva de tecido cariado, em uma lesão profunda de um dente vital sem sinais de pulpite irreversível, uma conduta compatível é:",
    alternativas: {
      A: "Remover seletivamente o tecido cariado, preservando dentina próxima à polpa quando necessário, e realizar adequado selamento da cavidade.",
      B: "Remover obrigatoriamente todo tecido amolecido até expor a polpa.",
      C: "Indicar tratamento endodôntico em qualquer lesão profunda.",
      D: "Deixar a cavidade aberta para permitir drenagem.",
      E: "Realizar exodontia preventiva."
    }
  },

  // ============================================================
  // Q020
  // ============================================================
  {
    id: "Q020",
    tipo: "objetiva",
    tema: "Cárie — decisão restauradora",
    dificuldade: "muito alta",
    enunciado: "Na decisão de tratamento de uma lesão de cárie, qual conjunto de fatores deve ser considerado?",
    alternativas: {
      A: "Atividade da lesão, risco de cárie, controle de biofilme, localização, extensão e possibilidade de controle da lesão.",
      B: "Apenas a profundidade radiográfica.",
      C: "Apenas a presença de cavitação.",
      D: "Apenas a idade do paciente.",
      E: "Apenas a cor da lesão."
    }
  },

  // ============================================================
  // Q021
  // ============================================================
  {
    id: "Q021",
    tipo: "objetiva",
    tema: "Preparo cavitário — Classe I",
    dificuldade: "alta",
    enunciado: "As cavidades Classe I de Black envolvem, classicamente:",
    alternativas: {
      A: "Áreas de cicatrículas e fissuras, incluindo superfícies oclusais de posteriores.",
      B: "Superfícies proximais de dentes posteriores exclusivamente.",
      C: "Superfícies proximais de anteriores sem envolvimento incisal.",
      D: "Terço cervical de qualquer dente.",
      E: "Bordas incisais exclusivamente."
    }
  },

  // ============================================================
  // Q022
  // ============================================================
  {
    id: "Q022",
    tipo: "objetiva",
    tema: "Preparo cavitário — princípios atuais",
    dificuldade: "muito alta",
    enunciado: "Em comparação aos princípios clássicos de Black, a filosofia contemporânea de preparo cavitário para restaurações adesivas enfatiza:",
    alternativas: {
      A: "Maior preservação de estrutura dental sadia e remoção seletiva do tecido comprometido.",
      B: "Extensão preventiva ampla mesmo em esmalte hígido.",
      C: "Profundidade uniforme independentemente da lesão.",
      D: "Criação obrigatória de retenções mecânicas profundas.",
      E: "Remoção de todo esmalte sem suporte, mesmo quando não comprometido clinicamente."
    }
  },

  // ============================================================
  // Q023
  // ============================================================
  {
    id: "Q023",
    tipo: "objetiva",
    tema: "Preparo cavitário — forma de resistência",
    dificuldade: "muito alta",
    enunciado: "A forma de resistência de um preparo cavitário tem como finalidade principal:",
    alternativas: {
      A: "Permitir que o dente remanescente e a restauração resistam às forças mastigatórias sem fratura ou deformação indesejada.",
      B: "Criar exclusivamente retenção para o material restaurador.",
      C: "Facilitar a entrada dos instrumentos.",
      D: "Determinar a cor da restauração.",
      E: "Substituir o isolamento absoluto."
    }
  },

  // ============================================================
  // Q024
  // ============================================================
  {
    id: "Q024",
    tipo: "objetiva",
    tema: "Preparo cavitário — forma de retenção",
    dificuldade: "muito alta",
    enunciado: "A forma de retenção de um preparo cavitário está relacionada principalmente à capacidade de:",
    alternativas: {
      A: "Evitar o deslocamento da restauração de sua posição.",
      B: "Facilitar a iluminação do campo.",
      C: "Determinar a profundidade de cárie.",
      D: "Reduzir o tempo de fotoativação.",
      E: "Determinar a cor da resina."
    }
  },

  // ============================================================
  // Q025
  // ============================================================
  {
    id: "Q025",
    tipo: "objetiva",
    tema: "Preparo cavitário — forma de conveniência",
    dificuldade: "alta",
    enunciado: "A forma de conveniência corresponde a características do preparo que:",
    alternativas: {
      A: "Facilitam o acesso, a instrumentação, a inserção e/ou a manipulação do material restaurador.",
      B: "Aumentam obrigatoriamente a profundidade do preparo.",
      C: "Impedem o acesso visual à cavidade.",
      D: "Substituem a resistência.",
      E: "Criam exclusivamente retenção mecânica."
    }
  },

  // ============================================================
  // Q026
  // ============================================================
  {
    id: "Q026",
    tipo: "objetiva",
    tema: "Preparo cavitário — ângulos",
    dificuldade: "muito alta",
    enunciado: "Em relação aos ângulos diedros dos preparos cavitários, o ângulo diedro de primeiro grupo é formado pela união de:",
    alternativas: {
      A: "Duas paredes circundantes.",
      B: "Uma parede circundante e uma parede de fundo.",
      C: "Duas paredes de fundo.",
      D: "Uma parede circundante e o ângulo cavo-superficial.",
      E: "Duas paredes de esmalte."
    }
  },

  // ============================================================
  // Q027
  // ============================================================
  {
    id: "Q027",
    tipo: "objetiva",
    tema: "Evolução dos preparos cavitários",
    dificuldade: "muito alta",
    enunciado: "A evolução dos preparos cavitários está relacionada, entre outros fatores, ao desenvolvimento dos sistemas adesivos e dos materiais restauradores. Uma consequência dessa evolução é:",
    alternativas: {
      A: "A necessidade de ampliar todas as cavidades para aumentar a retenção mecânica.",
      B: "A possibilidade de realizar preparos mais conservadores, reduzindo a dependência de determinadas formas mecânicas de retenção.",
      C: "A eliminação completa da necessidade de controle de umidade.",
      D: "A indicação universal de preparos baseados exclusivamente em princípios de Black.",
      E: "A impossibilidade de restaurar lesões pequenas com materiais adesivos."
    }
  },

  // ============================================================
  // Q028
  // ============================================================
  {
    id: "Q028",
    tipo: "discursiva",
    tema: "Princípios clássicos e atuais do preparo cavitário",
    dificuldade: "muito alta",
    enunciado: "Compare os princípios clássicos de preparo cavitário associados a Black com os princípios contemporâneos utilizados na Dentística restauradora adesiva. Destaque as principais diferenças quanto à preservação da estrutura dental, retenção e extensão do preparo."
  },

  // ============================================================
  // Q029
  // ============================================================
  {
    id: "Q029",
    tipo: "objetiva",
    tema: "Sistemas adesivos",
    dificuldade: "muito alta",
    enunciado: "O condicionamento ácido do esmalte com ácido fosfórico favorece a adesão principalmente porque:",
    alternativas: {
      A: "Elimina completamente a fase mineral do esmalte e transforma-o em tecido conjuntivo.",
      B: "Produz microporosidades e aumenta a energia superficial, favorecendo a retenção micromecânica do sistema restaurador.",
      C: "Impede permanentemente qualquer interação entre o esmalte e o sistema adesivo.",
      D: "Torna o esmalte completamente impermeável aos monômeros adesivos.",
      E: "Substitui integralmente a necessidade de aplicação de sistema adesivo."
    }
  },

  // ============================================================
  // Q030
  // ============================================================
  {
    id: "Q030",
    tipo: "objetiva",
    tema: "Sistemas adesivos — autocondicionantes",
    dificuldade: "muito alta",
    enunciado: "Em um sistema adesivo autocondicionante de dois passos, a estratégia clínica envolve:",
    alternativas: {
      A: "Condicionamento ácido exclusivamente do esmalte, seguido diretamente pela aplicação do compósito.",
      B: "Aplicação de um primer ácido que realiza o condicionamento/desmineralização e, posteriormente, aplicação de uma resina adesiva separada.",
      C: "Aplicação de ácido fosfórico, primer e adesivo em uma única etapa obrigatória.",
      D: "Aplicação somente de água sobre dentina e posterior inserção do material restaurador.",
      E: "Remoção completa da dentina para expor exclusivamente esmalte."
    }
  },

  // ============================================================
  // Q031
  // ============================================================
  {
    id: "Q031",
    tipo: "objetiva",
    tema: "Sistemas adesivos — esmalte e dentina",
    dificuldade: "muito alta",
    enunciado: "Em comparação com o esmalte, a adesão à dentina apresenta maior complexidade principalmente devido:",
    alternativas: {
      A: "À ausência completa de água e matéria orgânica na dentina.",
      B: "À presença de matriz orgânica, umidade e túbulos dentinários, fatores que influenciam a interação com os sistemas adesivos.",
      C: "À inexistência de qualquer conteúdo mineral na dentina.",
      D: "Ao fato de a dentina ser estruturalmente idêntica ao esmalte.",
      E: "À impossibilidade de qualquer sistema adesivo interagir com a dentina."
    }
  },

  // ============================================================
  // Q032
  // ============================================================
  {
    id: "Q032",
    tipo: "objetiva",
    tema: "Condicionamento ácido",
    dificuldade: "muito alta",
    enunciado: "Após o condicionamento ácido da dentina, a secagem excessiva e vigorosa pode prejudicar a adesão porque:",
    alternativas: {
      A: "Aumenta indefinidamente a quantidade de colágeno disponível para infiltração.",
      B: "Transforma imediatamente toda a dentina em esmalte.",
      C: "Impede a ação do ácido sobre qualquer componente mineral.",
      D: "Pode provocar o colapso da rede de colágeno desmineralizada, dificultando a infiltração adequada dos monômeros adesivos.",
      E: "Aumenta obrigatoriamente a resistência de união em qualquer sistema adesivo."
    }
  },

  // ============================================================
  // Q033
  // ============================================================
  {
    id: "Q033",
    tipo: "objetiva",
    tema: "Lesões cavitadas",
    dificuldade: "muito alta",
    enunciado: "Diante de uma lesão de cárie cavitada, a decisão sobre a necessidade e extensão do tratamento restaurador deve considerar principalmente:",
    alternativas: {
      A: "Somente o tamanho visual da cavidade.",
      B: "Apenas a idade do paciente.",
      C: "Atividade da lesão, controle de biofilme, risco de cárie, localização, acesso à higiene e quantidade de estrutura dental comprometida.",
      D: "A necessidade obrigatória de realizar um preparo clássico de Black.",
      E: "Somente a presença ou ausência de dor."
    }
  },

  // ============================================================
  // Q034
  // ============================================================
  {
    id: "Q034",
    tipo: "discursiva",
    tema: "Lesões cavitadas",
    dificuldade: "muito alta",
    enunciado: "Explique por que a presença de uma lesão cavitada não determina, isoladamente, a necessidade de um preparo cavitário extenso. Quais fatores devem ser avaliados para definir a conduta?"
  },

  // ============================================================
  // Q035
  // ============================================================
  {
    id: "Q035",
    tipo: "objetiva",
    tema: "Isolamento do campo operatório",
    dificuldade: "alta",
    enunciado: "O controle da umidade e da contaminação durante procedimentos restauradores adesivos é importante porque:",
    alternativas: {
      A: "A presença de saliva sempre aumenta a resistência de união dos sistemas adesivos.",
      B: "A contaminação por umidade não interfere em nenhuma etapa da adesão.",
      C: "A contaminação pode comprometer o controle do campo operatório e prejudicar procedimentos nos quais a adesão depende de condições adequadas de superfície.",
      D: "O isolamento é necessário apenas para melhorar a iluminação do campo.",
      E: "O isolamento absoluto serve exclusivamente para impedir que o paciente engula o lençol."
    }
  },

  // ============================================================
  // Q036
  // ============================================================
  {
    id: "Q036",
    tipo: "objetiva",
    tema: "Isolamento absoluto",
    dificuldade: "alta",
    enunciado: "Durante o isolamento absoluto, a pinça porta-grampo é utilizada principalmente para:",
    alternativas: {
      A: "Perfurar o lençol de borracha.",
      B: "Segurar, posicionar e remover o grampo durante sua colocação ou retirada.",
      C: "Cortar a restauração após a fotopolimerização.",
      D: "Realizar a remoção de dentina cariada.",
      E: "Condensar o material restaurador."
    }
  },

  // ============================================================
  // Q037
  // ============================================================
  {
    id: "Q037",
    tipo: "objetiva",
    tema: "Grampos — seleção e função",
    dificuldade: "muito alta",
    enunciado: "Na seleção de grampos para isolamento absoluto, devem ser consideradas características como estabilidade, anatomia coronária e necessidade de retração gengival. Sobre essa seleção, assinale a alternativa correta.",
    alternativas: {
      A: "A escolha do grampo independe completamente da anatomia do dente.",
      B: "Todo grampo pode ser utilizado indistintamente em qualquer dente, desde que o lençol seja perfurado corretamente.",
      C: "A estabilidade do grampo não possui relação com sua adaptação à região cervical.",
      D: "A seleção deve considerar a anatomia e a retenção disponível; determinados grampos apresentam indicações específicas, inclusive para situações que exigem maior retração cervical.",
      E: "O grampo deve ser escolhido apenas pelo número do dente."
    }
  },

  // ============================================================
  // Q038
  // ============================================================
  {
    id: "Q038",
    tipo: "objetiva",
    tema: "Grampo 212",
    dificuldade: "muito alta",
    enunciado: "O grampo 212 é classicamente associado a situações de isolamento absoluto que exigem:",
    alternativas: {
      A: "Retenção exclusiva em molares com grande altura coronária.",
      B: "Adaptação cervical e possibilidade de retração gengival, sendo empregado principalmente em dentes anteriores e pré-molares conforme a situação clínica.",
      C: "Fixação exclusivamente em terceiros molares parcialmente erupcionados.",
      D: "Isolamento sem utilização de lençol de borracha.",
      E: "Substituição da pinça porta-grampo."
    }
  },

  // ============================================================
  // Q039
  // ============================================================
  {
    id: "Q039",
    tipo: "discursiva",
    tema: "Isolamento absoluto modificado",
    dificuldade: "muito alta",
    enunciado: "Explique o que se entende por isolamento absoluto modificado e descreva uma situação clínica em que uma adaptação da técnica convencional possa ser necessária. Quais princípios de controle de umidade e estabilidade devem ser preservados?"
  },

  // ============================================================
  // Q040
  // ============================================================
  {
    id: "Q040",
    tipo: "discursiva",
    tema: "Integração clínica — Dentística",
    dificuldade: "muito alta",
    enunciado: "Descreva, em sequência lógica, uma abordagem clínica para o tratamento restaurador de uma lesão de cárie, desde a avaliação da lesão até o acabamento e polimento da restauração. Relacione diagnóstico e atividade da lesão, preservação de estrutura, preparo, isolamento, sistema adesivo, inserção do material restaurador, fotoativação e acabamento."
  }

];
