// Gera HTML a partir do acervo publicado. Rascunhos e mensagens não entram na exportação.
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  rename,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublished, diretorioMidia, fecharBanco } from "./dados.js";
import { origemOriginal } from "./catalogo.js";
import { rotas, renderPage, sitemap, robots } from "./paginas.js";
import { arquivoDaRota } from "./modelos/html.js";

const raiz = fileURLToPath(new URL("../", import.meta.url));
const origem = new URL(process.env.VET_ORIGIN || origemOriginal).origin;
if (!/^https?:\/\//.test(origem)) throw Error("Use uma origem HTTP ou HTTPS.");
const destino = resolve(process.argv[2] || join(raiz, "dist-estatico"));
const copia = await mkdtemp(
  join(dirname(destino), "." + basename(destino) + "-"),
);
try {
  const acervo = getPublished();
  for (const nome of [
    "css",
    "js",
    "fontes",
    "imagens",
    "mapas",
    "marca.svg",
    "favicon.svg",
  ])
    await cp(join(raiz, "site", nome), join(copia, nome), { recursive: true });
  const midias = new Set();
  for (const rota of rotas(acervo)) {
    const nome = join(copia, arquivoDaRota(rota));
    const html = renderPage(rota, acervo, { origin: origem });
    for (const match of html.matchAll(
      /(?:\.{1,2}\/|https?:\/\/[^/"]+\/)midia\/([a-f\d-]{36}\.(?:jpg|png|webp))/g,
    ))
      midias.add(match[1]);
    await mkdir(dirname(nome), { recursive: true });
    await writeFile(nome, html);
  }
  if (midias.size) await mkdir(join(copia, "midia"));
  for (const nome of midias)
    await copyFile(join(diretorioMidia, nome), join(copia, "midia", nome));
  await writeFile(join(copia, "robots.txt"), robots(origem));
  await writeFile(join(copia, "sitemap.xml"), sitemap(acervo, origem));
  try {
    await mkdir(destino);
  } catch (falha) {
    if (falha.code === "EEXIST")
      throw Error(
        "O destino já existe. Escolha uma pasta nova com npm run exportar -- ./outra-pasta.",
      );
    throw falha;
  }
  // O diretório recém-reservado está vazio; o conteúdo só se torna visível depois da geração.
  try {
    await rename(copia, destino);
  } catch (falha) {
    if (!["EEXIST", "EPERM", "EACCES", "ENOTEMPTY"].includes(falha.code))
      throw falha;
    await rmdir(destino);
    await rename(copia, destino);
  }
  console.log("Site estático gerado em " + destino);
} finally {
  fecharBanco();
  await rm(copia, { recursive: true, force: true });
}
