# Element Picker Bookmarklet

一个轻量级的书签栏工具，用于选择网页元素并复制其 HTML 代码。无需安装浏览器扩展，点击书签即可使用。

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

打开 http://localhost:7890 ，点击页面顶部红色 **Load Bookmarklet** 按钮即可注入工具进行调试。

修改 `src/` 下的文件后，esbuild 会自动重新打包，刷新页面即可看到更新。

### 构建 Bookmarklet

```bash
npm run build
```

产物在 `dist/` 目录：

| 文件 | 说明 |
|------|------|
| `bookmarklet.txt` | 最终的 bookmarklet URL，复制到书签栏即可使用 |
| `bundle.js` | 压缩后的完整脚本 |
| `bundle.dev.js` | 未压缩版本，含 sourcemap，方便调试 |

### 安装到书签栏

1. 运行 `npm run build`
2. 打开 `dist/bookmarklet.txt`，复制全部内容
3. 在浏览器中新建一个书签，名称随意（如 "Element Picker"）
4. 将复制的内容粘贴到书签的 **URL** 栏
5. 在任何网页点击该书签即可启动工具

## 使用方法

1. 点击书签 → 页面右下角出现悬浮面板
2. 点击 **Click** 按钮 → 进入元素选择模式
3. 鼠标移到页面元素上 → 虚线框高亮
4. 点击元素 → 虚线框锁定选中
5. 按 **↑** / **↓** 方向键 → 切换到父级/子级元素
6. 切换 **Origin** / **Format** 模式（默认 Origin）
7. 点击 **Copy** → 复制 HTML 代码到剪贴板
8. 点击 **Clear** → 清除选中并退出
9. 按 **Esc** → 退出选择模式（有锁定元素时先解锁）

## 开发调试方式

由于 bookmarklet 最终是一行压缩的 `javascript:` URL，直接编辑不现实。本项目提供了完整的开发工作流：

### 方式一：Dev Server（推荐）

```bash
npm run dev
```

在 http://localhost:7890 的测试页面上，点击顶部按钮注入脚本。代码修改后刷新页面即可。

### 方式二：浏览器控制台

在任意网页的 DevTools Console 中粘贴 `dist/bundle.dev.js` 的内容并执行。

### 方式三：用户脚本

将 `dist/bundle.dev.js` 通过 Tampermonkey 等用户脚本管理器加载，适合在真实网站上测试。

## 项目结构

```
├── src/
│   ├── main.js         # 入口：初始化并串联所有模块
│   ├── panel.js        # 悬浮面板 UI + 拖拽
│   ├── selector.js     # 元素选择：hover / click / 键盘导航
│   ├── copier.js       # HTML 复制（Origin / Format）
│   ├── formatter.js    # 轻量级 HTML 格式化器
│   └── styles.js       # CSS 样式注入
├── scripts/
│   ├── build-bookmarklet.mjs  # 构建脚本
│   └── dev-server.mjs         # 开发服务器
├── dev/
│   └── index.html      # 开发测试页面
└── dist/               # 构建产物
```

## 排除规则

以下元素不会被选中：
- 工具自身的悬浮面板
- `<html>`、`<body>`、`<head>`、`<script>`、`<style>`
- `<input type="password">` 密码输入框
