import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const DEFAULT_SITE_URL = "https://ablomer.github.io/planetcrafter"

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "")
}

function seoPlugin(): Plugin {
  return {
    name: "seo-site-url",
    transformIndexHtml(html) {
      const siteUrl = normalizeSiteUrl(
        process.env.VITE_SITE_URL || DEFAULT_SITE_URL
      )
      return html.replaceAll("%SITE_URL%", siteUrl)
    },
    generateBundle() {
      const siteUrl = normalizeSiteUrl(
        process.env.VITE_SITE_URL || DEFAULT_SITE_URL
      )
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url>\n` +
          `    <loc>${siteUrl}/</loc>\n` +
          `  </url>\n` +
          `</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
