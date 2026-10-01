const $ = id => document.getElementById(id);

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const KEY = "ed_dent_prova01";

let S = {
  aluno: null,
  tid: null,
  inicio: 0,
  limite: 0,
  resp: {},
  cur: 0,
  fim: false,
  resultado: null,
  pend: []
};

let timerH = null;
let saiu = false;
let finalizando = false;


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function salvarLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
}


function carregarLocal() {
  try {
    const j = localStorage.getItem(KEY);

    if (j) {
      const salvo = JSON.parse(j);

      S = Object.assign({
        aluno: null,
        tid: null,
        inicio: 0,
        limite: 0,
        resp: {},
        cur: 0,
        fim: false,
        resultado: null,
        pend: []
      }, salvo);
    }

  } catch (e) {}
}


function limparLocal() {

  try {
    localStorage.removeItem(KEY);
  } catch (e) {}

  S = {
    aluno: null,
    tid: null,
    inicio: 0,
    limite: 0,
    resp: {},
    cur: 0,
    fim: false,
    resultado: null,
    pend: []
  };
}


/* =========================================================
   API
   ========================================================= */

async function api(action, data = {}) {

  if (!CONFIG.API_URL) {
    throw new Error("backend_nao_configurado");
  }

  const r = await fetch(
    CONFIG.API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        ...data
      })
    }
  );

  let j;

  try {
    j = await r.json();
  } catch (e) {
    throw new Error("Resposta inválida do servidor.");
  }

  if (j && j.ok === false) {
    throw new Error(
      j.erro ||
      j.mensagem ||
      "erro_api"
    );
  }

  return j;
}


/* =========================================================
   FILA OFFLINE / SINCRONIZAÇÃO
   ========================================================= */

async function enviar(action, data) {

  S.pend.push({
    action,
    data,
    t: Date.now()
  });

  salvarLocal();

  await flush();
}


async function flush() {

  if (!S.pend || !S.pend.length) {
    return;
  }

  const fila = [...S.pend];

  S.pend = [];

  salvarLocal();

  for (const item of fila) {

    try {

      await api(
        item.action,
        item.data
      );

    } catch (e) {

      S.pend.unshift(item);

      salvarLocal();

      break;
    }
  }

  salvarLocal();
}


/* =========================================================
   EVENTOS
   ========================================================= */

function evento(tipo, detalhe = {}) {

  if (!S.tid) {
    return;
  }

  enviar(
    "registrar_evento",
    {
      tentativa_id: S.tid,
      tipo,
      detalhe
    }
  );
}


/* =========================================================
   TELAS
   ========================================================= */

function esconderTodas() {

  const ids = [
    "s-id",
    "s-termos",
    "s-prova",
    "s-res"
  ];

  ids.forEach(id => {

    const el = $(id);

    if (el) {
      el.classList.add("hidden");
    }

  });

  const barra = $("barra");

  if (barra) {
    barra.classList.add("hidden");
  }
}


function mostrarIdentificacao() {

  esconderTodas();

  const tela = $("s-id");

  if (tela) {
    tela.classList.remove("hidden");
  }

  const barra = $("barra");

  if (barra) {
    barra.classList.add("hidden");
  }

  const erroId = $("erroId");

  if (erroId) {
    erroId.textContent = "";
  }

  const erroLogin = $("erroLogin");

  if (erroLogin) {
    erroLogin.textContent = "";
  }

  const loginEmail = $("loginEmail");

  if (loginEmail) {
    loginEmail.value = "";
  }

  const loginMatricula = $("loginMatricula");

  if (loginMatricula) {
    loginMatricula.value = "";
  }

  const nome = $("nome");

  if (nome) {
    nome.value = "";
  }

  const email = $("email");

  if (email) {
    email.value = "";
  }

  const matricula = $("matricula");

  if (matricula) {
    matricula.value = "";
  }

  document.body.classList.remove("noselect");
}


function mostrarTermos() {

  esconderTodas();

  const tela = $("s-termos");

  if (tela) {
    tela.classList.remove("hidden");
  }

  const aceite = $("aceite");

  if (aceite) {
    aceite.checked = false;
  }

  const btn = $("btnIniciar");

  if (btn) {
    btn.disabled = true;
  }

  const erro = $("erroTermos");

  if (erro) {
    erro.textContent = "";
  }
}


/* =========================================================
   IDENTIFICAÇÃO — NOVA TENTATIVA
   ========================================================= */

