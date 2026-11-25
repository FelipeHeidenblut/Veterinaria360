import { createServer } from "node:http";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaults, origemOriginal, publicar } from "./catalogo.js";
import { getPublished, apiJson, diretorioMidia, fecharBanco } from "./dados.js";
import { rotas, renderPage, sitemap, robots } from "./paginas.js";
import { arquivoDaRota } from "./modelos/html.js";
import * as editorial from "./api/editorial.js";
import * as contato from "./api/contato.js";
import * as fotos from "./api/fotos.js";

const web = fileURLToPath(new URL("../site/", import.meta.url));
const host = process.env.VET_HOST || "127.0.0.1";
const porta = Number(process.env.VET_PORT || 3000);
const locais = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const local = locais.has(host);
const origemFixa = process.env.VET_ORIGIN
  ? new URL(process.env.VET_ORIGIN).origin
  : "";
if (origemFixa && !/^https?:\/\//.test(origemFixa))
  throw Error("VET_ORIGIN deve ser um endereço HTTP ou HTTPS.");
if (!local && (!origemFixa || !process.env.VET_EDITOR_PASSWORD))
  throw Error(
    "Para servir na rede, configure VET_ORIGIN e VET_EDITOR_PASSWORD.",
  );
if (!Number.isInteger(porta) || porta < 0 || porta > 65535)
  throw Error("A porta informada é inválida.");
const senha =
  process.env.VET_EDITOR_PASSWORD || randomBytes(18).toString("base64url");
const digest = (valor) => createHash("sha256").update(valor).digest();
const credencial = digest(
  "Basic " + Buffer.from("redacao:" + senha).toString("base64"),
);
const catalogoBase = publicar(defaults);
const paginasBase = new Map(
  rotas(catalogoBase).map((rota) => [rota, renderPage(rota, catalogoBase)]),
);
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
};
const mimeHtml = tipos[".html"];
const rotasApi = new Map([
  ["/api/contato", { POST: contato.POST, limite: 16000 }],
  [
    "/api/editorial",
    { GET: editorial.GET, POST: editorial.POST, limite: 180000 },
  ],
  ["/api/fotos", { POST: fotos.POST, limite: 6000000 }],
]);
function origemPedido(requisicao) {
  if (origemFixa) return origemFixa;
  const autoridade = requisicao.headers.host || "";
  if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i.test(autoridade))
    throw Object.assign(Error(), { status: 400 });
  return new URL("http://" + autoridade).origin;
}
async function lerCorpo(req, limite) {
  if (Number(req.headers["content-length"]) > limite)
    throw Object.assign(Error(), { status: 413 });
  const blocos = [];
  let tamanho = 0;
  for await (const bloco of req) {
    tamanho += bloco.length;
    if (tamanho > limite) throw Object.assign(Error(), { status: 413 });
    blocos.push(bloco);
  }
  return Buffer.concat(blocos);
}
function texto(corpo, tipo, status = 200) {
  return new Response(corpo, {
    status,
    headers: { "Content-Type": tipo, "Cache-Control": "no-cache" },
  });
}
async function arquivo(caminho) {
  try {
    return texto(
      await readFile(caminho),
      tipos[extname(caminho)] || "application/octet-stream",
    );
  } catch (falha) {
    if (!["ENOENT", "ENOTDIR"].includes(falha.code)) throw falha;
    return null;
  }
}
async function pagina(rota, catalogo, origem, status) {
  const original = paginasBase.get(rota);
  if (original && renderPage(rota, catalogo) === original) {
    try {
      // Edições manuais no HTML têm efeito enquanto o conteúdo editorial desta página usar a base do pacote.
      const html = await readFile(join(web, arquivoDaRota(rota)), "utf8");
      return texto(
        html
          .replace('data-servidor="nao"', 'data-servidor="sim"')
          .replaceAll(origemOriginal, origem),
        mimeHtml,
        status,
      );
    } catch (falha) {
      if (falha.code !== "ENOENT") throw falha;
    }
  }
  return texto(
    renderPage(rota, catalogo, { origin: origem, servidor: true }),
    mimeHtml,
    status,
  );
}
async function atender(req) {
  const origem = origemPedido(req);
  if (!req.url?.startsWith("/") || req.url.startsWith("//"))
    return apiJson({ error: "Endereço inválido." }, 400);
  const url = new URL(req.url, origem);
  const caminho = url.pathname.replace(/\/+$/, "") || "/";
  const api = rotasApi.get(caminho);
  const privado = [
    "/redacao",
    "/redacao.html",
    "/api/editorial",
    "/api/fotos",
  ].includes(caminho);
  if (
    privado &&
    !timingSafeEqual(credencial, digest(req.headers.authorization || ""))
  ) {
    return new Response(
      "Área da produção. Entre com o usuário redacao e a senha do servidor.",
      {
        status: 401,
        headers: {
          "Content-Type": tipos[".txt"],
          "WWW-Authenticate": 'Basic realm="Veterinaria 360", charset="UTF-8"',
          "Cache-Control": "no-store",
        },
      },
    );
  }
  if (api) {
    const metodo = req.method === "HEAD" ? "GET" : req.method;
    if (!["GET", "POST"].includes(metodo) || !api[metodo])
      return apiJson({ error: "Método indisponível." }, 405);
    const headers = new Headers();
    for (const nome of ["content-type", "content-length", "origin"])
      if (req.headers[nome]) headers.set(nome, req.headers[nome]);
    headers.set("x-vet-peer", req.socket.remoteAddress || "");
    const corpo =
      metodo === "POST" ? await lerCorpo(req, api.limite) : undefined;
    return api[metodo](
      new Request(url, { method: metodo, headers, body: corpo }),
    );
  }
  if (!["GET", "HEAD"].includes(req.method))
    return apiJson({ error: "Método indisponível." }, 405);
  let recurso;
  if (
    /^\/(?:imagens|mapas|fontes|css|js)\/[a-zA-Z0-9_.-]+\.(?:txt|woff2|svg|webp|css|js)$/.test(
      caminho,
    ) ||
    ["/favicon.svg", "/marca.svg"].includes(caminho)
  )
    recurso = await arquivo(join(web, caminho.slice(1)));
  else if (/^\/midia\/[a-f\d-]{36}\.(?:jpg|png|webp)$/.test(caminho))
    recurso = await arquivo(
      join(diretorioMidia, caminho.slice("/midia/".length)),
    );
  if (recurso) return recurso;
  const catalogo = getPublished();
  if (caminho === "/sitemap.xml")
    return texto(
      sitemap(catalogo, origem, true),
      "application/xml; charset=utf-8",
    );
  if (caminho === "/robots.txt") return texto(robots(origem), tipos[".txt"]);
  const rota = caminho === "/index.html" ? "/" : caminho.replace(/\.html$/, "");
  if (rota !== "/404" && rotas(catalogo).includes(rota)) {
    const resposta = await pagina(rota, catalogo, origem, 200);
    if (privado) resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  }
  if (caminho.startsWith("/api/"))
    return apiJson({ error: "Recurso não encontrado." }, 404);
  return pagina("/404", catalogo, origem, 404);
}
const server = createServer(async (req, res) => {
  try {
    const resposta = await atender(req);
    res.writeHead(resposta.status, {
      ...Object.fromEntries(resposta.headers),
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    res.end(
      req.method === "HEAD"
        ? undefined
        : Buffer.from(await resposta.arrayBuffer()),
    );
  } catch (falha) {
    const status = falha.status || 500;
    if (status === 500)
      console.error("Falha ao atender o pedido:", falha.message);
    if (!res.headersSent)
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
    res.end(
      JSON.stringify({
        error:
          status === 413
            ? "O arquivo ou a mensagem excede o limite."
            : "Não foi possível concluir o pedido.",
      }),
    );
  }
});
server.listen(porta, host, () => {
  const portaAtiva = server.address().port;
  const endereco =
    origemFixa ||
    "http://" + (host === "::1" ? "[::1]" : host) + ":" + portaAtiva;
  console.log(
    "Site em " +
      endereco +
      "\nRedação em " +
      endereco +
      "/redacao.html (usuário redacao)",
  );
  if (!process.env.VET_EDITOR_PASSWORD)
    console.log("Senha local desta execução: " + senha);
});
for (const sinal of ["SIGTERM", "SIGINT"])
  process.once(sinal, () =>
    server.close(() => {
      fecharBanco();
      process.exit(0);
    }),
  );
