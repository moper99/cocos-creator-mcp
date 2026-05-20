const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function build() {
  console.log('🔨 Building Cocos MCP Server...');

  try {
    // 1. 尝试运行类型检查
    console.log('🔍 Running type check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (e) {
      console.warn('⚠️ Type check failed or tsc not found, but proceeding to bundle...');
    }

    // 2. 使用 esbuild 将所有代码和依赖打包成一个 CommonJS 文件
    console.log('📦 Bundling with esbuild...');
    await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: path.join(distDir, 'main.js'),
      sourcemap: true,
      target: 'node16',
      logLevel: 'info',
    });

    // 3. 构建 scene.ts（场景脚本，独立运行在编辑器场景上下文）
    await esbuild.build({
      entryPoints: [path.join(srcDir, 'scene.ts')],
      bundle: false,
      platform: 'node',
      format: 'cjs',
      outfile: path.join(distDir, 'scene.js'),
      target: 'node16',
      logLevel: 'info',
    });

    console.log('✅ Build completed! Bundle created at dist/main.js and dist/scene.js');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();


