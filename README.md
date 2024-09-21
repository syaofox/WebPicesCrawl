# 图片提取器 Chrome 插件

## 简介

图片提取器是一个 Chrome 浏览器扩展,专门设计用于从特定网站（如 photos18.com、knit.bid 和 xinmeitulu.com）提取和下载图片。这个插件可以自动滚动页面以加载所有图片,然后提取并提供下载功能。

## 功能特点

- 自动滚动页面加载所有图片
- 从指定网站提取图片 URL
- 实时显示图片加载和提取进度
- 提供简单的用户界面,包括提取和下载按钮
- 支持批量下载提取的图片

## 支持的网站

- photos18.com
- knit.bid
- xinmeitulu.com

## 安装方法

1. 下载此仓库的 ZIP 文件并解压
2. 打开 Chrome 浏览器,进入 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的文件夹

## 使用说明

1. 访问支持的网站（如 photos18.com、knit.bid 或 xinmeitulu.com）
2. 点击浏览器右下角出现的"提取图片"按钮
3. 等待插件自动滚动页面并提取图片
4. 提取完成后,点击"下载图片"按钮下载所有图片

## 技术细节

- 使用 JavaScript 实现页面滚动和图片提取
- 利用 Chrome 扩展 API 进行跨脚本通信和文件下载
- 采用异步编程确保流畅的用户体验

## 贡献指南

欢迎提交 Issues 和 Pull Requests 来改进这个项目。在提交 PR 之前，请确保您的代码符合现有的代码风格并通过所有测试。

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过 [GitHub Issues](https://github.com/yourusername/image-extractor-extension/issues) 与我们联系。
