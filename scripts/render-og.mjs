// Regenerate the static share cards with: CHROME_BIN=/path/to/chrome bun scripts/render-og.mjs [section]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { shareImagePath } from '../lib/site-metadata.ts';

const chrome = process.env.CHROME_BIN || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'chromium');
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const outputDir = join(publicDir, 'brand', 'og');
const data = (name, type) => `data:${type};base64,${readFileSync(join(publicDir, name)).toString('base64')}`;
const logo = data('brand/launcher-icon-color.svg', 'image/svg+xml');
const sora = data('fonts/Sora.ttf', 'font/ttf');
const chinese = data('fonts/ZCOOLKuaiLe-subset.woff2', 'font/woff2');

// [section marker, headline lines, supporting line, small platform/action cue]
const cards = {
  home: {
    zh: ['产品介绍', ['星酿启动器'], '一站式启动与管理 SillyTavern', '桌面启动器'],
    en: ['THE LAUNCHER', ['AstraBrew', 'Launcher'], 'Set up and manage SillyTavern', 'DESKTOP LAUNCHER'],
  },
  download: {
    zh: ['版本下载', ['下载 Windows 版'], '稳定版、测试版与历史版本', 'Windows 安装包'],
    en: ['RELEASES', ['Download', 'for Windows'], 'Stable, beta, and previous releases', 'WINDOWS INSTALLERS'],
  },
  license: {
    zh: ['开源协议', ['Apache 2.0', '开源协议'], '查看权限、条件与限制', 'Windows 版'],
    en: ['OPEN SOURCE', ['Apache 2.0', 'License'], 'Permissions, conditions, and limitations', 'WINDOWS EDITION'],
  },
  about: {
    zh: ['关于我们', ['关于星酿'], '让酒馆更简单', 'ASTRABREW LABS'],
    en: ['ABOUT US', ['AstraBrew', 'Labs'], 'A simpler start for your tavern', 'MEET THE PROJECT'],
  },
  docs: {
    zh: ['使用文档', ['星酿使用文档'], '从安装启动器，到打开你的酒馆', 'Windows 使用指南'],
    en: ['DOCUMENTATION', ['Launcher', 'User Guide'], 'From installation to your first launch', 'WINDOWS USER GUIDE'],
  },
};

const artwork = {
  home: '<path d="M10 16l5 5-5 5m9 0h9"/>',
  download: '<path d="M21 12v15m-6-6 6 6 6-6m-15 8v5h18v-5"/>',
  license: '<path d="M21 12v18m-7 3h14M10 16h22m-19 0-4 8h8zm16 0-4 8h8z"/>',
  about: '<path d="M21 11c2 6 4 8 10 10-6 2-8 4-10 10-2-6-4-8-10-10 6-2 8-4 10-10Z"/>',
  docs: '<path d="M21 15c-4-3-8-3-12-2v16c4-1 8-1 12 2 4-3 8-3 12-2V13c-4-1-8-1-12 2zm0 0v16"/>',
};

