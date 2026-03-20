import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base:'/flyer-draw/',
  server: {
    host: '0.0.0.0', // 允许所有IP访问（局域网/外网），也可填具体IP如192.168.1.100
    proxy: {
      '/api': {
        target: 'http://localhost:8000/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  build:{
    outDir:'./deploy'
  },
  plugins: [
      vue(),
    {
      name:'copy-dist-files',
      closeBundle() {
        console.log("打包后有木有执行这个方法")
      }
    }
  ],
})
