# 本地模组 CLI

`npm run mod --` 调用项目内置的 `bin/mod-agent.mjs`，无需安装第三方 npm 包。它提供确定性的工具操作；AI 代理可根据玩家的自然语言需求选择命令和具体数值。网页生成器仍可独立使用。

开发者持有 Unity 源码时，可先执行 `npm run catalog:check -- "D:\Unity Space\Survivor"`，检查 CLI 与网页共用的武器目录是否仍与 12 个武器升级资源一致。普通玩家只需使用 `catalog` 命令。

## 完整示例

在项目根目录打开 PowerShell：

```powershell
npm run mod -- catalog
npm run mod -- create --weapon SawBlade --title "Faster Buzz Saw" --id faster-buzz-saw --set "1:damage=28,cooldown=2.4" --out .\faster-buzz-saw.dsmod
npm run mod -- validate .\faster-buzz-saw.dsmod
npm run mod -- install .\faster-buzz-saw.dsmod
```

启动或重启游戏后，可运行：

```powershell
npm run mod -- verify .\faster-buzz-saw.dsmod
```

`create` 和 `install` 都不会覆盖已有文件。`create` 支持多个 `--set`，例如 `--set "1:damage=28" --set "2:cooldown=2.4"`。单个包目前只针对一把武器；`--set` 内的 `damage` 是绝对伤害值，`cooldown` 是以秒为单位的绝对冷却时间。

## 命令与校验范围

| 命令 | 行为 |
| --- | --- |
| `catalog [--json]` | 列出当前网页和 CLI 共用的武器目录及每级原值 |
| `create ... [--json]` | 组装版本 1 `.dsmod`，校验后写入指定文件 |
| `validate FILE [--json]` | 校验文件扩展名、JSON、64 KiB 大小、游戏 ID、版本、武器、等级和数值 |
| `install FILE [--mods-dir DIR] [--json]` | 先校验，再复制到游戏 Mods 目录；拒绝覆盖同名包 |
| `verify FILE [--mods-dir DIR] [--log FILE] [--json]` | 比对已安装文件，并检查较新的 `Player.log` 是否记录该包加载且至少一个武器预制体被修改 |

默认安装目录为 `%USERPROFILE%\AppData\LocalLow\DefaultCompany\Survivor\Mods`。如果游戏使用了其他公司名或产品名，先从 Unity Player 日志中的 `[Player Mods]` 消息确认实际目录，再用 `--mods-dir`。`verify` 默认读取 Mods 文件夹上一级的 `Player.log`；也可用 `--log` 指定。

`validate` 只证明数据包符合当前版本的结构和范围。`verify` 能确认本地文件与日志，但日志无法证明游戏中的实际伤害或冷却数值。要报告“实机效果已验证”，还需在游戏中测量或读回该数值，并将证据记录到 `docs/field-notes/`。

当前 `.dsmod` 加载器只支持现有武器的基础伤害和冷却时间，不会加载贴图、音效、新武器或可执行代码。格式的权威说明在 Unity 项目的 `Assets/DOTSSurvivors/AI/MarkdownDocumentation/integrations/PlayerMods.md`。
