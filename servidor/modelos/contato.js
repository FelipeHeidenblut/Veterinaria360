import { elemento, fragmento } from "./html.js";
import { Icon } from "./icones.js";
import { suggestedSubjects } from "../modelo.js";
function ContactForm() {
  return elemento(
    "form",
    { className: "contact-form", method: "post", "data-contato": true },
    elemento("h2", null, "Escreva para a produção"),
    elemento(
      "div",
      { className: "form-two" },
      elemento(
        "label",
        null,
        "Nome",
        elemento("input", {
          required: true,
          minLength: 2,
          maxLength: 100,
          name: "name",
          autoComplete: "name",
        }),
      ),
      elemento(
        "label",
        null,
        "E-mail",
        elemento("input", {
          required: true,
          maxLength: 254,
          type: "email",
          name: "email",
          autoComplete: "email",
        }),
      ),
    ),
    elemento(
      "label",
      null,
      "Assunto",
      elemento(
        "select",
        { required: true, name: "subject" },
        elemento(
          "option",
          { selected: true, disabled: true, value: "" },
          "Selecione um assunto",
        ),
        suggestedSubjects.map((s) => elemento("option", { key: s }, s)),
      ),
    ),
    elemento(
      "label",
      null,
      "Mensagem",
      elemento("textarea", {
        required: true,
        minLength: 10,
        maxLength: 3e3,
        name: "message",
        rows: 5,
        placeholder: "Conte um pouco sobre a sua ideia.",
      }),
    ),
    elemento(
      "div",
      { className: "trap", "aria-hidden": "true" },
      elemento(
        "label",
        null,
        "Website",
        elemento("input", {
          tabIndex: -1,
          name: "website",
          autoComplete: "off",
        }),
      ),
    ),
    elemento(
      "label",
      { className: "checkbox" },
      elemento("input", { type: "checkbox", required: true, name: "consent" }),
      elemento(
        "span",
        null,
        "Concordo com o uso destes dados para responder ao contato, conforme a",
        " ",
        elemento(
          "a",
          { href: "/privacidade", target: "_blank", rel: "noopener" },
          "política de privacidade",
        ),
        ".",
      ),
    ),
    elemento("p", { className: "form-error", role: "alert", hidden: true }),
    elemento(
      "button",
      { className: "btn btn-ink" },
      elemento(Icon, { name: "mail", size: 17 }),
      "Enviar mensagem",
    ),
  );
}
export { ContactForm };
