import { bootDrawName, bootEntryMs } from "./boot-intro-timing";

/** Inline the boot styles so the SVG can draw before the client bundle arrives. */
export function BootScreenStyles() {
  return <style>{`
.boot-screen{display:none;position:fixed;inset:0;z-index:1600;overflow:hidden;place-items:center;isolation:isolate;--boot-paper:#fcfdff;--boot-ink:#141a24}
.boot-backdrop{position:absolute;inset:0;z-index:-1;background:var(--boot-paper)}
html[data-theme="dark"]{color-scheme:dark}
html[data-theme="dark"] .boot-screen{--boot-paper:#141a25;--boot-ink:#f5f7fb}
.boot-lockup{width:clamp(200px,36vmin,300px);max-width:calc(100vw - 48px)}
.boot-logo{display:block;width:100%;height:auto}
.boot-trace{fill:var(--boot-ink);stroke:var(--boot-ink);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;fill-opacity:0;stroke-opacity:0;--boot-offset:0ms}
.boot-chevron{fill:#429fdc}
.boot-star{fill:#3db18e;--boot-offset:24ms}
.boot-glyph-1,.boot-glyph-5{--boot-offset:38ms}
.boot-glyph-2,.boot-glyph-4{--boot-offset:76ms}
.boot-glyph-3{--boot-offset:105ms}
@media(prefers-reduced-motion:no-preference){
.reload-intro-active .boot-screen{display:grid}
.reload-intro-active .site-logo img{opacity:0}
.reload-intro-active .boot-trace{animation:${bootDrawName} calc(${bootEntryMs}ms - var(--boot-offset)) ease-in-out var(--boot-offset) both}
}
@keyframes ${bootDrawName}{
  0%{stroke-dashoffset:1;stroke-opacity:0;fill-opacity:0}
  12%{stroke-opacity:1;fill-opacity:0}
  64%{stroke-dashoffset:0;stroke-opacity:1;fill-opacity:0}
  100%{stroke-dashoffset:-1;stroke-opacity:0;fill-opacity:1}
}
`}</style>;
}
