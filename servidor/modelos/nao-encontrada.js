import { elemento } from "./html.js";
function NotFound() {
  return elemento(
    "div",
    { className: "wrap page-main" },
    elemento(
      "a",
      { className: "btn btn-ink", href: "/episodios" },
      "Explorar episódios",
    ),
  );
}
export { NotFound as default };