async function continuarIdentificacao() {

  const nome =
    ($("nome")?.value || "").trim();

  const email =
    ($("email")?.value || "")
      .trim()
      .toLowerCase();

  const matricula =
    ($("matricula")?.value || "").trim();

  const erro =
    $("erroId");

  if (erro) {
    erro.textContent = "";
  }

  if (!nome) {

    if (erro) {
      erro.textContent =
        "Informe seu nome completo.";
    }

    return;
  }

  if (!email || !email.includes("@")) {

    if (erro) {
      erro.textContent =
        "Informe um e-mail válido.";
    }

    return;
  }

  if (!matricula) {

    if (erro) {
      erro.textContent =
        "Informe sua matrícula.";
    }

    return;
  }

  const botao =
    $("btnContinuar");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "VERIFICANDO...";
  }

  try {

    const r =
      await api(
        "verificar_prova",
        {
          codigo_prova:
            CONFIG.CODIGO_PROVA
        }
      );

    if (
      !r ||
      r.ok === false ||
      r.ativa === false
    ) {

      throw new Error(
        r?.mensagem ||
        "Esta prova não está disponível."
      );
    }

    limparLocal();

    S.aluno = {
      nome,
      email,
      matricula
    };

    salvarLocal();

    mostrarTermos();

  } catch (e) {

    if (erro) {
      erro.textContent =
        mensagemErro(e);
    }

  } finally {

    if (botao) {
      botao.disabled = false;
      botao.textContent = "CONTINUAR";
    }
  }
}


/* =========================================================
   LOGIN / RECUPERAÇÃO
   ========================================================= */

async function entrarAluno() {

  const email =
    ($("loginEmail")?.value || "")
      .trim()
      .toLowerCase();

  const matricula =
    ($("loginMatricula")?.value || "").trim();

  const erro =
    $("erroLogin");

  if (erro) {
    erro.textContent = "";
  }

  if (!email || !email.includes("@")) {

    if (erro) {
      erro.textContent =
        "Informe um e-mail válido.";
    }

    return;
  }

  if (!matricula) {

    if (erro) {
      erro.textContent =
        "Informe sua matrícula.";
    }

    return;
  }

  const botao =
    $("btnEntrar");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "RECUPERANDO...";
  }

  try {

    const r =
      await api(
        "entrar_aluno",
        {
          codigo_prova:
            CONFIG.CODIGO_PROVA,
          email,
          matricula
        }
      );

    if (!r || !r.tipo) {

      throw new Error(
        r?.mensagem ||
        "Não foi possível recuperar a tentativa."
      );
    }


    /* =====================================================
       TENTATIVA EM ANDAMENTO
       ===================================================== */

    if (r.tipo === "retomar") {

      limparLocal();

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid =
        r.tentativa_id;

      S.inicio =
        Number(
          r.inicio_ts ||
          Date.now()
        );

      S.limite =
        Number(
          r.tempo_limite ||
          7200
        );

      S.resp =
        r.respostas || {};

      S.cur =
        Number(
          r.primeira_questao || 0
        );

      S.fim = false;
      S.resultado = null;
      S.pend = [];

      salvarLocal();

      iniciarProva();

      await flush();

      return;
    }


    /* =====================================================
       TEMPO ESGOTADO
       ===================================================== */

    if (r.tipo === "tempo_esgotado") {

      limparLocal();

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid =
        r.tentativa_id;

      S.inicio =
        Number(
          r.inicio_ts ||
          Date.now()
        );

      S.limite =
        Number(
          r.tempo_limite ||
          7200
        );

      S.resp =
        r.respostas || {};

      S.cur =
        Number(
          r.primeira_questao || 0
        );

      S.fim = false;
      S.resultado = null;
      S.pend = [];

      salvarLocal();

      iniciarProva();

      setTimeout(
        () => {

          if (
            !S.fim &&
            S.tid
          ) {
            finalizar(true);
          }

        },
        100
      );

      return;
    }


    /* =====================================================
       RESULTADO FINALIZADO
       ===================================================== */

    if (r.tipo === "resultado") {

      limparLocal();

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid =
        r.tentativa_id;

      S.inicio =
        Number(
          r.inicio_ts || 0
        );

      S.limite =
        Number(
          r.tempo_limite ||
          7200
        );

      S.resp =
        r.respostas || {};

      S.cur = 0;

      S.fim = true;

      S.resultado =
        r.resultado || null;

      S.pend = [];

      salvarLocal();

      mostrarResultado();

      return;
    }


    throw new Error(
      r.mensagem ||
      "Tentativa não encontrada."
    );

  } catch (e) {

    if (erro) {
      erro.textContent =
        mensagemErro(e);
    }

  } finally {

    if (botao) {
      botao.disabled = false;
      botao.textContent =
        "ENTRAR E RECUPERAR";
    }
  }
}


/* =========================================================
   TERMOS
   ========================================================= */

async function iniciarNovaTentativa() {

  const erro =
    $("erroTermos");

  if (erro) {
    erro.textContent = "";
  }

  const aceite =
    $("aceite")?.checked;

  if (!aceite) {

    if (erro) {
      erro.textContent =
        "Você precisa aceitar os termos para iniciar.";
    }

    return;
  }

  if (!S.aluno) {

    if (erro) {
      erro.textContent =
        "Identificação não encontrada.";
    }

    return;
  }

  const botao =
    $("btnIniciar");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "INICIANDO...";
  }

  try {

    const r =
      await api(
        "iniciar_tentativa",
        {
          codigo_prova:
            CONFIG.CODIGO_PROVA,

          nome:
            S.aluno.nome,

          email:
            S.aluno.email,

          matricula:
            S.aluno.matricula,

          aceite_termos: true,

          versao_termos:
            CONFIG.VERSAO_TERMOS
        }
      );

    if (
      !r ||
      !r.tentativa_id
    ) {

      throw new Error(
        r?.mensagem ||
        "Não foi possível iniciar a tentativa."
      );
    }

    S.tid =
      r.tentativa_id;

    S.inicio =
      Number(
        r.inicio_ts ||
        Date.now()
      );

    S.limite =
      Number(
        r.tempo_limite ||
        7200
      );

    S.resp =
      r.respostas || {};

    S.cur =
      Number(
        r.primeira_questao || 0
      );

    S.fim = false;
    S.resultado = null;
    S.pend = [];

    salvarLocal();

    iniciarProva();

  } catch (e) {

    if (erro) {
      erro.textContent =
        mensagemErro(e);
    }

  } finally {

    if (botao) {
      botao.disabled = false;
      botao.textContent =
        "ACEITAR E INICIAR PROVA";
    }
  }
}


