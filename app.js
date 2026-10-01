javascript
// ESTUDO DIRIGIDO DENTÍSTICA — lógica do frontend.
// O gabarito e o cálculo da nota ficam no Apps Script.
// Aqui há interface, cronômetro, autosave, eventos e envio.

// ============================================================
// UTILITÁRIOS
// ============================================================

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


// ============================================================
// ESTADO LOCAL
// ============================================================

const salvarLocal = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
};

function carregarLocal() {
  try {
    const j = localStorage.getItem(KEY);
    if (j) S = Object.assign(S, JSON.parse(j));
  } catch (e) {}
}


// ============================================================
// API — GOOGLE APPS SCRIPT
// ============================================================

// text/plain evita preflight CORS
async function api(action, data) {
  if (!CONFIG.API_URL) {
    throw new Error("backend_nao_configurado");
  }

  const r = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(
      Object.assign({ action }, data)
    )
  });

  return r.json();
}


// ============================================================
// FILA DE ENVIO
// ============================================================

async function enviar(action, data) {
  S.pend.push({
    action,
    data,
    t: Date.now()
  });

  salvarLocal();
  flush();
}

let flushing = false;

async function flush() {
  if (flushing || !S.tid) return;

  flushing = true;

  try {
    while (S.pend.length) {
      const p = S.pend[0];

      const r = await api(
        p.action,
        p.data
      );

      if (
        r &&
        r.ok === false &&
        r.erro === "tentativa_finalizada"
      ) {
        S.pend = [];
        break;
      }

      S.pend.shift();
      salvarLocal();
    }
  } catch (e) {
    // Sem conexão:
    // mantém a fila para tentar novamente.
  }

  flushing = false;
}

setInterval(flush, 15000);

window.addEventListener("online", flush);


// ============================================================
// REGISTRO DE EVENTOS
// ============================================================

const evento = (tipo, det) => {
  if (
    S.tid &&
    !S.fim
  ) {
    enviar(
      "registrar_evento",
      {
        tentativa_id: S.tid,
        tipo_evento: tipo,
        detalhes: det || "",
        data_hora: new Date().toISOString()
      }
    );
  }
};


// ============================================================
// TELAS
// ============================================================

function tela(id) {
  [
    "s-id",
    "s-termos",
    "s-prova",
    "s-res"
  ].forEach(x => {
    $(x).classList.toggle(
      "hidden",
      x !== id
    );
  });

  $("barra").classList.toggle(
    "hidden",
    id !== "s-prova"
  );

  window.scrollTo(0, 0);
}

function toast(msg, ms = 6000) {
  $("toast").textContent = msg;
  $("toast").classList.remove("hidden");

  setTimeout(() => {
    $("toast").classList.add("hidden");
  }, ms);
}

function modal(html) {
  $("modalBox").innerHTML = html;
  $("modal").classList.remove("hidden");
}

const fechaModal = () =>
  $("modal").classList.add("hidden");


// ============================================================
// IDENTIFICAÇÃO
// ============================================================

$("btnContinuar").onclick = () => {

  const nome =
    $("nome").value
      .trim()
      .replace(/\s+/g, " ");

  const email =
    $("email").value
      .trim()
      .toLowerCase();

  const mat =
    $("matricula").value.trim();

  let e = "";

  if (nome.split(" ").length < 2) {
    e = "Informe seu nome completo.";
  }

  else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    e = "E-mail inválido.";
  }

  else if (!mat) {
    e = "Informe a matrícula.";
  }

  $("erroId").textContent = e;

  if (e) return;

  S.aluno = {
    nome,
    email,
    matricula: mat
  };

  tela("s-termos");
};


// ============================================================
// TERMOS
// ============================================================

$("aceite").onchange = () => {
  $("btnIniciar").disabled =
    !$("aceite").checked;
};

$("btnIniciar").onclick = async () => {

  if (!$("aceite").checked) return;

  $("btnIniciar").disabled = true;

  $("erroTermos").textContent =
    "Iniciando...";

  try {

    const r = await api(
      "iniciar_tentativa",
      Object.assign(
        {
          codigo_prova:
            CONFIG.CODIGO_PROVA,

          aceite_termos: true,

          versao_termos:
            CONFIG.VERSAO_TERMOS,

          aceite_em:
            new Date().toISOString()
        },
        S.aluno
      )
    );

    if (!r.ok) {

      $("erroTermos").textContent =
        r.erro === "ja_finalizada"
          ? "Você já realizou esta prova."
          : (
              r.mensagem ||
              "Não foi possível iniciar."
            );

      $("btnIniciar").disabled = false;

      return;
    }

    S.tid = r.tentativa_id;
    S.inicio = r.inicio_ts;
    S.limite = r.tempo_limite || 0;
    S.resp = r.respostas || {};
    S.cur = 0;
    S.fim = false;
    S.pend = [];

    salvarLocal();

    iniciarProva();

  } catch (e) {

    $("erroTermos").textContent =
      e.message === "backend_nao_configurado"
        ? "Backend ainda não configurado (config.js)."
        : "Falha de conexão. Tente novamente.";

    $("btnIniciar").disabled = false;
  }
};


