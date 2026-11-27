(function () {
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (_) {}
  if (saved) document.documentElement.dataset.theme = saved;
  window.toggleTheme = function () {
    var root = document.documentElement;
    var dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
  };
})();
