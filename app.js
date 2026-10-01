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
      S = Object.assign(S, JSON.parse(j));
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

  const r = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(
      Object.assign(
        {
          action
        },
        data
      )
    )
  });

  const j = await r.json();

  if (j && j.ok === false) {
    throw new Error(j.erro || j.mensagem || "erro_api");
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

  flush();
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

      await api(item.action, item.data);

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

  $("s-id").classList.add("hidden");
  $("s-termos").classList.add("hidden");
  $("s-prova").classList.add("hidden");
  $("s-res").classList.add("hidden");

  $("barra").classList.add("hidden");
}


function mostrarIdentificacao() {

  esconderTodas();

  $("s-id").classList.remove("hidden");

  $("barra").classList.add("hidden");

  $("erroId").textContent = "";
  $("erroLogin").textContent = "";

  $("loginEmail").value = "";
  $("loginMatricula").value = "";

  $("nome").value = "";
  $("email").value = "";
  $("matricula").value = "";
}


function mostrarTermos() {

  esconderTodas();

  $("s-termos").classList.remove("hidden");

  $("aceite").checked = false;
  $("btnIniciar").disabled = true;

  $("erroTermos").textContent = "";
}


/* =========================================================
   IDENTIFICAÇÃO — NOVA TENTATIVA
   ========================================================= */

async function continuarIdentificacao() {

  const nome = $("nome").value.trim();
  const email = $("email").value.trim().toLowerCase();
  const matricula = $("matricula").value.trim();

  $("erroId").textContent = "";

  if (!nome) {
    $("erroId").textContent = "Informe seu nome completo.";
    return;
  }

  if (!email || !email.includes("@")) {
    $("erroId").textContent = "Informe um e-mail válido.";
    return;
  }

  if (!matricula) {
    $("erroId").textContent = "Informe sua matrícula.";
    return;
  }

  $("btnContinuar").disabled = true;
  $("btnContinuar").textContent = "VERIFICANDO...";

  try {

    const r = await api(
      "verificar_prova",
      {
        codigo_prova: CONFIG.CODIGO_PROVA
      }
    );

    if (!r.ok && r.ativa === false) {
      throw new Error(
        r.mensagem || "Esta prova não está disponível."
      );
    }

    S.aluno = {
      nome,
      email,
      matricula
    };

    salvarLocal();

    mostrarTermos();

  } catch (e) {

    $("erroId").textContent =
      mensagemErro(e);

  } finally {

    $("btnContinuar").disabled = false;
    $("btnContinuar").textContent = "CONTINUAR";
  }
}


/* =========================================================
   LOGIN / RECUPERAÇÃO
   ========================================================= */

