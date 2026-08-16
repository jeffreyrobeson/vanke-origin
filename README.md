# 万科傲璟 · 荷花苑 — 楼盘公示与房屋交易查询

> 完整收录 荷花苑住宅项目自编 3# / 4# / 5# / 6# 四栋楼销控图的可视化站点，
> 对接广州市住房和城乡建设局（`zfcj.gz.gov.cn`）真实公示数据，提供销控筛选、
> 官方验证码直通、网签行情分析、户型赏析与广州房贷税费测算。

线上地址：<https://origin.hassis.top>

![站点展示](./7731E08C31D026E08ECB4A3723CA81DE.png)

## 功能亮点

- **楼栋销控与房源实时公示**：3# / 4# / 5# / 6# 销控图，按楼层、户型、状态
  （预售可售 / 已认购 / 已签约 / 已备案 / 抵押 / 查封 / 非住宅）筛选，点击房号即查
  建面、套内面积、抵押状态、预售许可与估算一房一价。
- **广州市住建局一键直通**：预填关键字（项目名 荷花苑 / 开发商 溪桐 / 地址 喜鹊），
  图形验证码本地展示与"智能自动识别"演示，生成与 4 栋楼 sProjectId 挂钩的直达链接,
  跳转住建局原网项目详情与销控表页。
- **网签行情与销售分析大屏**：四大楼栋去化率对比、高低楼层价格梯度溢价、
  房源状态分布与网签进度可视化。
- **臻品户型赏析**：85㎡ 精致三房 / 115㎡ 舒适四房 / 129㎡ 尊享楼王 /
  143㎡ 奢阔大平层四档户型，含套内实用率与朝向说明。
- **广州房贷与税费测算器**：支持商业贷款 / 纯公积金 / 组合贷款，
  广州最新首付比例（低至 15%），自动核算契税、住宅专项维修资金及月供还款明细。

## 数据来源

全部销控数据采集自广州市住房和城乡建设局公示接口（采集于 `2026-07-25`）：

- 项目基本信息：`POST /ysqgk/Api/WebApi/fdcxmjbxx.ashx?sProjectId=<id>`
- 楼栋列表：`/ysqgk/Api/WebApi/xmldxx.ashx?sProjectId=<id>&sPreSellNo=<presell>`
- 逐套销控：`/ysqgk/Api/WebApi/xmxkbxx.ashx?sProjectId=<id>&sPreSellNo=<presell>&buildingId=<bid>`

采集与规范化脚本（一次性）保存于 `scripts/fetch_data.py` 的注释里。
最终数据落盘为 `data/sales-control.json`（1027 条房源记录：944 套住宅 + 83 套配套），
通过 `src/data/projectData.ts` 派生为应用的楼盘/单元/户型数据结构。

> 注意：广州住建局未公示逐套成交价格，"估算一房一价"基于楼栋均价 + 楼层修正
> （每高一档约 +350 元/㎡）做示例性推算，非官方成交数据。

## 技术栈

