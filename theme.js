/* Loaded synchronously in <head> to avoid a flash of the wrong theme.
   Modes: "auto" (follows the OS, default), "dark", "light". */
(function () {
  var KEY = "beaztcode-theme";
  var mode = "auto";
  try { mode = localStorage.getItem(KEY) || "auto"; } catch (e) {}
  var root = document.documentElement;
  if (mode === "dark" || mode === "light") root.setAttribute("data-theme", mode);
  window.BeaztTheme = {
    get: function () { return mode; },
    set: function (m) {
      mode = m;
      try { if (m === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch (e) {}
      if (m === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", m);
      window.BeaztTheme.sync();
    },
    effective: function () {
      if (mode !== "auto") return mode;
      return window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    },
    sync: function () {
      var color = window.BeaztTheme.effective() === "light" ? "#f6f8fc" : "#07090f";
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      for (var i = 0; i < metas.length; i++) { metas[i].setAttribute("content", color); metas[i].removeAttribute("media"); }
      document.dispatchEvent(new Event("themechange"));
    }
  };
})();
