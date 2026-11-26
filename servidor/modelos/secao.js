import { elemento, fragmento } from "./html.js";
import { dateLabel, fieldSeries } from "../modelo.js";
import {
  SectionLabel,
  EpisodeCard,
  PressList,
  Copy,
  Gallery,
  Partner,
} from "./blocos.js";
import { Icon } from "./icones.js";
import { Archive, Atlas, Consent } from "./interativos.js";
import { ContactForm } from "./contato.js";
function Source({ e }) {
  return elemento(
    "a",
    {
      href: e.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "source-link",
    },
    e.source,
    " · ",
    dateLabel(e.date),
  );
}
function Secao(c, secao) {
  const p = c.pages[secao],
    s = c.settings,
    road = c.episodes.filter(fieldSeries);
  const gallery = (name) =>
    elemento(Gallery, { photos: c.photos.filter((e) => e.context === name) });
  if (secao === "episodios")
    return elemento(
      "div",
      { className: "wrap page-main" },
      p.body &&
        elemento(
          "div",
          { className: "prose" },
          elemento(Copy, { text: p.body }),
        ),
      elemento(Archive, {
        entries: c.episodes,
      }),
      elemento(
        "div",
        { className: "channel-note" },
        elemento(Icon, { name: "youtube", size: 25 }),
        elemento(
          "p",
          null,
          "Veja também as novas publicações diretamente no canal.",
        ),
        elemento(
          "a",
          {
            href: s.youtube + "/videos",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "line-link",
          },
          "Abrir o YouTube",
        ),
      ),
    );
  if (secao === "o-podcast")
    return elemento(
      fragmento,
      null,
      elemento(
        "div",
        { className: "wrap page-main podcast-story" },
        elemento(
          "section",
          { className: "story-origin" },
          elemento(SectionLabel, { icon: "wave" }, "O projeto"),
          elemento("h2", { className: "secondary-title", id: "historia-titulo" }, "Como nasceu o podcast."),
          elemento(
            "div",
            { className: "prose" },
            elemento("p", null, "Dr. Rodrigo Carmo criou o Veterinária 360° para ouvir quem trabalha com medicina veterinária e levar essas conversas a quem cuida dos animais. Ao microfone, ele recebe veterinários, pesquisadores, professores, produtores rurais e empresários."),
            elemento("p", null, "Os convidados trazem questões do consultório, da pesquisa e da vida no campo. Ao contar como trabalham, dão visibilidade a iniciativas e mostram onde a profissão faz parte do nosso dia a dia."),
          ),
        ),
        elemento(
          "section",
          { className: "story-host" },
          elemento(
            "div",
            null,
            elemento("h2", { className: "secondary-title" }, "Uma ideia, muitas histórias e um olhar para o mundo."),
            elemento("div", { className: "prose" }, elemento(Copy, { text: p.body })),
            elemento(
              "a",
              {
                className: "source-link",
                href: c.press.find((i) => i.source === "Pod Le Pet Santé")?.url || s.youtube,
                rel: "noopener noreferrer",
                target: "_blank",
              },
              "Ouça Dr. Rodrigo Carmo contar a sua história",
            ),
          ),
          elemento("img", {
            src: "/imagens/bastidores-da-gravacao.webp",
            alt: "Dr. Rodrigo Carmo diante da câmera da equipe.",
            width: "1120",
            height: "632",
            loading: "lazy",
          }),
        ),
        elemento(
          "section",
          { className: "story-timeline", id: "alem-titulo" },
          elemento(SectionLabel, { icon: "calendar" }, "Trajetória"),
          elemento(
            "h2",
            { className: "secondary-title" },
            "Do estúdio à estrada.",
          ),
          elemento("p", { className: "prose" }, "Depois das primeiras entrevistas em estúdio, vieram as feiras, as visitas a propriedades e as participações na televisão e no rádio."),
          elemento(
            "div",
            { className: "timeline" },
            elemento(
              "a",
              { href: "/episodios/piscicultura-com-jose-vitor" },
              elemento("time", null, "Dezembro de 2023"),
              elemento("h3", null, "A primeira conversa"),
              elemento(
                "p",
                null,
                "José Vitor leva a piscicultura internacional ao episódio de estreia.",
              ),
            ),
            elemento(
              "a",
              { href: "/na-midia" },
              elemento("time", null, "Agosto de 2025"),
              elemento("h3", null, "Microfone na ExpoPinda"),
              elemento(
                "p",
                null,
                "O podcast se aproxima dos produtores e das empresas durante a feira.",
              ),
            ),
            elemento(
              "a",
              { href: "/na-estrada" },
              elemento("time", null, "Março de 2026"),
              elemento("h3", null, "Gravações em campo"),
              elemento(
                "p",
                null,
                "Produtores do Vale do Paraíba recebem Rodrigo dentro das propriedades.",
              ),
            ),
          ),
          elemento(
            "div",
            { className: "podcast-story-links" },
            elemento("a", { className: "line-link", href: "/na-estrada" }, "Conheça o Na Estrada"),
            elemento("a", { className: "line-link", href: "/na-midia" }, "Veja as participações na mídia"),
          ),
        ),
        gallery("O podcast"),
      ),
      elemento(Partner, null),
    );
  if (secao === "na-estrada")
    return elemento(
      fragmento,
      null,
      elemento(
        "div",
        { className: "wrap page-main" },
        elemento(
          "div",
          { className: "editorial-columns" },
          elemento(
            "div",
            null,
            elemento(SectionLabel, { icon: "pin" }, "Roteiro"),
            elemento(
              "h2",
              { className: "secondary-title" },
              "Porteiras abertas.",
            ),
          ),
          elemento(
            "div",
            { className: "prose" },
            elemento(Copy, { text: p.body }),
          ),
        ),
        elemento(
          "div",
          { className: "visits" },
          road.map((e) =>
            elemento(
              "article",
              { key: e.id },
              elemento(
                "div",
                { className: "visit-location" },
                elemento(Icon, { name: "pin", size: 15 }),
                e.location || "Gravação em campo",
              ),
              elemento(EpisodeCard, { entry: e }),
            ),
          ),
        ),
        gallery("Na Estrada"),
        elemento(
          "div",
          { className: "channel-note" },
          elemento(Icon, { name: "route", size: 28 }),
          elemento("p", null, "Quer receber uma gravação na sua propriedade?"),
          elemento(
            "a",
            { href: "/contato", className: "line-link" },
            "Converse com a produção",
          ),
        ),
      ),
      elemento(Partner, null),
    );
  if (secao === "na-midia")
    return elemento(
      fragmento,
      null,
      elemento(
        "div",
        { className: "wrap page-main" },
        p.body &&
          elemento(
            "div",
            { className: "prose" },
            elemento(Copy, { text: p.body }),
          ),
        elemento(PressList, { items: c.press, expanded: true }),
        gallery("Na mídia"),
      ),
      elemento(Partner, null),
    );
  if (secao === "audiencia") {
    const newest = new Map();
    for (const e of c.metrics) {
      if (!newest.has(e.title)) newest.set(e.title, e);
    }
    return elemento(
      fragmento,
      null,
      elemento(
        "div",
        { className: "wrap page-main" },
        p.body &&
          elemento(
            "div",
            { className: "prose" },
            elemento(Copy, { text: p.body }),
          ),
        elemento(
          "div",
          { className: "metric-list" },
          Array.from(newest.values()).map((e) =>
            elemento(
              "article",
              { key: e.id },
              elemento("b", null, e.value),
              elemento("h2", null, e.title),
              elemento("p", null, e.summary),
              elemento(Source, { e }),
            ),
          ),
        ),
        elemento(
          "section",
          { className: "inner-section" },
          elemento(SectionLabel, { icon: "globe" }, "Geografia da audiência"),
          elemento(
            "h2",
            { className: "secondary-title" },
            "Onde a conversa chega.",
          ),
          elemento(Atlas, {
            regions: c.regions,
            countries: Array.from(newest.values()).find(
              (m) => m.id === "paises-alcancados" || m.unit === "países",
            ),
          }),
        ),
        c.metrics.length > newest.size &&
          elemento(
            "section",
            { className: "inner-section" },
            elemento(
              "h2",
              { className: "secondary-title" },
              "Histórico das medições",
            ),
            c.metrics.map((e) =>
              elemento(
                "div",
                { className: "history-row", key: e.id },
                elemento("time", null, dateLabel(e.date)),
                elemento("b", null, e.value, " · ", e.title),
                elemento(Source, { e }),
              ),
            ),
          ),
      ),
      elemento(Partner, null),
    );
  }
  if (secao === "contato")
    return elemento(
      "div",
      { className: "wrap page-main" },
      p.body &&
        elemento(
          "div",
          { className: "prose" },
          elemento(Copy, { text: p.body }),
        ),
      elemento(
        "div",
        { className: "contact-columns" },
        elemento(ContactForm, null),
        elemento(
          "aside",
          { className: "contact-side" },
          elemento(SectionLabel, { icon: "chat" }, "Contato direto"),
          elemento("h2", null, "Fale com a equipe."),
          elemento(
            "p",
            null,
            "Para combinar uma entrevista ou conversar sobre uma parceria, fale com a produção pelo WhatsApp.",
          ),
          s.whatsapp &&
            elemento(
              "a",
              {
                href: s.whatsapp,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "btn btn-gold",
                "data-track": "contato_whatsapp",
              },
              elemento(Icon, { name: "whatsapp", size: 18 }),
              "Abrir WhatsApp",
            ),
          s.email &&
            elemento(
              "a",
              { className: "contact-email", href: "mailto:" + s.email },
              elemento(Icon, { name: "mail", size: 17 }),
              s.email,
            ),
          elemento(
            "div",
            { className: "offer-list" },
            elemento("h3", null, "Formatos de parceria"),
            [
              [
                "Patrocínio do podcast",
                "Presença de marca em uma entrevista ou em uma série temática.",
              ],
              [
                "Produção audiovisual",
                "Conversas e vídeos institucionais sobre projetos, pessoas e práticas do setor.",
              ],
              [
                "Cobertura em campo",
                "Entrevistas em feiras, visitas a propriedades e registros de eventos.",
              ],
            ].map(([t, d]) =>
              elemento(
                "details",
                { key: t },
                elemento(
                  "summary",
                  null,
                  t,
                  elemento(Icon, { name: "plus", size: 16 }),
                ),
                elemento("p", null, d),
              ),
            ),
          ),
        ),
      ),
    );
  if (secao === "privacidade")
    return elemento(
      "div",
      { className: "wrap page-main" },
      elemento(
        "div",
        { className: "legal prose" },
        elemento("h2", null, "Quando você entra em contato"),
        elemento(
          "p",
          null,
          "A produção guarda o nome, o e-mail, o assunto e a mensagem enviados no formulário para responder ao seu pedido. A equipe editorial tem acesso a essas mensagens. Para falar sobre seus dados, use o contato direto da produção.",
        ),
        elemento(
          "a",
          { href: s.whatsapp || "/contato", className: "source-link" },
          "Falar com a produção",
        ),
        elemento("h2", null, "Reprodução de episódios"),
        elemento(
          "p",
          null,
          "Ao iniciar um vídeo ou áudio, o player se conecta ao YouTube ou ao Spotify. Essas plataformas passam a receber os dados técnicos necessários para reproduzir o conteúdo.",
        ),
        elemento("h2", null, "Preferência de medição"),
        elemento(
          "p",
          null,
          "Quando ativada pela produção, a medição do Google Analytics respeita a escolha abaixo. Você pode alterá-la a qualquer momento neste navegador.",
        ),
        elemento(Consent, null),
      ),
    );
  return elemento(
    "div",
    { className: "wrap page-main" },
    elemento(
      "div",
      { className: "legal prose" },
      elemento("h2", null, "Episódios e reportagens"),
      elemento(
        "p",
        null,
        "Os episódios pertencem ao Veterinária 360° e aos respectivos criadores. As fichas remetem aos players oficiais. As participações na imprensa incluem o link para a publicação original.",
      ),
      elemento("h2", null, "Fotografias e marca"),
      elemento(
        "p",
        null,
        "A marca e as fotografias de estúdio, de campo e de bastidores são do acervo do Veterinária 360°. A imagem da entrevista ao Balanço Geral é um registro do programa. As capas ilustrativas dos episódios desta edição foram criadas com auxílio de inteligência artificial.",
      ),
      elemento("h2", null, "Cartografia e tipografia"),
      elemento(
        "p",
        null,
        "O mapa-múndi usa dados do Natural Earth, distribuídos pelo World Atlas. Os contornos do Brasil e de São Paulo foram adaptados da cartografia MapSVG na versão SVG Maps, de Victor Cazanave, sob licença Creative Commons Atribuição 4.0.",
      ),
      elemento(
        "p",
        null,
        elemento(
          "a",
          {
            href: "https://github.com/VictorCazanave/svg-maps/tree/master/packages/brazil",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "source-link",
          },
          "Base cartográfica do Brasil",
        ),
        " ",
        "·",
        " ",
        elemento(
          "a",
          {
            href: "https://creativecommons.org/licenses/by/4.0/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "source-link",
          },
          "Licença CC BY 4.0",
        ),
      ),
      elemento(
        "p",
        null,
        "Barlow Condensed e DM Sans são distribuídas sob a SIL Open Font License.",
      ),
    ),
  );
}
export { Secao };
