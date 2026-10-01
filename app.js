// ESTUDO DIRIGIDO DENTÍSTICA — lógica do frontend.
// O gabarito e o cálculo da nota ficam no Apps Script. Aqui só há interface, cronômetro e envio.
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KEY = "ed_dent_prova01";
let S = { aluno: null, tid: null, inicio: 0, limite: 0, resp: {}, cur: 0, fim: false, resultado: null, pend: [] };
let timerH = null, saiu = false;

/* ---------- Estado local (recuperação após F5 / queda de conexão) ---------- */
const salvarLocal = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
function carregarLocal() { try { const j = localStorage.getItem(KEY); if (j) S = Object.assign(S, JSON.parse(j)); } catch (e) {} }

/* ---------- API (Apps Script). text/plain evita preflight CORS ---------- */
async function api(action, data) {
  if (!CONFIG.API_URL) throw new Error("backend_nao_configurado");
  const r = await fetch(CONFIG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action }, data)) });
  return r.json();
}
// Fila de envios pendentes: se falhar, tenta de novo depois (sem duplicar: o backend usa tentativa+questão como chave)
async function enviar(action, data) {
  S.pend.push({ action, data, t: Date.now() }); salvarLocal(); flush();
}
let flushing = false;
async function flush() {
  if (flushing || !S.tid) return; flushing = true;
  try {
    while (S.pend.length) {
      const p = S.pend[0];
      const r = await api(p.action, p.data);
      if (r && r.ok === false && r.erro === "tentativa_finalizada") { S.pend = []; break; }
      S.pend.shift(); salvarLocal();
    }
  } catch (e) { /* sem conexão: mantém na fila */ }
  flushing = false;
}
setInterval(flush, 15000); window.addEventListener("online", flush);
const evento = (tipo, det) => { if (S.tid && !S.fim) enviar("registrar_evento", { tentativa_id: S.tid, tipo_evento: tipo, detalhes: det || "", data_hora: new Date().toISOString() }); };

/* ---------- Telas ---------- */
function tela(id) { ["s-id", "s-termos", "s-prova", "s-res"].forEach(x => $(x).classList.toggle("hidden", x !== id)); $("barra").classList.toggle("hidden", id !== "s-prova"); window.scrollTo(0, 0); }
function toast(msg, ms = 6000) { $("toast").textContent = msg; $("toast").classList.remove("hidden"); setTimeout(() => $("toast").classList.add("hidden"), ms); }
function modal(html) { $("modalBox").innerHTML = html; $("modal").classList.remove("hidden"); }
const fechaModal = () => $("modal").classList.add("hidden");

/* ---------- Identificação e termos ---------- */
$("btnContinuar").onclick = () => {
  const nome = $("nome").value.trim().replace(/\s+/g, " "), email = $("email").value.trim().toLowerCase(), mat = $("matricula").value.trim();
  let e = "";
  if (nome.split(" ").length < 2) e = "Informe seu nome completo.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e = "E-mail inválido.";
  else if (!mat) e = "Informe a matrícula.";
  $("erroId").textContent = e; if (e) return;
  S.aluno = { nome, email, matricula: mat }; tela("s-termos");
};
$("aceite").onchange = () => $("btnIniciar").disabled = !$("aceite").checked;
$("btnIniciar").onclick = async () => {
  if (!$("aceite").checked) return;
  $("btnIniciar").disabled = true; $("erroTermos").textContent = "Iniciando...";
  try {
    const r = await api("iniciar_tentativa", Object.assign({ codigo_prova: CONFIG.CODIGO_PROVA, aceite_termos: true, versao_termos: CONFIG.VERSAO_TERMOS, aceite_em: new Date().toISOString() }, S.aluno));
    if (!r.ok) { $("erroTermos").textContent = r.erro === "ja_finalizada" ? "Você já realizou esta prova." : (r.mensagem || "Não foi possível iniciar."); $("btnIniciar").disabled = false; return; }
    S.tid = r.tentativa_id; S.inicio = r.inicio_ts; S.limite = r.tempo_limite || 0; S.resp = r.respostas || {}; S.cur = 0; S.fim = false; S.pend = [];
    salvarLocal(); iniciarProva();
  } catch (e) {
    $("erroTermos").textContent = e.message === "backend_nao_configurado" ? "Backend ainda não configurado (config.js)." : "Falha de conexão. Tente novamente."; $("btnIniciar").disabled = false;
  }
};

