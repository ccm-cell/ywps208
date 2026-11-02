(function () {
  function docFull(doc) {
    try { return !!(doc.fullscreenElement || doc.webkitFullscreenElement); }
    catch (e) { return false; }
  }
  function inFrame() {
    return window.parent !== window;
  }
  function fsOn() {
    if (inFrame() && docFull(parent.document)) return true;
    return docFull(document);
  }
  function sync() {
    const btn = document.getElementById("fullBtn");
    const on = fsOn();
    document.body.classList.toggle("is-full", on);
    if (btn) btn.textContent = on ? "退出全螢幕" : "全螢幕";
    if (typeof fitTopBar === "function") fitTopBar();
  }
  function toggle() {
    if (inFrame()) {
      parent.postMessage({ type: "yw208-fs" }, location.origin);
      return;
    }
    const root = document.documentElement;
    if (docFull(document)) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    } else {
      const ask = root.requestFullscreen || root.webkitRequestFullscreen;
      if (ask) ask.call(root);
    }
  }
  function sitePage(href) {
    var url;
    try { url = new URL(href, location.href); }
    catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    var name = decodeURIComponent(url.pathname.split("/").pop() || "index.html");
    return name === "" || name === "index.html" || name === "bottle-flip.html" || name === "校慶禮堂.html";
  }
  function openFrame(href) {
    var frame = document.getElementById("fsFrame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "fsFrame";
      frame.title = "校慶";
      frame.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:200;background:#fff8ea";
      document.body.appendChild(frame);
    }
    frame.src = href;
  }
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest("#fullBtn");
    if (btn) {
      ev.preventDefault();
      toggle();
      return;
    }
    if (inFrame() || !docFull(document)) return;
    var link = ev.target.closest && ev.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    if (!sitePage(link.href)) return;
    ev.preventDefault();
    ev.stopPropagation();
    openFrame(link.href);
  }, true);
  window.addEventListener("message", function (ev) {
    if (ev.origin !== location.origin || !ev.data) return;
    if (ev.data.type === "yw208-fs-state") {
      document.body.classList.toggle("is-full", !!ev.data.on);
      var btn = document.getElementById("fullBtn");
      if (btn) btn.textContent = ev.data.on ? "退出全螢幕" : "全螢幕";
      return;
    }
    if (ev.data.type !== "yw208-fs") return;
    if (inFrame()) parent.postMessage({ type: "yw208-fs" }, location.origin);
    else toggle();
  });
  function onChange() {
    sync();
    var frame = document.getElementById("fsFrame");
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "yw208-fs-state", on: docFull(document) }, location.origin);
    }
    if (inFrame() || docFull(document) || !frame || !frame.src) return;
    var next = frame.src;
    frame.remove();
    if (next !== location.href) location.href = next;
  }
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
})();
