import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    build: {
      outDir: resolve(__dirname, 'out/node/main'),
      rollupOptions: {
        external: ['better-sqlite3', 'onnxruntime-node', 'sharp'],
        input: {
          main: resolve(__dirname, 'src/node/main/index.ts'), // 主入口
          imageInfer: resolve(__dirname, 'src/node/private/model/imageInfer.ts') // 推理程序入口
        },
        // 关键：确保共用模块在两个入口间正确共享
        output: {
          // 为每个入口生成单独的文件
          entryFileNames: '[name].js',
          // 拆分第三方依赖和共用代码到独立文件
          chunkFileNames: 'chunks/[name]-[hash].js'
        }
      }
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@global': resolve(__dirname, 'src/node/global'),
        '@private': resolve(__dirname, 'src/node/private')
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/node/preload/index.ts')
      },
      outDir: resolve(__dirname, 'out/node/preload')
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@global': resolve(__dirname, 'src/node/global')
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      },
      outDir: resolve(__dirname, 'out/renderer')
    },
    resolve: {
      alias: {
        '@global': resolve(__dirname, 'src/node/global'),
        '@renderer': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: true
      },
      proxy: {
        // 将以 img:// 开头的请求代理到一个不存在的地址，
        // 目的是让 Vite 放弃处理它，而不是返回错误或占位符。
        '^/img:': {
          target: 'http://localhost:9999', // 一个不存在的服务地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/img:/, '') // 可选，重写路径
        }
      }
    }
  }
})
