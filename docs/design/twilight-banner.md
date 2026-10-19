# 粉紫黄昏横幅

- 用途：恢复 Fuwari 横幅，与现有头像、默认淡紫色主题搭配。
- 资源：`src/assets/images/twilight-banner.webp`，由内置 ImageGen 生成，使用 Sharp 转为 WebP，构建时由 Astro 优化。
- 生成日期：2026-10-19。
- 原图尺寸：2172 × 724。原有头像继续使用，旧横幅保留。

## 本地图标

`src/assets/ui-icons.json` 只包含交互组件需要的六个图标，取自仓库已安装的图标集，图形未经修改，随站点打包，避免浏览器运行时请求外部 Iconify API。

- Material Symbols：Google，[源项目](https://github.com/google/material-design-icons)，[Apache-2.0](https://github.com/google/material-design-icons/blob/master/LICENSE)。
- Font Awesome 6 Solid：Dave Gandy，[源项目](https://github.com/FortAwesome/Font-Awesome)，[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)。

生成提示词：

> Use case: illustration-story. Asset type: production panoramic anime landscape banner for a personal Fuwari blog. Create a beautiful 3:1 wide panoramic illustration, preferably 2400x800, of a quiet Japanese town and railway at twilight, distant mountain silhouettes, glowing lavender and rose-pink sunset clouds, tiny warm windows, delicate power lines, soft breeze and a few distant petals. Refined hand-painted anime background art, cinematic composition with beautiful detailed clouds, calm nostalgic atmosphere, sophisticated muted lilac, dusty rose and deep indigo palette. Focus scenic beauty, no people or characters. Keep important scenery in the central horizontal band so it remains attractive when cropped to shallow desktop header and narrow mobile header. A unified fully illustrated scene reaching all edges. No lettering, no logos, no watermark, no border, no UI, no mockup, no website text.
