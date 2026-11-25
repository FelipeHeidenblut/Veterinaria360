// A árvore de elementos só existe no servidor. O navegador recebe HTML comum.
export const fragmento = Symbol("fragmento");

export function elemento(tipo, atributos, ...filhos) {
  const props = atributos || {};
  if (tipo === fragmento) return filhos;
  if (typeof tipo === "function") {
    return tipo({
      ...props,
      children: filhos.length === 1 ? filhos[0] : filhos,
    });
  }
  return { tipo, props, filhos };
}

const nomes = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  srcSet: "srcset",
  dateTime: "datetime",
  autoFocus: "autofocus",
  autoComplete: "autocomplete",
  allowFullScreen: "allowfullscreen",
  referrerPolicy: "referrerpolicy",
  fetchPriority: "fetchpriority",
  crossOrigin: "crossorigin",
  minLength: "minlength",
  maxLength: "maxlength",
  strokeWidth: "stroke-width",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  fillRule: "fill-rule",
  clipRule: "clip-rule",
};
const semFecho = new Set(
  "area base br col embed hr img input link meta param source track wbr".split(
    " ",
  ),
);
const blocos = new Set(
  "html head body header main section aside footer article div nav form dl figure dialog picture template".split(
    " ",
  ),
);
const literais = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export const escapar = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => literais[ch]);

export function arquivoDaRota(rota) {
  return rota === "/" ? "index.html" : rota.replace(/^\/|\/$/g, "") + ".html";
}
function relativo(valor, raiz) {
  if (!valor.startsWith("/") || valor.startsWith("//")) return valor;
  const corte = valor.search(/[?#]/);
  const caminho = corte < 0 ? valor : valor.slice(0, corte),
    resto = corte < 0 ? "" : valor.slice(corte);
  if (
    /^\/(?:imagens|fontes|mapas|css|js|midia)\//.test(caminho) ||
    /\.[a-z0-9]+$/i.test(caminho)
  )
    return raiz + caminho.slice(1) + resto;
  return raiz + arquivoDaRota(caminho) + resto;
}
function atributos(props, raiz) {
  let str = "";
  for (const [key, valor] of Object.entries(props)) {
    if (
      ["key", "children", "ref", "dangerouslySetInnerHTML"].includes(key) ||
      valor == null
    )
      continue;
    const nome = nomes[key] || key;
    if (typeof valor === "boolean") {
      if (nome.startsWith("aria-")) str += " " + nome + '="' + valor + '"';
      else if (valor) str += " " + nome;
      continue;
    }
    let value = valor;
    if (nome === "style" && typeof valor === "object")
      value = Object.entries(valor)
        .map(
          ([k, v]) =>
            k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + v,
        )
        .join(";");
    else if (["href", "src", "srcset", "action"].includes(nome))
      value = relativo(String(valor), raiz);
    str += " " + nome + '="' + escapar(value) + '"';
  }
  return str;
}
export function html(node, raiz = "./", nivel = 0) {
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node))
    return node.map((n) => html(n, raiz, nivel)).join("");
  if (typeof node !== "object") return escapar(node);
  const { tipo, props, filhos } = node;
  const inicio = "<" + tipo + atributos(props, raiz) + ">";
  if (semFecho.has(tipo)) return inicio;
  if (
    tipo === "script" &&
    props.type === "application/ld+json" &&
    props.dangerouslySetInnerHTML
  )
    return (
      inicio +
      props.dangerouslySetInnerHTML.__html.replace(/</g, "\\u003c") +
      "</script>"
    );
  const children = filhos
    .flat(Infinity)
    .filter((f) => f != null && f !== "" && typeof f !== "boolean");
  const quebra =
    blocos.has(tipo) &&
    children.length &&
    children.every((f) => typeof f === "object");
  const partes = children.map((c) => html(c, raiz, nivel + 1));
  return (
    inicio +
    (quebra
      ? "\n" +
        "  ".repeat(nivel + 1) +
        partes.join("\n" + "  ".repeat(nivel + 1)) +
        "\n" +
        "  ".repeat(nivel)
      : partes.join("")) +
    "</" +
    tipo +
    ">"
  );
}
