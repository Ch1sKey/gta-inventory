import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs';

const modules = fs.readdirSync('src/modules');

const copyModulesToClientpackagesPlugin = () => {
  let config

  return {
    name: 'vite-plugin-copy-module-to-client-packages-plugin',

    outputOptions(options: any) {
      console.log(options)
    },
  }

}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(modules.map(moduleName =>
          [
            `module_${moduleName}`,
            resolve(__dirname, `src/modules/${moduleName}/index.html`)
          ])
      ),
      output: {
        dir: 'dist'
      }
    }
  }
})
