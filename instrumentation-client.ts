try {
  const root = document.documentElement
  const savedTheme = window.localStorage.getItem('astrabrew:site-theme:v1')
  const theme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'

  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.dataset.theme = theme
} catch {
  // The server-rendered dark theme remains available when browser storage is blocked.
}
