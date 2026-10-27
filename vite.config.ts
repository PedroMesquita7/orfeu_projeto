import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import { renderPage } from './src/render/page.ts'

/** Injeta o HTML gerado a partir de src/content.ts no index.html. */
function prerender(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: 'orfeu-prerender',
    configureServer(s) {
      server = s
    },
    async transformIndexHtml(html) {
      let render = renderPage
      if (server) {
        // Em dev, recarrega o conteúdo a cada requisição (edite content.ts e dê F5).
        const mod = (await server.ssrLoadModule('/src/render/page.ts')) as { renderPage: typeof renderPage }
        render = mod.renderPage
      }
      const { head, body } = render()
      return html.replace('<!--head-->', head).replace('<!--app-->', body)
    },
    handleHotUpdate({ file, server }) {
      if (/src[\\/](content\.ts|render[\\/])/.test(file)) {
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}

export default defineConfig({
  plugins: [prerender()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
})
