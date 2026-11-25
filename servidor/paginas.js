import { heroInterno } from "./modelos/hero.js";
import { fotosDasPaginas } from "./modelos/fotografias.js";
import { elemento as el, html, arquivoDaRota } from "./modelos/html.js";
import { Inicio } from "./modelos/inicio.js";
import { Secao } from "./modelos/secao.js";
import { Episodio } from "./modelos/episodio.js";
import { Cabecalho } from "./modelos/cabecalho.js";
import { Footer } from "./modelos/blocos.js";
import NotFound from "./modelos/nao-encontrada.js";
import { sections } from "./modelo.js";
import { origemOriginal } from "./catalogo.js";

const nome = "Veterinária 360°";
const descricao =
  "Entrevistas de Rodrigo Carmo com quem trabalha no campo, na pesquisa e na medicina veterinária. Assista aos episódios e acompanhe o Na Estrada.";
export function rotas(c) {
  return [
    "/",
    ...sections.map((s) => "/" + s),
    ...c.episodes.map((e) => "/episodios/" + e.slug),
    "/redacao",
    "/404",
  ];
}
function baseDeRedacao() {
  return el(
    "div",
    { className: "wrap page-main" },
    el(
      "div",
      { id: "redacao" },
      el(
        "p",
        { className: "aviso-estatico" },
        "Para acessar o painel editorial, inicie o servidor que acompanha este site e entre em Redação pelo endereço local.",
      ),
    ),
  );
}
function preferencia() {
  return el(
    "aside",
    {
      className: "consent-strip",
      "aria-label": "Preferência de medição",
      hidden: true,
    },
    el("span", {}, "Permitir estatísticas de navegação do podcast?"),
    el("a", { href: "/privacidade" }, "Privacidade"),
    el("button", { type: "button", "data-medicao": "nao" }, "Recusar"),
    el("button", { type: "button", "data-medicao": "sim" }, "Permitir"),
  );
}
function absolute(value, origin) {
  return new URL(value, origin + "/").href;
}
function enderecoPublico(rota, origin, servidor) {
  return absolute(
    servidor || origin === origemOriginal ? rota : "/" + arquivoDaRota(rota),
    origin,
  );
}
export function renderPage(
  rota,
  c,
  { origin = origemOriginal, servidor = false } = {},
) {
  const pagina = rota.slice(1);
  const episodio = rota.startsWith("/episodios/")
    ? c.episodes.find((e) => e.slug === rota.slice("/episodios/".length))
    : null;
  const isSection = sections.includes(pagina),
    inicio = rota === "/",
    redacao = rota === "/redacao",
    conhecida = inicio || !!episodio || isSection || redacao;
  const p = inicio ? c.pages.inicio : c.pages[pagina];
  const titulos = {
    privacidade: "Privacidade",
    creditos: "Créditos editoriais",
    redacao: "Redação",
  };
  const titulo = inicio
    ? nome + " | " + (p?.title || "A voz de quem faz.").replace(/\.$/, "")
    : (episodio?.seoTitle ||
        episodio?.title ||
        p?.title ||
        titulos[pagina] ||
        "Página não encontrada") +
      " | " +
      nome;
  const resumo =
    episodio?.seoDescription || episodio?.summary || p?.summary || descricao;
  const imagem =
    episodio?.image ||
    p?.image ||
    fotosDasPaginas[inicio ? "inicio" : pagina]?.src ||
    fotosDasPaginas["o-podcast"].src;
  const seo = enderecoPublico(rota, origin, servidor);
  const conteudo = inicio
    ? Inicio(c, origin)
    : episodio
      ? Episodio(c, episodio, origin, seo)
      : isSection
        ? Secao(c, pagina)
        : redacao
          ? baseDeRedacao()
          : NotFound();
  const caminho = arquivoDaRota(rota);
  const raiz = "../".repeat(caminho.split("/").length - 1) || "./";
  const scripts = [
    "site",
    ...(inicio ? ["galeria"] : []),
    ...(inicio || episodio ? ["players"] : []),
    ...(pagina === "episodios" ? ["episodios"] : []),
    ...(pagina === "audiencia" ? ["audiencia"] : []),
    ...(pagina === "contato" ? ["contato"] : []),
    ...(redacao ? ["campos", "redacao"] : []),
  ];
  const head = el(
    "head",
    {},
    el("meta", { charset: "utf-8" }),
    el("meta", {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    }),
    el("title", {}, titulo),
    el("meta", { name: "description", content: resumo }),
    el("meta", { name: "theme-color", content: "#17291f" }),
    (redacao || !conhecida) &&
      el("meta", { name: "robots", content: "noindex, nofollow" }),
    c.settings.verification &&
      el("meta", {
        name: "google-site-verification",
        content: c.settings.verification,
      }),
    el("link", { rel: "canonical", href: seo }),
    el("meta", { property: "og:title", content: titulo }),
    el("meta", { property: "og:description", content: resumo }),
    el("meta", {
      property: "og:type",
      content: episodio ? "article" : "website",
    }),
    el("meta", { property: "og:url", content: seo }),
    el("meta", { property: "og:site_name", content: nome }),
    el("meta", { property: "og:locale", content: "pt_BR" }),
    el("meta", { property: "og:image", content: absolute(imagem, origin) }),
    el("link", { rel: "icon", href: "/favicon.svg" }),
    el("link", {
      rel: "preload",
      href: "/fontes/barlow-condensed-latin-800-normal.woff2",
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
    }),
    el("link", { rel: "stylesheet", href: "/css/estilo.css" }),
    el("link", { rel: "stylesheet", href: "/css/paginas.css" }),
    scripts.map((s) => el("script", { src: "/js/" + s + ".js", defer: true })),
  );
  const body = el(
    "body",
    {
      "data-servidor": servidor ? "sim" : "nao",
      "data-ga": c.settings.ga || "",
    },
    Cabecalho(rota),
    el(
      "main",
      { id: "conteudo" },
      !inicio && heroInterno(pagina, p, episodio, titulos[pagina] || "Página não encontrada"),
      conteudo,
    ),
    el(Footer, { settings: c.settings }),
    preferencia(),
  );
  return (
    "<!doctype html>\n" +
    html(el("html", { lang: "pt-BR" }, head, body), raiz) +
    "\n"
  );
}
export function sitemap(c, origin, servidor = false) {
  const links = rotas(c)
    .filter((r) => !["/redacao", "/404"].includes(r))
    .map(
      (r) =>
        "<url><loc>" + enderecoPublico(r, origin, servidor) + "</loc></url>",
    );
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    links.join("\n") +
    "\n</urlset>\n"
  );
}
export function robots(origin) {
  return (
    "User-agent: *\nAllow: /\nDisallow: /redacao\nDisallow: /api/\nSitemap: " +
    origin +
    "/sitemap.xml\n"
  );
}
