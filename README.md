# Musee

> 在 DeepSeek Harness 里读期刊、译摘要、管引用。

Musee 是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的一个文献工作台插件：按学科浏览期刊最新论文与 arXiv 预印本，提供学术化中英翻译、期刊引用格式、一键与批量引用、收藏和阅读笔记。数据来自 OpenAlex 与 arXiv，个人数据全部保存在本地。

**Musee is a reading desk for journals and preprints inside DeepSeek Harness.** It browses recent journal articles and arXiv preprints by field, translates titles and abstracts into idiomatic academic Chinese with your own model, formats citations (GB/T 7714, APA, MLA, IEEE, BibTeX, RIS), and keeps a local library with reading status, tags, and notes.

## 功能

- **三个学科，32 本期刊**：城市研究、物理、人工智能与机器人；期刊目录内置 ISSN 与 OpenAlex source id。
- **arXiv 预印本**：按 `cs.RO`、`cs.AI`、`quant-ph`、`hep-th`、`physics.soc-ph` 等分类看最新提交。
- **学术翻译**：调用你已配置的模型，按“标题 + 摘要 + 学术语体 + 术语一致”的提示词翻译；结果按内容哈希缓存，重复阅读不重复计费。
- **一键引用与批量引用**：GB/T 7714、APA 7、MLA 9、IEEE、BibTeX、RIS 六种格式；在“我的库”勾选多篇即可批量生成。
- **收藏与笔记**：阅读状态（待读/在读/已读）、标签、Markdown 笔记、按状态筛选、整库导出 Markdown / BibTeX / RIS。
- **检索**：按标题、作者、主题检索 OpenAlex 收录的论文。
- **本地优先**：无账号、无后端、无遥测；库与译文缓存都在 `~/.dsh/musee`，可随时导出。

## 安装

前置条件：

- 已安装 DeepSeek Harness Desktop；
- 已配置可用的模型路由（翻译走 `ctx.llm`，默认使用当前 Agent 的默认模型）。

从源码安装：

1. 克隆仓库并进入目录：

   ```powershell
   git clone https://github.com/Yuhang-Wan/musee.git
   cd musee
   ```

2. 在 DSH 的 **设置 → 插件 → 安装本地插件** 中选择本目录（包含 `package.json` 与 `cordis.patch.yml`）。
3. 安装完成后刷新页面，左侧栏会出现 Musee 的书本图标。

开发者也可以直接调用 Plugin Manager 的 `install_bundle`，target 指向本目录。

## 配置

配置写在 profile 的 `cordis.patch.yml` 中 `musee` 这一行：

```yaml
- id: musee
  name: dsh-musee
  config:
    dataDir: ''          # 留空使用 ~/.dsh/musee
    mailto: ''           # OpenAlex polite pool 邮箱，建议填写
    llmProvider: ''      # 留空使用 Agent 默认模型
    llmModel: ''         # 与 llmProvider 同时填写才生效
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `dataDir` | `~/.dsh/musee` | 库、译文缓存、运行信息的保存目录 |
| `mailto` | 空 | OpenAlex 礼貌池标识，填写后请求更稳定 |
| `llmProvider` / `llmModel` | 空 | 翻译用的模型路由；留空则用 Agent 默认模型 |

数据目录内容：

- `library.json`：收藏、状态、标签、笔记；
- `cache/translations.json`：按内容哈希缓存的译文；
- `runtime.json`：本次运行的本地 API token（权限 0600，仅供调试或后续 CLI 使用）。

## 数据与合规

- 只读取 **公开元数据与摘要**，不抓取付费全文，不绕过任何付费墙或登录墙。
- 使用 OpenAlex 与 arXiv 的公开 API；请填写 `mailto` 以遵守 OpenAlex 的礼貌使用约定。
- 翻译只把**标题与摘要**发送到你配置的模型，不发送整篇 PDF，也不上传到 Musee 自己的服务器（Musee 没有服务器）。
- 引用格式由程序生成，投稿前请按目标期刊要求核对。

## 工作方式

```
Client（React，挂在整页 main 面板 + 左侧栏图标）
  ├─ 发现 / 期刊 / arXiv / 检索 / 我的库
  ├─ 学术翻译、引用弹窗、笔记自动保存
  └─ 同源请求 /musee/api/*（带本次启动的 token）
Host 插件
  ├─ OpenAlex / arXiv 数据源与解析
  ├─ ctx.llm 学术翻译 + 磁盘缓存
  ├─ 引用格式与本地库
  └─ 同源 HTTP API（GET/POST）
```

- 用 `webServer.tapIndex` 把本次运行的 token 注入页面 `<meta name="musee-token">`，客户端请求带上 `x-musee-token`。
- 面板使用 DSH 主题 token（`--dsw-alias-*`），跟随明暗主题；文案走 Client locale 的 `musee` 命名空间（中文/英文）。

## 开发

```powershell
# 安装构建依赖（esbuild）
cd tools
pnpm install --node-linker=hoisted

# 构建 Client bundle
cd ..
node tools/build.mjs

# 数据源、引用、存储的冒烟测试
node tools/smoke.mjs

# 运行时 API 检查（需要先安装插件并启动 DSH）
node tools/check-api.mjs
```

目录：

```
index.js              Host 入口：注册 API 路由与 token 注入
src/host/             数据源、翻译、引用、存储
src/client/           React 界面源码（JSX）
client.js             构建产物（由 tools/build.mjs 生成）
tools/                构建与冒烟脚本
locale/               插件显示元数据（中/英）
icon.svg              插件图标
cordis.patch.yml      插件清单
```

## 路线图

- **v0.2 全文阅读**：arXiv HTML/PDF、PMC JATS，段落级双语对照与高亮锚定。
- **v0.3 知识管理**：Zotero / BibTeX 导入，引用网络与“被谁引用”提醒，期刊订阅与每日新文。
- **v0.4 智能阅读**：Agent 工具（`musee_search` / `musee_note`）、论文问答、观点卡片与综述草稿。
- **v1.0 全学科**：可导入的期刊目录、更多数据源、npm 发布与完整文档。

欢迎在 Issues 里补充你所在领域的期刊清单和使用场景。

## License

[MIT](LICENSE) © 2026 Yuhang Wan