/* =========================================================
   INÍCIO DA PROVA
   ========================================================= */

function iniciarProva() {

  esconderTodas();

  $("s-prova")?.classList.remove("hidden");
  $("barra")?.classList.remove("hidden");

  saiu = false;
  finalizando = false;

  document.body.classList.add("noselect");

  render();

  tick();

  if (timerH) {
    clearInterval(timerH);
  }

  timerH =
    setInterval(
      tick,
      1000
    );

  flush();
}


/* =========================================================
   TIMER
   ========================================================= */

function tick() {

  if (
    !S.tid ||
    S.fim ||
    finalizando
  ) {
    return;
  }

  const agora =
    Date.now();

  const inicio =
    Number(
      S.inicio ||
      agora
    );

  const limite =
    Number(
      S.limite ||
      7200
    ) * 1000;

  const decorrido =
    agora - inicio;

  const restante =
    Math.max(
      0,
      limite - decorrido
    );

  const timer =
    $("timer");

  if (timer) {

    timer.textContent =
      "⏱ " +
      formatarTempo(restante);
  }

  if (restante <= 0) {

    if (timerH) {
      clearInterval(timerH);
      timerH = null;
    }

    finalizar(true);
  }
}


function formatarTempo(ms) {

  const total =
    Math.max(
      0,
      Math.floor(
        ms / 1000
      )
    );

  const h =
    Math.floor(
      total / 3600
    );

  const m =
    Math.floor(
      (total % 3600) / 60
    );

  const s =
    total % 60;

  if (h > 0) {

    return [
      String(h).padStart(2, "0"),
      String(m).padStart(2, "0"),
      String(s).padStart(2, "0")
    ].join(":");
  }

  return [
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0")
  ].join(":");
}


/* =========================================================
   RENDERIZAÇÃO DA PROVA
   ========================================================= */

function render() {

  if (!QUESTOES.length) {

    $("qEnun").textContent =
      "Nenhuma questão cadastrada.";

    return;
  }

  if (
    S.cur < 0 ||
    S.cur >= QUESTOES.length
  ) {
    S.cur = 0;
  }

  const q =
    QUESTOES[S.cur];

  $("qInfo").textContent =
    `Questão ${S.cur + 1} de ${QUESTOES.length}`;

  $("qMeta").textContent =
    `${q.id} • ${q.tipo} • ${q.tema || "Geral"}${
      q.dificuldade
        ? " • " + q.dificuldade
        : ""
    }`;

  $("qEnun").textContent =
    q.enunciado || "";

  const resposta =
    S.resp[q.id] ?? "";

  const box =
    $("qResp");

  box.innerHTML = "";


  /* =====================================================
     OBJETIVA
     ===================================================== */

  if (q.tipo === "objetiva") {

    const alternativas =
      q.alternativas || {};

    Object.keys(alternativas)
      .forEach(letra => {

        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "alt" +
          (
            resposta === letra
              ? " sel"
              : ""
          );

        button.innerHTML =
          `<b>${esc(letra)}</b><span>${esc(alternativas[letra])}</span>`;

        button.addEventListener(
          "click",
          () => {

            if (!S.fim) {
              responder(
                q.id,
                letra
              );
            }

          }
        );

        box.appendChild(button);
      });

  }


  /* =====================================================
     DISCURSIVA
     ===================================================== */

  else {

    const textarea =
      document.createElement("textarea");

    textarea.value =
      resposta || "";

    textarea.placeholder =
      "Digite sua resposta...";

    textarea.addEventListener(
      "input",
      () => {

        if (S.fim) {
          return;
        }

        S.resp[q.id] =
          textarea.value;

        salvarLocal();
      }
    );

    textarea.addEventListener(
      "blur",
      () => {

        if (S.fim) {
          return;
        }

        const valor =
          textarea.value;

        S.resp[q.id] =
          valor;

        salvarLocal();

        if (S.tid) {

          enviar(
            "salvar_resposta",
            {
              tentativa_id:
                S.tid,

              questao_id:
                q.id,

              resposta:
                valor
            }
          );
        }
      }
    );

    box.appendChild(textarea);
  }

  atualizarPainel();

  salvarLocal();
}


/* =========================================================
   RESPOSTA
   ========================================================= */

