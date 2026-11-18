const sectionNamesZh: Record<string, string> = {
  "1": "定义", "2": "版权授权", "3": "专利授权", "4": "再分发", "5": "提交贡献",
  "6": "商标", "7": "免责声明", "8": "责任限制", "9": "担保与额外责任", appendix: "附录",
};

export function LicenseReader({ text, en }: { text: string; en: boolean }) {
  // Reflow hard-wrapped lines, retaining every paragraph and the wording of the file.
  const blocks = text.trim().split(/\r?\n\s*\n/).map(raw => {
    const paragraph = raw.trim().replace(/\s+/g, " ");
    const match = /^(\d+)\. ([^.]+\.)(?: (.*))?$/.exec(paragraph);
    if (match) return { id: match[1], heading: `${match[1]}. ${match[2]}`, label: match[2].slice(0, -1), body: match[3] };
    if (paragraph.startsWith("APPENDIX:")) return { id: "appendix", heading: paragraph, label: "Appendix" };
    return { body: raw.trim() };
  });
  const tocTitle = en ? "On this page" : "章节目录";
  return <div className="license-reader">
    <div className="license-prose" lang="en">
      {blocks.map(({ id, heading, body }, i) => <div key={i}>
        {heading && <h3 id={`license-${id}`} tabIndex={-1}>{heading}</h3>}
        {body && <p>{body}</p>}
      </div>)}
    </div>
    <nav className="license-toc" aria-label={tocTitle}>
      <strong>{tocTitle}</strong>
      <ul>{blocks.map(({ id, label }) => id && <li key={id}><a href={`#license-${id}`}>
        <span aria-hidden="true">{id === "appendix" ? "A" : id.padStart(2, "0")}</span>
        {en ? label : sectionNamesZh[id] ?? label}
      </a></li>)}</ul>
    </nav>
  </div>;
}
