import React from "react";
import ReactDOM from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOM;
window.TWEAK_DEFAULTS = {
  accentColor: "#C95B15",
  showHotList: true,
};

// 显示加载中
const rootEl = document.getElementById('root')
rootEl.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;color:#C95B15;font-size:14px;font-family:\'Noto Sans SC\',sans-serif">加载中…</div>'

;(async () => {
  // 先加载真实数据（等待 fetch 完成）
  const loaderModule = await import("./api-loader.js");
  await loaderModule.default;

  // 清空加载提示
  rootEl.innerHTML = ''

  await import("./tweaks-panel.jsx");
  await import("./components.jsx");
  await import("./features.jsx");
  await import("./settings.jsx");
  await import("./app.jsx");
})();