function responder(id, valor) {

  if (
    S.fim ||
    !S.tid
  ) {
    return;
  }

  S.resp[id] =
    valor;

  salvarLocal();

  enviar(
    "salvar_resposta",
    {
      tentativa_id:
        S.tid,

      questao_id:
        id,

      resposta:
        valor
    }
  );

  render();
}


/* =========================================================
   PAINEL DE QUESTÕES
   ========================================================= */

function atualizarPainel() {

  const painel =
    $("painel");

  if (!painel) {
    return;
  }

  painel.innerHTML = "";

  QUESTOES.forEach(
    (q, i) => {

      const b =
        document.createElement("button");

      b.type = "button";

      b.textContent =
        i + 1;

      const respondida =
        S.resp[q.id] !== undefined &&
        String(
          S.resp[q.id]
        ).trim() !== "";

      if (respondida) {
        b.classList.add("done");
      }

      if (i === S.cur) {
        b.classList.add("cur");
      }

      b.addEventListener(
        "click",
        () => {

          if (finalizando) {
            return;
          }

          S.cur = i;

          render();
        }
      );

      painel.appendChild(b);
    }
  );

  const respondidas =
    QUESTOES.filter(
      q =>
        S.resp[q.id] !== undefined &&
        String(
          S.resp[q.id]
        ).trim() !== ""
    ).length;

  const barra =
    $("progBar");

  if (barra) {

    barra.style.width =
      `${
        (
          respondidas /
          Math.max(
            1,
            QUESTOES.length
          )
        ) * 100
      }%`;
  }
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function anterior() {

  if (S.cur > 0) {

    S.cur--;

    render();
  }
}


function proxima() {

  if (
    finalizando ||
    S.fim
  ) {
    return;
  }

  if (
    S.cur <
    QUESTOES.length - 1
  ) {

    S.cur++;

    render();

  } else {

    confirmarFinalizacao();
  }
}


/* =========================================================
   FINALIZAÇÃO
   ========================================================= */

function confirmarFinalizacao() {

  if (
    finalizando ||
    S.fim
  ) {
    return;
  }

  const faltando =
    QUESTOES.filter(
      q =>
        S.resp[q.id] === undefined ||
        String(
          S.resp[q.id]
        ).trim() === ""
    ).length;

  if (faltando > 0) {

    abrirModal(`

      <h2>Atenção</h2>

      <p>
        Você ainda possui
        <b>${faltando}</b>
        questão(ões) sem resposta.
      </p>

      <p>
        Deseja finalizar mesmo assim?
      </p>

      <div class="nav">

        <button
          class="btn sec"
          onclick="fecharModal()">
          VOLTAR
        </button>

        <button
          class="btn"
          onclick="fecharModal();finalizar(false)">
          FINALIZAR PROVA
        </button>

      </div>

    `);

    return;
  }

  abrirModal(`

    <h2>Finalizar prova?</h2>

    <p>
      Depois de finalizada, a tentativa não poderá
      ser respondida novamente.
    </p>

    <div class="nav">

      <button
        class="btn sec"
        onclick="fecharModal()">
        CONTINUAR
      </button>

      <button
        class="btn"
        onclick="fecharModal();finalizar(false)">
        FINALIZAR
      </button>

    </div>

  `);
}


async function finalizar(
  automatico = false
) {

  if (
    S.fim ||
    !S.tid ||
    finalizando
  ) {
    return;
  }

  finalizando = true;

  if (timerH) {

    clearInterval(timerH);

    timerH = null;
  }

  const btnProx =
    $("btnProx");

  const btnAnt =
    $("btnAnt");

  if (btnProx) {
    btnProx.disabled = true;
  }

  if (btnAnt) {
    btnAnt.disabled = true;
  }

  try {

    await flush();

    const r =
      await api(
        "finalizar_tentativa",
        {
          tentativa_id:
            S.tid,

          respostas:
            S.resp,

          fim_automatico:
            !!automatico,

          tempo_cliente:
            Math.floor(
              (
                Date.now() -
                Number(
                  S.inicio ||
                  Date.now()
                )
              ) / 1000
            )
        }
      );

    if (
      !r ||
      !r.resultado
    ) {

      throw new Error(
        r?.mensagem ||
        "Não foi possível finalizar a tentativa."
      );
    }

    S.fim = true;

    S.resultado =
      r.resultado;

    if (r.respostas) {
      S.resp =
        r.respostas;
    }

    salvarLocal();

    mostrarResultado();

  } catch (e) {

    finalizando = false;

    if (btnProx) {
      btnProx.disabled = false;
    }

    if (btnAnt) {
      btnAnt.disabled = false;
    }

    abrirModal(`

      <h2>Não foi possível finalizar</h2>

      <p>
        ${esc(mensagemErro(e))}
      </p>

      <p>
        Suas respostas continuam salvas localmente.
        Verifique sua conexão e tente novamente.
      </p>

      <button
        class="btn"
        onclick="fecharModal()">
        FECHAR
      </button>

    `);
  }
}


/* =========================================================
   UTILITÁRIOS DO RESULTADO
   ========================================================= */

function obterAlternativaTexto(q, valor) {

  if (!q || !valor) {
    return valor || "";
  }

  if (
    q.alternativas &&
    Object.prototype.hasOwnProperty.call(
      q.alternativas,
      valor
    )
  ) {
    return q.alternativas[valor];
  }

  return valor;
}


function obterRespostaCorretaTexto(q, valor) {

  if (!q || !valor) {
    return valor || "";
  }

  return obterAlternativaTexto(
    q,
    valor
  );
}


function classeResultadoItem(item) {

  if (item.correta === true) {
    return "correct";
  }

  if (item.correta === false) {
    return "wrong";
  }

  if (item.correta === "manual") {
    return "manual";
  }

  return "neutral";
}


/* =========================================================
   GRÁFICO CIRCULAR
   ========================================================= */

function graficoCircular(percentual) {

  const p =
    Math.max(
      0,
      Math.min(
        100,
        Number(percentual || 0)
      )
    );

  const raio = 74;
  const circ =
    2 * Math.PI * raio;

  const offset =
    circ -
    (p / 100) * circ;

  return `

    <div class="score-chart">

      <svg
        viewBox="0 0 180 180"
        class="score-svg"
        aria-label="Desempenho de ${p.toFixed(0)} por cento">

        <circle
          cx="90"
          cy="90"
          r="${raio}"
          class="score-track">
        </circle>

        <circle
          cx="90"
          cy="90"
          r="${raio}"
          class="score-progress"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${offset}">
        </circle>

      </svg>

      <div class="score-center">

        <strong>
          ${p.toFixed(0)}%
        </strong>

        <span>
          desempenho
        </span>

      </div>

    </div>
  `;
}


/* =========================================================
   GRÁFICO DE BARRAS POR TEMA
   ========================================================= */

function graficoTemas(temas) {

  if (
    !Array.isArray(temas) ||
    !temas.length
  ) {
    return `
      <div class="empty-chart">
        Ainda não há dados suficientes
        para montar o gráfico por tema.
      </div>
    `;
  }

  return `

    <div class="tema-chart">

      ${temas.map(t => {

        const percentual =
          Math.max(
            0,
            Math.min(
              100,
              Number(
                t.percentual || 0
              )
            )
          );

        const nome =
          t.tema ||
          "Geral";

        const acertos =
          Number(
            t.acertos || 0
          );

        const total =
          Number(
            t.total || 0
          );

        return `

          <div class="tema-row">

            <div class="tema-row-head">

              <span>
                ${esc(nome)}
              </span>

              <strong>
                ${acertos}/${total}
                · ${percentual.toFixed(0)}%
              </strong>

            </div>

            <div class="tema-track">

              <div
                class="tema-fill"
                style="width:${percentual}%">
              </div>

            </div>

          </div>
        `;

      }).join("")}

    </div>
  `;
}


/* =========================================================
   CARDS DE RESULTADO
   ========================================================= */

function cardResultado(
  titulo,
  valor,
  classe = ""
) {

  return `

    <div class="result-stat ${classe}">

      <span class="result-stat-label">
        ${esc(titulo)}
      </span>

      <strong class="result-stat-value">
        ${esc(valor)}
      </strong>

    </div>
  `;
}


/* =========================================================
   RESULTADO
   ========================================================= */

function mostrarResultado() {

  esconderTodas();

  document.body.classList.remove("noselect");

  if (timerH) {

    clearInterval(timerH);

    timerH = null;
  }

  const tela =
    $("s-res");

  if (!tela) {
    return;
  }

  tela.classList.remove("hidden");

  const r =
    S.resultado || {};

  const percentual =
    Number(
      r.percentual || 0
    );

  const acertos =
    Number(
      r.acertos || 0
    );

  const erros =
    Number(
      r.erros || 0
    );

  const total =
    Number(
      r.total ||
      QUESTOES.length ||
      0
    );

  const respondidas =
    Number(
      r.respondidas ??
      Object.values(
        S.resp || {}
      ).filter(
        v =>
          String(v).trim() !== ""
      ).length
    );

  const discursivas =
    QUESTOES.filter(
      q =>
        q.tipo === "discursiva"
    ).length;

  const objetivas =
    QUESTOES.filter(
      q =>
        q.tipo === "objetiva"
    ).length;

  const tempo =
    r.tempo_gasto != null
      ? formatarSegundos(
          Number(
            r.tempo_gasto
          )
        )
      : calcularTempoGasto();

  const mensagem =
    msgDesempenho(
      percentual
    );

  const revisao =
    Array.isArray(r.revisao)
      ? r.revisao
      : [];

  const temas =
    Array.isArray(r.temas)
      ? r.temas
      : [];


  /* =====================================================
     CABEÇALHO / HERO
     ===================================================== */

  let html = `

    <div class="result-hero">

      <div class="result-hero-content">

        <div class="result-kicker">
          RESULTADO DA AVALIAÇÃO
        </div>

        <h1>
          ${esc(CONFIG.TITULO)}
        </h1>

        <p class="result-subtitle">
          ${esc(CONFIG.SUBTITULO)}
        </p>

        <div class="result-student">
          <span>Aluno</span>
          <strong>
            ${esc(
              S.aluno?.nome || ""
            )}
          </strong>
        </div>

      </div>

      ${graficoCircular(percentual)}

    </div>


    <div class="result-message">

      <span class="result-message-icon">
        ✦
      </span>

      <div>

        <strong>
          Análise do seu desempenho
        </strong>

        <p>
          ${esc(mensagem)}
        </p>

      </div>

    </div>


    <div class="result-section-title">

      <span>
        VISÃO GERAL
      </span>

      <h2>
        Seu desempenho
      </h2>

    </div>


    <div class="result-grid">

      ${cardResultado(
        "Acertos",
        acertos,
        "stat-success"
      )}

      ${cardResultado(
        "Erros",
        erros,
        "stat-danger"
      )}

      ${cardResultado(
        "Respondidas",
        respondidas,
        "stat-info"
      )}

      ${cardResultado(
        "Total",
        total,
        "stat-neutral"
      )}

      ${cardResultado(
        "Objetivas",
        objetivas,
        "stat-neutral"
      )}

      ${cardResultado(
        "Discursivas",
        discursivas,
        "stat-neutral"
      )}

      ${cardResultado(
        "Tempo",
        tempo,
        "stat-neutral"
      )}

    </div>
  `;


  /* =====================================================
     GRÁFICO POR TEMA
     ===================================================== */

  if (temas.length) {

    html += `

      <div class="result-panel">

        <div class="panel-heading">

          <div>

            <span class="panel-kicker">
              ANÁLISE
            </span>

            <h2>
              Desempenho por tema
            </h2>

          </div>

          <span class="panel-badge">
            ${temas.length}
            ${
              temas.length === 1
                ? "tema"
                : "temas"
            }
          </span>

        </div>

        ${graficoTemas(temas)}

      </div>
    `;
  }


  /* =====================================================
     REVISÃO
     ===================================================== */

  if (revisao.length) {

    html += `

      <div class="result-panel review-panel">

        <div class="panel-heading">

          <div>

            <span class="panel-kicker">
              REVISÃO
            </span>

            <h2>
              Questões e respostas
            </h2>

          </div>

          <span class="panel-badge">
            ${revisao.length}
            ${
              revisao.length === 1
                ? "questão"
                : "questões"
            }
          </span>

        </div>

    `;

    revisao.forEach(
      (item, index) => {

        const q =
          QUESTOES.find(
            x =>
              x.id ===
              item.questao_id
          );

        const tipo =
          q?.tipo || "";

        const respostaAluno =
          item.resposta_aluno ??
          S.resp[
            item.questao_id
          ] ??
          "";

        const respostaAlunoTexto =
          tipo === "objetiva"
            ? obterAlternativaTexto(
                q,
                respostaAluno
              )
            : respostaAluno;

        const correta =
          item.correta;

        const classe =
          classeResultadoItem(
            item
          );

        let respostaCorreta =
          item.resposta_correta || "";

        if (tipo === "objetiva") {

          respostaCorreta =
            obterRespostaCorretaTexto(
              q,
              respostaCorreta
            );
        }

        let statusTexto =
          "Avaliação";

        if (correta === true) {
          statusTexto = "Resposta correta";
        }

        if (correta === false) {
          statusTexto = "Resposta incorreta";
        }

        if (correta === "manual") {
          statusTexto = "Correção manual";
        }

        html += `

          <article
            class="review-item ${classe}">

            <div class="review-head">

              <div class="review-number">
                ${String(
                  index + 1
                ).padStart(2, "0")}
              </div>

              <div class="review-title">

                <span>
                  ${esc(
                    q?.tema ||
                    "Questão"
                  )}
                </span>

                <h3>
                  Questão ${index + 1}
                </h3>

              </div>

              <div class="review-status">
                ${esc(statusTexto)}
              </div>

            </div>


            ${
              q
                ? `
                  <div class="review-enunciado">

                    ${esc(
                      q.enunciado ||
                      ""
                    )}

                  </div>
                `
                : ""
            }


            <div class="answer-grid">

              <div class="answer-box student-answer">

                <span class="answer-label">
                  SUA RESPOSTA
                </span>

                <strong>
                  ${
                    respostaAlunoTexto
                      ? esc(
                          respostaAlunoTexto
                        )
                      : "Não respondida"
                  }
                </strong>

                ${
                  tipo === "objetiva" &&
                  respostaAluno
                    ? `
                      <small>
                        Alternativa
                        ${esc(
                          respostaAluno
                        )}
                      </small>
                    `
                    : ""
                }

              </div>


              ${
                tipo === "objetiva"
                  ? `

                    <div class="answer-box correct-answer">

                      <span class="answer-label">
                        RESPOSTA CORRETA
                      </span>

                      <strong>
                        ${
                          respostaCorreta
                            ? esc(
                                respostaCorreta
                              )
                            : "Não informada"
                        }
                      </strong>

                      ${
                        item.resposta_correta
                          ? `
                            <small>
                              Alternativa
                              ${esc(
                                item.resposta_correta
                              )}
                            </small>
                          `
                          : ""
                      }

                    </div>

                  `
                  : `
                    <div class="answer-box manual-answer">

                      <span class="answer-label">
                        CORREÇÃO
                      </span>

                      <strong>
                        Avaliação discursiva
                      </strong>

                      <small>
                        Esta resposta pode exigir
                        correção manual.
                      </small>

                    </div>
                  `
              }

            </div>


            ${
              item.explicacao
                ? `

                  <div class="review-detail">

                    <span>
                      EXPLICAÇÃO
                    </span>

                    <p>
                      ${esc(
                        item.explicacao
                      )}
                    </p>

                  </div>

                `
                : ""
            }


            ${
              item.resposta_modelo
                ? `

                  <div class="review-detail">

                    <span>
                      RESPOSTA-MODELO
                    </span>

                    <p>
                      ${esc(
                        item.resposta_modelo
                      )}
                    </p>

                  </div>

                `
                : ""
            }


            ${
              item.criterios
                ? `

                  <div class="review-detail">

                    <span>
                      CRITÉRIOS
                    </span>

                    <p>
                      ${esc(
                        item.criterios
                      )}
                    </p>

                  </div>

                `
                : ""
            }


            ${
              item.fonte
                ? `

                  <div class="review-source">

                    Fonte:
                    ${esc(
                      item.fonte
                    )}

                  </div>

                `
                : ""
            }

          </article>

        `;
      }
    );

    html += `
      </div>
    `;
  }


  /* =====================================================
     RODAPÉ
     ===================================================== */

  html += `

    <div class="result-footer">

      <div>

        <span>
          ACESSO SEGURO
        </span>

        <strong>
          Seu resultado está salvo
        </strong>

        <p>
          Você poderá consultar novamente
          utilizando seu e-mail e matrícula.
        </p>

      </div>

      <button
        class="btn result-exit"
        type="button"
        onclick="sairSistema()">

        SAIR / TROCAR ALUNO

      </button>

    </div>

  `;

  tela.innerHTML =
    html;
}


/* =========================================================
   MENSAGEM DE DESEMPENHO
   ========================================================= */

function msgDesempenho(p) {

  if (p >= 90) {

    return (
      "Excelente desempenho. " +
      "Continue aprofundando os conteúdos."
    );
  }

  if (p >= 70) {

    return (
      "Bom desempenho. " +
      "Revise os pontos que ficaram abaixo do esperado."
    );
  }

  if (p >= 50) {

    return (
      "Você já possui uma base. " +
      "A revisão dos temas pode fortalecer seu desempenho."
    );
  }

  return (
    "Use esta revisão para identificar " +
    "os conteúdos que precisam de mais estudo."
  );
}


/* =========================================================
   TEMPO
   ========================================================= */

function calcularTempoGasto() {

  if (!S.inicio) {
    return "--";
  }

  const segundos =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          Number(S.inicio)
        ) / 1000
      )
    );

  return formatarSegundos(
    segundos
  );
}


