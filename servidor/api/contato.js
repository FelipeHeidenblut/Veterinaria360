import {
  readFields,
  apiJson,
  db,
  getPublished,
  writeAllowed,
} from "../dados.js";
import { suggestedSubjects } from "../modelo.js";
const env = process.env;
async function POST(req) {
  if (!writeAllowed(req))
    return apiJson({ error: "Abra o formulário no próprio site." }, 403);
  if (Number(req.headers.get("content-length") || 0) > 16e3)
    return apiJson({ error: "A mensagem é muito longa." }, 413);
  const form = await readFields(req);
  if (!form) return apiJson({ error: "Revise os campos do formulário." }, 400);
  if (form.website) return apiJson({ ok: true });
  const name = String(form.name || "").trim(),
    email = String(form.email || "").trim(),
    subject = String(form.subject || "").trim(),
    message = String(form.message || "").trim();
  if (
    name.length < 2 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !suggestedSubjects.includes(subject) ||
    message.length < 10 ||
    message.length > 3e3 ||
    form.consent !== true
  )
    return apiJson(
      { error: "Confira o nome, o e-mail, o assunto e a mensagem." },
      400,
    );
  const key = String(form.requestId || "");
  if (!/^[a-f0-9-]{36}$/.test(key))
    return apiJson({ error: "Atualize a página para tentar de novo." }, 400);
  const address = req.headers.get("x-vet-peer") || email.toLowerCase();
  const day = new Date().toISOString().slice(0, 10);
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(day + "|" + address),
  );
  const hash = Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const now = Date.now();
  try {
    const result = await db()
      .prepare(
        "INSERT INTO contact_messages (id,created,name,email,subject,message,consent,sender_hash) SELECT ?,?,?,?,?,?,1,? WHERE (SELECT count(*) FROM contact_messages WHERE sender_hash=? AND created>?)<5 ON CONFLICT(id) DO NOTHING",
      )
      .bind(key, now, name, email, subject, message, hash, hash, now - 36e5)
      .run();
    if (!result.meta.changes) {
      const previous = await db()
        .prepare("SELECT id FROM contact_messages WHERE id=? AND email=?")
        .bind(key, email)
        .first();
      return previous
        ? apiJson({ ok: true })
        : apiJson(
            {
              error:
                "Você já enviou algumas mensagens. Tente mais tarde ou use o WhatsApp.",
            },
            429,
          );
    }
  } catch {
    return apiJson(
      {
        error:
          "O envio ficou indisponível. Tente novamente ou fale pelo WhatsApp.",
      },
      503,
    );
  }
  const dest = (await getPublished()).settings.email;
  if (env.RESEND_API_KEY && env.MAIL_FROM && dest) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.RESEND_API_KEY,
          "Content-Type": "application/json",
          "Idempotency-Key": "vet360-" + key,
        },
        body: JSON.stringify({
          from: env.MAIL_FROM,
          to: [dest],
          reply_to: email,
          subject: "Veterinária 360° | " + subject,
          text: name + " (" + email + ")\n\n" + message,
        }),
        signal: AbortSignal.timeout(4e3),
      });
    } catch {}
  }
  return apiJson({ ok: true });
}
export { POST };
