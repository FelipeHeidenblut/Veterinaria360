// A busca trabalha sobre os cartões já presentes no HTML e também funciona sem rede.
(() => {
  const acervo = document.querySelector(".archive");
  if (!acervo) return;
  const busca = acervo.querySelector("input[type=search]");
  const botoes = [...acervo.querySelectorAll("[data-tema]")];
  const normalizar = (valor) =>
    valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const cartoes = [
    ...acervo.querySelectorAll(".archive-grid .episode-card"),
  ].map((elemento) => ({
    elemento,
    texto: normalizar(elemento.dataset.busca || ""),
    temas: (elemento.dataset.temas || "").split(",").map((t) => t.trim()),
  }));
  let tema = "";
  function aplicar(atualizarEndereco = true) {
    const consulta = normalizar(busca.value).trim();
    let total = 0;
    for (const { elemento, texto, temas } of cartoes) {
      elemento.hidden =
        (!!tema && !temas.includes(tema)) || !texto.includes(consulta);
      if (!elemento.hidden) total += 1;
    }
    botoes.forEach((botao) =>
      botao.setAttribute("aria-pressed", String(botao.dataset.tema === tema)),
    );
    acervo.querySelector(".result-count").textContent =
      total +
      (total === 1 ? " episódio" : " episódios") +
      (tema ? " · " + tema : "");
    acervo.querySelector(".empty").hidden = total > 0;
    if (!atualizarEndereco) return;
    const endereco = new URL(location.href);
    for (const [nome, valor] of [
      ["q", busca.value],
      ["tema", tema],
    ]) {
      if (valor) endereco.searchParams.set(nome, valor);
      else endereco.searchParams.delete(nome);
    }
    try {
      history.replaceState(history.state, "", endereco.href);
    } catch {}
  }
  function lerEndereco() {
    const parametros = new URLSearchParams(location.search);
    busca.value = parametros.get("q") || "";
    tema = parametros.get("tema") || "";
    aplicar(false);
  }
  botoes.forEach((botao) =>
    botao.addEventListener("click", () => {
      tema = botao.dataset.tema;
      aplicar();
    }),
  );
  busca.addEventListener("input", () => aplicar());
  acervo.querySelector("[data-limpar]").addEventListener("click", () => {
    tema = "";
    busca.value = "";
    aplicar();
    busca.focus();
  });
  window.addEventListener("popstate", lerEndereco);
  lerEndereco();
})();
