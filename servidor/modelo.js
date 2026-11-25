const topics = [
  "Cães e gatos",
  "Grandes animais",
  "Agronegócio",
  "Saúde pública",
  "Gestão",
  "Tecnologia",
  "Produção animal",
];
const nav = [
  ["/", "Início"],
  ["/o-podcast", "O podcast"],
  ["/episodios", "Episódios"],
  ["/na-estrada", "Na Estrada"],
  ["/na-midia", "Na mídia"],
  ["/audiencia", "Audiência"],
];
const sections = [
  ...nav.slice(1).map(([p]) => p.slice(1)),
  "contato",
  "privacidade",
  "creditos",
];
const suggestedSubjects = [
  "Patrocínio e parcerias",
  "Sugestão de pauta",
  "Produção audiovisual",
  "Cobertura de evento",
  "Outro assunto",
];
const mediaScopes = ["Mundo", "Brasil", "São Paulo"];
function dateLabel(value, full = false) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: full ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(value.slice(0, 10) + "T12:00:00Z"))
    .replaceAll(" de ", " ");
}
function tags(entry) {
  return String(entry.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
function fieldSeries(entry) {
  return tags(entry).includes("Na Estrada");
}
function ordered(list) {
  return list
    .slice()
    .sort(
      (a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")) ||
        a.title.localeCompare(b.title, "pt-BR"),
    );
}
function safeSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
function readable(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}
export {
  dateLabel,
  fieldSeries,
  mediaScopes,
  nav,
  ordered,
  readable,
  safeSlug,
  sections,
  suggestedSubjects,
  tags,
  topics,
};
