// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import path from 'path';

export default defineConfig({
    integrations: [],
    output: 'server',
    adapter: vercel({
        webAnalytics: {
          enabled: true,
        },
        maxDuration: 8,
      }),
    vite: {
        resolve: {
            alias: {
                '@scripts': path.resolve('./src/scripts'),
            },
        },
        css: {
            preprocessorOptions: {
                // ...existing code...
            },
        },
    },
});