/* ---------- Prova ---------- */
function iniciarProva() {
  tela("s-prova"); evento("inicio_prova"); render(); clearInterval(timerH); timerH = setInterval(tick, 500); tick();
}
const fmt = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = n => String(n).padStart(2, "0"); return (h ? p(h) + ":" : "") + p(m) + ":" + p(x); };
const decorrido = () => (Date.now() - S.inicio) / 1000; // diferença de timestamps: F5 não zera
function tick() {
  if (S.fim) return;
  const d = decorrido();
  if (S.limite) { const rest = S.limite - d; $("timer").textContent = "⏱ " + fmt(rest); if (rest <= 0) finalizar(true); }
  else $("timer").textContent = "⏱ " + fmt(d);
}
function render() {
  const q = QUESTOES[S.cur], n = QUESTOES.length, nr = Object.keys(S.resp).length;
  $("qInfo").textContent = `QUESTÃO ${S.cur + 1} DE ${n}`;
  $("progBar").style.width = (nr / n * 100) + "%";
  $("qMeta").textContent = q.tema + (q.dificuldade ? " · " + q.dificuldade : "");
  $("qEnun").textContent = q.enunciado;
  if (q.tipo === "discursiva") {
    $("qResp").innerHTML = `<textarea id="disc" placeholder="Digite sua resposta..."></textarea>`;
    const t = $("disc"); t.value = S.resp[q.id] || "";
    let h; t.oninput = () => { clearTimeout(h); h = setTimeout(() => responder(q.id, t.value), 700); };
  } else {
    $("qResp").innerHTML = Object.entries(q.alternativas).map(([k, v]) => `<button class="alt ${S.resp[q.id] === k ? "sel" : ""}" data-k="${k}"><b>${k})</b><span>${esc(v)}</span></button>`).join("");
    document.querySelectorAll(".alt").forEach(b => b.onclick = () => { responder(q.id, b.dataset.k); render(); });
  }
  $("btnAnt").disabled = S.cur === 0;
  $("btnProx").textContent = S.cur === n - 1 ? "FINALIZAR PROVA" : "PRÓXIMA →";
  $("painel").innerHTML = QUESTOES.map((x, i) => `<button class="${S.resp[x.id] ? "done" : ""} ${i === S.cur ? "cur" : ""}" data-i="${i}">${i + 1}</button>`).join("");
  document.querySelectorAll("#painel button").forEach(b => b.onclick = () => ir(+b.dataset.i));
}
function responder(qid, valor) {
  if (S.fim) return;
  valor = String(valor).trim();
  if (valor) S.resp[qid] = valor; else delete S.resp[qid];
  salvarLocal();
  enviar("salvar_resposta", { tentativa_id: S.tid, questao_id: qid, resposta: valor, data_hora: new Date().toISOString(), tempo_decorrido: Math.round(decorrido()) });
}
function ir(i) { if (S.fim) return; S.cur = i; salvarLocal(); render(); evento("troca_questao", "q" + (i + 1)); }
$("btnAnt").onclick = () => ir(S.cur - 1);
$("btnProx").onclick = () => S.cur === QUESTOES.length - 1 ? confirmarFim() : ir(S.cur + 1);

/* ---------- Finalização ---------- */
function confirmarFim() {
  const r = Object.keys(S.resp).length, n = QUESTOES.length;
  modal(`<h3>Você tem certeza que deseja finalizar a prova?</h3><p>Respondidas: <b>${r}</b><br>Não respondidas: <b>${n - r}</b><br>Tempo utilizado: <b>${fmt(decorrido())}</b></p>
  <button class="btn sec" onclick="fechaModal()">VOLTAR PARA A PROVA</button> <button class="btn" onclick="finalizar(false)">FINALIZAR</button>`);
}
async function finalizar(auto) {
  if (S.fim && S.resultado) return;
  fechaModal(); S.fim = true; clearInterval(timerH); salvarLocal();
  modal("<p>Finalizando e calculando resultado...</p>");
  try {
    await flush();
    const r = await api("finalizar_tentativa", { tentativa_id: S.tid, respostas: S.resp, fim_automatico: !!auto, tempo_cliente: Math.round(decorrido()) });
    if (!r.ok) throw new Error(r.mensagem || "erro");
    S.resultado = r.resultado; S.pend = []; salvarLocal(); fechaModal(); mostrarResultado();
  } catch (e) {
    modal(`<p>Não foi possível finalizar agora (${esc(e.message)}). Suas respostas estão salvas.</p><button class="btn" onclick="S.fim=false;finalizar(false)">TENTAR NOVAMENTE</button>`);
  }
}

