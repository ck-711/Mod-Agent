# DOTS Survivors 玩家模组生成器

用自然语言调整《DOTS Survivors》现有武器的数值，生成可安装到 Windows 游戏中的 `.dsmod` 文件。当前版本面向受邀玩家测试，支持修改武器各等级的**基础伤害**和**冷却时间**。

## 网站截图

以下截图来自本地运行的中文界面，展示的是尚未生成模组时的页面。

**首页**

![网站首页](docs/screenshots/home.jpg)

**填写需求**

![武器与需求输入区](docs/screenshots/editor.jpg)

**结果预览区**

![模组结果预览区](docs/screenshots/preview.jpg)

## 玩家如何使用

1. 打开测试网站，输入测试邀请码。
2. 选择一把武器，描述希望调整的等级和数值。例如：“只把圆锯第 1 级伤害从 20 提高到 28，冷却从 3 秒缩短到 2.4 秒；其他等级不变。”
3. 点击“生成模组”，核对结果中的武器、等级和数值，然后下载 `.dsmod` 文件。
4. 先运行一次游戏。在文件资源管理器中打开 `%USERPROFILE%\AppData\LocalLow\DefaultCompany\Survivor\Mods`，将文件直接放入该文件夹，再重启游戏。若游戏的公司名或产品名发生变化，以 Unity Player 日志中 `[Player Mods]` 显示的路径为准。

游戏在每局开始前读取本地模组。下载、复制和重启目前需要玩家手动完成。页面默认使用简体中文，右上角可切换英文。

## 本地运行

需要 **Node.js 20 或更新版本**，无需安装第三方 npm 包。

```powershell
Copy-Item .env.example .env
npm start
```

在 `.env` 中填写 `BETA_ACCESS_CODE`、`LLM_API_KEY` 和 `LLM_MODEL`，然后访问 <http://127.0.0.1:4173/>。`.env.example` 默认配置 DeepSeek 的兼容接口；使用其他兼容服务时，可调整 `LLM_PROVIDER`、`LLM_BASE_URL` 和 `LLM_MODEL`。不要把真实密钥或邀请码提交到 Git。

| 配置项 | 作用 |
| --- | --- |
| `HOST`、`PORT` | 监听地址和端口，默认 `127.0.0.1:4173` |
| `BETA_ACCESS_CODE` | 测试邀请码；未设置时无法生成模组 |
| `LLM_PROVIDER`、`LLM_BASE_URL`、`LLM_MODEL` | 模型提供方、兼容接口地址和模型名 |
| `LLM_API_KEY` | 仅保存在服务端的模型密钥 |
| `MAX_GENERATIONS_PER_WINDOW` | 每个 IP 每小时的生成次数，默认 4 |
| `MAX_GENERATIONS_PER_DAY` | 全站每天的生成次数，默认 20，以 UTC 日期计算 |

执行 `npm test` 可运行现有校验测试。生成次数保存在进程内存中，重启服务后会重置。面向远程玩家开放时，应使用 HTTPS 并妥善分发邀请码。

## 模组范围与格式

生成器只输出数据文件，不包含 C#、程序集、原生代码或素材。版本 1 只能调整现有武器的基础伤害（0–10,000）和冷却时间（0.1–600 秒）；黑洞武器只能调整冷却时间。未指定的武器等级保持游戏原有数值。

网站与 Unity 加载器共同遵循 `.dsmod` 契约，详见 Unity 项目中的 `Assets/DOTSSurvivors/AI/MarkdownDocumentation/integrations/PlayerMods.md`。服务端和游戏内都会校验版本、武器、等级与数值范围。

目前是封闭测试版，尚无公开托管服务、游戏内模组浏览器、自动安装或 Steam Workshop 集成。