function cardHtml(section, locale, [sectionName, lines, subtitle, cue]) {
  return `<!doctype html><html lang="${locale}"><meta charset="utf-8"><style>
    @font-face{font-family:Sora;src:url(${sora})} @font-face{font-family:KuaiLe;src:url(${chinese})}
    *{box-sizing:border-box} html,body{width:1200px;height:630px;margin:0;overflow:hidden}
    body{font-family:Sora,KuaiLe,sans-serif;color:#162f50;background:
      radial-gradient(ellipse at 87% 77%,#cdeee6 0%,transparent 38%),
      radial-gradient(ellipse at 78% 22%,#d8eafa 0%,transparent 46%),#f1f7fb}
    .frame{position:absolute;inset:32px;border:1px solid #9ebbd080;border-radius:26px;overflow:hidden;display:flex;flex-direction:column;padding:35px 41px}
    .header,.footer{z-index:2;display:flex;justify-content:space-between;align-items:center}
    .brand{display:flex;align-items:center;gap:11px;font-size:18px;font-weight:650;letter-spacing:-.035em}
    .brand img{width:31px;height:31px}.tag,.cue{font-size:14px;letter-spacing:.11em;font-weight:650}
    .tag{padding:9px 13px;border:1px solid #97b4ce;border-radius:6px;color:#28577e}
    .copy{position:absolute;top:49%;left:45px;width:640px;transform:translateY(-50%);z-index:2}
    h1{font-size:89px;line-height:1.01;letter-spacing:-.052em;margin:0;font-weight:750}
    p{font-size:25px;letter-spacing:-.035em;color:#365674;margin:24px 0 0;font-weight:470}
    [lang="zh"] h1{font-size:83px;letter-spacing:-.038em}[lang="zh"] .copy{width:665px}
    .footer{margin-top:auto;padding-top:20px;border-top:1px solid #9ebbd080;font-size:13px;letter-spacing:.11em;color:#365674}
    .cue{display:flex;align-items:center;gap:10px}.cue::before{content:'';width:8px;height:8px;border-radius:50%;background:#287d69;box-shadow:0 0 0 4px #82d1b948}
    .visual{position:absolute;inset:46px -4px 43px auto;width:500px;display:grid;place-items:center}
    .visual::before{content:'';position:absolute;inset:7% -2%;background:linear-gradient(#95b6d250 1px,transparent 1px),linear-gradient(90deg,#95b6d250 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse,#000,transparent 73%)}
    .orbit{position:absolute;width:100%;height:100%;inset:0;overflow:visible}
    .tile{position:relative;width:232px;height:232px;display:grid;place-items:center;border-radius:58px;background:linear-gradient(145deg,#fff,#e3f3f8);border:1px solid white;
      box-shadow:0 34px 68px -22px #395b8a69,inset 0 0 0 5px #ffffff61;transform:rotate(-11deg)}
    .tile img{width:160px;height:160px;transform:rotate(11deg)}
    .badge{position:absolute;top:65%;left:65%;width:69px;height:69px;border-radius:21px;display:grid;place-items:center;transform:rotate(9deg);background:#183753;color:#d5f4ea;box-shadow:0 12px 26px #2c638d39;border:1px solid #f5fcff57}
    .badge svg{width:43px;height:43px}
  </style><div class="frame">
    <div class="header"><div class="brand"><img src="${logo}">AstraBrew Labs</div><div class="tag">${sectionName}</div></div>
    <div class="copy"><h1>${lines.join('<br>')}</h1><p>${subtitle}</p></div>
    <div class="visual">
      <svg class="orbit" viewBox="0 0 500 480" fill="none">
        <circle cx="250" cy="240" r="185" stroke="#779db9" stroke-opacity=".37" stroke-dasharray="2 6"/>
        <circle cx="250" cy="240" r="207" stroke="#779db9" stroke-opacity=".28"/>
        <ellipse cx="250" cy="242" rx="228" ry="103" transform="rotate(-29 250 242)" stroke="#6d95b6" stroke-opacity=".72"/>
        <path d="M19 242h462M250 29v422" stroke="#7f9eb7" stroke-opacity=".38" stroke-dasharray="3 7"/>
        <circle cx="373" cy="113" r="6" fill="#3a8cbd" stroke="#f1f9ff" stroke-width="3"/>
        <circle cx="60" cy="313" r="6" fill="#278c75" stroke="#effcfa" stroke-width="3"/>
        <path d="M409 306v14m-7-7h14M104 117v16m-8-8h16" stroke="#3e80ac" stroke-width="2"/>
      </svg>
      <div class="tile"><img src="${logo}"></div>
      <div class="badge"><svg viewBox="0 0 42 42" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">${artwork[section]}</svg></div>
    </div>
    <div class="footer"><div class="cue">${cue}</div><div>SILLYTAVERN&nbsp; / &nbsp;LAUNCHER</div></div>
  </div></html>`;
}

const selected = process.argv[2];
if (selected && !Object.hasOwn(cards, selected)) throw new Error(`Unknown share card section: ${selected}`);

const scratch = mkdtempSync(join(tmpdir(), 'astrabrew-og-'));
mkdirSync(outputDir, { recursive: true });
try {
  for (const [section, languages] of Object.entries(cards)) {
    if (selected && selected !== section) continue;
    for (const [locale, copy] of Object.entries(languages)) {
      const html = join(scratch, 'card.html');
      const result = join(scratch, 'card.png');
      rmSync(result, { force: true });
      writeFileSync(html, cardHtml(section, locale, copy));
      execFileSync(chrome, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        `--user-data-dir=${join(scratch, 'profile')}`, '--hide-scrollbars', '--window-size=1200,630',
        '--force-device-scale-factor=1', '--virtual-time-budget=1500', `--screenshot=${result}`,
        pathToFileURL(html).href], { stdio: 'pipe', timeout: 30000 });
      if (!existsSync(result)) throw new Error(`Chrome did not render ${section}-${locale}`);
      const png = readFileSync(result);
      if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) throw new Error('Wrong OG dimensions');
      const destination = join(publicDir, shareImagePath(section, locale));
      writeFileSync(destination, png);
      console.log(`${destination}: ${Math.round(png.length / 1024)} KB`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
