// O servidor exige autenticação antes de entregar o acervo editável e a caixa de entrada.
(() => {
  const raiz = document.getElementById("redacao");
  if (!raiz || document.body.dataset.servidor !== "sim") return;
  const { fields, names } = window.VetCampos;
  const secoes = { ...names, mensagens: "Mensagens" };
  const ordenar = (a, b) =>
    (b.date || "").localeCompare(a.date || "") ||
    a.title.localeCompare(b.title, "pt-BR");
  const slug = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96);
  let registros = [],
    mensagens = [],
    secao = "episodio",
    editando = null,
    alterado = false,
    ocupado = false;
  function el(tipo, texto, classe) {
    const no = document.createElement(tipo);
    if (texto !== undefined && texto !== null) no.textContent = texto;
    if (classe) no.className = classe;
    return no;
  }
  function botao(texto, acao, classe) {
    const b = el("button", texto, classe);
    b.type = "button";
    b.addEventListener("click", acao);
    return b;
  }
  const editor = el("div", null, "editor");
  const nav = el("nav", null, "editor-nav");
  nav.setAttribute("aria-label", "Seções da redação");
  const painel = el("div", null, "editor-panel");
  const aviso = el("p");
  aviso.setAttribute("role", "status");
  aviso.hidden = true;
  const conteudo = el("div");
  painel.append(aviso, conteudo);
  editor.append(nav, painel);
  raiz.replaceChildren(editor);
  function informar(texto, erro = false) {
    aviso.className = erro ? "form-error" : "notice";
    aviso.setAttribute("role", erro ? "alert" : "status");
    aviso.textContent = texto || "";
    aviso.hidden = !texto;
  }
  function podeSair() {
    return (
      !ocupado &&
      (!alterado || window.confirm("Descartar as alterações desta edição?"))
    );
  }
  window.addEventListener("beforeunload", (evento) => {
    if (alterado) {
      evento.preventDefault();
      evento.returnValue = "";
    }
  });
  async function json(url, opcoes = {}) {
    const r = await fetch(url, { cache: "no-store", ...opcoes });
    if (r.status === 401)
      throw Error("Sessão encerrada. Atualize a página e entre novamente.");
    const j = await r.json();
    if (!r.ok) throw Error(j.error || "Não foi possível concluir o pedido.");
    return j;
  }
  for (const [id, nome] of Object.entries(secoes)) {
    const b = botao(nome, () => {
      if (!podeSair()) return;
      secao = id;
      editando = null;
      alterado = false;
      informar("");
      lista();
    });
    b.dataset.secao = id;
    nav.append(b);
  }
  const backup = el("a", "Baixar cópia do acervo", "backup-link");
  backup.href = "./api/editorial?exportar=1";
  backup.download = "veterinaria360-acervo.json";
  nav.append(backup);
  async function recarregar() {
    if (ocupado) return;
    ocupado = true;
    informar("Carregando a redação…");
    try {
      const dados = await json("./api/editorial");
      registros = dados.entries;
      mensagens = dados.messages;
      informar("");
      lista();
    } catch (erro) {
      informar(erro.message, true);
      conteudo.replaceChildren(
        botao("Tentar novamente", recarregar, "line-link"),
      );
    } finally {
      ocupado = false;
    }
  }
  function lista() {
    conteudo.replaceChildren();
    nav
      .querySelectorAll("[data-secao]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.secao === secao)),
      );
    const topo = el("div", null, "editor-top");
    topo.append(
      el("h2", secao === "mensagens" ? "Mensagens recebidas" : names[secao]),
    );
    conteudo.append(topo);
    if (secao === "mensagens") {
      topo.append(botao("Atualizar", recarregar, "line-link"));
      if (!mensagens.length)
        conteudo.append(el("p", "Nenhuma mensagem recebida."));
      for (const m of mensagens) {
        const linha = el("article", null, "lead");
        const contato = el("a", m.email);
        contato.href = "mailto:" + encodeURIComponent(m.email);
        linha.append(
          el("small", new Date(m.created).toLocaleString("pt-BR")),
          el("h3", m.subject),
          el("strong", m.name),
          document.createTextNode(" · "),
          contato,
          el("p", m.message, "lead-message"),
        );
        conteudo.append(linha);
      }
      return;
    }
    if (!["pagina", "ajustes"].includes(secao))
      topo.append(botao("Adicionar", () => abrir(), "btn btn-ink"));
    const itens = registros.filter((e) => e.kind === secao).sort(ordenar);
    if (!itens.length)
      conteudo.append(
        el("p", "Use Adicionar para cadastrar o primeiro registro."),
      );
    for (const item of itens) {
      const linha = botao("", () => abrir(item), "editor-item"),
        nomes = el("span");
      const agendado =
        item.status === "publicado" &&
        item.publishAt &&
        Date.parse(item.publishAt) > Date.now();
      nomes.append(
        el("strong", item.title),
        el(
          "small",
          [item.date, agendado ? "agendado" : item.status]
            .filter(Boolean)
            .join(" · "),
        ),
      );
      linha.append(nomes, el("span", "Editar"));
      conteudo.append(linha);
    }
  }
  function horaLocal(iso) {
    if (!iso) return "";
    const data = new Date(iso);
    return new Date(data.getTime() - data.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  function abrir(item) {
    if (!podeSair()) return;
    editando = item
      ? { ...item, publishAt: horaLocal(item.publishAt) }
      : {
          id: "",
          kind: secao,
          rev: 0,
          date: new Date().toISOString().slice(0, 10),
          status: "rascunho",
          scope: "Mundo",
          context: "Na Estrada",
        };
    alterado = false;
    informar("");
    desenharFormulario();
  }
  function elementoCampo(campo) {
    if (campo.type === "area") return el("textarea");
    if (campo.type === "select" || campo.type === "status") {
      const lista = el("select");
      if (!campo.required && campo.type !== "status") {
        const opt = el("option", "Selecione");
        opt.value = "";
        lista.append(opt);
      }
      const opcoes =
        campo.type === "status" ? ["rascunho", "publicado"] : campo.choices;
      for (const valor of opcoes || []) {
        const opt = el("option", valor);
        opt.value = valor;
        lista.append(opt);
      }
      return lista;
    }
    const input = el("input");
    input.type = ["date", "datetime-local", "email", "url"].includes(campo.type)
      ? campo.type
      : "text";
    return input;
  }
  function urlDeImagem(valor) {
    if (/^\/(imagens|midia)\/[\w.-]+$/.test(valor)) return "." + valor;
    try {
      const url = new URL(valor);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }
  function comUpload(bloco, input, campo) {
    bloco.className = "upload-control";
    const rotulo = el(
        "label",
        "Enviar JPEG, PNG ou WebP (até 6 MB)",
        "upload-file",
      ),
      arquivo = el("input");
    arquivo.type = "file";
    arquivo.accept = "image/jpeg,image/png,image/webp";
    rotulo.append(arquivo);
    const foto = el("img", null, "upload-preview");
    foto.alt = "Prévia da imagem";
    function atualizar() {
      const url = urlDeImagem(input.value);
      foto.hidden = !url;
      if (url) foto.src = url;
      else foto.removeAttribute("src");
    }
    input.addEventListener("input", atualizar);
    atualizar();
    arquivo.addEventListener("change", async () => {
      const selecionado = arquivo.files[0];
      if (!selecionado || ocupado) return;
      if (selecionado.size > 6000000) {
        informar("Use uma imagem de até 6 MB.", true);
        arquivo.value = "";
        return;
      }
      const form = input.form;
      ocupado = true;
      form.querySelector('[type="submit"]').disabled = true;
      try {
        const resultado = await json("./api/fotos", {
          method: "POST",
          headers: { "Content-Type": selecionado.type },
          body: selecionado,
        });
        input.value = resultado.url;
        editando[campo.key] = resultado.url;
        alterado = true;
        atualizar();
        informar("Imagem carregada. Salve o registro para usá-la.");
      } catch (erro) {
        informar(erro.message, true);
      } finally {
        ocupado = false;
        arquivo.value = "";
        form.querySelector('[type="submit"]').disabled = false;
      }
    });
    bloco.append(rotulo, foto);
  }
  function comMapa(bloco, input, form) {
    bloco.className = "editor-map";
    const mapa = el("div", null, "map-canvas"),
      foto = el("img"),
      ponto = el("i", null, "map-marker");
    mapa.append(foto, ponto);
    bloco.append(
      el(
        "p",
        "Clique no mapa ou informe as porcentagens horizontal e vertical.",
      ),
      mapa,
    );
    input.placeholder = "50,50";
    function atualizar() {
      const escala = form.elements.scope?.value || "Mundo";
      foto.src =
        "./mapas/" +
        ({ Brasil: "brasil", "São Paulo": "sao-paulo" }[escala] || "mundo") +
        ".svg";
      foto.alt = "Mapa de " + escala;
      const [x, y] = input.value.split(",").map(Number);
      ponto.hidden = !(
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 0 &&
        x <= 100 &&
        y >= 0 &&
        y <= 100
      );
      if (!ponto.hidden) {
        ponto.style.left = x + "%";
        ponto.style.top = y + "%";
      }
    }
    form.elements.scope?.addEventListener("change", atualizar);
    input.addEventListener("input", atualizar);
    atualizar();
    mapa.addEventListener("click", (evento) => {
      const b = mapa.getBoundingClientRect();
      if (!b.width || !b.height) return;
      input.value = [
        (evento.clientX - b.left) / b.width,
        (evento.clientY - b.top) / b.height,
      ]
        .map((v) => Math.max(0, Math.min(100, v * 100)).toFixed(2))
        .join(",");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  function desenharFormulario() {
    const form = el("form", null, "edit-form"),
      topo = el("div", null, "editor-top");
    topo.append(
      el("h2", editando.id ? "Editar registro" : "Novo registro"),
      botao(
        "Voltar",
        () => {
          if (!podeSair()) return;
          editando = null;
          alterado = false;
          informar("");
          lista();
        },
        "line-link",
      ),
    );
    form.append(topo);
    conteudo.replaceChildren(form);
    for (const campo of fields[secao]) {
      const bloco = el("div"),
        input = elementoCampo(campo),
        nome = "ed-" + campo.key;
      const label = el("label", campo.label);
      label.htmlFor = nome;
      input.name = campo.key;
      input.id = nome;
      input.required = !!campo.required;
      input.value = editando[campo.key] || "";
      if (campo.key === "slug" && editando.id) input.readOnly = true;
      if (input.tagName === "TEXTAREA") {
        input.rows = campo.key === "body" ? 7 : 4;
        input.maxLength = 12000;
      } else if (input.type === "text") input.maxLength = 1600;
      label.append(input);
      if (campo.type === "map" || campo.type === "image") {
        bloco.append(label);
        form.append(bloco);
      } else form.append(label);
      input.addEventListener("input", () => {
        if (
          campo.key === "title" &&
          secao === "episodio" &&
          !editando.id &&
          (!editando.slug || editando.slug === slug(editando.title || ""))
        ) {
          editando.slug = slug(input.value);
          if (form.elements.slug) form.elements.slug.value = editando.slug;
        }
        editando[campo.key] = input.value;
        alterado = true;
      });
      if (campo.type === "map") comMapa(bloco, input, form);
      if (campo.type === "image") comUpload(bloco, input, campo);
    }
    const acoes = el("div", null, "edit-actions"),
      salvar = el("button", "Salvar alterações", "btn btn-ink");
    salvar.type = "submit";
    acoes.append(salvar);
    form.append(acoes);
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      if (ocupado || !form.reportValidity()) return;
      ocupado = true;
      salvar.disabled = true;
      informar("");
      try {
        const dados = {
          ...editando,
          ...Object.fromEntries(new FormData(form)),
        };
        if (!dados.id) {
          dados.id =
            secao === "episodio"
              ? slug(dados.slug || dados.title)
              : secao + "-" + crypto.randomUUID();
          if (registros.some((r) => r.id === dados.id))
            throw Error("Este endereço já existe. Escolha outro.");
        }
        if (dados.publishAt)
          dados.publishAt = new Date(dados.publishAt).toISOString();
        const { entry } = await json("./api/editorial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        registros = [...registros.filter((r) => r.id !== entry.id), entry];
        editando = null;
        alterado = false;
        lista();
        informar("Alterações salvas.");
      } catch (erro) {
        informar(erro.message, true);
      } finally {
        ocupado = false;
        salvar.disabled = false;
      }
    });
  }
  recarregar();
})();
