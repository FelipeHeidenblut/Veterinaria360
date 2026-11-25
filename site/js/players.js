// Os players externos só são carregados depois de o visitante escolher reproduzir.
(() => {
  function criarPlayer(modo, id, titulo) {
    const spotify = modo === "spotify";
    if (!(spotify ? /^[A-Za-z0-9]{22}$/ : /^[\w-]{11}$/).test(id)) return null;
    const frame = document.createElement("iframe");
    frame.src = spotify
      ? "https://open.spotify.com/embed/episode/" + id + "?theme=0"
      : "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = (spotify ? "Áudio de " : "Vídeo de ") + titulo;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    return frame;
  }
  const abrir = document.querySelector("[data-abrir-destaque]");
  const dialogo = document.getElementById("video-destaque");
  if (abrir && dialogo) {
    const palco = dialogo.querySelector("[data-video-destaque]");
    let overflowAnterior = "";
    abrir.addEventListener("click", () => {
      const frame = criarPlayer(
        "youtube",
        dialogo.dataset.youtube,
        document.getElementById("destaque-titulo").textContent,
      );
      if (frame) palco.replaceChildren(frame);
      dialogo.showModal();
      overflowAnterior = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialogo.querySelector("[data-fechar]").focus();
    });
    dialogo
      .querySelector("[data-fechar]")
      .addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo) dialogo.close();
    });
    dialogo.addEventListener("close", () => {
      palco.replaceChildren();
      document.body.style.overflow = overflowAnterior;
      abrir.focus();
    });
  }
  document.querySelectorAll(".player-box").forEach((caixa) => {
    const palco = caixa.querySelector(".stage");
    const capa = caixa.querySelector(".player-poster");
    const link = caixa.querySelector(".source-link");
    const botoes = caixa.querySelectorAll("[data-modo]");
    let modo = "youtube";
    capa.addEventListener("click", () => {
      const frame = criarPlayer(
        modo,
        caixa.dataset[modo],
        caixa.dataset.titulo,
      );
      if (!frame) return;
      palco.replaceChildren(frame);
      palco.classList.toggle("spotify-stage", modo === "spotify");
    });
    botoes.forEach((botao) =>
      botao.addEventListener("click", () => {
        if (modo === botao.dataset.modo) return;
        modo = botao.dataset.modo;
        palco.replaceChildren(capa);
        palco.classList.remove("spotify-stage");
        const spotify = modo === "spotify";
        capa.querySelector(".player-hint").textContent = spotify
          ? "Ouvir episódio"
          : "Assistir ao episódio";
        link.href = spotify
          ? "https://open.spotify.com/episode/" + caixa.dataset.spotify
          : "https://www.youtube.com/watch?v=" + caixa.dataset.youtube;
        link.textContent = spotify ? "Abrir no Spotify" : "Abrir no YouTube";
        botoes.forEach((b) =>
          b.setAttribute("aria-pressed", String(b === botao)),
        );
      }),
    );
  });
})();
