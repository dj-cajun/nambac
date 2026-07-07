import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { nambacApiPlugin } from './server/viteApiPlugin.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'share-og-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = req.url?.split('?')[0] || '';
          const fortuneShareMatch = pathname.match(/^\/share-fortune\/([^/]+)\/(\d+)(?:\/([^/]+))?$/);
          if (fortuneShareMatch) {
            const [, name, idx, date] = fortuneShareMatch;
            const decodedName = decodeURIComponent(name);
            let q = `name=${encodeURIComponent(decodedName)}&idx=${idx}`;
            if (date) q += `&date=${encodeURIComponent(date)}`;
            req.url = `/api/fortune-share?${q}`;
            return next();
          }
          const balanceShareMatch = pathname.match(/^\/share-balance\/([^/]+)(?:\/([^/]+))?$/);
          if (balanceShareMatch) {
            const [, bid, voted] = balanceShareMatch;
            let q = `q=${encodeURIComponent(bid)}`;
            if (voted) q += `&voted=${encodeURIComponent(voted)}`;
            req.url = `/api/balance-share?${q}`;
            return next();
          }
          const roastShareMatch = pathname.match(/^\/share-roast\/([^/]+)\/([^/]+)$/);
          if (roastShareMatch) {
            const [, rname, rtrait] = roastShareMatch;
            req.url = `/api/roast-share?name=${encodeURIComponent(decodeURIComponent(rname))}&trait=${encodeURIComponent(rtrait)}`;
            return next();
          }
          const scoreMatch = pathname.match(/^\/share\/([^/]+)\/(\d+)$/);
          const quizMatch = pathname.match(/^\/share\/([^/]+)$/);
          if (scoreMatch) {
            req.url = `/api/og?id=${encodeURIComponent(scoreMatch[1])}&score=${scoreMatch[2]}`;
          } else if (quizMatch) {
            req.url = `/api/og?id=${encodeURIComponent(quizMatch[1])}`;
          }
          next();
        });
      },
    },
    nambacApiPlugin(),
    {
      name: 'missing-static-images-404',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] || ''
          if (!url.startsWith('/images/')) return next()
          const filePath = path.join(__dirname, 'public', url)
          if (fs.existsSync(filePath)) return next()
          res.statusCode = 404
          res.end('Not found')
        })
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
  },
})
