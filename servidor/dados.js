import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaults, publicar } from "./catalogo.js";

export { defaults };
export const diretorioDados = process.env.VET_DATA_DIR
  ? resolve(process.env.VET_DATA_DIR)
  : fileURLToPath(new URL("../dados/", import.meta.url));
export const diretorioMidia = join(diretorioDados, "midia");
let conexao;
function abrir() {
  if (conexao) return conexao;
  mkdirSync(diretorioDados, { recursive: true, mode: 0o700 });
  const arquivo = join(diretorioDados, "veterinaria360.sqlite");
  const banco = new DatabaseSync(arquivo);
  try {
    chmodSync(arquivo, 0o600);
    banco.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000");
    banco.exec(
      "CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY NOT NULL, created INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, consent INTEGER NOT NULL, sender_hash TEXT NOT NULL)",
    );
    banco.exec(
      "CREATE INDEX IF NOT EXISTS contact_sender_time ON contact_messages(sender_hash,created)",
    );
    banco.exec(
      "CREATE TABLE IF NOT EXISTS editorial_records (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, revision INTEGER NOT NULL)",
    );
  } catch (erro) {
    banco.close();
    throw erro;
  }
  conexao = banco;
  return conexao;
}
export function fecharBanco() {
  if (conexao) {
    conexao.close();
    conexao = undefined;
  }
}
// Mantém a interface de consultas usada pelos controladores da edição publicada.
export function db() {
  return {
    prepare(sql) {
      const consulta = abrir().prepare(sql);
      function vincular(...valores) {
        return {
          bind: vincular,
          all: () => ({ results: consulta.all(...valores) }),
          first: () => consulta.get(...valores) || null,
          run: () => ({
            meta: { changes: Number(consulta.run(...valores).changes) },
          }),
        };
      }
      return vincular();
    },
  };
}
export function allEntries() {
  const registros = new Map(defaults.map((item) => [item.id, item]));
  for (const linha of abrir()
    .prepare("SELECT id, kind, payload, revision FROM editorial_records")
    .all()) {
    registros.set(linha.id, {
      ...JSON.parse(linha.payload),
      id: linha.id,
      kind: linha.kind,
      rev: linha.revision,
    });
  }
  return [...registros.values()];
}
export const getPublished = () => publicar(allEntries());
export const writeAllowed = (req) =>
  req.headers.get("origin") === new URL(req.url).origin;
export function apiJson(valor, status = 200) {
  return Response.json(valor, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function readFields(req) {
  try {
    const dados = await req.json();
    return dados && typeof dados === "object" && !Array.isArray(dados)
      ? dados
      : null;
  } catch {
    return null;
  }
}
export async function guardarImagem(chave, dados) {
  if (!/^[a-f\d-]{36}\.(png|jpg|webp)$/.test(chave))
    throw Error("Nome de mídia inválido.");
  mkdirSync(diretorioMidia, { recursive: true, mode: 0o700 });
  await writeFile(join(diretorioMidia, chave), new Uint8Array(dados), {
    flag: "wx",
    mode: 0o600,
  });
}
