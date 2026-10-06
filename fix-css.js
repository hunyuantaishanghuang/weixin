// fix-css.js - 零依赖、纯原生 Node.js CSS 兼容性降级修复脚本
// 专治：Chromium < 99、微信 XWeb、华为鸿蒙 WebView、安卓系统老内核丢弃 CSS 的问题

import fs from 'node:fs';
import path from 'node:path';

// 1. 纯数学实现 OKLCH 颜色空间转 sRGB / Hex
function oklchToHex(lStr, cStr, hStr, aStr) {
  let L = parseFloat(lStr);
  if (lStr.includes('%')) L = L / 100;
  const C = parseFloat(cStr);
  let h = parseFloat(hStr);
  let alpha = aStr !== undefined ? parseFloat(aStr) : 1;
  if (aStr && aStr.includes('%')) alpha = parseFloat(aStr) / 100;

  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  function gamma(x) {
    if (x <= 0.0031308) return 12.92 * x;
    return 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
  }

  const r = Math.min(255, Math.max(0, Math.round(gamma(rLin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gamma(gLin) * 255)));
  const bVal = Math.min(255, Math.max(0, Math.round(gamma(bLin) * 255)));

  if (alpha < 1) {
    return `rgba(${r},${g},${bVal},${alpha})`;
  }
  return '#' + [r, g, bVal].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// 2. 解构 @layer 包装层（老内核不认 @layer 会丢弃内部所有规则）
function unwrapLayers(css) {
  css = css.replace(/@layer\s+[a-zA-Z0-9_-]+\s*;/g, '');
  let result = '';
  let i = 0;
  while (i < css.length) {
    const match = css.substring(i).match(/^@layer\s+[a-zA-Z0-9_-]+\s*\{/);
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
        const inner = css.substring(start, j - 1);
        result += unwrapLayers(inner);
        i = j;
        continue;
      }
    }
    result += css[i];
    i++;
  }
  return result;
}

// 3. 移除 @supports (color:color-mix...) 块（保留前面已声明的 Hex 静态色）
function removeColorMixSupports(css) {
  let result = '';
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
    result += css[i];
    i++;
  }
  return result;
}

// 4. 核心转换函数
function transformCss(rawCss) {
  let css = unwrapLayers(rawCss);
  css = removeColorMixSupports(css);

  // 转换 oklch(...) 颜色为 Hex 或 rgba
  css = css.replace(/oklch\(\s*([^%]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([^)]+))?\s*\)/g, (_, l, c, h, a) => {
    return oklchToHex(l, c, h, a);
  });

  // 移除渐变中的 in oklab 插值空间声明（老内核不识别 in oklab 会导致渐变背景完全失效呈现白块）
  css = css.replace(/\s+in\s+oklab/g, '');

  // 补齐 translate / scale 的标准 transform 回退语法
  css = css.replace(
    /translate:\s*var\(--tw-translate-x\)\s+var\(--tw-translate-y\)/g,
    'transform:translate(var(--tw-translate-x,0),var(--tw-translate-y,0));translate:var(--tw-translate-x) var(--tw-translate-y)'
  );
  css = css.replace(
    /scale:\s*var\(--tw-scale-x\)\s+var\(--tw-scale-y\)/g,
    'transform:scale(var(--tw-scale-x,1),var(--tw-scale-y,1));scale:var(--tw-scale-x) var(--tw-scale-y)'
  );

  return css;
}

// 执行目录扫描与替换
const rootDir = process.cwd();
const possibleDirs = [
  path.join(rootDir, 'dist', 'assets'),
  path.join(rootDir, 'dist')
];

let processedCount = 0;

for (const dir of possibleDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.css')) {
      const fullPath = path.join(dir, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const transformed = transformCss(raw);
      fs.writeFileSync(fullPath, transformed, 'utf8');

      const layers = (transformed.match(/@layer/g) || []).length;
      const oklch = (transformed.match(/oklch\(/g) || []).length;
      const colorMix = (transformed.match(/color-mix\(/g) || []).length;

      console.log(`[成功降级] ${file}:`);
      console.log(`  - @layer: ${layers} (已解构)`);
      console.log(`  - oklch: ${oklch} (已转为标准 Hex/RGB)`);
      console.log(`  - color-mix: ${colorMix} (已转为 Hex 兜底)`);
      console.log(`  - 大小: ${(transformed.length / 1024).toFixed(1)} KB`);
      processedCount++;
    }
  }
}

if (processedCount === 0) {
  console.log('[提示] dist 目录未找到 .css 文件，请先运行 npm run build 生成产物后再运行 node fix-css.js');
} else {
  console.log(`\n🎉 共成功修复 ${processedCount} 个 CSS 文件！现在执行 tcb hosting deploy dist 即可在手机上查看正常样式！`);
}
