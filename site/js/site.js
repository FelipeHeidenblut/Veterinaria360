// Menu e preferências de medição, compartilhados por todas as páginas.
(() => {
  const menu = document.getElementById("menu-principal");
  const gatilho = document.querySelector(".nav-trigger");
  function mostrarMenu(aberto) {
    menu.classList.toggle("open", aberto);
    gatilho.setAttribute("aria-expanded", String(aberto));
    gatilho.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    gatilho.querySelector("[data-icone-abrir]").hidden = aberto;
    gatilho.querySelector("[data-icone-fechar]").hidden = !aberto;
  }
  gatilho.addEventListener("click", () =>
    mostrarMenu(!menu.classList.contains("open")),
  );
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("open")) {
      mostrarMenu(false);
      gatilho.focus();
    }
  });
  window
    .matchMedia?.("(min-width: 791px)")
    .addEventListener("change", () => mostrarMenu(false));

  const chave = "vet360:medicao";
  const id = document.body.dataset.ga || "";
  const configurado = /^G-[A-Z0-9]{4,20}$/.test(id);
  const faixa = document.querySelector(".consent-strip");
  const caixa = document.getElementById("medicao-opt-in");
  let escolha = null;
  try {
    escolha = localStorage.getItem(chave);
  } catch {}
  function aplicar() {
    const permitido = escolha === "sim";
    if (caixa) caixa.checked = permitido;
    if (faixa) faixa.hidden = !configurado || escolha !== null;
    if (!configurado) return;
    window["ga-disable-" + id] = !permitido;
    if (!permitido || document.getElementById("vet-ga")) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { allow_google_signals: false });
    const script = document.createElement("script");
    script.id = "vet-ga";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.append(script);
  }
  function escolher(permitido) {
    escolha = permitido ? "sim" : "não";
    try {
      localStorage.setItem(chave, escolha);
    } catch {}
    aplicar();
  }
  caixa?.addEventListener("change", () => escolher(caixa.checked));
  faixa?.querySelectorAll("[data-medicao]").forEach((botao) => {
    botao.addEventListener("click", () =>
      escolher(botao.dataset.medicao === "sim"),
    );
  });
  window.addEventListener("storage", (evento) => {
    if (evento.key === chave) {
      escolha = evento.newValue;
      aplicar();
    }
  });
  document.addEventListener("click", (evento) => {
    const alvo = evento.target.closest?.("[data-track]");
    if (alvo && configurado && escolha === "sim")
      window.gtag?.("event", alvo.dataset.track);
  });
  aplicar();
})();