async function entrarAluno() {

  const email = $("loginEmail").value.trim().toLowerCase();
  const matricula = $("loginMatricula").value.trim();

  $("erroLogin").textContent = "";

  if (!email || !email.includes("@")) {
    $("erroLogin").textContent =
      "Informe um e-mail válido.";

    return;
  }

  if (!matricula) {
    $("erroLogin").textContent =
      "Informe sua matrícula.";

    return;
  }

  $("btnEntrar").disabled = true;
  $("btnEntrar").textContent = "RECUPERANDO...";

  try {

    const r = await api(
      "entrar_aluno",
      {
        codigo_prova: CONFIG.CODIGO_PROVA,
        email,
        matricula
      }
    );

    if (!r || !r.tipo) {
      throw new Error(
        r?.mensagem || "Não foi possível recuperar a tentativa."
      );
    }


    /* -----------------------------------------
       TENTATIVA EM ANDAMENTO
       ----------------------------------------- */

    if (r.tipo === "retomar") {

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid = r.tentativa_id;
      S.inicio = Number(r.inicio_ts || Date.now());
      S.limite = Number(r.tempo_limite || 7200);
      S.resp = r.respostas || {};
      S.cur = Number(r.primeira_questao || 0);
      S.fim = false;
      S.resultado = null;
      S.pend = [];

      salvarLocal();

      iniciarProva();

      flush();

      return;
    }


    /* -----------------------------------------
       TEMPO ESGOTADO
       ----------------------------------------- */

    if (r.tipo === "tempo_esgotado") {

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid = r.tentativa_id;
      S.inicio = Number(r.inicio_ts || Date.now());
      S.limite = Number(r.tempo_limite || 7200);
      S.resp = r.respostas || {};
      S.cur = Number(r.primeira_questao || 0);
      S.fim = false;
      S.resultado = null;
      S.pend = [];

      salvarLocal();

      iniciarProva();

      setTimeout(() => {
        if (!S.fim && S.tid) {
          finalizar(true);
        }
      }, 100);

      return;
    }


    /* -----------------------------------------
       RESULTADO FINALIZADO
       ----------------------------------------- */

    if (r.tipo === "resultado") {

      S.aluno = {
        nome: r.nome,
        email: r.email,
        matricula: r.matricula
      };

      S.tid = r.tentativa_id;
      S.inicio = Number(r.inicio_ts || 0);
      S.limite = Number(r.tempo_limite || 7200);
      S.resp = r.respostas || {};
      S.cur = 0;
      S.fim = true;
      S.resultado = r.resultado || null;
      S.pend = [];

      salvarLocal();

      mostrarResultado();

      return;
    }


    throw new Error(
      r.mensagem || "Tentativa não encontrada."
    );

  } catch (e) {

    $("erroLogin").textContent =
      mensagemErro(e);

  } finally {

    $("btnEntrar").disabled = false;
    $("btnEntrar").textContent = "ENTRAR E RECUPERAR";
  }
}


/* =========================================================
   TERMOS
   ========================================================= */

async function iniciarNovaTentativa() {

  $("erroTermos").textContent = "";

  if (!$("aceite").checked) {

    $("erroTermos").textContent =
      "Você precisa aceitar os termos para iniciar.";

    return;
  }

  if (!S.aluno) {

    $("erroTermos").textContent =
      "Identificação não encontrada.";

    return;
  }

  $("btnIniciar").disabled = true;
  $("btnIniciar").textContent = "INICIANDO...";

  try {

    const r = await api(
      "iniciar_tentativa",
      {
        codigo_prova: CONFIG.CODIGO_PROVA,
        nome: S.aluno.nome,
        email: S.aluno.email,
        matricula: S.aluno.matricula,
        aceite: true,
        versao_termos: CONFIG.VERSAO_TERMOS
      }
    );

    if (!r || !r.tentativa_id) {
      throw new Error(
        r?.mensagem || "Não foi possível iniciar a tentativa."
      );
    }

    S.tid = r.tentativa_id;
    S.inicio = Number(r.inicio_ts || Date.now());
    S.limite = Number(r.tempo_limite || 7200);
    S.resp = r.respostas || {};
    S.cur = Number(r.primeira_questao || 0);
    S.fim = false;
    S.resultado = null;
    S.pend = [];

    salvarLocal();

    iniciarProva();

  } catch (e) {

    $("erroTermos").textContent =
      mensagemErro(e);

  } finally {

    $("btnIniciar").disabled = false;
    $("btnIniciar").textContent =
      "ACEITAR E INICIAR PROVA";
  }
}


/* =========================================================
   INÍCIO DA PROVA
   ========================================================= */

function iniciarProva() {

  esconderTodas();

  $("s-prova").classList.remove("hidden");
  $("barra").classList.remove("hidden");

  saiu = false;

  document.body.classList.add("noselect");

  render();

  tick();

  if (timerH) {
    clearInterval(timerH);
  }

  timerH = setInterval(
    tick,
    1000
  );

  flush();
}


/* =========================================================
   TIMER
   ========================================================= */

