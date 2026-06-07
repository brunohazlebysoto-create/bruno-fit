import React from "react";
import { createRoot } from "react-dom/client";
import AppPrototype from "./AppPrototype";

const rootEl = document.getElementById("root") || (() => {
const el = document.createElement("div");
el.id = "root";
document.body.appendChild(el);
return el;
})();

const root = createRoot(rootEl);
root.render(<AppPrototype />);
