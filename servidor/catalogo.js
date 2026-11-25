import { readFileSync } from "node:fs";
import { ordered } from "./modelo.js";
export const origemOriginal =
  "https://veterinaria360-caderno-de-campo.fheidenblut.chatgpt.site";
export const defaults = JSON.parse(
  readFileSync(new URL("./catalogo-base.json", import.meta.url), "utf8"),
);
export function publicar(registros, agora = Date.now()) {
  const publicados = registros.filter(
    (e) =>
      e.status === "publicado" &&
      (!e.publishAt || Date.parse(e.publishAt) <= agora),
  );
  const grupo = (tipo) => ordered(publicados.filter((e) => e.kind === tipo));
  return {
    episodes: grupo("episodio"),
    press: grupo("imprensa"),
    metrics: grupo("indicador"),
    regions: grupo("territorio"),
    photos: grupo("foto"),
    pages: Object.fromEntries(grupo("pagina").map((e) => [e.id, e])),
    settings:
      publicados.find((e) => e.kind === "ajustes") ||
      defaults.find((e) => e.kind === "ajustes"),
  };
}
