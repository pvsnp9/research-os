// Minimal markdown renderer: headings, lists, fenced code, blockquotes,
// paragraphs; inline code, bold, italics, links. The only HTML passed through
// is a <figure ...>...</figure> block starting at column 0 (see docs/figures.md).
(function () {
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+|[^)\s:]+)\)/g, '<a href="$2">$1</a>');
  }
  window.renderMD = function (src) {
    var out = [], para = [], list = null; // list: {tag, items}
    function flushPara() {
      if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; }
    }
    function flushList() {
      if (list) {
        out.push("<" + list.tag + "><li>" + list.items.join("</li><li>") + "</li></" + list.tag + ">");
        list = null;
      }
    }
    var lines = src.split("\n"), i = 0;
    while (i < lines.length) {
      var ln = lines[i];
      if (/^```/.test(ln)) {               // fenced code block
        flushPara(); flushList();
        var code = [];
        for (i++; i < lines.length && !/^```/.test(lines[i]); i++) code.push(lines[i]);
        out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
        i++; continue;
      }
      if (/^<figure[\s>]/.test(ln)) {          // raw diagram block, passed through unescaped
        flushPara(); flushList();
        var fig = [ln];
        while (!/<\/figure>/.test(fig[fig.length - 1]) && i + 1 < lines.length) fig.push(lines[++i]);
        out.push(fig.join("\n"));
        i++; continue;
      }
      var h = ln.match(/^(#{1,4}) +(.*)/);
      var li = ln.match(/^\s*([-*]|\d+\.) +(.*)/);
      if (h) {
        flushPara(); flushList();
        out.push("<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">");
      } else if (li) {
        flushPara();
        var tag = /[-*]/.test(li[1]) ? "ul" : "ol";
        if (!list || list.tag !== tag) { flushList(); list = { tag: tag, items: [] }; }
        list.items.push(inline(li[2]));
      } else if (/^> ?/.test(ln)) {
        flushPara(); flushList();
        out.push("<blockquote><p>" + inline(ln.replace(/^> ?/, "")) + "</p></blockquote>");
      } else if (/^\s*$/.test(ln)) {
        flushPara(); flushList();
      } else {
        flushList(); para.push(ln.trim());
      }
      i++;
    }
    flushPara(); flushList();
    return '<div class="md">' + out.join("\n") + "</div>";
  };
})();
