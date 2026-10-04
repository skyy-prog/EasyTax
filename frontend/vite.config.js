// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
// });


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },

      manifest: {
        name: 'EasyTax',
        short_name: 'EasyTax',
        description: 'Tax management and GST assistant for small businesses',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',

        icons: [
          {
            src: '/image.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/imagetwo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})