- 前端：React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + lucide-react
- 构建：`npm run build` → 产出 `dist/`
- 纯前端静态站，无后端；所有交互在浏览器侧完成。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 产出 dist/
npm run lint     # tsc --noEmit 类型检查
```

## 部署架构

```
用户 ──HTTPS──> EdgeOne 边缘（TrustAsia DV 证书）
                │ HTTPS 回源（SNI=origin.hassis.top，源站 LE 证书校验通过）
                ▼
                本机 nginx 443（origin.hassis.top server 块，root=/www/wwwroot/origin.hassis.top）
                │
                └─ 静态文件 dist/* + SPA fallback（try_files → /index.html）
```

- 本机已加 nginx vhost：`/www/server/panel/vhost/nginx/origin.hassis.top.conf`（80 + 443 双端口）
- SSL 证书：Let's Encrypt（acme.sh，`origin.hassis.top_ecc`），续签时自动 reload nginx
- EdgeOne 域名：`origin.hassis.top` CNAME 到 `*.eo.dnse2.com`
- 回源 IP：本机 IPv4 公网（通过 DNS CNAME → EdgeOne → 回源 172.245.195.21）

### 更新线上

```bash
cd /root/vanke-origin
npm run build
rm -rf /www/wwwroot/origin.hassis.top/*
cp -r dist/* /www/wwwroot/origin.hassis.top/
# 修改 HTML 后建议在 EdgeOne 控制台 Purge 一次根路径缓存
```

---

## 迁移史：172 老系统 → 107 新系统（2026-08-15）

`origin.hassis.top` 2026-08-15 从老机 `172.245.195.21` 迁到新机 `107.175.32.210`，域名不变，**两台机器的部署架构不同**。上文「部署架构」框图描述的是**老机**形态；迁后线上服务实际跑在新机，下面逐维度摊开对比，作为「现在线上长什么样」的真实记录与迁机备忘。

> 这是个**纯静态站**：前端 build 产物（`dist/*`）由 nginx 直接 serve，无后端、无运行时进程。与同批迁移的 riddle（Python app，宿主 systemd）、tuge（FastAPI 后端 + Meting 容器）形态都不同——origin 既没有「自重启」约束也不需要「跨容器回源」介质，迁移方式是**纯静态文件搬运 + 一个 nginx 容器**。

### 架构总览对比

| 维度 | 老系统 172.245.195.21（热备，仍在跑 fetcher 但 EdgeOne 已不回源） | 新系统 107.175.32.210（对外服务） |
|---|---|---|
| 角色 | 原 prod，迁后静默热备 | 现 prod，EdgeOne 回源入口 |
| 面板 | 宝塔面板（BT） | 无宝塔，Pangolin + Traefik 栈 |
| 反代 / Web 服务 | 宝塔 nginx vhost 直接 serve 静态 | `origin-static` 容器（`nginx:alpine`）serve 静态 + Traefik 前置路由 |
| 静态文件位置 | `/www/wwwroot/origin.hassis.top/`（宿主文件系统） | `/root/origin-site/` → `docker bind` 挂到容器 `/usr/share/nginx/html:ro` |
| 容器化? | 否（宿主 BT nginx 直接读 webroot） | **是** —— `nginx:alpine` 容器，挂载静态目录，接 `pangolin` 网络（IP `172.22.0.4`） |
| 回源地址 | ——（nginx 本机 serve） | Traefik 路由 `Host(origin.hassis.top)` → `http://origin-static:80`（容器名，pangolin 网络内 DNS） |
| SPA fallback | vhost `location / { try_files $uri $uri/ /index.html; }` —— **有**，客户端路由子路径刷新也能回 index.html | 容器内是 **`nginx:alpine` 默认 conf**（`server_name localhost`，`location / { root ...; index index.html }`），**无 `try_files` SPA fallback** —— 客户端路由子路径直接刷新会拿 nginx 404（见已知点） |
| 静态资源缓存 | vhost 显式 `location ~* ^/assets/ { expires 30d; immutable }` 之外，根 `index.html` 带 `Cache-Control: no-cache, must-revalidate` | 容器默认 conf 无定制缓存头，靠 EdgeOne 边缘缓存策略兜底 |
| 自辨识头 | `add_header X-Origin-Server "vanke-origin-thisbox"`（`/index.html`、`/` 均加）—— 可 curl 辨认来源 | 无该头（容器默认 conf 没加）；现靠 `server: nginx/1.x` + 容器 IP 区分 |
| TLS 证书 | 源站 nginx 自持 Let's Encrypt（acme.sh `origin.hassis.top_ecc`），落在 `/www/server/panel/vhost/cert/origin.hassis.top/`，续签自动 reload nginx | **EdgeOne 边缘**终结 TrustAsia DV；Traefik 侧配了 `certResolver: letsencrypt` 但 EdgeOne 回源走明文 HTTP（cleartext），不触发 LE ACME 重签，`acme.json` 不更新。浏览器看到的是边缘那张可信证书 |
| HTTP→HTTPS | nginx vhost 内 `rewrite` 强制 443（80 + 443 双 server block） | Traefik `redirect-to-https@file` 中间件，entryPoint `web` → `websecure` |
| DNS / 入口 | `origin.hassis.top` CNAME `*.eo.dnse2.com`（EdgeOne），回源 IP 指向 172 | 同 CNAME，**回源 IP 在 EdgeOne 控制台改指 107**；EdgeOne → Traefik 走 **HTTP 明文回源**（443 边缘终结后明文回到 Traefik 80→容器） |
| 定时数据刷新 | `deploy/vanke-origin-fetcher.timer`（OnCalendar `*-*-* 03:17`）→ `refresh.sh`（fetcher 采集→写 SQLite/JSON→`npm run build`→cp 到 `/www/wwwroot/origin.hassis.top/`）。老机**仍在跑**（timer active/enabled），每天 03:17 刷新本地 webroot | **无对应定时链路** —— `origin-site/` 是迁机当天一次性搬过去的静态快照（最新文件停 **2026-08-14 15:30**），之后没有自动更新机制。每天新 build 只到老机 wwwroot，**没同步到 107**（见已知点） |
| 敏感文件拦截 | vhost `location ~* /(\.git|\.env|node_modules)/ { return 404; }` + `location ~* /\.(?!well-known) { return 404; }` | 容器默认 conf 无拦截；好在 `.git`/.env` 本就不在 `origin-site/` 静态快照里，且挂载是 `:ro`，未暴露——但属于「靠目录内容＋只读挂载」间接兜住，非 nginx 层主动拦截 |

### 为什么架构不同，而不只是换台机器

迁机不是「把 webroot rsync 过去改个 IP」——老机是**宿主 BT nginx 直接 serve 一个受 vhost 管控的目录**；新机是 **Pangolin/Traefik 容器编排栈**，静态服务跑在一个挂载 `:ro` 目录的 `nginx:alpine` 容器里，前置 Traefik 做 SNI 路由。差异有三条结构性变化 + 两个迁后遗留的已知点：

1. **静态 serve 从「宿主 BT nginx + 定制 vhost」变「nginx:alpine 容器 + 默认 conf」**。老机 vhost 是按本站需求定制的（SPA fallback、`/assets/` 长缓存、`no-cache` HTML、敏感文件拦截、自辨识头）；新机 `origin-static` 用的是 `nginx:alpine` 出厂默认 conf，**这些定制一项都没带过去**（详见已知点）。
2. **TLS 终结点上移到 EdgeOne 边缘且回源走明文**。老机是源站 nginx 持 LE 证书、EdgeOne 经 HTTPS 回源校验源站证书；新机 EdgeOne 边缘持 TrustAsia DV 对外，回源走 **HTTP cleartext** 回到 Traefik 80。Traefik 虽配了 LE `certResolver`，但走明文回源时不触发 ACME，所以 `acme.json` 一直不更新——**这是设计预期，不是故障**。
3. **定时刷新链路与线上 serve 点解耦了**。老机时代「刷新→build→cp 到 webroot」是一条本机闭环链路；迁后线上 serve 点（107 `origin-site/`）与刷新点（老机 wwwroot）分在两台机器，**刷新链路没跟着搬**，导致 107 上的静态快照停留在迁机时刻（见已知点 ①）。

**迁后两个已知点（记录在案，非本次处理范围）：**

- ① **数据/前端会逐渐陈旧**：老机 fetcher 每天还在跑（timer `active`），新静态文件只落到老机 `/www/wwwroot/origin.hassis.top/`（实测 2026-08-16 03:30 持续更新），但 107 的 `/root/origin-site/` 停在迁机当天的 **2026-08-14 15:30**（最新 bundle `index-D7PICThk.js`）。线上用户看到的数据会停在迁机那一刻。**根本解**是把刷新链路也迁到 107（107 上跑 fetcher→build→cp 到 `/root/origin-site/`，或把 172 的 `refresh.sh` 输出 rsync 到 107），**本次未做**。当前如需让线上更新，需手动从老机同步：`rsync -a /www/wwwroot/origin.hassis.top/ root@107.175.32.210:/root/origin-site/` 后重启/不动容器（`:ro` 挂载读新文件即生效）。
- ② **容器缺 SPA fallback**：`origin-static` 容器内是 `nginx:alpine` 默认 conf，`location /` 没有 `try_files $uri /index.html`，对客户端路由子路径（如直接刷新 `/buildings/3`）会返回 nginx 404 而非 SPA。根 `/` 与既有静态资源不受影响；客户端导航（点 link 进子路径）也不受影响，只有「子路径硬刷新 / 直接访问子路径」会 404。**根本解**：给容器挂一份定制 `default.conf`（含 `try_files`），或换用自带 SPA fallback 的 Nginx 镜像，**本次未做**。（实际线上若子路径没 404，多半是 EdgeOne 边缘缓存缓存了 `/index.html` 兜底——非源站能力的体现。）

### 迁移操作实录

- **方向**：老机 172 → 新机 107。把老机 `/www/wwwroot/origin.hassis.top/` 的静态产物（约 15M）打包传输到 107 的 `/root/origin-site/`。
- **容器** `origin-static`：`nginx:alpine`（Docker Hub），`docker run` 挂 `-v /root/origin-site:/usr/share/nginx/html:ro`，接入 `pangolin` 网络（IP `172.22.0.4`），不发布宿主端口（只在网络内可达，Traefik 回源）。
- **Traefik 动态路由**新写到 `/opt/pangolin/config/traefik/dynamic/20-origin.yml`：`Host(origin.hassis.top)` → `http://origin-static:80`，80 `redirect-to-https@file` → 443 `websecure`，`tls.certResolver: letsencrypt`（file provider watch 自动加载，无 reload）。
- **EdgeOne 切换**：EdgeOne 控制台把 `origin.hassis.top` 的回源 IP 从 172 改指 107，即生效——**全程不碰源站文件、不碰证书**。
- **热备**：老机保留 `/www/wwwroot/origin.hassis.top/`（产物）、BT nginx vhost、LE 证书目录、`deploy/` 三件套，fetcher.timer 仍 `active`/`enabled` 继续每天刷新老机 webroot（作热备 + 未来同步源）。
- **回退（秒级）**：EdgeOne 控制台回源 IP 改回 172 即可（老机 BT nginx 443 一直在跑）。
- ⚠️ **回退后立即生效，但**：老机 webroot 因 fetcher 每天在更新，数据比 107 新「约 30 小时」（截至读时老机 8-16 03:30 vs 107 8-14 15:30）；回切 172 反而**数据更新**，只是又回到「BT nginx 受国内运营商封锁」那条老链路（迁机主因之一）。两台均不持久化任何账号态/会话（纯静态），不存在 `keys.json`/`config.db` 分叉问题（与 riddle/tuge 不同）。

### 验证清单（迁移后实测）

- 经 EdgeOne → Traefik → `origin-static`：`https://origin.hassis.top/` → HTTP/2 **200**，`server: nginx/1.31.3`（`nginx:alpine` 容器），`eo-cache-status: MISS`，拿到站点页面；国内无代理 `curl https://origin.hassis.top/` → **200**（绕开 172 被封锁链路）。
- Traefik 命中日志：`172.22.0.1 -> origin-static` 拉到 769 字节 `index.html`（EdgeOne 回源走明文 HTTP，未触发 LE ACME，符合预期）。
- 容器/网络侧（107 实查）：`origin-static` = Up 15h、Image `nginx:alpine`、Cmd `['nginx','-g','daemon off;']`、Mounts `(/root/origin-site, /usr/share/nginx/html, ro)`、Networks `['pangolin']`（IP `172.22.0.4`，承自 tuge 迁移时核查的同一 pangolin 网络拓扑，origin-static 是其中一员）。
- 老机侧（实查）：origin nginx vhost 80+443 双 server block、`try_files $uri $uri/ /index.html` SPA fallback、`/assets/` `immutable` 30d、`X-Origin-Server: vanke-origin-thisbox` 自辨识头、SSL 用 `/www/server/panel/vhost/cert/origin.hassis.top/`；`vanke-origin-fetcher.timer` 仍 `active`/`enabled`（`active waiting`次日 03:17），`vanke-origin-fetcher.service` `inactive`（oneshot，定时触发即起跑）。

### 迁机主因（背景）

迁机并不仅因为「换台更快的服务器」：172 从国内电信/移动直连被拦（参见同期时间线 [[edgeone-setup]] ——`origin.hassis.top` 曾出现 522 边缘→源站回源超时，根因是 EdgeOne 回源解析到 WARP IPv6 而该 v6 公网不可达，最终「先把回源硬写 IPv4」再「迁源 IP 到 107」彻底绕开 172 网络链路的不确定性）。迁到 107 后国内直连恢复 200，522 不再复现。

---

## 真实数据每日刷新

销控数据自采集后会逐渐过期（住宅网签、备案状态会实时变动）。为保证 `origin.hassis.top`
反映住建局最新公示，本项目落地了「定时缓存 + SQLite + 重新构建」的全自动刷新链路：

```
systemd timer (每日 03:17)
  └─ deploy/refresh.sh  (set -euo pipefail，任一步失败即中止，保留旧线上文件)
      ├─ backend/fetcher.py once   → 拉 4 栋楼全量销控 → 写 backend/sales.db (SQLite)
      │                            → 原子 os.replace 覆盘 data/sales-control.json
      ├─ npm run build             → 重新构建 dist/（JSON 在构建期打进 bundle）
      └─ cp -r dist/* /www/wwwroot/origin.hassis.top/   → 部署到 nginx root
```

### 数据采集（backend/fetcher.py）

只用 Python 标准库（`urllib.request` + `sqlite3`），**无需 pip 安装任何包**。
四个住建局公开 API 无需验证码：

- 项目基本信息：`fdcxmjbxx.ashx?sProjectId=<id>`（项目名 / preSellNo / 开发商 / 销控汇总）
- 楼栋列表：`xmldxx.ashx?sProjectId=<id>&sPreSellNo=<presell>`（取 buildingId）
- 逐套销控：`xmxkbxx.ashx?sProjectId=<id>&sPreSellNo=<presell>&buildingId=<bid>`（按楼层 group）

四个楼栋的 `sProjectId` 硬编码在 `BUILDINGS` 常量里，与前端 `OFFICIAL_BASIC` 一一对应。
抓取时每栋间隔 1s 礼貌等待，全量 1027 套约 20–30s。

状态映射与官方 `totalSaleNum` 已对齐：
`pactStatus` 1=可售/预售可售 | 2=已认购 | 3=已签约 | 5=已备案；
`pledgeStatus` 2=已抵押 | 0=无；`closed=1` 查封；`preSellStatus` 0=非预售配套。
「已售 = registered + contracted + subscribed」。非住宅单元 `status="non-residential"`、
`statusKey="other"`，与前端 `STATUS_META` 索引一致。

用法：

```bash
cd /root/vanke-origin
/usr/bin/python3 backend/fetcher.py once    # 拉取 + 写 SQLite + 覆盘 JSON
/usr/bin/python3 backend/fetcher.py dump    # 仅从 SQLite 重新导出 JSON（不重新拉取）
```

> ⚠️ ExecStart / 脚本里必须用绝对路径 `/usr/bin/python3`，不能写裸 `python3`：
> 本机 root 交互 PATH 里 `python3` 命中 node venv，裸调用会跑错解释器。

### 容灾与回滚

- **fetcher 失败不动旧数据**：`fetch_once()` 失败时不覆盖 SQLite，`dump_json()` 用
  临时文件 + `os.replace` 原子替换 `data/sales-control.json`，任何中途异常都保留旧 JSON。
- **refresh.sh 任一步失败即中止**：`set -euo pipefail` 保证 fetcher 失败时不会用旧 JSON
  重新构建（虽然理论上旧 JSON 也能构建），更不会在 build 失败时覆盖 nginx root。
  站点持续使用上一次成功的数据，日志记录失败原因。
- **日志**：systemd 的 `StandardOutput/Error=append:` 写入 `backend/fetcher.log`，
  可 `tail -f backend/fetcher.log` 跟踪。`fetch_log` 表也记录每次抓取的成败/套数。

### systemd 部署

repo 内 `deploy/` 自带三件套，生效副本需 cp 到 `/etc/systemd/system/`：

```bash
cp deploy/vanke-origin-fetcher.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now vanke-origin-fetcher.timer
systemctl list-timers vanke-origin-fetcher.timer          # 确认 NEXT 指向次日 03:17±10m
systemctl start vanke-origin-fetcher.service              # 手动触发一次看日志
tail -30 backend/fetcher.log
```

timer 配置：`OnCalendar=*-*-* 03:17`、`Persistent=true`（错过的定时点开机补跑）、
`RandomizedDelaySec=10m`（错峰，避免与系统其它 daily 任务挤同一秒）。

### git 与生成产物

- `data/sales-control.json` **进 git**（前端构建期直接读它，作为 seed 数据）；
  每日刷新会让工作区 dirty，择期手动 commit 留痕，**timer 不自动 commit**。
- `backend/sales.db`、`backend/fetcher.log` **不进 git**（已由 `.gitignore` 忽略：

  `backend/*.db`、`*.log`），是运行时产物，每台机器各自生成。

> ⚠️ EdgeOne 缓存：HTML 资源带 `Cache-Control: no-cache, must-revalidate`，
> `/assets/*.{js,css}` 带 immutable 长缓存（文件名含 hash，安全）。
> 首次部署后 `https://origin.hassis.top/` 若命中 EdgeOne 缓存的旧 404 条目，
> 任意带 query 的访问（如 `/?v=1`）会强制 MISS 取新内容；根路径彻底刷新需用户在
> EdgeOne 控制台点 **刷新缓存 / Purge**。

> ⚠️ 部署时附带修复了一个宝塔遗留问题：`extension/time.hassis.top/proxy.conf` 与主 conf
> 各含一个 `location / {}` 块导致 `nginx -t` duplicate 报错（多年未能 reload 成功）。
> 已把 `proxy.conf` 中冗余的 `location / {}` 注释（保留 `/static/`），备份于 `proxy.conf.bak.*`。
> time.hassis.top 现公网回源走新机，本机此 conf 实为热备，注释不影响线上。

## 免责声明

本站为公示辅助工具，数据来自官方渠道但存在更新延迟。所有房源状态、价格、预售信息
以广州市住建局网签系统实时数据为最终依据。非万科官方产品，与开发商无隶属关系。

## 致谢

项目结构与组件划分参考自 [jeffreyrobeson/vanke-origin](https://github.com/jeffreyrobeson/vanke-origin)
（Google AI Studio 生成的同名演示项目），其源数据为占位假数据；本项目把全部数据替换为
从广州市住建局真实采集的销控与楼盘基本信息，并按真实楼层/套数/状态结构重写。