function formatarSegundos(seg) {

  seg =
    Math.max(
      0,
      Number(seg || 0)
    );

  const h =
    Math.floor(
      seg / 3600
    );

  const m =
    Math.floor(
      (seg % 3600) / 60
    );

  const s =
    seg % 60;

  if (h > 0) {

    return (
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }

  return (
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0")
  );
}


/* =========================================================
   MODAL
   ========================================================= */

function abrirModal(html) {

  const box =
    $("modalBox");

  const modal =
    $("modal");

  if (!box || !modal) {
    return;
  }

  box.innerHTML =
    html;

  modal.classList.remove(
    "hidden"
  );
}


function fecharModal() {

  const modal =
    $("modal");

  const box =
    $("modalBox");

  if (modal) {
    modal.classList.add(
      "hidden"
    );
  }

  if (box) {
    box.innerHTML = "";
  }
}


/* =========================================================
   SAIR / TROCAR ALUNO
   ========================================================= */

function sairSistema() {

  if (timerH) {

    clearInterval(timerH);

    timerH = null;
  }

  saiu = true;
  finalizando = false;

  document.body.classList.remove(
    "noselect"
  );

  limparLocal();

  fecharModal();

  mostrarIdentificacao();
}


/* =========================================================
   MENSAGENS DE ERRO
   ========================================================= */

function mensagemErro(e) {

  const msg =
    String(
      e?.message ||
      e ||
      "Erro desconhecido."
    );

  const mapa = {

    "prova_nao_encontrada":
      "A prova não foi encontrada no sistema.",

    "prova_inativa":
      "Esta prova não está disponível no momento.",

    "aluno_nao_encontrado":
      "Não encontramos uma tentativa com esse e-mail e matrícula.",

    "tentativa_nao_encontrada":
      "Não encontramos essa tentativa.",

    "tentativa_finalizada":
      "Esta tentativa já foi finalizada. Use a opção de entrar para consultar o resultado.",

    "email_invalido":
      "Informe um e-mail válido.",

    "matricula_obrigatoria":
      "Informe sua matrícula.",

    "nome_obrigatorio":
      "Informe seu nome completo.",

    "backend_nao_configurado":
      "O backend ainda não está configurado.",

    "tempo_esgotado":
      "O tempo desta tentativa já terminou."
  };

  return mapa[msg] || msg;
}


/* =========================================================
   EVENTOS DE BOTÕES
   ========================================================= */

function configurarEventos() {

  $("btnContinuar")?.addEventListener(
    "click",
    continuarIdentificacao
  );

  $("btnEntrar")?.addEventListener(
    "click",
    entrarAluno
  );

  $("btnIniciar")?.addEventListener(
    "click",
    iniciarNovaTentativa
  );

  $("aceite")?.addEventListener(
    "change",
    () => {

      $("btnIniciar").disabled =
        !$("aceite").checked;
    }
  );

  $("btnAnt")?.addEventListener(
    "click",
    anterior
  );

  $("btnProx")?.addEventListener(
    "click",
    proxima
  );

  $("btnSairProva")?.addEventListener(
    "click",
    () => {

      abrirModal(`

        <h2>Sair da prova?</h2>

        <p>
          Suas respostas já salvas permanecerão
          registradas. Você poderá voltar depois
          usando seu e-mail e matrícula.
        </p>

        <div class="nav">

          <button
            class="btn sec"
            onclick="fecharModal()">

            CONTINUAR

          </button>

          <button
            class="btn"
            onclick="fecharModal();sairSistema()">

            SAIR

          </button>

        </div>

      `);
    }
  );


  /* =====================================================
     TECLAS ENTER
     ===================================================== */

  $("loginMatricula")?.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        e.preventDefault();
        entrarAluno();
      }

    }
  );

  $("loginEmail")?.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        e.preventDefault();
        entrarAluno();
      }

    }
  );

  $("matricula")?.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        e.preventDefault();
        continuarIdentificacao();
      }

    }
  );

  $("email")?.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        e.preventDefault();
        continuarIdentificacao();
      }

    }
  );
}


