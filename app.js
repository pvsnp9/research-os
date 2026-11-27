// One renderer for all pages. The page is chosen by <body data-page="...">.
// Data comes from data/*.js (window.SITE/RESOURCES/EXPERIMENTS); live run data
// is fetched from results/<slug>/ when the site is served over http.
(function () {
  var PAGE = document.body.dataset.page;
  var Q = new URLSearchParams(location.search);
  var main = document.getElementById("main");

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fetchText(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      return r.ok ? r.text() : null;
    }).catch(function () { return null; });
  }
  function fetchJSON(url) {
    return fetchText(url).then(function (t) { return t === null ? null : JSON.parse(t); });
  }

  // ----- header -----
  var ACTIVE = { home: "Home", readings: "Readings", experiments: "Experiments",
                 experiment: "Experiments", paper: "Readings" }[PAGE];
  var tabs = [["home.html", "Home"], ["readings.html", "Readings"], ["experiments.html", "Experiments"]];
  document.getElementById("header").innerHTML =
    '<div class="masthead"><a class="site" href="home.html">' + esc(SITE.name) + "</a><nav>" +
    tabs.map(function (t) {
      return '<a href="' + t[0] + '"' + (t[1] === ACTIVE ? ' class="active"' : "") + ">" + t[1] + "</a>";
    }).join("") +
    '</nav><button id="theme-toggle" title="Toggle theme">&#9680;</button></div>';
  document.getElementById("theme-toggle").onclick = window.toggleTheme;

  // ----- shared rows -----
  function expMeta(e) {
    var bits = [e.status, e.verdict, e.stage, e.ran_by, e.review].filter(Boolean);
    return bits.join(" &middot; ");
  }
  function expRow(e) {
    return '<a class="row" href="experiment.html?e=' + encodeURIComponent(e.slug) + '">' +
      '<span class="title">' + esc(e.title) + '</span>' +
      '<span class="meta">' + expMeta(e) + '</span>' +
      '<span class="live" data-slug="' + esc(e.slug) + '"></span></a>';
  }
  function paperRow(p) {
    return '<a class="row" href="paper.html?p=' + encodeURIComponent(p.slug) + '">' +
      '<span class="title">' + esc(p.title) + '</span>' +
      '<span class="meta">' + esc(p.authors) + " &middot; " + esc(p.venue) + " " + esc(p.published) +
      " &middot; " + esc(p.status) + '</span></a>';
  }
  function section(label, rowsHtml, emptyText) {
    return '<div class="section-label">' + label + "</div>" +
      (rowsHtml || '<div class="empty">' + emptyText + "</div>");
  }
  // Fetch progress.json for each running experiment shown on the page (local serve only).
  function overlayProgress() {
    document.querySelectorAll(".live").forEach(function (el) {
      fetchJSON("results/" + el.dataset.slug + "/progress.json").then(function (p) {
        if (!p) return;
        el.innerHTML = '<span class="progress"><span class="bar" style="width:' +
          Number(p.percent) + '%"></span></span><span class="meta">' + Number(p.percent) +
          "% &middot; " + esc(p.now) + " (" + esc(p.updated) + ")</span>";
        el.querySelector(".progress").style.display = "block";
      });
    });
  }

  // ----- pages -----
  if (PAGE === "home") {
    var running = EXPERIMENTS.filter(function (e) { return e.status === "running"; });
    var unreviewed = EXPERIMENTS.filter(function (e) { return e.status === "done" && e.review === "unreviewed"; });
    var reading = RESOURCES.filter(function (p) { return p.status === "reading"; });
    main.innerHTML =
      '<p class="question">' + esc(SITE.question) + "</p>" +
      section("Running", running.map(expRow).join(""), "Nothing running.") +
      section("Done, awaiting review", unreviewed.map(expRow).join(""), "Nothing awaiting review.") +
      section("Currently reading", reading.map(paperRow).join(""), "Nothing in progress.");
    overlayProgress();
  }

  if (PAGE === "readings") {
    var pStatuses = ["all", "unread", "reading", "completed"];
    function drawReadings(st) {
      var rows = RESOURCES.filter(function (p) { return st === "all" || p.status === st; });
      document.getElementById("rows").innerHTML =
        rows.map(paperRow).join("") || '<div class="empty">No papers yet.</div>';
    }
    main.innerHTML = "<h1>Readings</h1>" +
      '<div class="filters"><select id="f">' +
      pStatuses.map(function (s) { return "<option>" + s + "</option>"; }).join("") +
      '</select></div><div id="rows"></div>';
    document.getElementById("f").onchange = function () { drawReadings(this.value); };
    drawReadings("all");
  }

  if (PAGE === "experiments") {
    var filters = { status: ["all", "planned", "running", "done", "abandoned"],
                    stage: ["all", "preliminary", "main", "replication"],
                    review: ["all", "unreviewed", "reviewed"] };
    function drawExps() {
      var rows = EXPERIMENTS.filter(function (e) {
        return Object.keys(filters).every(function (k) {
          var v = document.getElementById("f-" + k).value;
          return v === "all" || e[k] === v;
        });
      });
      document.getElementById("rows").innerHTML =
        rows.map(expRow).join("") || '<div class="empty">No experiments yet.</div>';
      overlayProgress();
    }
    main.innerHTML = "<h1>Experiments</h1>" +
      '<div class="filters">' + Object.keys(filters).map(function (k) {
        return '<select id="f-' + k + '">' +
          filters[k].map(function (s) { return "<option>" + s + "</option>"; }).join("") + "</select>";
      }).join("") + '</div><div id="rows"></div>';
    Object.keys(filters).forEach(function (k) {
      document.getElementById("f-" + k).onchange = drawExps;
    });
    drawExps();
  }

  if (PAGE === "experiment") {
    var slug = Q.get("e");
    var e = EXPERIMENTS.find(function (x) { return x.slug === slug; });
    if (!e) { main.innerHTML = '<p class="empty">Unknown experiment: ' + esc(slug) + "</p>"; return; }
    var codePath = "src/exps/" + slug + ".py";
    var codeLink = SITE.repo
      ? SITE.repo + "/blob/" + (e.commit || "main") + "/" + codePath
      : codePath;
    main.innerHTML = "<h1>" + esc(e.title) + "</h1>" +
      '<p class="meta">' + expMeta(e) + " &middot; registered " + esc(e.registered) +
      (e.commit ? " &middot; commit <code>" + esc(e.commit) + "</code>" : "") +
      ' &middot; <a href="' + esc(codeLink) + '">code</a></p>' +
      '<span class="live" data-slug="' + esc(slug) + '"></span>' +
      '<div id="body"></div><div id="metrics"></div><div id="artifacts"></div>';
    overlayProgress();
    fetchText("exps/" + slug + ".md").then(function (md) {
      document.getElementById("body").innerHTML =
        md ? renderMD(md) : '<p class="empty">No pre-registration page (exps/' + esc(slug) + ".md).</p>";
    });
    fetchJSON("results/" + slug + "/metrics.json").then(function (m) {
      if (!m) return;
      var rows = Object.keys(m).map(function (k) {
        var v = m[k];
        return "<tr><td>" + esc(k) + '</td><td class="num">' +
          esc(typeof v === "object" ? JSON.stringify(v) : v) + "</td></tr>";
      }).join("");
      document.getElementById("metrics").innerHTML =
        "<h3>Metrics</h3><table>" + rows + "</table>";
    });
    fetchJSON("results/" + slug + "/artifacts.json").then(function (a) {
      if (!a || !a.length) return;
      var rows = a.map(function (x) {
        return "<tr><td>" + esc(x.path) + '</td><td class="num">' + esc(x.size) +
          '</td><td class="num">' + esc(String(x.sha256).slice(0, 12)) + "</td></tr>";
      }).join("");
      document.getElementById("artifacts").innerHTML =
        "<h3>Artifacts</h3><table><tr><th>path (under $ARTIFACTS)</th><th>size</th><th>sha256</th></tr>" +
        rows + "</table>";
    });
  }

  if (PAGE === "doc") {          // renders docs/<name>.md, e.g. doc.html?d=figures
    var dname = (Q.get("d") || "").replace(/[^\w-]/g, "");
    fetchText("docs/" + dname + ".md").then(function (md) {
      main.innerHTML = md ? renderMD(md) : '<p class="empty">Unknown doc: ' + esc(dname) + "</p>";
    });
  }

  if (PAGE === "paper") {
    var pslug = Q.get("p");
    var p = RESOURCES.find(function (x) { return x.slug === pslug; });
    if (!p) { main.innerHTML = '<p class="empty">Unknown paper: ' + esc(pslug) + "</p>"; return; }
    main.innerHTML = "<h1>" + esc(p.title) + "</h1>" +
      '<p class="meta">' + esc(p.authors) + " &middot; " + esc(p.venue) + " " + esc(p.published) +
      ' &middot; ' + esc(p.status) + ' &middot; <a href="' + esc(p.url) + '">paper</a></p>' +
      "<p>" + esc(p.summary) + "</p><div id=\"notes\"></div>";
    fetchText("notes/" + pslug + ".md").then(function (md) {
      document.getElementById("notes").innerHTML =
        md ? renderMD(md) : '<p class="empty">No notes yet (notes/' + esc(pslug) + ".md).</p>";
    });
  }
})();