// ============================================================
// PROVA
// ============================================================

function iniciarProva() {

  tela("s-prova");

  evento("inicio_prova");

  render();

  clearInterval(timerH);

  timerH = setInterval(
    tick,
    500
  );

  tick();
}


const fmt = s => {

  s = Math.max(
    0,
    Math.floor(s)
  );

  const h =
    Math.floor(s / 3600);

  const m =
    Math.floor(
      s % 3600 / 60
    );

  const x =
    s % 60;

  const p =
    n => String(n).padStart(2, "0");

  return (
    h
      ? p(h) + ":"
      : ""
  ) +
  p(m) +
  ":" +
  p(x);
};


const decorrido = () =>
  (Date.now() - S.inicio) / 1000;


function tick() {

  if (S.fim) return;

  const d = decorrido();

  if (S.limite) {

    const rest =
      S.limite - d;

    $("timer").textContent =
      "⏱ " + fmt(rest);

    if (rest <= 0) {
      finalizar(true);
    }

  } else {

    $("timer").textContent =
      "⏱ " + fmt(d);
  }
}


// ============================================================
// RENDERIZAÇÃO DAS QUESTÕES
// ============================================================

function render() {

  const q =
    QUESTOES[S.cur];

  const n =
    QUESTOES.length;

  const nr =
    Object.keys(S.resp).length;

  $("qInfo").textContent =
    `QUESTÃO ${S.cur + 1} DE ${n}`;

  $("progBar").style.width =
    (nr / n * 100) + "%";

  $("qMeta").textContent =
    q.tema +
    (
      q.dificuldade
        ? " · " + q.dificuldade
        : ""
    );

  $("qEnun").textContent =
    q.enunciado;


  // ----------------------------------------------------------
  // DISCURSIVA
  // ----------------------------------------------------------

  if (q.tipo === "discursiva") {

    $("qResp").innerHTML = `
      <textarea
        id="disc"
        placeholder="Digite sua resposta..."
      ></textarea>
    `;

    const t =
      $("disc");

    t.value =
      S.resp[q.id] || "";

    let h;

    t.oninput = () => {

      clearTimeout(h);

      h = setTimeout(
        () =>
          responder(
            q.id,
            t.value
          ),
        700
      );
    };

  }


  // ----------------------------------------------------------
  // OBJETIVA
  // ----------------------------------------------------------

  else {

    $("qResp").innerHTML =
      Object.entries(
        q.alternativas
      )
      .map(
        ([k, v]) =>
          `
          <button
            class="alt ${
              S.resp[q.id] === k
                ? "sel"
                : ""
            }"
            data-k="${k}"
          >
            <b>${k})</b>
            <span>${esc(v)}</span>
          </button>
          `
      )
      .join("");

    document
      .querySelectorAll(".alt")
      .forEach(
        b =>
          b.onclick = () => {

            responder(
              q.id,
              b.dataset.k
            );

            render();
          }
      );
  }


  $("btnAnt").disabled =
    S.cur === 0;

  $("btnProx").textContent =
    S.cur === n - 1
      ? "FINALIZAR PROVA"
      : "PRÓXIMA →";


  $("painel").innerHTML =
    QUESTOES
      .map(
        (x, i) =>
          `
          <button
            class="${
              S.resp[x.id]
                ? "done"
                : ""
            } ${
              i === S.cur
                ? "cur"
                : ""
            }"
            data-i="${i}"
          >
            ${i + 1}
          </button>
          `
      )
      .join("");


  document
    .querySelectorAll(
      "#painel button"
    )
    .forEach(
      b =>
        b.onclick = () =>
          ir(+b.dataset.i)
    );
}


// ============================================================
// RESPOSTA
// ============================================================