/* =========================================================
   PROTEÇÃO CONTRA CÓPIA
   ========================================================= */

document.addEventListener(
  "copy",
  e => {

    if (
      document.body.classList.contains(
        "noselect"
      ) &&
      !e.target.matches(
        "textarea,input"
      )
    ) {

      e.preventDefault();

      evento(
        "copy",
        {}
      );
    }
  }
);


document.addEventListener(
  "cut",
  e => {

    if (
      document.body.classList.contains(
        "noselect"
      ) &&
      !e.target.matches(
        "textarea,input"
      )
    ) {

      e.preventDefault();

      evento(
        "cut",
        {}
      );
    }
  }
);


document.addEventListener(
  "paste",
  e => {

    if (
      document.body.classList.contains(
        "noselect"
      ) &&
      !e.target.matches(
        "textarea,input"
      )
    ) {

      e.preventDefault();

      evento(
        "paste",
        {}
      );
    }
  }
);


document.addEventListener(
  "contextmenu",
  e => {

    if (
      document.body.classList.contains(
        "noselect"
      ) &&
      !e.target.matches(
        "textarea,input"
      )
    ) {

      e.preventDefault();

      evento(
        "contextmenu",
        {}
      );
    }
  }
);


document.addEventListener(
  "dragstart",
  e => {

    if (
      document.body.classList.contains(
        "noselect"
      )
    ) {

      e.preventDefault();

      evento(
        "dragstart",
        {}
      );
    }
  }
);