function tick() {

  if (!S.tid || S.fim) {
    return;
  }

  const agora = Date.now();

  const inicio =
    Number(S.inicio || agora);

  const limite =
    Number(S.limite || 7200) * 1000;

  const decorrido =
    agora - inicio;

  const restante =
    Math.max(
      0,
      limite - decorrido
    );

  $("timer").textContent =
    "⏱ " + formatarTempo(restante);

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
      Math.floor(ms / 1000)
    );

  const h =
    Math.floor(total / 3600);

  const m =
    Math.floor((total % 3600) / 60);

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

  const q = QUESTOES[S.cur];

  $("qInfo").textContent =
    `Questão ${S.cur + 1} de ${QUESTOES.length}`;

  $("qMeta").textContent =
    `${q.id} • ${q.tipo} • ${q.tema || "Geral"}${q.dificuldade ? " • " + q.dificuldade : ""}`;

  $("qEnun").textContent =
    q.enunciado || "";

  const resposta =
    S.resp[q.id] ?? "";

  const box =
    $("qResp");

  box.innerHTML = "";


  /* -----------------------------------------
     OBJETIVA
     ----------------------------------------- */

  if (q.tipo === "objetiva") {

    const alternativas =
      q.alternativas || {};

    Object.keys(alternativas).forEach(letra => {

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
        () => responder(q.id, letra)
      );

      box.appendChild(button);
    });

  }


  /* -----------------------------------------
     DISCURSIVA
     ----------------------------------------- */

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

        const valor =
          textarea.value;

        S.resp[q.id] =
          valor;

        salvarLocal();

      }
    );

    textarea.addEventListener(
      "blur",
      () => {

        const valor =
          textarea.value;

        S.resp[q.id] =
          valor;

        salvarLocal();

        if (S.tid) {

          enviar(
            "salvar_resposta",
            {
              tentativa_id: S.tid,
              questao_id: q.id,
              resposta: valor
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

  if (S.fim) {
    return;
  }

  S.resp[id] =
    valor;

  salvarLocal();

  enviar(
    "salvar_resposta",
    {
      tentativa_id: S.tid,
      questao_id: id,
      resposta: valor
    }
  );

  render();

  atualizarPainel();
}


/* =========================================================
   PAINEL DE QUESTÕES
   ========================================================= */

function atualizarPainel() {

  const painel =
    $("painel");

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
        String(S.resp[q.id]).trim() !== "";

      if (respondida) {
        b.classList.add("done");
      }

      if (i === S.cur) {
        b.classList.add("cur");
      }

      b.addEventListener(
        "click",
        () => {

          S.cur = i;

          render();
        }
      );

      painel.appendChild(b);
    }
  );

  const respondidas =
    QUESTOES.filter(q =>
      S.resp[q.id] !== undefined &&
      String(S.resp[q.id]).trim() !== ""
    ).length;

  $("progBar").style.width =
    `${(respondidas / Math.max(1, QUESTOES.length)) * 100}%`;
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

  if (S.cur < QUESTOES.length - 1) {

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

  const faltando =
    QUESTOES.filter(q =>
      S.resp[q.id] === undefined ||
      String(S.resp[q.id]).trim() === ""
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
        <button class="btn sec" onclick="fecharModal()">
          VOLTAR
        </button>

        <button class="btn" onclick="fecharModal();finalizar(false)">
          FINALIZAR PROVA
        </button>
      </div>
    `);

    return;
  }

  abrirModal(`
    <h2>Finalizar prova?</h2>

    <p>
      Depois de finalizada, a tentativa não poderá ser respondida
      novamente.
    </p>

    <div class="nav">
      <button class="btn sec" onclick="fecharModal()">
        CONTINUAR
      </button>

      <button class="btn" onclick="fecharModal();finalizar(false)">
        FINALIZAR
      </button>
    </div>
  `);
}


async function finalizar(automatico = false) {

  if (S.fim || !S.tid) {
    return;
  }

  if (timerH) {
    clearInterval(timerH);
    timerH = null;
  }

  $("btnProx").disabled = true;
  $("btnAnt").disabled = true;

  try {

    await flush();

    const r =
      await api(
        "finalizar_tentativa",
        {
          tentativa_id: S.tid,
          respostas: S.resp,
          fim_automatico: !!automatico,
          tempo_cliente:
            Math.floor(
              (Date.now() - Number(S.inicio || Date.now())) / 1000
            )
        }
      );

    if (!r || !r.resultado) {
      throw new Error(
        r?.mensagem ||
        "Não foi possível finalizar a tentativa."
      );
    }

    S.fim = true;
    S.resultado = r.resultado;

    if (r.respostas) {
      S.resp = r.respostas;
    }

    salvarLocal();

    mostrarResultado();

  } catch (e) {

    $("btnProx").disabled = false;
    $("btnAnt").disabled = false;

    abrirModal(`
      <h2>Não foi possível finalizar</h2>

      <p>
        ${esc(mensagemErro(e))}
      </p>

      <p>
        Suas respostas continuam salvas localmente.
        Verifique sua conexão e tente novamente.
      </p>

      <button class="btn" onclick="fecharModal()">
        FECHAR
      </button>
    `);
  }
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

  $("s-res").classList.remove("hidden");

  const r =
    S.resultado || {};

  const percentual =
    Number(r.percentual || 0);

  const acertos =
    Number(r.acertos || 0);

  const erros =
    Number(r.erros || 0);

  const total =
    Number(r.total || QUESTOES.length || 0);

  const respondidas =
    Number(
      r.respondidas ||
      Object.values(S.resp || {})
        .filter(v => String(v).trim() !== "")
        .length
    );

  const discursivas =
    QUESTOES.filter(
      q => q.tipo === "discursiva"
    ).length;

  const objetivas =
    QUESTOES.filter(
      q => q.tipo === "objetiva"
    ).length;

  const tempo =
    r.tempo_gasto != null
      ? formatarSegundos(Number(r.tempo_gasto))
      : calcularTempoGasto();


  let mensagem =
    msgDesempenho(percentual);


  let html = `

    <div class="card">

      <p style="text-align:center;margin-bottom:4px">
        ESTUDO DIRIGIDO
      </p>

      <h1 style="text-align:center;margin-top:0">
        ${esc(CONFIG.TITULO)}
      </h1>

      <p style="text-align:center">
        ${esc(CONFIG.SUBTITULO)}
      </p>

      <p style="text-align:center">
        Aluno:
        <b>${esc(S.aluno?.nome || "")}</b>
      </p>

      <div class="big">
        ${percentual.toFixed(0)}%
      </div>

      <p style="text-align:center">
        ${esc(mensagem)}
      </p>

    </div>


    <div class="card">

      <h2>Seu desempenho</h2>

      <div style="
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(130px,1fr));
        gap:10px;
      ">

        ${cardResultado(
          "ACERTOS",
          acertos,
          "🟢"
        )}

        ${cardResultado(
          "ERROS",
          erros,
          "🔴"
        )}

        ${cardResultado(
          "RESPONDIDAS",
          respondidas,
          "🟦"
        )}

        ${cardResultado(
          "TOTAL",
          total,
          "📚"
        )}

        ${cardResultado(
          "OBJETIVAS",
          objetivas,
          "🎯"
        )}

        ${cardResultado(
          "DISCURSIVAS",
          discursivas,
          "✍️"
        )}

        ${cardResultado(
          "TEMPO",
          tempo,
          "⏱️"
        )}

      </div>

    </div>
  `;


  /* -----------------------------------------
     TEMAS
     ----------------------------------------- */

  if (
    Array.isArray(r.temas) &&
    r.temas.length
  ) {

    html += `
      <div class="card">
        <h2>Desempenho por tema</h2>
    `;

    r.temas.forEach(t => {

      const p =
        Number(t.percentual || 0);

      html += `
        <div class="tema">

          <span>
            ${esc(t.tema || "Geral")}
          </span>

          <b>
            ${Number(t.acertos || 0)}/
            ${Number(t.total || 0)}
            (${p.toFixed(0)}%)
          </b>

        </div>
      `;
    });

    html += `
      </div>
    `;
  }


  /* -----------------------------------------
     REVISÃO
     ----------------------------------------- */

  if (
    Array.isArray(r.revisao) &&
    r.revisao.length
  ) {

    html += `
      <div class="card">

        <h2>Revisão das questões</h2>
    `;

    r.revisao.forEach((item, index) => {

      const q =
        QUESTOES.find(
          x => x.id === item.questao_id
        );

      const tipo =
        q?.tipo || "";

      const respostaAluno =
        item.resposta_aluno ??
        S.resp[item.questao_id] ??
        "";

      let classe = "rev";

      if (item.correta === true) {
        classe = "rev ok";
      }

      if (item.correta === "manual") {
        classe = "rev";
      }

      html += `
        <div class="card ${classe}">

          <h3>
            Questão ${index + 1}
          </h3>

          ${
            q
              ? `<p><b>${esc(q.enunciado)}</b></p>`
              : ""
          }

          <p>
            <b>Sua resposta:</b>
          </p>

          <div style="
            background:#f3f4f6;
            padding:10px;
            border-radius:8px;
            white-space:pre-wrap;
          ">
            ${esc(
              respostaAluno || "Não respondida"
            )}
          </div>

          ${
            tipo === "objetiva"
              ? `
                <p>
                  <b>Resposta correta:</b>
                  ${esc(item.resposta_correta || "")}
                </p>
              `
              : `
                <p>
                  <b>Correção:</b>
                  resposta discursiva para avaliação.
                </p>
              `
          }

          ${
            item.explicacao
              ? `
                <p>
                  <b>Explicação:</b><br>
                  ${esc(item.explicacao)}
                </p>
              `
              : ""
          }

          ${
            item.resposta_modelo
              ? `
                <p>
                  <b>Resposta-modelo:</b><br>
                  ${esc(item.resposta_modelo)}
                </p>
              `
              : ""
          }

          ${
            item.criterios
              ? `
                <p>
                  <b>Critérios:</b><br>
                  ${esc(item.criterios)}
                </p>
              `
              : ""
          }

          ${
            item.fonte
              ? `
                <p>
                  <small>
                    <b>Fonte:</b>
                    ${esc(item.fonte)}
                  </small>
                </p>
              `
              : ""
          }

        </div>
      `;
    });

    html += `
      </div>
    `;
  }


  /* -----------------------------------------
     SAIR
     ----------------------------------------- */

  html += `

    <div class="card" style="text-align:center">

      <h2>Seu acesso está salvo</h2>

      <p>
        Você pode sair agora. Quando voltar,
        use seu e-mail e matrícula para recuperar
        esta tentativa e consultar suas respostas.
      </p>

      <button
        class="btn"
        type="button"
        onclick="sairSistema()">
        SAIR / TROCAR ALUNO
      </button>

    </div>
  `;


  $("s-res").innerHTML =
    html;
}


/* =========================================================
   CARDS
   ========================================================= */

function cardResultado(titulo, valor, icone) {

  return `
    <div style="
      border:1px solid #e5e7eb;
      border-radius:10px;
      padding:14px;
      text-align:center;
      background:#fafafa;
    ">

      <div style="font-size:1.4rem">
        ${icone}
      </div>

      <div style="
        font-size:.78rem;
        color:#6b7280;
        font-weight:700;
      ">
        ${titulo}
      </div>

      <div style="
        font-size:1.25rem;
        font-weight:800;
        margin-top:3px;
      ">
        ${esc(valor)}
      </div>

    </div>
  `;
}


/* =========================================================
   MENSAGEM DE DESEMPENHO
   ========================================================= */

function msgDesempenho(p) {

  if (p >= 90) {
    return "Excelente desempenho. Continue aprofundando os conteúdos.";
  }

  if (p >= 70) {
    return "Bom desempenho. Revise os pontos que ficaram abaixo do esperado.";
  }

  if (p >= 50) {
    return "Você já possui uma base. A revisão dos temas pode fortalecer seu desempenho.";
  }

  return "Use esta revisão para identificar os conteúdos que precisam de mais estudo.";
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
        (Date.now() - Number(S.inicio)) / 1000
      )
    );

  return formatarSegundos(segundos);
}


function formatarSegundos(seg) {

  seg =
    Math.max(
      0,
      Number(seg || 0)
    );

  const h =
    Math.floor(seg / 3600);

  const m =
    Math.floor((seg % 3600) / 60);

  const s =
    seg % 60;

  if (h > 0) {

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


/* =========================================================
   MODAL
   ========================================================= */

function abrirModal(html) {

  $("modalBox").innerHTML =
    html;

  $("modal").classList.remove("hidden");
}


function fecharModal() {

  $("modal").classList.add("hidden");

  $("modalBox").innerHTML = "";
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

  document.body.classList.remove("noselect");

  limparLocal();

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

$("btnContinuar").addEventListener(
  "click",
  continuarIdentificacao
);

$("btnEntrar").addEventListener(
  "click",
  entrarAluno
);

$("btnIniciar").addEventListener(
  "click",
  iniciarNovaTentativa
);

$("aceite").addEventListener(
  "change",
  () => {

    $("btnIniciar").disabled =
      !$("aceite").checked;
  }
);

$("btnAnt").addEventListener(
  "click",
  anterior
);

$("btnProx").addEventListener(
  "click",
  proxima
);

$("btnSairProva").addEventListener(
  "click",
  () => {

    abrirModal(`
      <h2>Sair da prova?</h2>

      <p>
        Suas respostas já salvas permanecerão registradas.
        Você poderá voltar depois usando seu e-mail e matrícula.
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


/* =========================================================
   TECLAS ENTER
   ========================================================= */

$("loginMatricula").addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {
      entrarAluno();
    }
  }
);

$("matricula").addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {
      continuarIdentificacao();
    }
  }
);


