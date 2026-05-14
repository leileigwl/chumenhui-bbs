import React from "react";
import ReactDOM from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOM;
window.TWEAK_DEFAULTS = {
  accentColor: "#C95B15",
  showHotList: true,
};

(async () => {
  await import("./data.js");
  await import("./tweaks-panel.jsx");
  await import("./components.jsx");
  await import("./features.jsx");
  await import("./settings.jsx");
  await import("./app.jsx");
})();
