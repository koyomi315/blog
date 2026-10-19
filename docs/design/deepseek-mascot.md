# DeepSeek 鲸鱼娘看板娘

仅增加博客角落的 Live2D 同人看板娘，支持待机、视线跟随、摸摸动作、拖动、收起及恢复。直接点击角色会触发摸摸；按住角色或 ⠿ 可拖动，移动不足 5 像素按点击处理；聚焦角色后 Enter / 空格也可触发。手机首次进入默认收起；收起和切换后台暂停渲染。没有接入 AI 对话或声音。

## 素材来源

- 来源：[A8Chann/dsh-pet-live2d](https://github.com/A8Chann/dsh-pet-live2d)。
- 固定版本：`c118e318692bb24c197c834e218c28953ded91bc`。
- 模型文件：`public/live2d/deepseek/`，来自上游 `dsh-live2d-pet/pets/ds-whale-girl/`，美术、动作和表情均未修改。
- 角色原作：上善无形（原创 OC「溟月」）；DeepSeek 女仆鲸鱼娘二次设计：ZipZipPipe；Live2D 绑定、动作与表情：氵六青。
- 许可：CC BY-NC-SA 4.0。保留原始 `LICENSE`；网页工具栏 ⓘ 中提供作者、许可及来源链接。此为同人形象。

## 渲染器

`public/live2d/vendor/live2d-vendor.js` 为同一固定版本发布的渲染器，不安装 DSH 插件或宿主代码。包含 PixiJS 8.19.0 与 untitled-pixi-live2d-engine 1.3.5；保留上游及依赖许可证、打包文件中的第三方许可声明。

Live2D Cubism Core 来自官方地址 `https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js`，按其文件头标注的 Redistributable Code 与[专有软件许可协议第 5 节](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html)原样随本博客功能提供；文件头及许可保存在 `public/live2d/vendor/`，不适用本仓库的 MIT 许可。全部运行资源同源加载，避免浏览器连接官方 CDN 不稳定导致模型空白。

This application contains Live2D Cubism SDK developed by Live2D Inc. of which the copyrights are held by Live2D Inc.

Core 文件 SHA-256：`25AE938CB4FE282CE189B357BCC97E603D1E1F7EC78BF04150D401C23CDC792F`。

## 挂载与交互

布局/滚动条初始化可能移动已有 DOM 节点。组件在同步重挂载时保留渲染器与事件，只在微任务确认真正离开文档后清理；真正重新挂载时创建新的事件控制器。异步模型加载以挂载版本隔离，避免旧加载结果写入新实例状态。
