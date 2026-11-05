/* A tiny Markdown renderer: headings, paragraphs, emphasis, links, images,
   lists, blockquotes, code, horizontal rules, and bare URLs. No dependencies. */
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeUrl = (u) => (/^(https?:|mailto:|\/|\.|#|[\w-]+\/|[\w-]+\.)/i.test(u) && !/^javascript:/i.test(u) ? u.replace(/"/g, "%22") : "#");

  function inline(s) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, a, u) => `<img src="${safeUrl(u)}" alt="${a}" loading="lazy" />`);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, t, u) => `<a href="${safeUrl(u)}" target="_blank" rel="noopener">${t}</a>`);
    s = s.replace(/(^|[\s(（\u0001])(https?:\/\/[^\s<)）]+)/g, (_, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
    return s;
  }

  window.renderMarkdown = function (md) {
    const lines = md.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      let line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^```/.test(line)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
        continue;
      }
      let m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m) { out.push(`<h${m[1].length}>${inline(m[2].trim())}</h${m[1].length}>`); i++; continue; }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push("<hr />"); i++; continue; }
      if (/^>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
        out.push(`<blockquote>${window.renderMarkdown(buf.join("\n"))}</blockquote>`);
        continue;
      }
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        const ordered = /^\s*\d+\./.test(line);
        const buf = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
        const tag = ordered ? "ol" : "ul";
        out.push(`<${tag}>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</${tag}>`);
        continue;
      }
      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s+)/.test(lines[i])) buf.push(lines[i++].trim());
      out.push(`<p>${inline(buf.join("<br/>").replace(/<br\/>/g, "\u0001")).replace(/\u0001/g, "<br/>")}</p>`);
    }
    return out.join("\n");
  };
})();
