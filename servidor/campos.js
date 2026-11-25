import { mediaScopes } from "./modelo.js";
const t = (key, label, type, required = false) => ({
  key,
  label,
  type,
  required,
});
const title = t("title", "Título", void 0, true);
const summary = t("summary", "Resumo", "area");
const body = t("body", "Texto completo", "area");
const date = t("date", "Data de publicação ou referência", "date", true);
const source = t("source", "Nome da fonte", void 0, true);
const url = t("url", "Link da fonte", "url", true);
const image = t("image", "Imagem de capa", "image");
const status = t("status", "Situação", "status");
const schedule = t(
  "publishAt",
  "Agendar publicação (horário local)",
  "datetime-local",
);
const fields = {
  episodio: [
    title,
    t("slug", "Endereço do episódio", void 0, true),
    date,
    t("guest", "Convidado", void 0, true),
    t("role", "Profissão"),
    t("num", "Número do episódio"),
    summary,
    body,
    t("tags", "Temas separados por vírgula"),
    t("location", "Local da gravação"),
    t("youtube", "ID ou link do YouTube", void 0, true),
    t("spotify", "ID ou link do episódio no Spotify"),
    image,
    t("portrait", "Foto autorizada do convidado", "image"),
    t("duration", "Duração (min:seg)"),
    t("seoTitle", "Título para buscadores"),
    t("seoDescription", "Descrição para buscadores", "area"),
    status,
    schedule,
  ],
  imprensa: [
    title,
    source,
    date,
    t("format", "Formato"),
    summary,
    url,
    image,
    status,
    schedule,
  ],
  pagina: [title, summary, body, image],
  indicador: [
    title,
    t("value", "Valor exibido", void 0, true),
    t("unit", "Rótulo curto"),
    summary,
    date,
    source,
    url,
    status,
  ],
  territorio: [
    title,
    {
      key: "scope",
      label: "Escala do mapa",
      type: "select",
      choices: mediaScopes,
      required: true,
    },
    t("position", "Posição no mapa", "map"),
    t("value", "Audiência ou alcance"),
    t("unit", "Unidade"),
    summary,
    date,
    source,
    url,
    status,
  ],
  foto: [
    title,
    t("image", "Arquivo ou link da foto", "image", true),
    t("alt", "Descrição da fotografia", void 0, true),
    t("credit", "Crédito e autorização"),
    t("context", "Seção", "select"),
    summary,
    status,
  ],
  ajustes: [
    t("youtube", "Canal no YouTube", "url"),
    t("spotify", "Programa ou episódio no Spotify", "url"),
    t("instagram", "Instagram", "url"),
    t("whatsapp", "Link de WhatsApp", "url"),
    t("email", "E-mail comercial", "email"),
    t("ga", "Identificador do GA4"),
    t("verification", "Código de verificação do Search Console"),
  ],
};
fields.foto.find((x) => x.key === "context").choices = [
  "Na Estrada",
  "O podcast",
  "Na mídia",
];
const names = {
  episodio: "Episódios",
  pagina: "Páginas e projetos",
  imprensa: "Imprensa",
  indicador: "Indicadores",
  territorio: "Territórios",
  foto: "Fotografias",
  ajustes: "Canais e medição",
};
const mapFile = (scope) =>
  scope === "Brasil"
    ? "/mapas/brasil.svg"
    : scope === "São Paulo"
      ? "/mapas/sao-paulo.svg"
      : "/mapas/mundo.svg";
export { fields, mapFile, names };