/* =========================================================
   ABA / VISIBILIDADE
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      S.tid &&
      !S.fim
    ) {

      evento(
        "saida_aba",
        {
          motivo:
            "visibilitychange"
        }
      );
    }
  }
);


/* =========================================================
   FECHAMENTO / SAÍDA DA PÁGINA
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (
      S.tid &&
      !S.fim &&
      !saiu
    ) {

      evento(
        "beforeunload",
        {}
      );

      salvarLocal();
    }
  }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function init() {

  if ($("hTitulo")) {

    $("hTitulo").textContent =
      CONFIG.TITULO || "";
  }

  if ($("hSub")) {

    $("hSub").textContent =
      CONFIG.SUBTITULO
        ? " — " +
          CONFIG.SUBTITULO
        : "";
  }

  carregarLocal();


  /* =====================================================
     TENTATIVA EM ANDAMENTO
     ===================================================== */

  if (
    S.tid &&
    !S.fim
  ) {

    try {

      const r =
        await api(
          "verificar_tentativa",
          {
            tentativa_id:
              S.tid
          }
        );


      if (
        r &&
        r.status === "finalizada"
      ) {

        limparLocal();

        mostrarIdentificacao();

        return;
      }


      if (
        r &&
        r.status === "em_andamento"
      ) {

        if (r.respostas) {

          S.resp =
            r.respostas;
        }

        if (r.inicio_ts) {

          S.inicio =
            Number(
              r.inicio_ts
            );
        }

        if (r.tempo_limite) {

          S.limite =
            Number(
              r.tempo_limite
            );
        }

        S.fim = false;

        salvarLocal();

        iniciarProva();

        return;
      }


      limparLocal();

      mostrarIdentificacao();

      return;

    } catch (e) {

      iniciarProva();

      return;
    }
  }


  /* =====================================================
     RESULTADO FINALIZADO
     ===================================================== */

  if (
    S.tid &&
    S.fim
  ) {

    limparLocal();
  }

  mostrarIdentificacao();
}


/* =========================================================
   INICIAR APLICAÇÃO
   ========================================================= */

configurarEventos();

init();
