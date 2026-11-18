/** Inline only the boot artwork: its first paint must not depend on a CSS chunk. */
export function BootScreenStyles() {
  return <style>{`
.boot-screen{display:none;position:fixed;inset:0;z-index:1600;overflow:hidden;place-items:center;isolation:isolate;color:#37616b}
.boot-backdrop{position:absolute;inset:0;z-index:-2;background:radial-gradient(ellipse at center,#f8fcff 8%,#e4f5f2 57%,#daebf8)}
html[data-theme="dark"]{color-scheme:dark}
html[data-theme="dark"] .boot-screen{color:#b2d4df}
html[data-theme="dark"] .boot-backdrop{background:radial-gradient(ellipse at center,#243647 8%,#192d34 57%,#141a25)}
html[data-theme="dark"] .boot-orbits i{border-color:#56838b78}
html[data-theme="dark"] .boot-signal i{background:#7fddbe}
.reload-intro-active .boot-screen{display:grid}
@media(prefers-reduced-motion:no-preference){.reload-intro-active .site-logo img{opacity:0}}
.boot-ignition{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.boot-ignition i{grid-area:1/1}
.boot-flare{width:18px;aspect-ratio:1;background:#36ae94;clip-path:polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%)}
.boot-axis{width:min(450px,76vw);height:2px;transform:scaleX(0);background:linear-gradient(90deg,transparent,#70bfcd 30%,#418e9d 50%,#70bfcd 70%,transparent)}
.boot-caption,.boot-signature{opacity:0;transform:translateY(5px)}
.boot-lockup img{clip-path:inset(0% 50% 0% 50%)}
.boot-signal{position:absolute;top:calc(100% + 13px);display:flex;gap:4px;opacity:0}
.boot-screen[data-phase="loading"] .boot-signal{opacity:1;transition:opacity .16s ease-out}
.boot-signal i{width:9px;height:2px;background:#398b85}
.boot-screen[data-phase="loading"] .boot-signal i{animation:boot-pulse 1s ease-in-out infinite alternate}
.boot-screen[data-phase="loading"] .boot-signal i:nth-child(2){animation-delay:.14s}.boot-screen[data-phase="loading"] .boot-signal i:nth-child(3){animation-delay:.28s}
@keyframes boot-pulse{to{opacity:.25;transform:scaleX(.55)}}
.boot-lockup{position:relative;display:grid;gap:8px;justify-items:center;text-align:center}
.boot-lockup img{display:block;width:clamp(180px,32vmin,300px);height:auto;max-width:100%}
.boot-lockup span,.boot-lockup small{font:600 10px/1.6 ui-monospace,monospace;letter-spacing:.18em}
.boot-orbits{opacity:0;position:absolute;z-index:-1;width:118vmax;height:118vmax;display:grid;place-items:center;transform:rotate(-21deg)}
.boot-orbits i{grid-area:1/1;width:88%;height:33%;border:1px solid #90b8bc88;border-radius:50%;animation:boot-drift 8s ease-in-out infinite alternate}
.boot-orbits i:nth-child(2){width:72%;height:46%;animation-delay:-4s}.boot-orbits i:nth-child(3){width:61%;height:60%;border-style:dashed;animation-delay:-2s}
.boot-orbits i::before{content:"";display:block;width:9px;height:9px;margin:7% 14%;border-radius:50%;background:#68b9ae;box-shadow:0 0 18px #71d9c4}
@keyframes boot-drift{to{transform:rotate(18deg) scale(1.06)}}
@media(prefers-reduced-motion:reduce){.reload-intro-active .boot-screen{display:none}.boot-orbits i{animation:none}}
`}</style>;
}
