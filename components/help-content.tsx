import { Info, Warning } from '@phosphor-icons/react'

export function HelpContent({ html }: { html: string }) {
  return (
    <div
      className="prose-custom text-sm leading-relaxed text-muted-foreground"
      dangerouslySetInnerHTML={{
        __html: html
          .replace(/<ul>/g, '<ul class="list-none space-y-1.5 mt-2">')
          .replace(/<ol>/g, '<ol class="list-none space-y-1.5 mt-2">')
          .replace(/<li>/g, '<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[oklch(0.74_0.10_212/0.7)] flex-shrink-0"></span><span>')
          .replace(/<\/li>/g, '</span></li>')
          .replace(/<strong>/g, '<strong class="text-foreground font-semibold">')
          .replace(/<code>/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background:var(--surface);color:var(--primary)">'),
      }}
    />
  )
}

export function HelpTip({ type, text }: { type: 'info' | 'warning'; text: string }) {
  return (
    <div
      className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
      style={type === 'warning'
        ? { background: 'oklch(0.60 0.18 55 / 0.1)', border: '1px solid oklch(0.60 0.18 55 / 0.3)', color: 'var(--warning-text)' }
        : { background: 'oklch(0.74 0.10 212 / 0.08)', border: '1px solid oklch(0.74 0.10 212 / 0.25)', color: 'var(--brand-blue-text)' }}
    >
      {type === 'warning'
        ? <Warning weight="fill" className="mt-0.5 size-4 shrink-0" />
        : <Info weight="fill" className="mt-0.5 size-4 shrink-0" />}
      <span>{text}</span>
    </div>
  )
}