function responder(qid, valor) {

  if (S.fim) return;

  valor =
    String(valor).trim();

  if (valor) {
    S.resp[qid] = valor;
  } else {
    delete S.resp[qid];
  }

  salvarLocal();

  enviar(
    "salvar_resposta",
    {
      tentativa_id:
        S.tid,

      questao_id:
        qid,

      resposta:
        valor,

      data_hora:
        new Date().toISOString(),

      tempo_decorrido:
        Math.round(
          decorrido()
        )
    }
  );
}


function ir(i) {

  if (S.fim) return;

  S.cur = i;

  salvarLocal();

  render();

  evento(
    "troca_questao",
    "q" + (i + 1)
  );
}


$("btnAnt").onclick = () =>
  ir(S.cur - 1);

$("btnProx").onclick = () =>
  S.cur === QUESTOES.length - 1
    ? confirmarFim()
    : ir(S.cur + 1);


// ============================================================
// FINALIZAÇÃO
// ============================================================

function confirmarFim() {

  const r =
    Object.keys(
      S.resp
    ).length;

  const n =
    QUESTOES.length;

  modal(`
    <h3>
      Você tem certeza que deseja
      finalizar a prova?
    </h3>

    <p>
      Respondidas:
      <b>${r}</b>
      <br>

      Não respondidas:
      <b>${n - r}</b>
      <br>

      Tempo utilizado:
      <b>${fmt(decorrido())}</b>
    </p>

    <button
      class="btn sec"
      onclick="fechaModal()"
    >
      VOLTAR PARA A PROVA
    </button>

    <button
      class="btn"
      onclick="finalizar(false)"
    >
      FINALIZAR
    </button>
  `);
}


async function finalizar(auto) {

  if (
    S.fim &&
    S.resultado
  ) return;

  fechaModal();

  S.fim = true;

  clearInterval(timerH);

  salvarLocal();

  modal(
    "<p>Finalizando e calculando resultado...</p>"
  );

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
            !!auto,

          tempo_cliente:
            Math.round(
              decorrido()
            )
        }
      );

    if (!r.ok) {
      throw new Error(
        r.mensagem ||
        "erro"
      );
    }

    S.resultado =
      r.resultado;

    S.pend = [];

    salvarLocal();

    fechaModal();

    mostrarResultado();

  } catch (e) {

    modal(`
      <p>
        Não foi possível finalizar agora
        (${esc(e.message)}).
        Suas respostas estão salvas.
      </p>

      <button
        class="btn"
        onclick="
          S.fim=false;
          finalizar(false)
        "
      >
        TENTAR NOVAMENTE
      </button>
    `);
  }
}


// ============================================================
// MENSAGENS DE DESEMPENHO
// ============================================================

function msgDesempenho(p) {

  p = Number(p) || 0;

  if (p >= 70) {

    return {
      titulo: "Mandou muito bem! 🎉",
      texto:
        "Você demonstrou ótimo desempenho nas questões objetivas. Aproveite a revisão para consolidar o conteúdo e aprofundar os pontos em que teve dificuldade.",
      classe: "excelente",
      icone: "🏆"
    };

  }

  if (p >= 60) {

    return {
      titulo: "Bom trabalho! 👏",
      texto:
        "Você já possui uma boa base. Agora vale revisar principalmente os temas em que houve erros para fortalecer seu desempenho.",
      classe: "bom",
      icone: "📚"
    };

  }

  return {

    titulo: "Hora de revisar! 💪",

    texto:
      "O resultado mostra que alguns conteúdos ainda precisam de atenção. Use a revisão abaixo para identificar exatamente onde concentrar seus estudos.",

    classe: "revisar",

    icone: "🔎"
  };
}


// ============================================================
// ESTILOS DO DASHBOARD DE RESULTADO
// ============================================================

