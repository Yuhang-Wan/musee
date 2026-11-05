# Musée

[![CI](https://github.com/Yuhang-Wan/musee/actions/workflows/ci.yml/badge.svg)](https://github.com/Yuhang-Wan/musee/actions/workflows/ci.yml)

> 在 DeepSeek Harness 里读期刊、译摘要、管引用。

Musée 是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的一个文献工作台插件：按学科浏览期刊最新论文与 arXiv 预印本，提供学术化中英翻译、期刊引用格式、一键与批量引用、收藏和阅读笔记。数据来自 OpenAlex 与 arXiv，个人数据全部保存在本地。

**Musée is a reading desk for journals and preprints inside DeepSeek Harness.** It browses recent journal articles and arXiv preprints by field, translates titles and abstracts into idiomatic academic Chinese with your own model, formats citations (GB/T 7714, APA, MLA, IEEE, BibTeX, RIS), and keeps a local library with reading status, tags, and notes.

## 功能

- **三个学科，32 本期刊**：城市研究、物理、人工智能与机器人；期刊目录内置 ISSN 与 OpenAlex source id。
- **编辑式首页**：Science 风格的衬线标题、细线分隔和原创封面插画；关注期刊的最新论文以头条 + 卡片呈现，红色只用于品牌字与少量强调。
- **推荐期刊**：Nature、Science、Cell 及 Nature Communications、Science Advances、Cell Reports、Nature Cities 等 10 本旗舰/子刊，均可一键关注。
- **旗舰系列**：Nature 系、Science 系、Cell 系共 24 本期刊（含 Nature Chemistry/Materials/Medicine、Science Signaling/Immunology、Molecular Cell/Neuron/Immunity 等），在「旗舰系列」标签下按系列浏览。
- **首页动态**：打开 Musée 先看到首页，汇总你关注期刊的最新 3 篇论文；期刊卡片上的星标即可关注/取消关注。
- **图文期刊卡片**：每本期刊有原创排版封面（随学科变色的书脊设计）、Musée 撰写的范围简介、ISSN 与收录量；详情页显示最新一卷/期。
- **引用指标**：期刊页显示 OpenAlex 的两年平均被引与 h-index；支持从本地导入 JCR 影响因子（需自备授权数据，Musée 不内置）。
- **PDF 内置阅读**：arXiv 论文在面板内用 PDF.js 自绘阅读器打开，支持翻页、缩放、文本层选择、高亮、划词翻译与批注；批注按页码和选区位置保存在 `library.json`，并随 Markdown 导出。
- **往期浏览**：期刊页可按年份筛选（带每年篇数）、显示总篇数与卷/期，底部「加载更多」逐页翻看历史论文。
- **标题翻译**：论文列表自动把标题批量译成当前翻译语言，缓存在本地；设置里可一键关闭，关闭后不再调用模型。
- **OA 全文阅读**：论文有 arXiv 版本时出现「全文阅读」；左侧章节目录，正文含图、表、公式与参考文献，点图可放大，正文引用可跳到对应文献，支持按章节做学术翻译。
- **全文翻译**：阅读器里一键「翻译全文」，按章节分批翻译并显示进度，可随时停止；译文视图按章节排列，原文视图保留图、表、公式与参考文献。结果按段落缓存，重复打开不再重复计费。
- **顶会论文**：NeurIPS、CVPR、ICCV、AAAI、IJCAI、ACL、EMNLP、KDD、ICRA、IROS、RSS，来自 OpenAlex 会议论文集。
- **arXiv 预印本**：按 `cs.RO`、`cs.AI`、`quant-ph`、`hep-th`、`physics.soc-ph` 等分类看最新提交。
- **学术翻译**：调用你已配置的模型，按“标题 + 摘要 + 学术语体 + 术语一致”的提示词翻译成中文或法语；结果按内容哈希缓存，重复阅读不重复计费。
- **面板内语言设置**：English / 中文 / Français 三语界面，只影响 Musée 面板，不切换整个 DSH；期刊名与简介会以所选语言显示在英文名下方。
- **一键引用与批量引用**：GB/T 7714、APA 7、MLA 9、IEEE、BibTeX、RIS 六种格式；期刊论文、会议论文、预印本分别按 `[J]` / `[C]` / `@inproceedings` 处理。
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
3. 安装完成后刷新页面，左侧栏会出现 Musée 的书本图标。

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
- `preferences.json`：关注的期刊；
- `impact-factors.json`：可选的本地影响因子表（见下）；
- `cache/translations.json`：按内容哈希缓存的译文；
- `runtime.json`：本次运行的本地 API token（权限 0600，仅供调试或后续 CLI 使用）。

### 本地导入影响因子

JCR 影响因子是 Clarivate 的版权数据，Musée 不内置、也不抓取。若你已有授权数据，可在 `~/.dsh/musee/impact-factors.json` 按 ISSN 写入：

```json
{
  "2522-5839": 18.8,
  "0042-0980": 3.4
}
```

重启插件后，期刊卡片和详情页会显示 `IF`；没有本地数据的期刊显示 OpenAlex 的两年平均被引（`2yr 被引`）与 `h-index`，并明确标注不是 JCR IF。

## 数据与合规

- 只读取 **公开元数据与摘要**，不抓取付费全文，不绕过任何付费墙或登录墙。
- 使用 OpenAlex 与 arXiv 的公开 API；请填写 `mailto` 以遵守 OpenAlex 的礼貌使用约定。
- 翻译只把**标题与摘要**发送到你配置的模型，不发送整篇 PDF，也不上传到 Musée 自己的服务器（Musée 没有服务器）。
- **期刊封面是 Musée 的原创排版设计**，不是出版商封面；出版商封面图有版权且没有稳定的授权 API，因此这里用按学科配色、由刊名缩写生成的封面替代。
- **期刊简介是 Musée 撰写的范围说明**，不是出版商官方文案；官方描述可点“期刊官网”前往。
- 顶会论文来自 OpenAlex 的会议论文集；ICML、ICLR、CoRL 等以 OpenReview 为主的会议收录不完整，后续会补其他数据源。
- **全文来自 arXiv HTML**：正文、图片、表格和参考文献由 arXiv 页面解析，图片直接指向 arXiv 的公开地址；Musée 不转存、不再分发这些内容。没有 HTML 全文的论文会给出 PDF 链接。
- **PDF 预览**：arXiv PDF 通过本地同源路由交给 PDF.js 自绘阅读器；PDF 文件不落盘，只缓存于当前页面内存。其他出版商的付费或登录 PDF 不做代理。
- **PDF 批注**：高亮/笔记保存为页码 + 归一化选区矩形，缩放后仍能对齐；文本只用于批注与翻译，不转存整篇 PDF。
- 渲染前会在浏览器端用白名单清洗 HTML（移除脚本、样式与表单），只保留正文、图表、公式和链接。
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

- **v0.7 全文翻译（当前）**：按章节批量翻译、进度与停止、原文/译文双视图。
- **v0.8 深读与批注**：HTML 阅读器段落高亮、PMC JATS 适配、阅读进度与章节笔记。
- **v0.9 知识管理**：Zotero / BibTeX 导入，引用网络与“被谁引用”提醒，期刊订阅与每日新文。
- **v1.0 智能阅读与全学科**：Agent 工具、论文问答、观点卡片、可导入期刊目录与 npm 发布。

欢迎在 Issues 里补充你所在领域的期刊清单和使用场景。

## License

[MIT](LICENSE) © 2026 Yuhang Wan

Bundled third-party code and its licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