/* =========================================================
   PROTEÇÃO CONTRA CÓPIA
   ========================================================= */

document.addEventListener(
  "copy",
  e => {

    if (
      document.body.classList.contains("noselect") &&
      !e.target.matches("textarea,input")
    ) {

      e.preventDefault();

      evento("copy", {});
    }
  }
);

document.addEventListener(
  "cut",
  e => {

    if (
      document.body.classList.contains("noselect") &&
      !e.target.matches("textarea,input")
    ) {

      e.preventDefault();

      evento("cut", {});
    }
  }
);

document.addEventListener(
  "paste",
  e => {

    if (
      document.body.classList.contains("noselect") &&
      !e.target.matches("textarea,input")
    ) {

      e.preventDefault();

      evento("paste", {});
    }
  }
);

document.addEventListener(
  "contextmenu",
  e => {

    if (
      document.body.classList.contains("noselect") &&
      !e.target.matches("textarea,input")
    ) {

      e.preventDefault();

      evento("contextmenu", {});
    }
  }
);

document.addEventListener(
  "dragstart",
  e => {

    if (
      document.body.classList.contains("noselect")
    ) {

      e.preventDefault();

      evento("dragstart", {});
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
          motivo: "visibilitychange"
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

  $("hTitulo").textContent =
    CONFIG.TITULO || "";

  $("hSub").textContent =
    CONFIG.SUBTITULO
      ? " — " + CONFIG.SUBTITULO
      : "";

  carregarLocal();


  /*
   * Se houver uma tentativa em andamento salva
   * localmente, mantemos a possibilidade de retomada.
   *
   * Se já estiver finalizada, NÃO mostramos automaticamente
   * o resultado. O usuário deverá entrar novamente com
   * e-mail + matrícula.
   */

  if (
    S.tid &&
    !S.fim
  ) {

    try {

      const r =
        await api(
          "verificar_tentativa",
          {
            tentativa_id: S.tid
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
            Number(r.inicio_ts);
        }

        if (r.tempo_limite) {
          S.limite =
            Number(r.tempo_limite);
        }

        S.fim = false;

        salvarLocal();

        iniciarProva();

        return;
      }

    } catch (e) {

      /*
       * Se estiver sem internet, usamos o estado local.
       */

      iniciarProva();

      return;
    }
  }


  /*
   * Resultado finalizado salvo localmente:
   * limpar para impedir que outro usuário do mesmo
   * computador veja o resultado sem fazer login.
   */

  if (S.tid && S.fim) {

    limparLocal();
  }

  mostrarIdentificacao();
}


init();
