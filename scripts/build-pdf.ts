/**
 * Gera public/downloads/orfeu-i300-ficha-tecnica.pdf a partir de src/content.ts.
 * Roda automaticamente no `npm run build` (ou manualmente: `npm run pdf`).
 */
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import PDFDocument from 'pdfkit'
import { brand, contact, site, specs } from '../src/content.ts'

const OUT = 'public/downloads/orfeu-i300-ficha-tecnica.pdf'
mkdirSync('public/downloads', { recursive: true })

const C = { ink: '#06141B', ink2: '#253745', muted: '#4A5C6A', soft: '#9BABAB', paper: '#FFFFFF', wash: '#EEF1F1' }
const fontDir = 'scripts/fonts' // instâncias estáticas (OFL) — pdfkit não lida bem com fontes variáveis
const tryFont = (doc: PDFKit.PDFDocument, name: string, file: string, fallback: string) => {
  try {
    if (!existsSync(file)) throw new Error('missing')
    doc.registerFont(name, file)
  } catch {
    doc.registerFont(name, fallback)
  }
}

const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `${specs.product} — ficha técnica`, Author: 'Orfeu Áudio' } })
doc.pipe(createWriteStream(OUT))
tryFont(doc, 'serif', `${fontDir}/Fraunces-Light.ttf`, 'Times-Roman')
tryFont(doc, 'serifItalic', `${fontDir}/Fraunces-LightItalic.ttf`, 'Times-Italic')
tryFont(doc, 'sans', `${fontDir}/Inter-Regular.ttf`, 'Helvetica')
tryFont(doc, 'mono', `${fontDir}/JetBrainsMono-Regular.ttf`, 'Courier')

const W = doc.page.width
const H = doc.page.height
const M = 56

// faixa superior
doc.rect(0, 0, W, 132).fill(C.wash)
doc.font('serif').fontSize(18).fillColor(C.ink).text(brand.name.split('').join(' '), M, 48, { lineBreak: false })
doc.moveTo(M + 98, 50).lineTo(M + 98, 66).lineWidth(0.6).strokeColor(C.muted).stroke()
doc.font('mono').fontSize(8).fillColor(C.ink2).text(brand.sub.split('').join(' '), M + 110, 54, { lineBreak: false })
doc.font('mono').fontSize(7.5).fillColor(C.muted).text('FICHA TÉCNICA · REV. 2026', W - M - 200, 54, { width: 200, align: 'right' })
doc.font('mono').fontSize(7.5).fillColor(C.muted).text(specs.label.toUpperCase(), M, 98, { characterSpacing: 1.6 })

// título
const plainTitle = specs.title.replace(/\*/g, '')
const [t1, t2] = plainTitle.split(',')
doc.font('serif').fontSize(40).fillColor(C.ink).text(t1 + ',', M, 168, { continued: !!t2, lineBreak: false })
if (t2) doc.font('serifItalic').text(t2)
doc.font('sans').fontSize(10.5).fillColor(C.ink2).text(specs.intro, M, 230, { width: W - M * 2 - 120, lineGap: 3 })

// tabela pontilhada
let y = 300
doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor(C.ink2).stroke()
y += 16
for (const r of specs.rows) {
  doc.font('sans').fontSize(10).fillColor(C.ink2)
  const lw = doc.widthOfString(r.label)
  doc.text(r.label, M, y, { lineBreak: false })
  doc.font('mono').fontSize(9.5).fillColor(C.ink)
  const vw = doc.widthOfString(r.value)
  doc.text(r.value, W - M - vw, y + 0.5, { lineBreak: false })
  doc
    .moveTo(M + lw + 10, y + 9)
    .lineTo(W - M - vw - 10, y + 9)
    .dash(0.6, { space: 2.4 })
    .lineWidth(0.6)
    .strokeColor(C.soft)
    .stroke()
    .undash()
  y += 22
}
doc.moveTo(M, y + 4).lineTo(W - M, y + 4).lineWidth(0.6).strokeColor(C.ink2).stroke()

// rodapé
const a = contact.address
doc.font('mono').fontSize(7.5).fillColor(C.muted)
doc.text(`${a.street.toUpperCase()} · ${a.district.toUpperCase()} · ${a.city.toUpperCase()} · ${a.zip}`, M, H - 92, { characterSpacing: 0.8 })
doc.text(`${contact.email.toUpperCase()} · ${contact.phoneDisplay} · ${site.url.replace('https://', '').toUpperCase()}`, M, H - 78, { characterSpacing: 0.8 })
doc.font('sans').fontSize(7.5).fillColor(C.soft).text('Marca, dados e especificações fictícios — material de demonstração. Medições conforme cada unidade entregue.', M, H - 56)
doc.end()
console.log('✓', OUT)
