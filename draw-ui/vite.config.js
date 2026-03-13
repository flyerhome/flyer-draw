import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base:'/flyer-draw/',
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
