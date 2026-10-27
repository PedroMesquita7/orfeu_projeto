/** Ilustrações em traço fino (SVG inline), no mesmo espírito "raio-x" do 3D. */

const tube300 = (cx: number, base = 130) => `
  <rect x="${cx - 10}" y="${base - 12}" width="20" height="12" rx="1.5"/>
  <path d="M${cx - 8} ${base - 12} V${base - 20} C${cx - 8} ${base - 28} ${cx - 15} ${base - 32} ${cx - 15} ${base - 50}
    C${cx - 15} ${base - 68} ${cx - 9} ${base - 78} ${cx} ${base - 80} C${cx + 9} ${base - 78} ${cx + 15} ${base - 68} ${cx + 15} ${base - 50}
    C${cx + 15} ${base - 32} ${cx + 8} ${base - 28} ${cx + 8} ${base - 20} V${base - 12}"/>
  <rect class="a-dim" x="${cx - 6}" y="${base - 60}" width="12" height="22"/>
  <path class="a-dim" d="M${cx - 3} ${base - 38} L${cx - 1.5} ${base - 60} L${cx} ${base - 38} L${cx + 1.5} ${base - 60} L${cx + 3} ${base - 38}"/>`

const tubeSmall = (cx: number, base = 130) => `
  <rect x="${cx - 6}" y="${base - 8}" width="12" height="8" rx="1"/>
  <path d="M${cx - 6} ${base - 8} V${base - 30} Q${cx - 6} ${base - 37} ${cx} ${base - 37} Q${cx + 6} ${base - 37} ${cx + 6} ${base - 30} V${base - 8}"/>
  <rect class="a-dim" x="${cx - 3}" y="${base - 28}" width="6" height="12"/>`

const knob = (cx: number, cy: number, r = 7) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}"/><circle class="a-dim" cx="${cx}" cy="${cy}" r="${r + 3}"/><path d="M${cx} ${cy} V${cy - r + 1.5}"/>`

const box = (x: number, y: number, w: number, h: number, cls = 'a-dim') =>
  `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`

const coil = (x: number, y: number, w: number, h: number, n = 6) => {
  let s = box(x, y, w, h)
  for (let i = 1; i < n; i++) s += `<path class="a-dim" d="M${x + 4} ${y + (h / n) * i} H${x + w - 4}"/>`
  return s
}

const wrap = (inner: string, label: string) =>
  `<svg class="art" viewBox="0 0 320 200" role="img" aria-label="${label}" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`

export const art: Record<string, (label: string) => string> = {
  amp: (l) =>
    wrap(
      `${coil(52, 92, 44, 38)}${coil(136, 88, 48, 42, 7)}${coil(224, 92, 44, 38)}
       <rect x="40" y="130" width="240" height="40" rx="2"/>
       <path class="a-dim" d="M40 138 H280"/>
       ${tube300(112)}${tube300(208)}${tubeSmall(148)}${tubeSmall(172)}
       ${knob(92, 154)}${knob(160, 154, 9)}${knob(228, 154)}
       <path d="M52 170 v5 h14 v-5 M254 170 v5 h14 v-5"/>`,
      l,
    ),
  pre: (l) =>
    wrap(
      `${coil(64, 112, 46, 30)}
       <rect x="40" y="142" width="240" height="30" rx="2"/>
       <path class="a-dim" d="M40 149 H280"/>
       ${tubeSmall(206, 142)}${tubeSmall(236, 142)}
       ${knob(80, 160, 6)}${knob(160, 160, 8)}${knob(240, 160, 6)}
       <path d="M52 172 v4 h14 v-4 M254 172 v4 h14 v-4"/>`,
      l,
    ),
  phono: (l) =>
    wrap(
      `<path class="a-dim" d="M100 146 V124 a10 4 0 0 1 20 0 V146 M130 146 V124 a10 4 0 0 1 20 0 V146"/>
       <ellipse class="a-dim" cx="110" cy="124" rx="10" ry="4"/><ellipse class="a-dim" cx="140" cy="124" rx="10" ry="4"/>
       <rect x="80" y="146" width="160" height="26" rx="2"/>
       <path class="a-dim" d="M80 152 H240"/>
       ${tubeSmall(200, 146)}
       ${knob(212, 161, 5)}
       <circle cx="98" cy="161" r="2.5"/><circle cx="110" cy="161" r="2.5"/>
       <path d="M90 172 v4 h12 v-4 M218 172 v4 h12 v-4"/>`,
      l,
    ),
  speaker: (l) =>
    wrap(
      `<rect x="112" y="16" width="96" height="172" rx="3"/>
       <rect class="a-dim" x="118" y="22" width="84" height="160" rx="2"/>
       <circle cx="160" cy="56" r="13"/><circle class="a-dim" cx="160" cy="56" r="6"/>
       <circle cx="160" cy="118" r="34"/><circle class="a-dim" cx="160" cy="118" r="27"/><circle cx="160" cy="118" r="9"/>
       <rect class="a-dim" x="142" y="164" width="36" height="7" rx="3.5"/>
       <path class="a-dim" d="M124 30 q4 70 0 150 M196 30 q-4 70 0 150"/>`,
      l,
    ),
}

/** Ilustração da sala de audição (placeholder elegante até haver foto real). */
export const roomArt = (label: string) => `
<svg class="room" viewBox="0 0 640 480" role="img" aria-label="${label}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="roomGlow" cx="50%" cy="38%" r="60%">
      <stop offset="0" stop-color="#253745" stop-opacity=".9"/>
      <stop offset=".6" stop-color="#11212D" stop-opacity=".6"/>
      <stop offset="1" stop-color="#06141B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="480" fill="url(#roomGlow)" stroke="none"/>
  <g class="a-dim">
    <path d="M0 330 L150 270 H490 L640 330"/>
    <path d="M150 270 V40 M490 270 V40"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${200 + i * 30} 80 V240"/>`).join('')}
    <rect x="190" y="70" width="260" height="180"/>
    <ellipse cx="320" cy="390" rx="210" ry="42"/>
  </g>
  <g>
    <rect x="170" y="180" width="44" height="96" rx="2"/><circle cx="192" cy="200" r="6"/><circle cx="192" cy="240" r="15"/>
    <rect x="426" y="180" width="44" height="96" rx="2"/><circle cx="448" cy="200" r="6"/><circle cx="448" cy="240" r="15"/>
    <path d="M178 276 v14 M206 276 v14 M434 276 v14 M462 276 v14"/>
    <rect x="276" y="250" width="88" height="22" rx="2"/>
    <path d="M296 250 v-16 q0 -6 6 -6 q6 0 6 6 v16 M332 250 v-16 q0 -6 6 -6 q6 0 6 6 v16"/>
    <path d="M250 430 q-6 -70 30 -82 h80 q36 12 30 82 M262 372 h116 M272 430 v20 M368 430 v20"/>
    <path class="a-dim" d="M560 150 v170 M540 330 h40 M560 150 q-30 -20 -40 10"/>
  </g>
</svg>`
