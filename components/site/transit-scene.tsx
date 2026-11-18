/** Inert artwork template. Only a live navigation puts a copy in the top layer. */
export function TransitScene() {
  return <dialog className="transit" data-transit-template>
    <div className="transit-slats" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} />)}</div>
    <div className="transit-field" aria-hidden="true">
      <svg className="transit-trails" viewBox="-500 -300 1000 600" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* Let SVG rotate radial lines so hydration never serializes trig results. */}
        <g transform="scale(1 .8)">
          {Array.from({ length: 32 }, (_, i) => (
            <path key={i} d={`M${122 + (i * 47) % 220} 0h${58 + (i % 6) * 20}`}
              transform={`rotate(${((i * 137508) % 360000) / 1000})`}
              stroke={i % 4 ? "var(--astra-blue)" : "var(--astra-green)"} strokeWidth={i % 4 ? .8 : 1.6} pathLength="1" strokeDasharray="1 1" />
          ))}
        </g>
      </svg>
    </div>
    <div className="transit-frame" aria-hidden="true">
      <div className="transit-meta"><span><b>✦</b> ASTRA BREW <em>/ FLIGHT SYSTEM</em></span><span>SEQ <strong data-seq /></span></div>
      <div className="transit-center">
        <svg className="transit-scope" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <path d="M0 120h48m144 0h48M120 0v48m0 144v48" stroke="currentColor" opacity=".4" />
          <g className="transit-dial" stroke="currentColor">
            <circle cx="120" cy="120" r="94" opacity=".28" />
            {Array.from({length: 60}, (_, i) => <path key={i} d={i % 5 ? 'M120 30v3' : 'M120 25v10'} transform={`rotate(${i * 6} 120 120)`} opacity={i % 5 ? '.43' : '.95'} />)}
            <path d="M120 16l-4 -6h8z" fill="currentColor" />
          </g>
          <g className="transit-orbit" stroke="var(--astra-green-text)">
            <circle cx="120" cy="120" r="70" strokeDasharray="95 15 2 108" />
            <ellipse cx="120" cy="120" rx="102" ry="36" transform="rotate(-32 120 120)" opacity=".55" />
            <circle cx="206.5" cy="66" r="3" fill="var(--astra-green)" />
          </g>
          <image href="/brand/launcher-icon-color.svg" x="67" y="67" width="106" height="106" />
        </svg>
        <span className="transit-kicker">DESTINATION LOCK</span>
        <strong className="transit-title" data-destination />
      </div>
      <div className="transit-meta transit-footer"><span data-status /><span className="transit-meter"><i /></span><span>AB—NAV</span></div>
    </div>
  </dialog>;
}
