import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd());//process不存在，则执行 npm i --save-dev @types/node

    // 根据环境变量决定是否启用React
    const enableReact = env.VITE_ENABLE_REACT === 'true';

    return {
        root: '.', // 设置根目录为项目根目录
        build: {
          outDir: 'dist', // 打包输出目录
          emptyOutDir: true, // 清空输出目录
          rollupOptions: {
            input: {
              main: path.resolve(__dirname, 'index.html'), //主入口文件， 使用绝对路径指向 index.html
            },
          },
        },
        plugins: enableReact ? [react()] : [], // 动态启用React插件
        define: {
          // 将环境变量注入到代码中
          'import.meta.env.VITE_ENABLE_REACT': JSON.stringify(env.VITE_ENABLE_REACT),
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"), // 配置 @ 指向 src 目录
          },
        },
      };
    });