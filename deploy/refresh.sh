#!/usr/bin/env bash
# Vanke Origin 每日刷新:fetcher → 原子覆盘 JSON → build → 部署到 nginx root
# 任意一步失败即中止，保留旧线上文件（站点持续可用）。
set -euo pipefail
cd /root/vanke-origin

# 1. 拉最新销控并原子覆盘 data/sales-control.json（失败保留旧 JSON）
/usr/bin/python3 backend/fetcher.py once

# 2. 重新构建静态站
npm run build

# 3. 部署到 nginx root（先 build 成功再覆盖）
cp -r dist/* /www/wwwroot/origin.hassis.top/

# 4. 站点 HTML 已配 no-cache，通常无需 EdgeOne Purge
echo "refresh done at $(date)"
