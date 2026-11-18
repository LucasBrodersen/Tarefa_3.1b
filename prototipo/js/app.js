// app.js - logica do prototipo
import {
  carregar, guardar, repor, proximoId, diasDesde, formatarData, euros,
  MODALIDADES, VALIDADE_REVISAO_DIAS, autenticado, entrar, sair
} from "./dados.js";

const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

// prevenir XSS nos templates
function esc(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}
const params = new URLSearchParams(location.search);

let bd = carregar();
const animal = (id) => bd.animais.find((a) => a.id === id);
const nomesAnimais = (ids) => ids.map((id) => animal(id)?.nome).filter(Boolean);
const chips = (ids) => `<span class="chips">${nomesAnimais(ids).map((n) => `<span class="chip">${esc(n)}</span>`).join("") || "—"}</span>`;

// verificar login
const pagina = document.body.dataset.pagina;
if (pagina !== "login" && pagina !== "ficha-animal" && !autenticado()) {
  location.replace("login.html?voltar=" + encodeURIComponent(location.pathname.split("/").pop() + location.search));
}
$$("[data-acao=sair]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); sair(); location.href = "login.html"; }));
$$("[data-acao=repor]").forEach((b) => b.addEventListener("click", () => { repor(); location.reload(); }));

// dialogos
function mostrarDetalhe(titulo, linhas) {
  const d = $("#dialogo-ver");
  $("h2", d).textContent = titulo;
  $("dl", d).innerHTML = linhas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("");
  d.showModal();
}
function confirmarRemocao(texto) {
  const d = $("#dialogo-remover");
  $("p", d).textContent = texto;
  d.returnValue = "";
  d.showModal();
  return new Promise((res) => d.addEventListener("close", () => res(d.returnValue === "sim"), { once: true }));
}
$$("dialog [data-fechar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));

// ver estado de revisao do animal
function estadoRevisao(animalId) {
  let revisores = bd.especialistas.filter((e) => e.ativo && e.animais.includes(animalId));
  const datas = revisores.map((e) => ({ e, data: e.revisoes[animalId] })).filter((x) => x.data);
  if (!revisores.length) return { tipo: "sem", texto: "Sem especialista" };
  if (!datas.length) return { tipo: "atraso", texto: "Por validar", revisores };
  const recente = datas.sort((a, b) => b.data.localeCompare(a.data))[0];
  const atrasada = diasDesde(recente.data) > VALIDADE_REVISAO_DIAS;
  return { tipo: atrasada ? "atraso" : "ok", texto: (atrasada ? "Revisão expirada · " : "Validada · ") + formatarData(recente.data), revisor: recente.e, revisores };
}


const paginas = {
  login() {
    $("#form-login").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.utilizador.value.trim() === "admin" && f.password.value === "animalec") {
        // console.log("login ok", f.utilizador.value);
        entrar();
        location.href = params.get("voltar") || "admin.html";
      } else {
        $("#erro-login").textContent = "Utilizador ou password incorretos. (Demo: admin / animalec)";
      }
    });
  },

  painel() {
    const ativosP = bd.patrocinadores.filter((p) => p.ativo);
    $("#n-patrocinadores").textContent = ativosP.length;
    $("#n-especialistas").textContent = bd.especialistas.filter((e) => e.ativo).length;
    $("#n-animais").textContent = bd.animais.length;
    $("#n-utilizadores").textContent = bd.outros.utilizadores;
    $("#n-quizzes").textContent = bd.outros.quizzes;
    $("#n-questoes").textContent = bd.outros.questoes;

    const alertas = [];
    const semApoio = bd.animais.filter((a) => !ativosP.some((p) => p.animais.includes(a.id)));
    if (semApoio.length) alertas.push(`${semApoio.length} animais sem patrocinador ativo (ex.: ${esc(semApoio.slice(0, 3).map((a) => a.nome).join(", "))}).`);
    const porValidar = bd.animais.filter((a) => estadoRevisao(a.id).tipo !== "ok");
    if (porValidar.length) alertas.push(`${porValidar.length} fichas de animais sem validação científica em dia. <a href="animais.html?filtro=validacao">Ver lista</a>`);
    const aTerminar = ativosP.filter((p) => p.fim && diasDesde(p.fim) > -45 && diasDesde(p.fim) <= 0);
    aTerminar.forEach((p) => alertas.push(`O apoio de <strong>${esc(p.nome)}</strong> termina a ${formatarData(p.fim)}.`));
    $("#lista-alertas").innerHTML = alertas.map((a) => `<li>${a}</li>`).join("") || "<li>Sem alertas.</li>";
  },

  // ---------------- PATROCINADORES ----------------
  "lista-patrocinadores"() {
    const corpo = $("#tabela tbody");
    const f = $("#filtros");
    function desenhar() {
      const q = f.pesquisa.value.trim().toLowerCase();
      const mod = f.modalidade.value;
      const estado = f.estado.value;
      const lista = bd.patrocinadores
        .filter((p) => !q || p.nome.toLowerCase().includes(q) || nomesAnimais(p.animais).join(" ").includes(q))
        .filter((p) => !mod || p.modalidade === mod)
        .filter((p) => !estado || (estado === "ativo") === p.ativo)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
      // console.log("patrocinadores filtrados:", lista.length);
      corpo.innerHTML = lista.map((p) => `
        <tr>
          <td data-rotulo="Nome"><div><strong>${esc(p.nome)}</strong><br><small>${esc(p.tipo)}</small></div></td>
          <td data-rotulo="Modalidade"><div><span class="selo ${p.modalidade}">${esc(MODALIDADES[p.modalidade])}</span></div></td>
          <td data-rotulo="Animais"><div>${chips(p.animais)}</div></td>
          <td data-rotulo="Valor/ano"><div>${euros(p.valorAnual)}</div></td>
          <td data-rotulo="Período"><div><time datetime="${p.inicio}">${formatarData(p.inicio)}</time> – <time datetime="${p.fim}">${formatarData(p.fim)}</time></div></td>
          <td data-rotulo="Estado"><div>${p.ativo ? '<span class="selo ok">Ativo</span>' : '<span class="selo inativo">Inativo</span>'}</div></td>
          <td class="acoes">
            <a class="botao" href="patrocinador.html?id=${p.id}">Editar</a>
            <button class="botao" type="button" data-ver="${p.id}">Ver</button>
            <button class="botao perigo" type="button" data-remover="${p.id}">Remover</button>
          </td>
        </tr>`).join("") || `<tr><td colspan="7" class="vazio">Nenhum patrocinador corresponde aos filtros.</td></tr>`;
      const total = lista.filter((p) => p.ativo).reduce((s, p) => s + Number(p.valorAnual || 0), 0);
      $("#total").value = `${lista.length} patrocinador(es) · apoio ativo: ${euros(total)}/ano`;
    }
    f.addEventListener("input", desenhar);
    corpo.addEventListener("click", async (e) => {
      const ver = e.target.closest("[data-ver]");
      const rem = e.target.closest("[data-remover]");
      if (ver) {
        const p = bd.patrocinadores.find((x) => x.id === +ver.dataset.ver);
        mostrarDetalhe(p.nome, [
          ["Tipo", esc(p.tipo)], ["Modalidade", esc(MODALIDADES[p.modalidade])], ["Valor anual", euros(p.valorAnual)],
          ["Período", `${formatarData(p.inicio)} – ${formatarData(p.fim)}`], ["Animais", chips(p.animais)],
          ["Contacto", `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`],
          ["Website", p.website ? `<a href="${esc(p.website)}" target="_blank" rel="noopener">${esc(p.website)}</a>` : "—"],
          ["Visível na app", p.mostrarNaApp ? "Sim, na ficha dos animais" : "Não"], ["Notas", esc(p.notas) || "—"]
        ]);
      }
      if (rem) {
        const p = bd.patrocinadores.find((x) => x.id === +rem.dataset.remover);
        if (await confirmarRemocao(`Remover o patrocinador "${p.nome}"? Os animais deixam de mostrar este apoio.`)) {
          bd.patrocinadores = bd.patrocinadores.filter((x) => x.id !== p.id);
          guardar(bd); desenhar();
        }
      }
    });
    desenhar();
  },

  "form-patrocinador"() {
    const f = $("#form");
    const id = +params.get("id") || null;
    const p = id ? bd.patrocinadores.find((x) => x.id === id) : null;
    $("#lista-animais").innerHTML = bd.animais.map((a) => `
      <label><input type="checkbox" name="animais" value="${a.id}"> ${esc(a.nome)} <span class="grupo">(${esc(a.grupo)})</span></label>`).join("");
    if (p) {
      document.title = "Editar patrocinador · Animalec";
      $("#titulo").textContent = "Editar patrocinador";
      $("#migalha-atual").textContent = "Editar";
      for (const k of ["nome", "tipo", "email", "website", "modalidade", "valorAnual", "inicio", "fim", "notas"]) f[k].value = p[k] ?? "";
      f.mostrarNaApp.checked = p.mostrarNaApp; f.ativo.checked = p.ativo;
      $$("input[name=animais]", f).forEach((c) => (c.checked = p.animais.includes(+c.value)));
    }
    // Um donativo pontual tem só uma data: o fim acompanha o início.
    const ajustarModalidade = () => {
      const pontual = f.modalidade.value === "donativo";
      $("#campo-fim").hidden = pontual;
      f.fim.required = !pontual;
      $("#rotulo-valor").textContent = pontual ? "Valor do donativo (€)" : "Valor anual (€)";
    };
    f.modalidade.addEventListener("change", ajustarModalidade);
    ajustarModalidade();

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const erro = $("#erro");
      const animais = $$("input[name=animais]:checked", f).map((c) => +c.value);
      if (f.modalidade.value === "donativo") f.fim.value = f.inicio.value;
      if (f.fim.value && f.fim.value < f.inicio.value) { erro.textContent = "A data de fim não pode ser anterior à de início."; f.fim.focus(); return; }
      if (f.modalidade.value !== "donativo" && !animais.length) { erro.textContent = "Escolha pelo menos um animal apoiado."; return; }
      const dados = {
        nome: f.nome.value.trim(), tipo: f.tipo.value, email: f.email.value.trim(), website: f.website.value.trim(),
        modalidade: f.modalidade.value, valorAnual: Number(f.valorAnual.value), inicio: f.inicio.value, fim: f.fim.value,
        animais, mostrarNaApp: f.mostrarNaApp.checked, ativo: f.ativo.checked, notas: f.notas.value.trim()
      };
      if (p) Object.assign(p, dados); else bd.patrocinadores.push({ id: proximoId(bd.patrocinadores), ...dados });
      guardar(bd);
      location.href = "patrocinadores.html";
    });
  },

  // ---------------- ESPECIALISTAS ----------------
  "lista-especialistas"() {
    const corpo = $("#tabela tbody");
    const f = $("#filtros");
    const desenhar = () => {
      const q = f.pesquisa.value.trim().toLowerCase();
      const g = f.especialidade.value;
      const lista = bd.especialistas
        .filter((e) => !q || (e.nome + " " + e.instituicao).toLowerCase().includes(q))
        .filter((e) => !g || e.especialidade === g)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
      corpo.innerHTML = lista.map((e) => {
        const pend = e.animais.filter((id) => diasDesde(e.revisoes[id]) > VALIDADE_REVISAO_DIAS).length;
        return `
        <tr>
          <td data-rotulo="Nome"><div><strong>${esc(e.titulo)} ${esc(e.nome)}</strong><br><small>${esc(e.instituicao)}</small></div></td>
          <td data-rotulo="Especialidade"><div>${esc(e.especialidade)}</div></td>
          <td data-rotulo="Acompanha"><div>${chips(e.animais)}</div></td>
          <td data-rotulo="Revisões"><div>${pend ? `<span class="selo atraso">${pend} por rever</span>` : '<span class="selo ok">Em dia</span>'}</div></td>
          <td data-rotulo="Quizzes"><div>${e.validaQuizzes ? "Valida" : "—"}</div></td>
          <td class="acoes">
            <a class="botao" href="especialista.html?id=${e.id}">Editar</a>
            <button class="botao" type="button" data-ver="${e.id}">Ver</button>
            <button class="botao perigo" type="button" data-remover="${e.id}">Remover</button>
          </td>
        </tr>`;
      }).join("") || `<tr><td colspan="6" class="vazio">Nenhum especialista corresponde aos filtros.</td></tr>`;
      $("#total").value = `${lista.length} especialista(s)`;
    };
    f.addEventListener("input", desenhar);
    corpo.addEventListener("click", async (ev) => {
      const ver = ev.target.closest("[data-ver]");
      const rem = ev.target.closest("[data-remover]");
      if (ver) {
        const e = bd.especialistas.find((x) => x.id === +ver.dataset.ver);
        const revisoes = e.animais.map((id) => `${esc(animal(id)?.nome)}: ${formatarData(e.revisoes[id])}`).join("<br>");
        mostrarDetalhe(`${e.titulo} ${e.nome}`, [
          ["Instituição", esc(e.instituicao)], ["Especialidade", esc(e.especialidade)],
          ["ORCID", e.orcid ? `<a href="https://orcid.org/${esc(e.orcid)}" target="_blank" rel="noopener">${esc(e.orcid)}</a>` : "—"],
          ["Contacto", `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>`],
          ["Última revisão", revisoes || "—"], ["Valida quizzes", e.validaQuizzes ? "Sim" : "Não"], ["Nota", esc(e.bio) || "—"]
        ]);
      }
      if (rem) {
        const e = bd.especialistas.find((x) => x.id === +rem.dataset.remover);
        if (await confirmarRemocao(`Remover ${e.nome}? As fichas que acompanha ficam sem validação científica.`)) {
          bd.especialistas = bd.especialistas.filter((x) => x.id !== e.id);
          guardar(bd); desenhar();
        }
      }
    });
    desenhar();
  },

  "form-especialista"() {
    const f = $("#form");
    const id = +params.get("id") || null;
    const e = id ? bd.especialistas.find((x) => x.id === id) : null;
    // A lista de animais filtra-se pela especialidade, mas pode alargar-se a todos.
    const desenharAnimais = () => {
      const marcados = new Set($$("input[name=animais]:checked", f).map((c) => +c.value).concat(e && !f.dataset.pronto ? e.animais : []));
      const todos = f.todos.checked;
      const lista = bd.animais.filter((a) => todos || a.grupo === f.especialidade.value || marcados.has(a.id));
      $("#lista-animais").innerHTML = lista.map((a) => `
        <label><input type="checkbox" name="animais" value="${a.id}" ${marcados.has(a.id) ? "checked" : ""}>
        ${esc(a.nome)} <span class="grupo">(${esc(a.grupo)})</span></label>`).join("") || "<p>Não há animais deste grupo.</p>";
      f.dataset.pronto = "1";
    };
    if (e) {
      document.title = "Editar especialista · Animalec";
      $("#titulo").textContent = "Editar especialista";
      $("#migalha-atual").textContent = "Editar";
      for (const k of ["nome", "titulo", "instituicao", "especialidade", "email", "orcid", "bio"]) f[k].value = e[k] ?? "";
      f.validaQuizzes.checked = e.validaQuizzes; f.ativo.checked = e.ativo;
    }
    f.especialidade.addEventListener("change", desenharAnimais);
    f.todos.addEventListener("change", desenharAnimais);
    desenharAnimais();

    f.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const animais = $$("input[name=animais]:checked", f).map((c) => +c.value);
      if (!animais.length) { $("#erro").textContent = "Associe pelo menos um animal que este especialista acompanha."; return; }
      const dados = {
        nome: f.nome.value.trim(), titulo: f.titulo.value, instituicao: f.instituicao.value.trim(),
        especialidade: f.especialidade.value, email: f.email.value.trim(), orcid: f.orcid.value.trim(),
        animais, validaQuizzes: f.validaQuizzes.checked, ativo: f.ativo.checked, bio: f.bio.value.trim()
      };
      // data de hoje se marcou validacao
      const hoje = new Date().toISOString().slice(0, 10);
      const revisoes = { ...(e?.revisoes || {}) };
      if (f.validadoHoje.checked) animais.forEach((a) => (revisoes[a] = hoje));
      if (e) Object.assign(e, dados, { revisoes }); else bd.especialistas.push({ id: proximoId(bd.especialistas), ...dados, revisoes });
      guardar(bd);
      location.href = "especialistas.html";
    });
  },

  // ---------------- ANIMAIS (bloco existente, agora com as novas entidades) ----------------
  "lista-animais"() {
    const corpo = $("#tabela tbody");
    const soValidacao = params.get("filtro") === "validacao";
    if (soValidacao) $("#aviso-filtro").hidden = false;
    const lista = bd.animais.filter((a) => !soValidacao || estadoRevisao(a.id).tipo !== "ok");
    corpo.innerHTML = lista.map((a) => {
      const apoios = bd.patrocinadores.filter((p) => p.ativo && p.animais.includes(a.id));
      const rev = estadoRevisao(a.id);
      return `
      <tr>
        <td data-rotulo="Nome"><div><strong>${esc(a.nome)}</strong></div></td>
        <td data-rotulo="Grupo"><div>${esc(a.grupo)}</div></td>
        <td data-rotulo="Nível"><div>${a.nivel}</div></td>
        <td data-rotulo="Patrocínio"><div>${apoios.length ? apoios.map((p) => `<span class="chip">${esc(p.nome)}</span>`).join(" ") : "—"}</div></td>
        <td data-rotulo="Validação"><div><span class="selo ${rev.tipo === "ok" ? "ok" : rev.tipo === "sem" ? "inativo" : "atraso"}">${esc(rev.texto)}</span>${rev.revisor ? `<br><small>${esc(rev.revisor.nome)}</small>` : ""}</div></td>
        <td class="acoes">
          <a class="botao" href="animal.html?id=${a.id}">Ficha pública</a>
        </td>
      </tr>`;
    }).join("");
  },

  "ficha-animal"() {
    const a = animal(+params.get("id") || 5) || bd.animais[0];
    document.title = `${a.nome} · Animalec`;
    $("#nome").textContent = a.nome;
    $("#grupo").textContent = `${a.grupo} · nível ${a.nivel}`;
    $("#descricao").textContent = a.descricao;
    const rev = estadoRevisao(a.id);
    $("#validacao").innerHTML = rev.revisor
      ? `<span>Conteúdo revisto por <strong>${esc(rev.revisor.titulo)} ${esc(rev.revisor.nome)}</strong> (${esc(rev.revisor.instituicao)}) em <time datetime="${rev.revisor.revisoes[a.id]}">${formatarData(rev.revisor.revisoes[a.id])}</time>.</span>`
      : `<span>Esta ficha ainda aguarda revisão de um especialista.</span>`;
    const apoios = bd.patrocinadores.filter((p) => p.ativo && p.mostrarNaApp && p.animais.includes(a.id));
    $("#apoios").innerHTML = apoios.length
      ? apoios.map((p) => `<p class="apoio"><span class="logo" aria-hidden="true">${esc(p.nome.slice(0, 2).toUpperCase())}</span><span>${esc(p.nome)}<br><small>${esc(MODALIDADES[p.modalidade])}</small></span></p>`).join("")
      : "<p>Ainda sem padrinhos. <a href=\"#\">Quer apoiar este animal?</a></p>";
  }
};

paginas[pagina]?.();
