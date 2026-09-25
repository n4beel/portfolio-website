// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://nabeelkhan.dev',

  // "One Portal" was the pre-launch placeholder name; keep the old case study URL alive.
  redirects: {
    '/projects/one-portal-ai-autofill': '/projects/zenapply-ai-autofill'
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        deny: [
          '**/projects.json',
          '**/projects copy.json'
        ]
      }
    }
  },

  integrations: [react()]
});