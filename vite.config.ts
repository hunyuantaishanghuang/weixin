import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import * as lightningcss from 'lightningcss';

/**
 * 针对老旧浏览器内核 (Chromium 80~98、微信 XWeb、华为鸿蒙 ArkWeb、老版 Android WebView) 的 CSS 降级插件：
 * 1. 消除 @layer：将 Tailwind v4 默认封装在 @layer 中的样式解构提升为顶层规则，防止老内核因不认 @layer 而直接丢弃整份 CSS。
 * 2. 转换 oklch()：通过 lightningcss 将现代 oklch 颜色空间静态降级为标准 sRGB/Hex/rgba 颜色。
 * 3. 清理 color-mix()：Tailwind v4 已经在 @supports 前生成了静态 Hex 回退值，清理不支持的 @supports 块，确保老内核稳定采用 Hex 回退。
 * 4. 补充 transform 回退：为 translate/scale 提供标准 transform: translate() 回退支持。
 */
function legacyCssDowngradePlugin(): Plugin {
  return {
    name: 'legacy-css-downgrade',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (fileName.endsWith('.css') && file.type === 'asset') {
          const rawCss = typeof file.source === 'string' ? file.source : Buffer.from(file.source).toString('utf8');

          try {
            // 步骤 1：利用 lightningcss 将 oklch/lab/p3 统一降级为 Chrome 80 兼容的 sRGB/Hex
            const transformed = lightningcss.transform({
              filename: fileName,
              code: Buffer.from(rawCss),
              targets: { chrome: 80 << 16 },
              minify: false,
            });
            let css = transformed.code.toString();

            // 步骤 2：解构 @layer 包装层，使全部选择器成为顶层标准选择器
            css = css.replace(/@layer\s+[a-zA-Z0-9_-]+\s*;/g, '');
            const unwrapLayers = (input: string): string => {
              let result = '';
              let i = 0;
              while (i < input.length) {
                const match = input.substring(i).match(/^@layer\s+[a-zA-Z0-9_-]+\s*\{/);
                if (match) {
                  const start = i + match[0].length;
                  let depth = 1;
                  let j = start;
                  while (j < input.length && depth > 0) {
                    if (input[j] === '{') depth++;
                    else if (input[j] === '}') depth--;
                    j++;
                  }
                  if (depth === 0) {
                    const inner = input.substring(start, j - 1);
                    result += unwrapLayers(inner);
                    i = j;
                    continue;
                  }
                }
                result += input[i];
                i++;
              }
              return result;
            };
            css = unwrapLayers(css);

            // 步骤 3：移除针对现代内核的 @supports (color:color-mix...) 块，老内核稳定使用前置的 Hex 默认值
            let cleanSupports = '';
            let i = 0;
            while (i < css.length) {
              const match = css.substring(i).match(/^@supports\s*\(\s*color\s*:\s*color-mix\([^)]+\)\s*\)\s*\{/);
              if (match) {
                const start = i + match[0].length;
                let depth = 1;
                let j = start;
                while (j < css.length && depth > 0) {
                  if (css[j] === '{') depth++;
                  else if (css[j] === '}') depth--;
                  j++;
                }
                if (depth === 0) {
                  i = j;
                  continue;
                }
              }
              cleanSupports += css[i];
              i++;
            }
            css = cleanSupports;

            // 步骤 4：补充 translate 与 scale 的 transform 回退规则并移除渐变中的 in oklab
            css = css.replace(/\s+in\s+oklab/g, '');
            css = css.replace(
              /translate:\s*var\(--tw-translate-x\)\s+var\(--tw-translate-y\)/g,
              'transform:translate(var(--tw-translate-x,0),var(--tw-translate-y,0));translate:var(--tw-translate-x) var(--tw-translate-y)'
            );
            css = css.replace(
              /scale:\s*var\(--tw-scale-x\)\s+var\(--tw-scale-y\)/g,
              'transform:scale(var(--tw-scale-x,1),var(--tw-scale-y,1));scale:var(--tw-scale-x) var(--tw-scale-y)'
            );

            // 步骤 5：最终压缩优化
            const finalMinified = lightningcss.transform({
              filename: fileName,
              code: Buffer.from(css),
              targets: { chrome: 80 << 16 },
              minify: true,
            });

            file.source = finalMinified.code.toString();
            console.log(`[legacy-css-downgrade] Successfully processed ${fileName} (0 @layer, 0 oklch, 0 color-mix)`);
          } catch (err) {
            console.error(`[legacy-css-downgrade] Error processing ${fileName}:`, err);
          }
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    legacyCssDowngradePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg'],
      manifest: {
        id: '/',
        name: '我们的小日子 · 情侣专属生活记录',
        short_name: '我们的小日子',
        description: '专为情侣打造的生活记录与互动空间：今日点菜、经期推算、心情日历、情侣留言便签与恋爱大冒险。',
        theme_color: '#FF6B81',
        background_color: '#FFF5F7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
