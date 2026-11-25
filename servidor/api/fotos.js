import { guardarImagem } from "../dados.js";
import { apiJson, writeAllowed } from "../dados.js";
async function POST(request) {
  if (!writeAllowed(request))
    return apiJson({ error: "Acesso reservado à produção." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 65e5)
    return apiJson({ error: "Use uma imagem de até 6 MB." }, 413);
  const type = request.headers.get("content-type") || "",
    ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
  if (!Object.hasOwn(ext, type))
    return apiJson({ error: "Use JPEG, PNG ou WebP." }, 400);
  const buf = await request.arrayBuffer(),
    u = new Uint8Array(buf);
  if (buf.byteLength > 6e6 || buf.byteLength < 12)
    return apiJson({ error: "Confira o tamanho da imagem (até 6 MB)." }, 400);
  const is = (s, offset = 0) =>
    [...s].every((c, i) => u[offset + i] === c.charCodeAt(0));
  const ok =
    type === "image/png"
      ? u[0] === 137 && is("PNG", 1)
      : type === "image/webp"
        ? is("RIFF") && is("WEBP", 8)
        : u[0] === 255 && u[1] === 216 && u[2] === 255;
  if (!ok)
    return apiJson(
      { error: "O formato do arquivo não corresponde à imagem." },
      400,
    );
  const key = crypto.randomUUID() + "." + ext[type];
  await guardarImagem(key, buf);
  return apiJson({ url: "/midia/" + key });
}
export { POST };
