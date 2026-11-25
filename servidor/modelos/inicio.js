import { GaleriaInicio } from "./galeria-inicio.js";
import { Hero } from "./hero.js";
import { fotosDasPaginas } from "./fotografias.js";
import { elemento, fragmento } from "./html.js";
import { fieldSeries, tags } from "../modelo.js";
import { FeaturedPlayer } from "./interativos.js";
import { Icon } from "./icones.js";
import {
  EpisodeCard,
  SectionLabel,
  Socials,
  Partner,
  PressList,
} from "./blocos.js";
function Inicio(c, origin) {
  const page = c.pages.inicio,
    series = c.pages["na-estrada"];
  const epMetric = c.metrics.find((m) => m.id === "episodios-publicados"),
    country = c.metrics.find((m) => m.id === "paises-alcancados");
  const featured = [
    ...new Set(
      [
        c.episodes[0],
        c.episodes.find(
          (e) => !fieldSeries(e) && tags(e).includes("Tecnologia"),
        ),
        c.episodes.find((e) => tags(e).includes("Cães e gatos")),
        ...c.episodes,
      ].filter((e) => !!e),
    ),
  ].slice(0, 3);
  const snapshot = [epMetric, country]
    .filter(Boolean)
    .sort((a, b) => String(b.date).localeCompare(a.date))[0];
  const structured = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "Veterinária 360°",
    url: origin,
    inLanguage: "pt-BR",
    description: page.summary,
    sameAs: [
      c.settings.youtube,
      c.settings.instagram,
      c.settings.spotify,
    ].filter(Boolean),
  };
  return elemento(
    fragmento,
    null,
    elemento("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: {
        __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
      },
    }),
    elemento(
      Hero,
      {
        variante: "inicio",
        foto: page.image ? { src: page.image, alt: "" } : fotosDasPaginas.inicio,
        mobile: !page.image && "/imagens/conversa-no-pasto-mobile.webp",
        section: "Podcast de medicina veterinária",
        title: page.title || "A voz de quem faz.",
        summary: page.summary,
        localizador: elemento(
          "a",
          { className: "hero-locator", href: "/na-estrada" },
          elemento(
            "span",
            { className: "focus-mark" },
            elemento(Icon, { name: "pin", size: 19 }),
          ),
          elemento(
            "span",
            null,
            elemento("small", null, "Série Na Estrada"),
            elemento("strong", null, "Vale do Paraíba, SP"),
          ),
        ),
      },
      elemento(
        "div",
        { className: "hero-actions" },
        featured[0]
          ? elemento(FeaturedPlayer, { episode: featured[0] })
          : elemento(
              "a",
              { href: "/episodios", className: "btn btn-gold" },
              "Explorar episódios",
            ),
        elemento(
          "a",
          { href: "/o-podcast", className: "hero-secondary" },
          "Conheça o podcast",
        ),
      ),
    ),
    elemento(
      "section",
      { className: "tuning", "aria-label": "Plataformas e alcance" },
      elemento(
        "div",
        { className: "wrap tuning-inner" },
        elemento(
          "div",
          { className: "tune-social" },
          elemento("span", { className: "station-label" }, "Acompanhe"),
          elemento(Socials, { settings: c.settings }),
        ),
        elemento(
          "div",
          { className: "tune-figures" },
          elemento(
            "div",
            { className: "tune-metrics" },
            [epMetric, country].filter(Boolean).map((m) =>
              elemento(
                "a",
                {
                  key: m.id,
                  href: "/audiencia",
                  title: "Fonte e data de " + m.title.toLowerCase(),
                },
                elemento("strong", null, m.value),
                elemento("span", null, m.unit),
              ),
            ),
          ),
          snapshot &&
            elemento(
              "a",
              {
                className: "metric-source",
                href: "/audiencia",
                title: "Consultar fontes e períodos das medições",
              },
              new Intl.DateTimeFormat("pt-BR", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })
                .format(new Date(snapshot.date + "T12:00:00Z"))
                .replace(" de ", " "),
            ),
        ),
      ),
    ),
    elemento(
      "section",
      { className: "highlights wrap" },
      elemento(
        "div",
        { className: "section-head" },
        elemento(
          "div",
          null,
          elemento(SectionLabel, null, "Do acervo"),
          elemento(
            "h2",
            null,
            "Episódios em destaque",
            elemento("span", null, "."),
          ),
        ),
        elemento(
          "a",
          { href: "/episodios", className: "line-link" },
          elemento(Icon, { name: "layers", size: 16 }),
          "Ver todos os episódios",
        ),
      ),
      elemento(
        "div",
        { className: "episode-grid" },
        featured.map((e, i) =>
          elemento(EpisodeCard, { key: e.id, entry: e, priority: i === 0 }),
        ),
      ),
    ),
    elemento(
      "section",
      { className: "road-spread" },
      elemento(
        "div",
        { className: "wrap road-inner" },
        elemento(
          "div",
          { className: "spread-photo" },
          elemento("img", {
            src: series.image || "/imagens/entrevista-na-fazenda.webp",
            alt: series.image ? "" : "Rodrigo Carmo entrevista um produtor na caçamba de uma caminhonete, junto ao gado.",
            loading: "lazy",
            width: "1100",
            height: "611",
          }),
          elemento(
            "span",
            { className: "photo-caption" },
            elemento(Icon, { name: "route", size: 15 }),
            "Veterinária 360° Na Estrada",
          ),
        ),
        elemento(
          "div",
          { className: "spread-copy" },
          elemento(SectionLabel, { icon: "compass" }, "Série de campo"),
          elemento("h2", null, "Na ", elemento("em", null, "Estrada.")),
          elemento("p", null, series.summary),
          elemento(
            "a",
            { className: "btn btn-gold", href: "/na-estrada" },
            elemento(Icon, { name: "play", size: 16 }),
            "Conheça a série",
          ),
        ),
      ),
    ),
    elemento(GaleriaInicio, null),
    elemento(
      "section",
      { className: "home-press wrap" },
      elemento(
        "div",
        null,
        elemento(SectionLabel, { icon: "broadcast" }, "Imprensa"),
        elemento("h2", null, "Na mídia", elemento("span", null, ".")),
        elemento(
          "p",
          null,
          "O Veterinária 360° e seu apresentador em outras conversas.",
        ),
        elemento(
          "a",
          { href: "/na-midia", className: "line-link" },
          "Ver todas as participações",
        ),
      ),
      elemento(PressList, { items: c.press.slice(0, 3) }),
    ),
    elemento(Partner, null),
  );
}
export { Inicio };
