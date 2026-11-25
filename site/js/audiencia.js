(() => {
  const atlas = document.querySelector(".atlas");
  if (!atlas) return;
  const escalas = atlas.querySelectorAll("[data-escala]");
  const paineis = atlas.querySelectorAll("[data-painel]");
  function selecionar(painel, id) {
    painel.querySelectorAll("[data-registro]").forEach((registro) => {
      registro.hidden = registro.dataset.registro !== id;
    });
    painel
      .querySelectorAll("[data-regiao]")
      .forEach((botao) =>
        botao.setAttribute("aria-pressed", String(botao.dataset.regiao === id)),
      );
  }
  escalas.forEach((botao) =>
    botao.addEventListener("click", () => {
      escalas.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === botao)),
      );
      paineis.forEach((painel) => {
        painel.hidden = painel.dataset.painel !== botao.dataset.escala;
        if (!painel.hidden) selecionar(painel, "");
      });
    }),
  );
  paineis.forEach((painel) => {
    painel
      .querySelectorAll("[data-regiao]")
      .forEach((botao) =>
        botao.addEventListener("click", () =>
          selecionar(painel, botao.dataset.regiao),
        ),
      );
    painel.querySelectorAll("[data-posicao]").forEach((marcador) => {
      const posicao = marcador.dataset.posicao.split(",").map(Number);
      if (
        posicao.length !== 2 ||
        posicao.some((n) => !Number.isFinite(n) || n < 0 || n > 100)
      )
        return;
      marcador.style.left = posicao[0] + "%";
      marcador.style.top = posicao[1] + "%";
    });
  });
})();
