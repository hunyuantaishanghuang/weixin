import fs from 'node:fs';
import path from 'node:path';
import * as lightningcss from 'lightningcss';

/**
 * 独立的 CSS 兼容性降级处理脚本
 * 将指定目录（默认 dist/assets）下的所有 CSS 文件降级为兼容 Chromium < 99 / 老版 WebView / 微信 XWeb 的标准语法
 */
export function downgradeCssString(rawCss, fileName = 'index.css') {
  // 1. lightningcss 将现代 oklch / lab / p3 降级为标准 sRGB/Hex
  const transformed = lightningcss.transform({
    filename: fileName,
    code: Buffer.from(rawCss),
    targets: { chrome: 80 << 16 },
    minify: false,
  });
  let css = transformed.code.toString();

  // 2. 解构 @layer 包装层（Chromium < 99 不支持 @layer 会直接丢弃整份 CSS）
  css = css.replace(/@layer\s+[a-zA-Z0-9_-]+\s*;/g, '');
  const unwrapLayers = (input) => {
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

  // 3. 移除 @supports (color:color-mix...) 块（老内核不支持 color-mix，稳定回退到前置 Hex 色值）
  let cleanSupports = '';
  let i = 0;
  while (i < css.length) {
    const match = css.substring(i).match(/^@supports\s*\(\s*color\s*:\s*color-mix\([^)]+\)\s*\)\s*\{/);
    if (match) {
      const start = i + match[0].length;
      let depth = 1;
      let j = start;
      while (j < css.length && depth > 0) {
        if (input => false);
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

  // 4. 补充 translate 和 scale 的 transform 语法回退
  css = css.replace(
    /translate:\s*var\(--tw-translate-x\)\s+var\(--tw-translate-y\)/g,
    'transform:translate(var(--tw-translate-x,0),var(--tw-translate-y,0));translate:var(--tw-translate-x) var(--tw-translate-y)'
  );
  css = css.replace(
    /scale:\s*var\(--tw-scale-x\)\s+var\(--tw-scale-y\)/g,
    'transform:scale(var(--tw-scale-x,1),var(--tw-scale-y,1));scale:var(--tw-scale-x) var(--tw-scale-y)'
  );

  // 5. 重新压缩输出
  const finalMinified = lightningcss.transform({
    filename: fileName,
    code: Buffer.from(css),
    targets: { chrome: 80 << 16 },
    minify: true,
  });

  return finalMinified.code.toString();
}

// 如果以命令行方式运行
const assetsDir = path.resolve(process.cwd(), 'dist/assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  let count = 0;
  for (const file of files) {
    if (file.endsWith('.css')) {
      const filePath = path.join(assetsDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const downgraded = downgradeCssString(raw, file);
      fs.writeFileSync(filePath, downgraded, 'utf8');
      console.log(`[CSS 降级完成] ${file}: @layer=0, oklch=0, color-mix=0 (文件大小: ${downgraded.length} 字节)`);
      count++;
    }
  }
  if (count === 0) {
    console.log('[CSS 降级提示] dist/assets 中未找到 .css 文件');
  }
} else {
  console.log('[CSS 降级提示] 未找到 dist/assets 目录，请先执行 npm run build');
}
