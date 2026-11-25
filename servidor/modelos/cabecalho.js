import { elemento, fragmento } from "./html.js";
import { Icon } from "./icones.js";
import { nav } from "../modelo.js";
function Cabecalho(path) {
  return elemento(
    "header",
    { className: "mast" },
    elemento(
      "a",
      { className: "skip", href: "#conteudo" },
      "Pular para o conteúdo",
    ),
    elemento(
      "div",
      { className: "wrap mast-inner" },
      elemento(
        "a",
        {
          className: "logolink",
          href: "/",
          "aria-label": "Veterinária 360°, início",
        },
        elemento("img", {
          src: "/marca.svg",
          alt: "Veterinária 360°",
          width: "74",
          height: "52",
        }),
      ),
      elemento(
        "nav",
        {
          id: "menu-principal",
          className: "mainnav",
          "aria-label": "Menu principal",
        },
        nav.map(([url, label]) => {
          const active =
            url === "/"
              ? path === "/"
              : path === url || path.startsWith(url + "/");
          return elemento(
            "a",
            {
              key: url,
              href: url,
              className: active ? "active" : "",
              "aria-current": active ? "page" : void 0,
            },
            label,
          );
        }),
        elemento(
          "a",
          { className: "mobile-contact", href: "/contato" },
          "Contato e parcerias",
        ),
      ),
      elemento(
        "div",
        { className: "mast-actions" },
        elemento(
          "a",
          {
            href: "/contato",
            className: "contact-nav" + (path === "/contato" ? " selected" : ""),
          },
          elemento(Icon, { name: "chat", size: 16 }),
          elemento("span", null, "Seja parceiro"),
        ),
        elemento(
          "button",
          {
            type: "button",
            className: "nav-trigger",
            "aria-label": "Abrir menu",
            "aria-controls": "menu-principal",
            "aria-expanded": "false",
          },
          elemento(
            "span",
            { "data-icone-abrir": true },
            elemento(Icon, { name: "menu" }),
          ),
          elemento(
            "span",
            { "data-icone-fechar": true, hidden: true },
            elemento(Icon, { name: "close" }),
          ),
        ),
      ),
    ),
  );
}
export { Cabecalho };
