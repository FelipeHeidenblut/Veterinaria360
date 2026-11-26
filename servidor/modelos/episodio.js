import { elemento } from "./html.js";
import { dateLabel, tags } from "../modelo.js";
import { Copy, EpisodeCard, SectionLabel } from "./blocos.js";
import { Icon } from "./icones.js";
import { Player } from "./interativos.js";
function Episodio(c, e, origin, endereco) {
  const related = c.episodes
    .filter((r) => r.id !== e.id)
    .sort(
      (a, b) =>
        tags(b).filter((t) => tags(e).includes(t)).length -
        tags(a).filter((t) => tags(e).includes(t)).length,
    )
    .slice(0, 3);
  const data = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: e.title,
    description: e.summary,
    datePublished: e.date,
    episodeNumber: e.num || void 0,
    url: endereco,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "Veterinária 360°",
      url: origin,
    },
    associatedMedia: {
      "@type": "VideoObject",
      name: e.title,
      uploadDate: e.date,
      thumbnailUrl: "https://i.ytimg.com/vi/" + e.youtube + "/hqdefault.jpg",
      embedUrl: "https://www.youtube.com/embed/" + e.youtube,
    },
    actor: { "@type": "Person", name: e.guest },
  };
  return elemento(
    "div",
    { className: "wrap page-main episode-page" },
    elemento("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: {
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      },
    }),
    elemento(
      "a",
      { className: "back-link", href: "/episodios" },
      elemento(Icon, { name: "back", size: 15 }),
      " Todos os episódios",
    ),
    elemento(
      "div",
      { className: "watch-layout" },
      elemento(
        "div",
        null,
        elemento(Player, { episode: e }),
        elemento(
          "div",
          { className: "watch-notes" },
          elemento("h2", null, "Sobre a conversa"),
          elemento("p", null, e.summary),
          e.body && elemento(Copy, { text: e.body }),
        ),
      ),
      elemento(
        "aside",
        { className: "episode-info" },
        elemento("h2", null, "Ficha do episódio"),
        e.portrait &&
          elemento("img", {
            src: e.portrait,
            alt: e.guest,
            className: "portrait",
          }),
        elemento(
          "dl",
          null,
          [
            ["Convidado", e.guest],
            ["Apresentação", "Dr. Rodrigo Carmo"],
            ["Publicação", dateLabel(e.date, true)],
            ["Local", e.location],
            ["Duração", e.duration],
          ]
            .filter((row) => row[1])
            .map(([k, v]) =>
              elemento(
                "div",
                { key: k },
                elemento("dt", null, k),
                elemento("dd", null, v),
              ),
            ),
        ),
        elemento(
          "div",
          { className: "topic-links" },
          tags(e).map((t) =>
            elemento(
              "a",
              { key: t, href: "/episodios?tema=" + encodeURIComponent(t) },
              t,
            ),
          ),
        ),
      ),
    ),
    related.length > 0 &&
      elemento(
        "section",
        { className: "inner-section" },
        elemento(SectionLabel, null, "Continue no acervo"),
        elemento("h2", { className: "secondary-title" }, "Outras conversas."),
        elemento(
          "div",
          { className: "episode-grid" },
          related.map((item) =>
            elemento(EpisodeCard, { key: item.id, entry: item }),
          ),
        ),
      ),
  );
}
export { Episodio };
