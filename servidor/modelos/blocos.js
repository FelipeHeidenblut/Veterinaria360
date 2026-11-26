import { elemento, fragmento } from "./html.js";
import { Icon } from "./icones.js";
import { dateLabel, fieldSeries, nav, tags } from "../modelo.js";
function SectionLabel({ children, icon = "wave" }) {
  return elemento(
    "span",
    { className: "eyebrow" },
    elemento(Icon, { name: icon, size: 18 }),
    children,
  );
}
function Socials({ settings, small = false }) {
  return elemento(
    "div",
    { className: "socials" + (small ? " compact" : "") },
    ["youtube", "spotify", "instagram"]
      .filter((n) => settings[n])
      .map((n) =>
        elemento(
          "a",
          {
            key: n,
            href: settings[n],
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": {
              youtube: "Veterinária 360 no YouTube",
              spotify: "Veterinária 360 no Spotify",
              instagram: "Dr. Rodrigo Carmo no Instagram",
            }[n],
            "data-track": "social_" + n,
          },
          elemento(Icon, { name: n, size: 18 }),
          elemento(
            "span",
            null,
            {
              youtube: "YouTube",
              instagram: "Instagram",
              spotify: "Spotify",
            }[n],
          ),
        ),
      ),
  );
}
function Footer({ settings }) {
  return elemento(
    "footer",
    { className: "footer" },
    elemento(
      "div",
      { className: "wrap" },
      elemento(
        "div",
        { className: "footer-main" },
        elemento(
          "a",
          { className: "logolink", href: "/", "aria-label": "Início" },
          elemento("img", {
            src: "/marca.svg",
            alt: "Veterinária 360°",
            width: "88",
            height: "62",
          }),
        ),
        elemento(
          "nav",
          { "aria-label": "Links do rodapé" },
          [...nav.slice(1), ["/contato", "Contato"]].map(([u, t]) =>
            elemento("a", { key: u, href: u }, t),
          ),
        ),
        elemento(Socials, { settings, small: true }),
      ),
      elemento(
        "div",
        { className: "footer-base" },
        elemento(
          "span",
          null,
          "© ",
          new Date().getFullYear(),
          " Veterinária 360°",
        ),
        elemento(
          "div",
          null,
          elemento("a", { href: "/creditos" }, "Créditos"),
          elemento("a", { href: "/privacidade" }, "Privacidade"),
          elemento("a", { href: "/redacao" }, "Redação"),
        ),
      ),
    ),
  );
}
function EpisodeCard({ entry: e, priority = false, pesquisavel = false }) {
  const label = fieldSeries(e) ? "Na Estrada" : tags(e)[0] || "Entrevista",
    cover = e.image || "/imagens/estudio.webp";
  return elemento(
    "article",
    {
      className: "episode-card",
      "data-temas": pesquisavel ? e.tags : void 0,
      "data-busca": pesquisavel
        ? [e.title, e.guest, e.role, e.tags, e.summary, e.location, e.num]
            .filter(Boolean)
            .join(" ")
        : void 0,
    },
    elemento(
      "a",
      {
        className: "card-img",
        href: "/episodios/" + e.slug,
        "aria-label": "Abrir episódio: " + e.title,
      },
      elemento("img", {
        src: cover,
        alt: "",
        loading: priority ? "eager" : "lazy",
        width: "720",
        height: "405",
      }),
      elemento(
        "span",
        { className: "thumb-label" },
        elemento("i", null),
        label,
      ),
      elemento(
        "span",
        { className: "card-play" },
        elemento(Icon, { name: "play", size: 19 }),
      ),
    ),
    elemento(
      "div",
      { className: "episode-caption" },
      elemento(
        "div",
        { className: "byline" },
        e.num &&
          elemento(
            fragmento,
            null,
            elemento("span", null, "EP. ", e.num),
            elemento("b", null, "·"),
          ),
        elemento("time", { dateTime: e.date }, dateLabel(e.date)),
      ),
      elemento(
        "h3",
        null,
        elemento("a", { href: "/episodios/" + e.slug }, e.title),
      ),
      elemento("p", null, elemento(Icon, { name: "mic", size: 15 }), e.guest),
    ),
  );
}
function PressList({ items, expanded = false }) {
  return elemento(
    "div",
    { className: "press-list" + (expanded ? " expanded" : "") },
    items.map((e) =>
      elemento(
        "a",
        {
          key: e.id,
          href: e.url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "press-row",
        },
        elemento(
          "div",
          { className: "press-date" },
          elemento("time", { dateTime: e.date }, dateLabel(e.date)),
          elemento("span", null, e.format),
        ),
        elemento(
          "div",
          null,
          elemento("span", { className: "press-source" }, e.source),
          elemento("h3", null, e.title),
          expanded && elemento("p", null, e.summary),
        ),
        elemento(
          "span",
          { className: "press-open" },
          elemento(Icon, { name: "external", size: 19 }),
        ),
      ),
    ),
  );
}
function Partner() {
  return elemento(
    "aside",
    { className: "partner" },
    elemento(
      "div",
      { className: "wrap partner-inner" },
      elemento(
        "div",
        null,
        elemento(SectionLabel, { icon: "chat" }, "Parcerias"),
        elemento("h2", null, "Sua marca nesta conversa."),
      ),
      elemento(
        "a",
        { className: "btn btn-ink", href: "/contato" },
        elemento(Icon, { name: "chat", size: 17 }),
        "Falar com a produção",
      ),
    ),
  );
}
function Copy({ text }) {
  return elemento(
    fragmento,
    null,
    (text || "")
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((s, i) => elemento("p", { key: i }, s)),
  );
}
function Gallery({ photos }) {
  return !photos.length
    ? null
    : elemento(
        "div",
        { className: "gallery" },
        photos.map((p) =>
          elemento(
            "figure",
            { key: p.id },
            elemento(
              "a",
              { href: p.image, target: "_blank", rel: "noopener noreferrer" },
              elemento("img", {
                src: p.image,
                alt: p.alt || p.title,
                loading: "lazy",
              }),
            ),
            elemento("figcaption", null, p.title, p.credit && " · " + p.credit),
          ),
        ),
      );
}
export {
  Copy,
  EpisodeCard,
  Footer,
  Gallery,
  Partner,
  PressList,
  SectionLabel,
  Socials,
};
