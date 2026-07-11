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
          if (pathname === '/sitemap.xml') {
            req.url = '/api/sitemap';
            return next();
          }
          const fortuneShareMatch = pathname.match(/^\/share-fortune\/([^/]+)\/(\d+)(?:\/([^/]+))?$/);
          if (fortuneShareMatch) {
            const [, name, idx, date] = fortuneShareMatch;
            const decodedName = decodeURIComponent(name);
            let q = `name=${encodeURIComponent(decodedName)}&idx=${idx}`;
            if (date) q += `&date=${encodeURIComponent(date)}`;
            const axis = new URL(req.url, 'http://localhost').searchParams.get('axis');
            if (axis) q += `&axis=${encodeURIComponent(axis)}`;
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
          const brainShareMatch = pathname.match(/^\/share-brain\/([^/]+)\/([^/]+)$/);
          if (brainShareMatch) {
            const [, bname, bresult] = brainShareMatch;
            req.url = `/api/brain-share?name=${encodeURIComponent(decodeURIComponent(bname))}&result=${encodeURIComponent(bresult)}`;
            return next();
          }
          const lienquanHeroShare = pathname.match(/^\/share-lienquan\/tuong\/([^/]+)$/);
          if (lienquanHeroShare) {
            req.url = `/api/lienquan-share?hero=${encodeURIComponent(lienquanHeroShare[1])}`;
            return next();
          }
          const lienquanPageShare = pathname.match(/^\/share-lienquan\/([^/]+)$/);
          if (lienquanPageShare) {
            req.url = `/api/lienquan-share?page=${encodeURIComponent(lienquanPageShare[1])}`;
            return next();
          }
          if (pathname === '/share-lienquan') {
            req.url = '/api/lienquan-share';
            return next();
          }
          const vbtiResultShare = pathname.match(/^\/share-vbti\/result\/([^/]+)$/);
          if (vbtiResultShare) {
            req.url = `/api/vbti-share?result=${encodeURIComponent(vbtiResultShare[1])}`;
            return next();
          }
          const vbtiTypeShare = pathname.match(/^\/share-vbti\/type\/([^/]+)$/);
          if (vbtiTypeShare) {
            req.url = `/api/vbti-share?type=${encodeURIComponent(vbtiTypeShare[1])}`;
            return next();
          }
          const vbtiPageShare = pathname.match(/^\/share-vbti\/([^/]+)$/);
          if (vbtiPageShare) {
            req.url = `/api/vbti-share?page=${encodeURIComponent(vbtiPageShare[1])}`;
            return next();
          }
          if (pathname === '/share-vbti') {
            req.url = '/api/vbti-share';
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('html2canvas')) return 'vendor-canvas';
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
            return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
})
