// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

export default defineConfig({
    integrations: [],
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
