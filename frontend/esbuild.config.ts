import esbuild from 'esbuild';

esbuild.serve({
  servedir: '.',
  port: 3000,
}, {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/main.js',
  loader: { '.tsx': 'tsx' },
}).then(server => {
  console.log(`Server is live at http://localhost:${server.port}`);
}).catch(() => process.exit(1));