function estilosResultado() {

  if (
    document.getElementById(
      "resultado-dashboard-style"
    )
  ) return;

  const style =
    document.createElement("style");

  style.id =
    "resultado-dashboard-style";

  style.textContent = `

    /* ======================================================
       DASHBOARD
       ====================================================== */

    #s-res{
      max-width:760px;
      margin:0 auto;
      padding-bottom:30px;
    }

    .res-header{
      background:
        linear-gradient(
          135deg,
          #1d4ed8 0%,
          #312e81 100%
        );
      color:#fff;
      border-radius:18px;
      padding:26px 22px;
      margin-bottom:14px;
      box-shadow:0 8px 25px #1e3a8a30;
    }

    .res-header small{
      opacity:.85;
      font-weight:600;
      letter-spacing:.04em;
      text-transform:uppercase;
    }

    .res-header h2{
      margin:6px 0 4px;
      font-size:1.65rem;
    }

    .res-header p{
      margin:0;
      opacity:.9;
    }


    /* ======================================================
       HERO
       ====================================================== */

    .res-hero{
      display:grid;
      grid-template-columns:180px 1fr;
      gap:24px;
      align-items:center;
      background:#fff;
      border-radius:18px;
      padding:22px;
      margin-bottom:14px;
      box-shadow:0 3px 12px #00000012;
    }

    .res-gauge{
      width:160px;
      height:160px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      margin:auto;
      position:relative;
    }

    .res-gauge::before{
      content:"";
      position:absolute;
      width:122px;
      height:122px;
      background:#fff;
      border-radius:50%;
    }

    .res-gauge-content{
      position:relative;
      z-index:1;
      text-align:center;
    }

    .res-gauge-value{
      font-size:2.35rem;
      font-weight:900;
      line-height:1;
    }

    .res-gauge-label{
      font-size:.76rem;
      color:#6b7280;
      font-weight:700;
      text-transform:uppercase;
      margin-top:5px;
    }

    .res-hero h3{
      margin:0 0 8px;
      font-size:1.35rem;
    }

    .res-hero p{
      margin:0;
      color:#4b5563;
    }


    /* ======================================================
       CARDS DE NÚMEROS
       ====================================================== */

    .res-stats{
      display:grid;
      grid-template-columns:
        repeat(3,1fr);
      gap:10px;
      margin-bottom:14px;
    }

    .res-stat{
      background:#fff;
      border-radius:14px;
      padding:16px 12px;
      text-align:center;
      box-shadow:0 2px 8px #0000000d;
      border:1px solid #eef0f4;
    }

    .res-stat-icon{
      font-size:1.35rem;
      margin-bottom:3px;
    }

    .res-stat-value{
      font-size:1.45rem;
      font-weight:900;
      line-height:1.15;
    }

    .res-stat-label{
      color:#6b7280;
      font-size:.78rem;
      margin-top:3px;
      font-weight:600;
    }


    /* ======================================================
       DISCURSIVA
       ====================================================== */

    .res-manual{
      background:#fff7ed;
      border:1px solid #fed7aa;
      border-radius:16px;
      padding:18px;
      margin-bottom:14px;
      display:flex;
      gap:13px;
      align-items:flex-start;
    }

    .res-manual-icon{
      font-size:1.8rem;
    }

    .res-manual h3{
      margin:0 0 4px;
      color:#9a3412;
    }

    .res-manual p{
      margin:0;
      color:#7c2d12;
      font-size:.92rem;
    }


    /* ======================================================
       TÍTULOS DE SEÇÃO
       ====================================================== */

    .res-section{
      background:#fff;
      border-radius:16px;
      padding:18px;
      margin-bottom:14px;
      box-shadow:0 2px 8px #0000000d;
    }

    .res-section-title{
      display:flex;
      align-items:center;
      gap:8px;
      margin:0 0 15px;
      font-size:1.12rem;
    }


    /* ======================================================
       BARRAS POR TEMA
       ====================================================== */

    .tema-dashboard{
      margin-bottom:15px;
    }

    .tema-dashboard:last-child{
      margin-bottom:0;
    }

    .tema-top{
      display:flex;
      justify-content:space-between;
      gap:10px;
      font-size:.9rem;
      font-weight:700;
      margin-bottom:6px;
    }

    .tema-top span:last-child{
      color:#4b5563;
    }

    .tema-track{
      height:12px;
      background:#e5e7eb;
      border-radius:999px;
      overflow:hidden;
    }

    .tema-fill{
      height:100%;
      border-radius:999px;
      transition:width .5s ease;
    }

    .tema-fill.alto{
      background:
        linear-gradient(
          90deg,
          #22c55e,
          #16a34a
        );
    }

    .tema-fill.medio{
      background:
        linear-gradient(
          90deg,
          #facc15,
          #f59e0b
        );
    }

    .tema-fill.baixo{
      background:
        linear-gradient(
          90deg,
          #fb7185,
          #dc2626
        );
    }


    /* ======================================================
       REVISÃO
       ====================================================== */

    .rev-card{
      border-radius:14px;
      border:1px solid #e5e7eb;
      padding:15px;
      margin-bottom:10px;
      background:#fff;
    }

    .rev-card:last-child{
      margin-bottom:0;
    }

    .rev-card.rev-ok{
      border-left:5px solid #16a34a;
    }

    .rev-card.rev-erro{
      border-left:5px solid #dc2626;
    }

    .rev-card.rev-manual{
      border-left:5px solid #f59e0b;
    }

    .rev-card summary{
      cursor:pointer;
      list-style:none;
    }

    .rev-card summary::-webkit-details-marker{
      display:none;
    }

    .rev-badge{
      display:inline-block;
      border-radius:999px;
      padding:3px 8px;
      font-size:.7rem;
      font-weight:800;
      margin-bottom:7px;
    }

    .rev-badge.ok{
      background:#dcfce7;
      color:#166534;
    }

    .rev-badge.erro{
      background:#fee2e2;
      color:#991b1b;
    }

    .rev-badge.manual{
      background:#fef3c7;
      color:#92400e;
    }

    .rev-enun{
      font-weight:700;
      line-height:1.4;
    }

    .rev-content{
      margin-top:14px;
      padding-top:12px;
      border-top:1px solid #eee;
      font-size:.92rem;
    }

    .rev-content p{
      margin:8px 0;
    }

    .res-empty{
      text-align:center;
      color:#6b7280;
      padding:10px;
    }


    /* ======================================================
       RODAPÉ
       ====================================================== */

    .res-footer{
      text-align:center;
      color:#6b7280;
      font-size:.82rem;
      padding:8px 15px 25px;
    }


    /* ======================================================
       RESPONSIVO
       ====================================================== */

    @media(max-width:600px){

      .res-hero{
        grid-template-columns:1fr;
        text-align:center;
      }

      .res-gauge{
        width:145px;
        height:145px;
      }

      .res-gauge::before{
        width:110px;
        height:110px;
      }

      .res-stats{
        grid-template-columns:
          repeat(2,1fr);
      }

      .res-header h2{
        font-size:1.4rem;
      }
    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// COR DO GAUGE
// ============================================================

function corGauge(percentual) {

  percentual =
    Number(percentual) || 0;

  if (percentual >= 70) {
    return "#16a34a";
  }

  if (percentual >= 60) {
    return "#f59e0b";
  }

  return "#dc2626";
}


// ============================================================
// DESEMPENHO POR TEMA
// ============================================================

function renderTemas(temas) {

  const lista =
    Object.entries(
      temas || {}
    );

  if (!lista.length) {

    return `
      <div class="res-empty">
        Ainda não há dados de desempenho
        por tema.
      </div>
    `;
  }

  return lista
    .map(
      ([tema, v]) => {

        const total =
          Number(v.total) || 0;

        const acertos =
          Number(v.acertos) || 0;

        const percentual =
          total
            ? Math.round(
                acertos /
                total *
                100
              )
            : 0;

        const classe =
          percentual >= 70
            ? "alto"
            : percentual >= 60
              ? "medio"
              : "baixo";

        return `
          <div class="tema-dashboard">

            <div class="tema-top">
              <span>${esc(tema)}</span>
              <span>
                ${acertos}/${total}
                · ${percentual}%
              </span>
            </div>

            <div class="tema-track">
              <div
                class="tema-fill ${classe}"
                style="width:${percentual}%"
              ></div>
            </div>

          </div>
        `;
      }
    )
    .join("");
}


// ============================================================
// REVISÃO DAS QUESTÕES
// ============================================================

function renderRevisao(revisao) {

  const lista =
    (revisao || [])
      .slice()
      .sort(
        (a, b) =>
          (a.correta === true) -
          (b.correta === true)
      );

  if (!lista.length) {

    return `
      <div class="res-empty">
        Nenhuma questão disponível
        para revisão.
      </div>
    `;
  }

  return lista
    .map(x => {

      const q =
        QUESTOES.find(
          z =>
            z.id ===
            x.questao_id
        );

      if (!q) return "";

      const disc =
        q.tipo ===
        "discursiva";

      const seu =
        S.resp[q.id];

      const alt =
        k =>
          k &&
          q.alternativas
            ? `${k}) ${esc(
                q.alternativas[k]
              )}`
            : "—";


      // --------------------------------------------------------
      // DISCURSIVA
      // --------------------------------------------------------

      if (disc) {

        return `
          <details
            class="rev-card rev-manual"
            open
          >

            <summary>

              <span class="rev-badge manual">
                🟡 AGUARDANDO CORREÇÃO
              </span>

              <div class="rev-enun">
                ${QUESTOES.indexOf(q) + 1}.
                ${esc(q.enunciado)}
              </div>

            </summary>

            <div class="rev-content">

              <p>
                <b>✍️ SUA RESPOSTA</b><br>
                ${esc(
                  seu ||
                  "(em branco)"
                )}
              </p>

              <p>
                <b>📌 STATUS</b><br>
                Esta questão discursiva
                será avaliada manualmente.
              </p>

              ${
                x.resposta_modelo
                  ? `
                    <p>
                      <b>
                        📖 RESPOSTA ESPERADA
                      </b><br>
                      ${esc(
                        x.resposta_modelo
                      )}
                    </p>
                  `
                  : ""
              }

              ${
                x.criterios_correcao
                  ? `
                    <p>
                      <b>
                        📝 CRITÉRIOS DE CORREÇÃO
                      </b><br>
                      ${esc(
                        x.criterios_correcao
                      )}
                    </p>
                  `
                  : ""
              }

              <p>
                <i>
                  A pontuação desta questão
                  não entra no percentual
                  objetivo exibido acima.
                </i>
              </p>

            </div>

          </details>
        `;
      }


      // --------------------------------------------------------
      // OBJETIVA
      // --------------------------------------------------------

      const correta =
        x.correta === true;

      return `
        <details
          class="
            rev-card
            ${
              correta
                ? "rev-ok"
                : "rev-erro"
            }
          "
          ${correta ? "" : "open"}
        >

          <summary>

            <span
              class="
                rev-badge
                ${
                  correta
                    ? "ok"
                    : "erro"
                }
              "
            >
              ${
                correta
                  ? "🟢 ACERTO"
                  : "🔴 REVISAR"
              }
            </span>

            <div class="rev-enun">
              ${QUESTOES.indexOf(q) + 1}.
              ${esc(q.enunciado)}
            </div>

          </summary>

          <div class="rev-content">

            <p>
              <b>Sua resposta:</b>
              ${alt(seu)}
            </p>

            <p>
              <b>Resposta correta:</b>
              ${alt(
                x.resposta_correta
              )}
            </p>

            ${
              x.explicacao
                ? `
                  <p>
                    <b>💡 Explicação</b><br>
                    ${esc(
                      x.explicacao
                    )}
                  </p>
                `
                : ""
            }

            ${
              x.fonte
                ? `
                  <p>
                    <small>
                      📚 Fonte:
                      ${esc(x.fonte)}
                    </small>
                  </p>
                `
                : ""
            }

          </div>

        </details>
      `;
    })
    .join("");
}


// ============================================================
// RESULTADO — DASHBOARD
// ============================================================

function mostrarResultado() {

  estilosResultado();

  const r =
    S.resultado || {};

  const el =
    $("s-res");

  tela("s-res");


  // ----------------------------------------------------------
  // DADOS
  // ----------------------------------------------------------

  const percentual =
    Number(
      r.percentual
    ) || 0;

  const totalQuestoes =
    Number(
      r.total_questoes
    ) || QUESTOES.length;

  const respondidas =
    Number(
      r.respondidas
    ) || 0;

  const acertos =
    Number(
      r.acertos
    ) || 0;

  const erros =
    Number(
      r.erros
    ) || 0;

  const discursivas =
    Number(
      r.total_discursivas
    ) ||
    QUESTOES.filter(
      q =>
        q.tipo ===
        "discursiva"
    ).length;

  const totalObjetivas =
    Number(
      r.total_objetivas
    ) ||
    QUESTOES.filter(
      q =>
        q.tipo !==
        "discursiva"
    ).length;

  const naoRespondidas =
    Math.max(
      0,
      totalQuestoes -
      respondidas
    );

  const tempo =
    fmt(
      Number(
        r.tempo_gasto_segundos
      ) || 0
    );

  const msg =
    msgDesempenho(
      percentual
    );

  const cor =
    corGauge(
      percentual
    );


  // ----------------------------------------------------------
  // GAUGE
  // ----------------------------------------------------------

  const gauge =
    Math.max(
      0,
      Math.min(
        100,
        percentual
      )
    );

  const gaugeBackground =
    `conic-gradient(
      ${cor} 0% ${gauge}%,
      #e5e7eb ${gauge}% 100%
    )`;


  // ----------------------------------------------------------
  // TEMAS
  // ----------------------------------------------------------

  const temasHtml =
    renderTemas(
      r.temas
    );


  // ----------------------------------------------------------
  // REVISÃO
  // ----------------------------------------------------------

  const revisaoHtml =
    renderRevisao(
      r.revisao
    );


  // ----------------------------------------------------------
  // HTML FINAL
  // ----------------------------------------------------------

  el.innerHTML = `

    <!-- ================================================
         CABEÇALHO
         ================================================ -->

    <div class="res-header">

      <small>
        ${esc(CONFIG.TITULO)}
      </small>

      <h2>
        Resultado da ${esc(CONFIG.SUBTITULO)}
      </h2>

      <p>
        ${
          S.aluno?.nome
            ? `Olá, ${esc(S.aluno.nome)}!`
            : "Confira seu desempenho."
        }
      </p>

    </div>


    <!-- ================================================
         DESEMPENHO PRINCIPAL
         ================================================ -->

    <div class="res-hero">

      <div
        class="res-gauge"
        style="
          background:${gaugeBackground};
        "
      >

        <div
          class="res-gauge-content"
        >

          <div
            class="res-gauge-value"
            style="color:${cor};"
          >
            ${percentual.toFixed(1).replace(".", ",")}%
          </div>

          <div
            class="res-gauge-label"
          >
            desempenho
          </div>

        </div>

      </div>


      <div>

        <h3>
          ${msg.icone}
          ${msg.titulo}
        </h3>

        <p>
          ${msg.texto}
        </p>

        <p
          style="
            margin-top:10px;
            font-size:.88rem;
            color:#6b7280;
          "
        >
          Resultado automático das
          <b>${totalObjetivas}</b>
          questões objetivas.
        </p>

      </div>

    </div>


    <!-- ================================================
         NÚMEROS PRINCIPAIS
         ================================================ -->

    <div class="res-stats">

      <div class="res-stat">
        <div class="res-stat-icon">
          🎯
        </div>
        <div class="res-stat-value">
          ${acertos}
        </div>
        <div class="res-stat-label">
          Acertos
        </div>
      </div>


      <div class="res-stat">
        <div class="res-stat-icon">
          ❌
        </div>
        <div class="res-stat-value">
          ${erros}
        </div>
        <div class="res-stat-label">
          Erros
        </div>
      </div>


      <div class="res-stat">
        <div class="res-stat-icon">
          📝
        </div>
        <div class="res-stat-value">
          ${discursivas}
        </div>
        <div class="res-stat-label">
          Discursivas
        </div>
      </div>


      <div class="res-stat">
        <div class="res-stat-icon">
          ⏱️
        </div>
        <div class="res-stat-value">
          ${tempo}
        </div>
        <div class="res-stat-label">
          Tempo
        </div>
      </div>


      <div class="res-stat">
        <div class="res-stat-icon">
          📚
        </div>
        <div class="res-stat-value">
          ${totalQuestoes}
        </div>
        <div class="res-stat-label">
          Questões
        </div>
      </div>


      <div class="res-stat">
        <div class="res-stat-icon">
          ✅
        </div>
        <div class="res-stat-value">
          ${respondidas}
        </div>
        <div class="res-stat-label">
          Respondidas
        </div>
      </div>

    </div>


    <!-- ================================================
         DISCURSIVAS
         ================================================ -->

    ${
      discursivas > 0
        ? `
          <div class="res-manual">

            <div class="res-manual-icon">
              📝
            </div>

            <div>

              <h3>
                Correção manual
              </h3>

              <p>
                Você possui
                <b>${discursivas}</b>
                questão(ões) discursiva(s).
                A resposta foi registrada e
                aguarda avaliação manual.
              </p>

            </div>

          </div>
        `
        : ""
    }


    <!-- ================================================
         RESUMO
         ================================================ -->

    <div class="res-section">

      <h3 class="res-section-title">
        📊 Resumo da prova
      </h3>

      <div
        class="tema-dashboard"
      >

        <div class="tema-top">
          <span>
            Questões respondidas
          </span>

          <span>
            ${respondidas}/${totalQuestoes}
          </span>
        </div>

        <div class="tema-track">

          <div
            class="tema-fill alto"
            style="
              width:${
                totalQuestoes
                  ? Math.round(
                      respondidas /
                      totalQuestoes *
                      100
                    )
                  : 0
              }%;
            "
          ></div>

        </div>

      </div>


      <div
        class="tema-dashboard"
      >

        <div class="tema-top">
          <span>
            Aproveitamento objetivo
          </span>

          <span>
            ${percentual.toFixed(1).replace(".", ",")}%
          </span>
        </div>

        <div class="tema-track">

          <div
            class="
              tema-fill
              ${
                percentual >= 70
                  ? "alto"
                  : percentual >= 60
                    ? "medio"
                    : "baixo"
              }
            "
            style="
              width:${gauge}%;
            "
          ></div>

        </div>

      </div>


      <div
        class="tema-dashboard"
        style="margin-bottom:0;"
      >

        <div class="tema-top">

          <span>
            Questões ainda não respondidas
          </span>

          <span>
            ${naoRespondidas}
          </span>

        </div>

        <div class="tema-track">

          <div
            class="tema-fill baixo"
            style="
              width:${
                totalQuestoes
                  ? Math.round(
                      naoRespondidas /
                      totalQuestoes *
                      100
                    )
                  : 0
              }%;
            "
          ></div>

        </div>

      </div>

    </div>


    <!-- ================================================
         DESEMPENHO POR TEMA
         ================================================ -->

    <div class="res-section">

      <h3 class="res-section-title">
        📚 Desempenho por tema
      </h3>

      ${temasHtml}

    </div>


    <!-- ================================================
         REVISÃO
         ================================================ -->

    <div class="res-section">

      <h3 class="res-section-title">
        🔎 Revisão das questões
      </h3>

      <p
        style="
          color:#6b7280;
          font-size:.88rem;
          margin-top:-7px;
          margin-bottom:14px;
        "
      >
        Abra cada questão para consultar
        sua resposta, o resultado e a
        explicação quando disponível.
      </p>

      ${revisaoHtml}

    </div>


    <!-- ================================================
         RODAPÉ
         ================================================ -->

    <div class="res-footer">

      Resultado registrado com sucesso. ✅

      <br>

      Continue estudando e use esta
      análise para orientar sua revisão.

    </div>

  `;
}


// ============================================================
// EVENTOS: CÓPIA, COLA E SAÍDA
// ============================================================

// Dissuasão e registro.
// NÃO é segurança absoluta.
// Nunca finaliza a prova nem acusa o aluno.

const ativa = () =>
  S.tid &&
  !S.fim &&
  !$("s-prova")
    .classList
    .contains("hidden");


document.body.classList.add(
  "noselect"
);


const bloq =
  (ev, tipo) =>
    document.addEventListener(
      ev,
      e => {

        e.preventDefault();

        if (ativa()) {
          evento(tipo);
        }

      }
    );


bloq("copy", "copia");
bloq("cut", "recorte");
bloq("paste", "colagem");
bloq(
  "contextmenu",
  "menu_contexto"
);
bloq(
  "dragstart",
  "arrastar"
);


document.addEventListener(
  "selectstart",
  e => {

    if (
      e.target.closest &&
      e.target.closest(
        "textarea,input"
      )
    ) {
      return;
    }

    e.preventDefault();
  }
);


document.addEventListener(
  "keydown",
  e => {

    if (
      (e.ctrlKey || e.metaKey) &&
      ["c", "x", "v", "a"]
        .includes(
          e.key.toLowerCase()
        )
    ) {

      e.preventDefault();

      if (ativa()) {

        evento(
          {
            c: "copia",
            x: "recorte",
            v: "colagem",
            a: "selecao"
          }[
            e.key.toLowerCase()
          ],
          "atalho"
        );
      }
    }
  }
);


// ============================================================
// DETECÇÃO DE SAÍDA DA PÁGINA
// ============================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (!ativa()) return;

    if (document.hidden) {

      saiu = true;

      evento(
        "SAIDA_DETECTADA"
      );

    }

    else if (saiu) {

      saiu = false;

      evento(
        "RETORNO_DETECTADO"
      );

      toast(
        "Detectamos que você saiu da página da prova. Sua tentativa foi registrada e a prova continua normalmente."
      );
    }
  }
);


window.addEventListener(
  "pagehide",
  () => {

    if (ativa()) {
      salvarLocal();
    }

  }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

(function init() {

  $("hTitulo").textContent =
    CONFIG.TITULO;

  $("hSub").textContent =
    CONFIG.SUBTITULO;


  if (
    !CONFIG.API_URL ||
    !CONFIG.CODIGO_PROVA
  ) {

    $("aviso").textContent =
      "Backend ainda não configurado: preencha API_URL e CODIGO_PROVA em config.js.";

    $("aviso")
      .classList
      .remove("hidden");
  }


  carregarLocal();


  if (
    S.tid &&
    S.resultado
  ) {

    mostrarResultado();

  }

  else if (
    S.tid &&
    !S.fim
  ) {

    iniciarProva();

    toast(
      "Tentativa em andamento recuperada."
    );

    flush();

  }

  else if (
    S.tid &&
    S.fim
  ) {

    finalizar(false);
  }

})();
