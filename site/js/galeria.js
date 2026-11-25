(() => {
  const trilho = document.getElementById("fotos-do-podcast");
  const controles = document.querySelector(".galeria-controles");
  if (!trilho || !controles) return;
  const [anterior, proxima] = controles.querySelectorAll("button");

  function atualizar() {
    const fim = trilho.scrollWidth - trilho.clientWidth;
    controles.hidden = fim <= 1;
    anterior.disabled = trilho.scrollLeft <= 1;
    proxima.disabled = trilho.scrollLeft >= fim - 1;
  }

  function avancar(direcao) {
    const [primeira, segunda] = trilho.children;
    const passo = segunda.offsetLeft - primeira.offsetLeft;
    trilho.scrollBy({ left: direcao * passo });
  }

  anterior.addEventListener("click", () => avancar(-1));
  proxima.addEventListener("click", () => avancar(1));
  trilho.addEventListener("scroll", atualizar, { passive: true });
  new ResizeObserver(atualizar).observe(trilho);
  atualizar();
})();
