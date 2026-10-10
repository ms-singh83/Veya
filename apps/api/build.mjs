import { build } from 'esbuild';

// Bundle our own workspace packages (they ship TypeScript source); keep npm dependencies external.
await build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  plugins: [
    {
      name: 'external-npm-deps',
      setup(b) {
        b.onResolve({ filter: /^[^./]/ }, (args) =>
          args.path.startsWith('@veya/') ? undefined : { path: args.path, external: true },
        );
      },
    },
  ],
});
