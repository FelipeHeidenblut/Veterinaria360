import { elemento, fragmento } from "./html.js";
import { Icon } from "./icones.js";
import { EpisodeCard } from "./blocos.js";
import { tags, topics, mediaScopes, dateLabel } from "../modelo.js";
import { mapFile } from "../campos.js";
function FeaturedPlayer({ episode: e }) {
  return elemento(
    fragmento,
    null,
    elemento(
      "button",
      {
        type: "button",
        className: "btn btn-gold",
        "data-track": "reproduzir_destaque",
        "data-abrir-destaque": true,
        "aria-haspopup": "dialog",
        "aria-controls": "video-destaque",
      },
      elemento(Icon, { name: "play", size: 17 }),
      "Assistir ao destaque",
    ),
    elemento(
      "dialog",
      {
        id: "video-destaque",
        className: "feature-dialog",
        "aria-labelledby": "destaque-titulo",
        "data-youtube": e.youtube,
      },
      elemento(
        "div",
        { className: "dialog-content" },
        elemento(
          "div",
          { className: "dialog-top" },
          elemento(
            "span",
            { className: "eyebrow" },
            elemento(Icon, { name: "wave", size: 17 }),
            "Destaque do acervo",
          ),
          elemento(
            "button",
            {
              type: "button",
              "aria-label": "Fechar vídeo",
              "data-fechar": true,
            },
            elemento(Icon, { name: "close", size: 21 }),
          ),
        ),
        elemento("h2", { id: "destaque-titulo" }, e.title),
        elemento("p", null, e.guest),
        elemento("div", { "data-video-destaque": true }),
        elemento(
          "div",
          { className: "dialog-foot" },
          elemento(
            "a",
            { href: "/episodios/" + e.slug, className: "line-link" },
            "Ficha do episódio",
          ),
          elemento(
            "a",
            {
              href: "https://www.youtube.com/watch?v=" + e.youtube,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "line-link",
            },
            "Abrir no YouTube",
          ),
        ),
      ),
    ),
  );
}
function Archive({ entries }) {
  const temas = [
    ...new Set([...topics, "Na Estrada", ...entries.flatMap(tags)]),
  ];
  return elemento(
    "div",
    { className: "archive" },
    elemento(
      "div",
      { className: "search-box" },
      elemento(Icon, { name: "search" }),
      elemento("input", {
        type: "search",
        "aria-label": "Buscar episódios por título, convidado ou tema",
        placeholder: "Busque por título, convidado ou tema",
      }),
    ),
    elemento(
      "div",
      { className: "filters", "aria-label": "Filtrar episódios por tema" },
      ["", ...temas].map((t) =>
        elemento(
          "button",
          { type: "button", "data-tema": t, "aria-pressed": !t },
          t || "Todos",
        ),
      ),
    ),
    elemento(
      "p",
      { className: "result-count", role: "status" },
      entries.length,
      " ",
      entries.length === 1 ? "episódio" : "episódios",
    ),
    elemento(
      "div",
      { className: "episode-grid archive-grid" },
      entries.map((e) =>
        elemento(EpisodeCard, { entry: e, pesquisavel: true }),
      ),
    ),
    elemento(
      "div",
      { className: "empty", hidden: !!entries.length },
      elemento(Icon, { name: "search" }),
      elemento("h2", null, "Nenhum episódio encontrado."),
      elemento("p", null, "Tente outro nome ou tema."),
      elemento(
        "button",
        { className: "btn btn-ink", type: "button", "data-limpar": true },
        "Limpar filtros",
      ),
    ),
  );
}
function Player({ episode: e }) {
  return elemento(
    "div",
    {
      className: "player-box",
      "data-youtube": e.youtube,
      "data-spotify": e.spotify || "",
      "data-titulo": e.title,
    },
    elemento(
      "div",
      { className: "stage" },
      elemento(
        "button",
        {
          type: "button",
          className: "player-poster",
          "aria-label": "Reproduzir " + e.title,
          "data-track": "reproduzir_episodio",
        },
        elemento("img", { alt: "", src: e.image || "/imagens/estudio.webp" }),
        elemento(
          "span",
          { className: "big-play" },
          elemento(Icon, { name: "play", size: 31 }),
        ),
        elemento("span", { className: "player-hint" }, "Assistir ao episódio"),
      ),
    ),
    elemento(
      "div",
      { className: "player-controls" },
      elemento(
        "div",
        { className: "player-modes" },
        ["youtube", ...(e.spotify ? ["spotify"] : [])].map((m) =>
          elemento(
            "button",
            { type: "button", "data-modo": m, "aria-pressed": m === "youtube" },
            elemento(Icon, { name: m, size: 18 }),
            m === "youtube" ? "Vídeo" : "Áudio",
          ),
        ),
      ),
      elemento(
        "a",
        {
          className: "source-link",
          href: "https://www.youtube.com/watch?v=" + e.youtube,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "Abrir no YouTube",
      ),
    ),
  );
}
function Atlas({ regions, countries }) {
  return elemento(
    "div",
    { className: "atlas" },
    elemento(
      "div",
      {
        className: "atlas-tabs",
        role: "group",
        "aria-label": "Escala geográfica",
      },
      mediaScopes.map((s) =>
        elemento(
          "button",
          { type: "button", "data-escala": s, "aria-pressed": s === "Mundo" },
          s,
        ),
      ),
    ),
    mediaScopes.map((scope) => {
      const list = regions.filter((e) => e.scope === scope);
      const title =
        scope === "Mundo"
          ? "Alcance internacional"
          : scope === "Brasil"
            ? "Audiência por estado"
            : "Audiência por município";
      const empty =
        scope === "Mundo"
          ? "A fonte informa o total de países alcançados. A relação de países não foi divulgada."
          : scope === "Brasil"
            ? "A produção ainda não divulgou um levantamento de ouvintes por estado."
            : "A produção ainda não divulgou um levantamento de ouvintes por município paulista.";
      return elemento(
        "div",
        {
          className: "atlas-grid",
          "data-painel": scope,
          hidden: scope !== "Mundo",
        },
        elemento(
          "div",
          { className: "map-canvas" },
          elemento("img", {
            src: mapFile(scope),
            alt: "Mapa de referência — " + scope,
          }),
          list
            .filter((r) => r.position)
            .map((r) =>
              elemento("button", {
                className: "map-marker",
                type: "button",
                "data-regiao": r.id,
                "data-posicao": r.position,
                "aria-label": r.title,
                title: r.title,
              }),
            ),
          elemento(
            "span",
            { className: "map-key" },
            elemento(Icon, { name: "globe", size: 14 }),
            scope,
          ),
        ),
        elemento(
          "div",
          { className: "atlas-side", "aria-live": "polite" },
          elemento("h3", null, title),
          elemento(
            "div",
            { "data-registro": "" },
            elemento(
              "strong",
              { hidden: !(scope === "Mundo" && countries) },
              scope === "Mundo" && countries
                ? elemento(
                    fragmento,
                    null,
                    countries.value,
                    " ",
                    elemento("small", null, "países"),
                  )
                : null,
            ),
            elemento(
              "p",
              null,
              list.length
                ? "Escolha uma localidade para consultar a medição e a fonte."
                : empty,
            ),
            scope === "Mundo" && countries
              ? elemento(
                  "a",
                  {
                    className: "source-link",
                    href: countries.url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  countries.source,
                  " · ",
                  dateLabel(countries.date),
                )
              : null,
          ),
          list.map((r) =>
            elemento(
              "div",
              { "data-registro": r.id, hidden: true },
              elemento("strong", null, r.title),
              elemento("p", null, [r.value, r.unit].filter(Boolean).join(" ")),
              elemento("p", null, r.summary),
              elemento(
                "a",
                {
                  className: "source-link",
                  href: r.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                r.source,
                " · ",
                dateLabel(r.date),
              ),
            ),
          ),
          list.length > 0 &&
            elemento(
              "div",
              { className: "region-options" },
              list.map((r) =>
                elemento(
                  "button",
                  {
                    type: "button",
                    "aria-pressed": "false",
                    "data-regiao": r.id,
                  },
                  r.title,
                ),
              ),
            ),
        ),
      );
    }),
  );
}
function Consent() {
  return elemento(
    "label",
    { className: "privacy-toggle" },
    elemento("input", { type: "checkbox", id: "medicao-opt-in" }),
    "Permitir medição de acesso e interação nesta visita e nas próximas",
  );
}
export { Archive, Atlas, Consent, FeaturedPlayer, Player };