/* ---------- Resultado ---------- */
function msgDesempenho(p) {
  if (p >= 70) return "Parabéns! Seu desempenho foi muito bom. Continue revisando os conteúdos e aprofundando os pontos em que teve dificuldade.";
  if (p >= 60) return "Parabéns por concluir! Seu desempenho mostra que você já possui uma boa base, mas ainda existem pontos que podem ser aprimorados.";
  return "Você concluiu o estudo dirigido. Este resultado indica que vale a pena revisar os conteúdos e refazer seus estudos antes de avançar.";
}
function mostrarResultado() {
  const r = S.resultado, el = $("s-res"); tela("s-res");
  const temas = Object.entries(r.temas || {}).map(([t, v]) => `<div class="tema"><span>${esc(t)}</span><b>${v.acertos}/${v.total} — ${Math.round(v.total ? v.acertos / v.total * 100 : 0)}%</b></div>`).join("");
  const rev = (r.revisao || []).slice().sort((a, b) => (a.correta === true) - (b.correta === true));
  const revHtml = rev.map(x => {
    const q = QUESTOES.find(z => z.id === x.questao_id); if (!q) return "";
    const disc = q.tipo === "discursiva", seu = S.resp[q.id];
    const alt = k => k && q.alternativas ? `${k}) ${esc(q.alternativas[k])}` : "—";
    let corpo = disc
      ? `<p><b>RESPOSTA DO ALUNO</b><br>${esc(seu || "(em branco)")}</p><p><b>RESPOSTA ESPERADA</b><br>${esc(x.resposta_modelo)}</p><p><b>CRITÉRIOS DE CORREÇÃO</b><br>${esc(x.criterios_correcao)}</p><p><i>Questão discursiva — correção manual.</i></p>`
      : `<p>Sua resposta: ${alt(seu)}</p><p>Resposta correta: <b>${alt(x.resposta_correta)}</b></p><p>${esc(x.explicacao)}</p>${x.fonte ? `<small>Fonte: ${esc(x.fonte)}</small>` : ""}`;
    const aberto = disc || x.correta !== true ? "open" : "";
    return `<details class="card rev ${x.correta === true ? "ok" : ""}" ${aberto}><summary><b>${QUESTOES.indexOf(q) + 1}.</b> ${esc(q.enunciado.slice(0, 90))}…</summary><p>${esc(q.enunciado)}</p>${corpo}</details>`;
  }).join("");
  el.innerHTML = `<div class="card"><h2>RESULTADO DA PROVA</h2>
    <div class="big">${r.acertos} / ${r.total_objetivas}</div><div class="big">${(+r.percentual).toFixed(1).replace(".", ",")}%</div>
    <p>${msgDesempenho(r.percentual)}</p>
    <div class="tema"><span>Total de questões</span><b>${r.total_questoes}</b></div>
    <div class="tema"><span>Respondidas</span><b>${r.respondidas}</b></div>
    <div class="tema"><span>Não respondidas</span><b>${r.total_questoes - r.respondidas}</b></div>
    <div class="tema"><span>Acertos (objetivas)</span><b>${r.acertos}</b></div>
    <div class="tema"><span>Erros (objetivas)</span><b>${r.erros}</b></div>
    <div class="tema"><span>Discursivas (correção manual)</span><b>${r.total_discursivas || 0}</b></div>
    <div class="tema"><span>Tempo utilizado</span><b>${fmt(r.tempo_gasto_segundos)}</b></div></div>
    <div class="card"><h3>DESEMPENHO POR TEMA</h3>${temas}</div>
    <h3>REVISAR QUESTÕES</h3>${revHtml}`;
}

/* ---------- Registro de eventos: cópia/cola, saída da página ---------- */
// Dissuasão e registro, NÃO segurança absoluta. Nunca finaliza a prova nem acusa o aluno.
const ativa = () => S.tid && !S.fim && !$("s-prova").classList.contains("hidden");
document.body.classList.add("noselect");
const bloq = (ev, tipo) => document.addEventListener(ev, e => { e.preventDefault(); if (ativa()) evento(tipo); });
bloq("copy", "copia"); bloq("cut", "recorte"); bloq("paste", "colagem"); bloq("contextmenu", "menu_contexto"); bloq("dragstart", "arrastar");
document.addEventListener("selectstart", e => { if (e.target.closest && e.target.closest("textarea,input")) return; e.preventDefault(); });
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && ["c", "x", "v", "a"].includes(e.key.toLowerCase())) {
    e.preventDefault(); if (ativa()) evento({ c: "copia", x: "recorte", v: "colagem", a: "selecao" }[e.key.toLowerCase()], "atalho");
  }
});
document.addEventListener("visibilitychange", () => {
  if (!ativa()) return;
  if (document.hidden) { saiu = true; evento("SAIDA_DETECTADA"); }
  else if (saiu) { saiu = false; evento("RETORNO_DETECTADO"); toast("Detectamos que você saiu da página da prova. Sua tentativa foi registrada e a prova continua normalmente."); }
});
window.addEventListener("pagehide", () => { if (ativa()) { salvarLocal(); } });

/* ---------- Inicialização ---------- */
(function init() {
  $("hTitulo").textContent = CONFIG.TITULO; $("hSub").textContent = CONFIG.SUBTITULO;
  if (!CONFIG.API_URL || !CONFIG.CODIGO_PROVA) { $("aviso").textContent = "Backend ainda não configurado: preencha API_URL e CODIGO_PROVA em config.js."; $("aviso").classList.remove("hidden"); }
  carregarLocal();
  if (S.tid && S.resultado) { mostrarResultado(); }
  else if (S.tid && !S.fim) { iniciarProva(); toast("Tentativa em andamento recuperada."); flush(); }
  else if (S.tid && S.fim) { finalizar(false); }
})();
