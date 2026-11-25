import { elemento, fragmento } from "./html.js";
function Icon({ name, size = 20, className = "", style }) {
  const line = (d) => elemento("path", { d });
  const shapes = {
    play: elemento("path", {
      d: "M8 4.8c0-.6.65-.99 1.17-.67l11 7.17c.5.32.5 1.05 0 1.38l-11 7.17c-.52.32-1.17-.07-1.17-.67z",
      fill: "currentColor",
      stroke: "none",
    }),
    mic: elemento(
      fragmento,
      null,
      elemento("rect", { x: "9", y: "2", width: "6", height: "13", rx: "3" }),
      line("M5 10a7 7 0 0 0 14 0M12 17v4m-4 0h8"),
    ),
    wave: line("M2 10v4m4-8v12m4-15v18m4-13v10m4-14v16m4-11v6"),
    youtube: elemento(
      fragmento,
      null,
      elemento("path", {
        d: "M22.5 7.1a3.4 3.4 0 0 0-2.1-2.4c-2-.6-14.6-.6-16.7 0a3.4 3.4 0 0 0-2.1 2.4 25 25 0 0 0 0 9.8 3.4 3.4 0 0 0 2.1 2.4c2.1.6 14.7.6 16.7 0a3.4 3.4 0 0 0 2.1-2.4 25 25 0 0 0 0-9.8z",
        fill: "currentColor",
        stroke: "none",
      }),
      elemento("path", {
        d: "m10 8.5 5.7 3.5-5.7 3.5z",
        className: "brand-cut",
        fill: "var(--icon-cut,#1c3327)",
        stroke: "none",
      }),
    ),
    spotify: elemento(
      fragmento,
      null,
      elemento("circle", {
        cx: "12",
        cy: "12",
        r: "10.7",
        fill: "currentColor",
        stroke: "none",
      }),
      elemento(
        "g",
        { stroke: "var(--icon-cut,#1c3327)", strokeWidth: "1.55" },
        line(
          "M5.7 9c4.3-1.35 8.9-1.2 12.5.8M6.6 12.1c3.7-1.1 7.8-.85 10.9.75M7.5 15.1c2.85-.8 6.35-.6 8.9.65",
        ),
      ),
    ),
    instagram: elemento(
      fragmento,
      null,
      elemento("rect", { x: "3", y: "3", width: "18", height: "18", rx: "5" }),
      elemento("circle", { cx: "12", cy: "12", r: "4.15" }),
      elemento("circle", {
        cx: "17.4",
        cy: "6.8",
        r: "1",
        fill: "currentColor",
        stroke: "none",
      }),
    ),
    pin: elemento(
      fragmento,
      null,
      line("M19 10c0 5.4-7 12-7 12S5 15.4 5 10a7 7 0 1 1 14 0z"),
      elemento("circle", { cx: "12", cy: "10", r: "2.5" }),
    ),
    menu: line("M3 6h18M3 12h18M3 18h18"),
    close: line("m5 5 14 14M19 5 5 19"),
    search: elemento(
      fragmento,
      null,
      elemento("circle", { cx: "10.8", cy: "10.8", r: "6.75" }),
      line("m16 16 5 5"),
    ),
    headphones: line(
      "M3 14v-2a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2M3 13a2 2 0 0 1 2-2h2v8H5a2 2 0 0 1-2-2z",
    ),
    chat: line(
      "M21 11.5a8.5 8.5 0 0 1-9 8.1c-1.3 0-2.6-.2-3.6-.6L3 21l1.3-5A7.7 7.7 0 0 1 3 11.5a9 8.1 0 1 1 18 0z",
    ),
    compass: elemento(
      fragmento,
      null,
      elemento("circle", { cx: "12", cy: "12", r: "9" }),
      line("m16 8-2.4 5.6L8 16l2.4-5.6z"),
    ),
    external: line(
      "M14 4h6v6m0-6-9 9m0-9H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5",
    ),
    layers: line("m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"),
    clock: elemento(
      fragmento,
      null,
      elemento("circle", { cx: "12", cy: "12", r: "9" }),
      line("M12 7v5l3 2"),
    ),
    calendar: elemento(
      fragmento,
      null,
      elemento("rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }),
      line("M7 3v4m10-4v4M3 11h18"),
    ),
    whatsapp: elemento(
      fragmento,
      null,
      line(
        "M20.5 11.9a8.5 8.5 0 0 1-12.7 7.4L3 20.7l1.35-4.6a8.5 8.5 0 1 1 16.15-4.2Z",
      ),
      elemento("path", {
        d: "M8 7.8c-.7.3-1 1.4-.5 2.5.9 2.7 3.6 5.2 6.3 5.8 1 .2 2.1-.2 2.5-1.1l.35-1.1-2.45-1.15-.9 1.15c-1.6-.7-2.7-1.75-3.55-3.25l.9-1.2-.95-2z",
        fill: "currentColor",
        stroke: "none",
      }),
    ),
    mail: elemento(
      fragmento,
      null,
      elemento("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
      line("m4 7 8 6 8-6"),
    ),
    check: line("m4 12 5 5L20 6"),
    globe: elemento(
      fragmento,
      null,
      elemento("circle", { cx: "12", cy: "12", r: "9" }),
      elemento("ellipse", { cx: "12", cy: "12", rx: "4", ry: "9" }),
      line("M3 12h18"),
    ),
    broadcast: elemento(
      fragmento,
      null,
      elemento("circle", {
        cx: "12",
        cy: "12",
        r: "1.7",
        fill: "currentColor",
      }),
      line(
        "M8.5 7a6 6 0 0 0 0 10m7-10a6 6 0 0 1 0 10M6 3.8a10 10 0 0 0 0 16.4m12-16.4a10 10 0 0 1 0 16.4",
      ),
    ),
    plus: line("M12 4v16M4 12h16"),
    back: line("m14.5 5-7 7 7 7"),
    filter: line("M3 6h18M6 12h12m-9 6h6"),
    book: elemento(
      fragmento,
      null,
      line(
        "M3 4.5c3.6-.7 6.6.1 9 1.7 2.4-1.6 5.4-2.4 9-1.7V19c-3.1-.65-6.25.1-9 1.5-2.75-1.4-5.9-2.15-9-1.5zM12 6.2v14",
      ),
    ),
    camera: elemento(
      fragmento,
      null,
      elemento("rect", {
        x: "2.5",
        y: "6.5",
        width: "19",
        height: "14",
        rx: "2",
      }),
      line("m7 6.5 1.5-3h7l1.5 3"),
      elemento("circle", { cx: "12", cy: "13", r: "3.3" }),
    ),
    route: elemento(
      fragmento,
      null,
      elemento("circle", { cx: "4.5", cy: "18.5", r: "2" }),
      elemento("circle", { cx: "19.5", cy: "5.5", r: "2" }),
      line("M6.5 18.5H16a3.3 3.3 0 0 0 0-6.5H9a3.3 3.3 0 0 1 0-6.5h8"),
    ),
  };
  return elemento(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.65",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      className,
      style,
    },
    shapes[name],
  );
}
export { Icon };
