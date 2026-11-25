import {
  readFields,
  allEntries,
  apiJson,
  db,
  defaults,
  writeAllowed,
} from "../dados.js";
import { fields } from "../campos.js";
import { mediaScopes, safeSlug } from "../modelo.js";
async function GET(r) {
  if (new URL(r.url).searchParams.has("exportar")) {
    return new Response(
      JSON.stringify(
        {
          versao: 1,
          exportadoEm: new Date().toISOString(),
          registros: await allEntries(),
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=veterinaria360-acervo.json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
  const [entries, messages] = await Promise.all([
    allEntries(),
    db()
      .prepare(
        "SELECT id, created, name, email, subject, message FROM contact_messages ORDER BY created DESC",
      )
      .all(),
  ]);
  return apiJson({ entries, messages: messages.results });
}
function validDate(value) {
  return (
    /^\d{4}-\d\d-\d\d$/.test(value) &&
    !Number.isNaN(Date.parse(value + "T12:00:00Z"))
  );
}
function validUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
function videoId(value, spotify = false) {
  if (!value) return "";
  const re = spotify ? /^[A-Za-z0-9]{22}$/ : /^[A-Za-z0-9_-]{11}$/;
  if (re.test(value)) return value;
  try {
    const u = new URL(value);
    let id = null;
    if (spotify && u.hostname === "open.spotify.com")
      id = u.pathname.match(/\/episode\/([A-Za-z0-9]+)/)?.[1] || null;
    if (
      !spotify &&
      ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        u.hostname,
      )
    )
      id = u.searchParams.get("v") || u.pathname.split("/").pop() || null;
    return id && re.test(id) ? id : "";
  } catch {
    return "";
  }
}
async function POST(req) {
  if (!writeAllowed(req))
    return apiJson({ error: "Acesso reservado à equipe editorial." }, 403);
  const form = await readFields(req);
  if (!form) return apiJson({ error: "Pedido inválido." }, 400);
  const kind = form.kind;
  if (!Object.hasOwn(fields, kind))
    return apiJson({ error: "Seção inválida." }, 400);
  const key = typeof form.id === "string" ? form.id : "";
  if (
    !/^[a-z0-9-]{1,108}$/.test(key) ||
    typeof form.rev !== "number" ||
    !Number.isInteger(form.rev) ||
    form.rev < 0
  )
    return apiJson({ error: "Registro inválido." }, 400);
  const standard = defaults.find((x) => x.id === key);
  if (
    (standard && standard.kind !== kind) ||
    ((kind === "pagina" || kind === "ajustes") && !standard)
  )
    return apiJson({ error: "Registro indisponível." }, 400);
  const old = await db()
    .prepare("SELECT kind,revision FROM editorial_records WHERE id=?")
    .bind(key)
    .first();
  if ((old && old.kind !== kind) || (old?.revision ?? 0) !== form.rev)
    return apiJson(
      { error: "Este registro mudou. Recarregue o painel antes de editar." },
      409,
    );
  const record = { status: "publicado" };
  for (const field of fields[kind]) {
    let val = String(form[field.key] ?? "").trim();
    if (val.length > (field.type === "area" ? 12e3 : 1600))
      return apiJson(
        { error: "Texto muito longo no campo " + field.label + "." },
        400,
      );
    if (field.required && !val)
      return apiJson({ error: "Preencha o campo " + field.label + "." }, 400);
    if (
      val &&
      ((field.type === "date" && !validDate(val)) ||
        (field.type === "url" && !validUrl(val)) ||
        (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)))
    )
      return apiJson({ error: "Confira o campo " + field.label + "." }, 400);
    if (
      field.type === "image" &&
      val &&
      !validUrl(val) &&
      !/^\/(imagens|midia)\/[\w.-]+$/.test(val)
    )
      return apiJson(
        { error: "Use uma imagem HTTPS ou envie um arquivo." },
        400,
      );
    if (field.type === "select" && val && !field.choices?.includes(val))
      return apiJson({ error: "Opção inválida em " + field.label + "." }, 400);
    if (field.type === "status" && !["rascunho", "publicado"].includes(val))
      return apiJson({ error: "Escolha a situação editorial." }, 400);
    if (field.key === "publishAt" && val) {
      if (!Number.isFinite(Date.parse(val)))
        return apiJson({ error: "Agendamento inválido." }, 400);
      val = new Date(val).toISOString();
    }
    if (
      kind === "episodio" &&
      ["youtube", "spotify"].includes(field.key) &&
      val
    ) {
      val = videoId(val, field.key === "spotify");
      if (!val)
        return apiJson(
          { error: "Confira o link de " + field.label + "." },
          400,
        );
    }
    if (field.key === "ga" && val && !/^G-[A-Z0-9]{4,20}$/.test(val))
      return apiJson({ error: "Confira o ID do GA4." }, 400);
    if (field.key === "position" && val) {
      const nums = val.split(",").map(Number);
      if (
        nums.length !== 2 ||
        nums.some((n) => !Number.isFinite(n) || n < 0 || n > 100)
      )
        return apiJson({ error: "Escolha um ponto dentro do mapa." }, 400);
    }
    record[field.key] = val;
  }
  if (kind === "episodio") {
    record.slug = safeSlug(record.slug);
    if (!record.slug)
      return apiJson({ error: "Defina um endereço para o episódio." }, 400);
    if (key !== record.slug)
      return apiJson(
        { error: "O endereço fica fixo depois do primeiro cadastro." },
        400,
      );
  }
  if (kind === "territorio" && !mediaScopes.includes(record.scope))
    return apiJson({ error: "Escala inválida." }, 400);
  if (kind === "ajustes") record.title = "Canais e integrações";
  const result = await db()
    .prepare(
      "INSERT INTO editorial_records (id,kind,payload,revision) VALUES (?,?,?,1) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,revision=editorial_records.revision+1 WHERE editorial_records.revision=? AND editorial_records.kind=excluded.kind",
    )
    .bind(key, kind, JSON.stringify(record), form.rev)
    .run();
  if (!result.meta.changes)
    return apiJson(
      {
        error:
          "O registro foi atualizado em outra sessão. Recarregue o painel.",
      },
      409,
    );
  return apiJson({
    entry: { ...record, id: key, kind, rev: form.rev + 1 },
  });
}
export { GET, POST };
