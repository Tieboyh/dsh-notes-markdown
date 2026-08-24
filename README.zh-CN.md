# dsh-notes-markdown

[English](./README.md) | [简体中文](./README.zh-CN.md)

在 DeepSeek Harness 侧边栏中随时记录和管理 Markdown 笔记。

它不是只读文档面板：你可以直接在 DSH 内新建、编辑、预览、重命名、搜索和删除 Markdown 文档。笔记默认保存为 `~/.dsh/docs` 下的真实 `.md` 文件。

## 功能

- 在 Better Sidebar 中注册常驻的「Markdown 笔记」页面
- 新建、打开、编辑、重命名、搜索和删除笔记
- 停止输入后自动保存，并显示保存状态
- 支持 GFM 的安全 Markdown 预览，HTML 会经过净化
- 使用 revision 拒绝其他 DSH 窗口产生的过期写入
- 原子保存、重名保护、路径穿越保护和符号链接拒绝
- 跟随页面语言显示中文或英文
- 适配不同宽度的侧边栏双栏布局

## 安装

如果尚未安装 Better Sidebar，先执行：

```sh
dsh plugin --profile web add dsh-better-sidebar
```

然后安装本插件：

```sh
dsh plugin --profile web add github:Tieboyh/dsh-notes-markdown
```

仓库包含预构建插件 bundle，通过 GitHub 安装时不需要额外授权依赖构建。

安装、升级或卸载插件后需要重启 DSH Web。之后可从 Better Sidebar 的 `+` 菜单打开「Markdown 笔记」。

## 数据位置

笔记是普通 Markdown 文件，默认保存在：

```text
~/.dsh/docs
```

目录会自动创建。如需使用其他目录，可以在启动 DSH Web 前设置 `DSH_NOTES_MARKDOWN_DIR`。

第一版有意只支持单层文档目录。文档名称不能包含 `/`、`\\`、隐藏文件前缀或路径穿越片段。

## 保存机制

停止输入约 700 毫秒后自动保存。切换或重命名文档前会先落盘待保存内容。每次写入都会携带读取时的 revision；如果另一个窗口已经修改文件，插件会提示冲突，不会覆盖更新内容。

## 本地开发

```sh
npm install
npm run check
npm run build
dsh plugin --profile web add "$PWD"
```

挂载本地源码后需要重启 DSH Web。

## 许可证

MIT
