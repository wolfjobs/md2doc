import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'

// 自定义插件：复制文档文件
function copyDocsPlugin() {
  return {
    name: 'copy-docs',
    writeBundle() {
      const srcDir = 'src'
      const distDir = 'dist'
      
      // 复制函数
      function copyDir(src, dest) {
        try {
          mkdirSync(dest, { recursive: true })
          const files = readdirSync(src)
          
          for (const file of files) {
            const srcPath = join(src, file)
            const destPath = join(dest, file)
            const stat = statSync(srcPath)
            
            if (stat.isDirectory()) {
              copyDir(srcPath, destPath)
            } else {
              copyFileSync(srcPath, destPath)
            }
          }
        } catch (error) {
          console.error(`复制目录失败: ${src} -> ${dest}`, error)
        }
      }
      
      // 复制docs目录
      copyDir(join(srcDir, 'docs'), join(distDir, 'src', 'docs'))
      
      // 复制data目录
      copyDir(join(srcDir, 'data'), join(distDir, 'src', 'data'))
      
      // 复制styles目录
      copyDir(join(srcDir, 'styles'), join(distDir, 'src', 'styles'))
      
      console.log('✅ 文档文件复制完成')
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [copyDocsPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
