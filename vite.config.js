import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const tiledPlugin = () => {
   return {
      name: 'tiled-tileset-plugin',
      resolveId: {
         order: 'pre',
         handler(sourceId, importer, options) {
            if (!sourceId.endsWith('.tsx')) return;
            return { id: 'tileset:' + sourceId, external: 'relative' }
         }
      }
   };
}

export default defineConfig({
   base: './',
   plugins: [
      tiledPlugin(),
      VitePWA({
         registerType: 'prompt',
         injectRegister: false,

         pwaAssets: {
            disabled: false,
            config: true,
         },

         manifest: {
            name: 'Rory Roamer',
            short_name: 'Rory Roamer',
            background_color: '#000',
            theme_color: '#333333',
         },

         workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
         },

         devOptions: {
            enabled: false,
            navigateFallback: 'index.html',
            suppressWarnings: true,
            type: 'module',
         },
      }),
   ],
   // currently excalibur plugins are commonjs
   // this forces vite to keep things from bundling ESM together with commonjs
   optimizeDeps: {
      exclude: ['excalibur'],
   },
   build: {
      assetsInlineLimit: 0, // excalibur cannot handle inlined xml in prod mode
      sourcemap: true,
      // Vite uses rollup currently for prod builds so a separate config is needed
      // to keep vite from bundling ESM together with commonjs
      rollupOptions: {
         output: {
            format: 'umd'
         }
      }
   }
});
