import { elemento } from "./html.js";
import { Icon } from "./icones.js";

const fotos = [
  ["entrevista-no-estudio", "À mesa do podcast", "Rodrigo e uma convidada conversam ao microfone no estúdio."],
  ["conversa-nos-fardos", "Conversa no campo", "Rodrigo e um convidado sentados em fardos de feno."],
  ["estudio-movel", "Dentro do estúdio móvel", "Uma câmera registra uma entrevista na van verde do projeto."],
  ["rebanho-no-pasto", "À beira do pasto", "Animais do rebanho no pasto sob um céu de nuvens."],
  ["entrevista-ao-ar-livre", "Gravação ao ar livre", "Três participantes conversam em bancos de madeira em um jardim."],
  ["vista-da-propriedade", "A propriedade vista do alto", "Vista aérea de galpões, árvores e um lago na propriedade rural."],
];

export function GaleriaInicio() {
  return elemento(
    "section",
    { className: "wrap galeria-inicio", "aria-labelledby": "titulo-galeria" },
    elemento(
      "div",
      { className: "section-head" },
      elemento("h2", { id: "titulo-galeria" }, "Galeria de fotos", elemento("span", null, ".")),
      elemento(
        "div",
        { className: "galeria-controles", hidden: true },
        ["Foto anterior", "Próxima foto"].map((label) =>
          elemento("button", { type: "button", "aria-label": label, "aria-controls": "fotos-do-podcast" },
            elemento(Icon, { name: "back", size: 20 }),
          ),
        ),
      ),
    ),
    elemento(
      "ul",
      { className: "galeria-trilho", id: "fotos-do-podcast", tabIndex: 0, "aria-labelledby": "titulo-galeria" },
      fotos.map(([arquivo, legenda, descricao]) =>
        elemento("li", null,
          elemento("figure", null,
            elemento("img", {
              src: "/imagens/" + arquivo + ".webp",
              alt: descricao,
              width: "960",
              height: "540",
              loading: "lazy",
              decoding: "async",
            }),
            elemento("figcaption", null, legenda),
          ),
        ),
      ),
    ),
  );
}
