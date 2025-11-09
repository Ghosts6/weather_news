import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Proxy for API requests
app.use('/api', createProxyMiddleware({
  target: 'http://backend:8000',
  changeOrigin: true,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '.')));


// esbuild watch and serve
esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/main.js',
  loader: { '.tsx': 'tsx' },
}).then(ctx => {
  ctx.watch();
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Frontend server listening at http://localhost:${port}`);
  });
}).catch(() => process.exit(1));
