import { elemento } from "./html.js";
import { SectionLabel } from "./blocos.js";
import { fotosDasPaginas } from "./fotografias.js";
import { fieldSeries } from "../modelo.js";

const secoes = {
  "o-podcast": ["Por trás do microfone", "mic"],
  episodios: ["Biblioteca audiovisual", "wave"],
  "na-estrada": ["Veterinária 360° em campo", "compass"],
  "na-midia": ["Sala de imprensa", "broadcast"],
  audiencia: ["Presença e alcance", "globe"],
  contato: ["Contato e parcerias", "chat"],
  privacidade: ["Informação ao visitante", "book"],
  creditos: ["Expediente", "book"],
  redacao: ["Área da produção", "mic"],
  "404": ["Navegação", "compass"],
};

export function Hero({ foto, variante, section, icon, title, summary, mobile, children, localizador }) {
  const ponto = !/[?!…]$/.test(title);
  return elemento(
    "section",
    { className: "page-hero hero-" + variante, "aria-labelledby": "hero-title" },
    elemento(
      "picture",
      null,
      mobile && elemento("source", { media: "(max-width:600px)", srcSet: mobile }),
      elemento("img", { src: foto.src, alt: foto.alt, fetchPriority: "high" }),
    ),
    elemento(
      "div",
      { className: "wrap hero-inner" },
      elemento(
        "div",
        { className: "page-heading" },
        elemento(SectionLabel, { icon }, section),
        elemento(
          "h1",
          { id: "hero-title" },
          title.replace(/\.$/, ""),
          ponto && elemento("span", { className: "heading-stop", "aria-hidden": "true" }, "."),
        ),
        summary && elemento("p", null, summary),
        children,
      ),
      localizador,
    ),
  );
}

export function heroInterno(pagina, p, episodio, titulo) {
  if (episodio) {
    const campo = fieldSeries(episodio);
    return Hero({
      variante: "episodio",
      foto: campo ? fotosDasPaginas["na-estrada"] : fotosDasPaginas["o-podcast"],
      section: episodio.num ? "Episódio " + episodio.num : campo ? "Veterinária 360° Na Estrada" : "Entrevista",
      icon: campo ? "compass" : "mic",
      title: episodio.title,
      summary: [episodio.guest, episodio.role].filter(Boolean).join(" · "),
    });
  }
  const [section, icon] = secoes[pagina] || secoes["404"];
  return Hero({
    variante: secoes[pagina] ? pagina : "404",
    foto: p?.image ? { src: p.image, alt: "" } : fotosDasPaginas[pagina] || fotosDasPaginas.contato,
    section,
    icon,
    title: p?.title || titulo,
    summary: p?.summary || (!secoes[pagina] || pagina === "404"
      ? "Este endereço pode ter mudado. Você pode retomar a navegação pelo acervo do podcast."
      : ""),
  });
}
