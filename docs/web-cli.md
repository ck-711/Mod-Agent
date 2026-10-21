# 网页与 CLI 互通

网页和 CLI 使用相同的武器目录、`.dsmod` 版本 1 校验以及本机安装和日志验证模块。两端处理的是同一份文件原文：网页导入 CLI 文件后，下载、安装和验证仍使用导入的原始字节对应文本；CLI 因此可以继续验证网页安装的文件。网页生成的 `.dsmod` 也可下载后交给 CLI `validate`、`install`、`verify`。

## 本机使用流程

1. `npm start` 后打开 `http://127.0.0.1:4173/`。网页底部的“本机联动”区域显示当前游戏 Mods 目录。
2. 在网页生成模组，或点击“导入 .dsmod”选择 CLI 创建的文件。导入时自动校验扩展名、大小及包结构，并显示改动预览。
3. 按需点击“校验格式”和“安装到本机游戏”。安装会先校验，再写入 Mods 目录；已存在的同名文件不会被覆盖。
4. 重启游戏并开始新一局，点击“检查游戏加载日志”。它比较已安装文件与当前文件，确认 `Player.log` 时间晚于安装，并查找 Unity 的加载和武器补丁日志。

CLI 对应命令见 [本地 CLI](cli.md)。日志确认只能说明加载器处理了模组，不能证明游戏中的实际伤害或冷却数值。

## 本机接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/local/status` | 返回本机操作是否可用及服务端配置的 Mods 目录 |
| `POST /api/mods/validate` | 校验 `packageText`，返回解析后的模组 |
| `POST /api/mods/install` | 校验并安装 `packageText`，返回安装路径 |
| `POST /api/mods/verify` | 比对已安装内容并检查 Player 日志 |

三个 POST 接口接收 `Content-Type: application/json` 与 `{ "packageText": "..." }`。服务只在回环地址监听且请求来自回环地址时开放这些接口，并检查请求的 Host 与 Origin；页面在其他地址访问时会禁用本机按钮。请求只能使用服务端配置的目录，不能指定任意文件路径。

默认目录为 `%USERPROFILE%\AppData\LocalLow\DefaultCompany\Survivor\Mods`，默认日志为其上一级的 `Player.log`。如游戏使用不同目录，在 `.env` 设置 `GAME_MODS_DIR` 和可选的 `GAME_PLAYER_LOG`，重启服务后生效。`.dsmod` 原文最大 64 KiB；本机接口的 JSON 请求上限为 128 KiB。
