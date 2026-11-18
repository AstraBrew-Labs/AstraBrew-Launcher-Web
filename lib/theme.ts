export const THEME_STORAGE_KEY = "astrabrew.site-theme";

// Run before the boot artwork paints; light is the intentional first-visit default.
export const themeBootstrap = `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==='dark'?'dark':'light'}catch{}`;
