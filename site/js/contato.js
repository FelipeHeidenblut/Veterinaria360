(() => {
  const form = document.querySelector("[data-contato]");
  if (!form) return;
  const servidor = document.body.dataset.servidor === "sim";
  const whatsapp = document.querySelector('[data-track="contato_whatsapp"]');
  const enviar = form.querySelector("button");
  const erro = form.querySelector("[role=alert]");
  const aviso = document.createElement("p");
  aviso.className = "aviso-estatico";
  let id;
  if (!servidor) {
    aviso.textContent = whatsapp
      ? "Nesta cópia estática, você pode preparar a mensagem e enviá-la pelo WhatsApp da produção."
      : "Para enviar pelo formulário, abra este site com o servidor que acompanha o projeto.";
    form.insertBefore(aviso, enviar);
    enviar.textContent = "Preparar mensagem para WhatsApp";
    enviar.disabled = !whatsapp;
  }
  function confirmar(titulo, texto, url) {
    const area = document.createElement("div");
    area.className = "form-success";
    const h = document.createElement("h2");
    h.textContent = titulo;
    h.tabIndex = -1;
    const p = document.createElement("p");
    p.textContent = texto;
    const voltar = document.createElement("button");
    voltar.type = "button";
    voltar.className = "line-link";
    voltar.textContent = url
      ? "Voltar ao formulário"
      : "Escrever outra mensagem";
    voltar.addEventListener("click", () => {
      area.remove();
      form.hidden = false;
      form.elements.name.focus();
    });
    area.append(h, p);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      a.className = "btn btn-ink";
      a.textContent = "Abrir WhatsApp";
      area.append(a);
    }
    area.append(voltar);
    form.after(area);
    form.hidden = true;
    h.focus();
  }
  form.addEventListener("input", () => {
    id = undefined;
    erro.hidden = true;
  });
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviar.disabled || !form.reportValidity()) return;
    const dados = Object.fromEntries(new FormData(form));
    dados.consent = form.elements.consent.checked;
    erro.hidden = true;
    if (!servidor) {
      if (!whatsapp) return;
      const url = new URL(whatsapp.href);
      url.searchParams.set(
        "text",
        [dados.subject, dados.message, dados.name + " · " + dados.email].join(
          "\n\n",
        ),
      );
      confirmar(
        "Sua mensagem está pronta",
        "Abra o WhatsApp para revisar a mensagem e concluir o envio.",
        url.href,
      );
      return;
    }
    enviar.disabled = true;
    try {
      if (!id) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        id = [
          hex.slice(0, 8),
          hex.slice(8, 12),
          hex.slice(12, 16),
          hex.slice(16, 20),
          hex.slice(20),
        ].join("-");
      }
      const resp = await fetch("./api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, requestId: id }),
      });
      const resposta = await resp.json();
      if (!resp.ok || !resposta.ok)
        throw Error(resposta.error || "Não foi possível enviar a mensagem.");
      form.reset();
      id = undefined;
      confirmar(
        "Mensagem recebida",
        "A produção recebeu seu contato e poderá responder pelo e-mail informado.",
      );
    } catch (falha) {
      erro.textContent = falha.message || "Falha de conexão. Tente novamente.";
      erro.hidden = false;
    } finally {
      enviar.disabled = false;
    }
  });
})();
