"""从广州市住建局 zfcj.gz.gov.cn 拉取 4 栋楼销控数据并归一化写 SQLite。

四个公开 API（无需验证码）：
- fdcxmjbxx.ashx  项目基本信息（projectName/preSellNo/developer/pzystspzysmjxx 销控汇总）
- xmldxx.ashx     楼栋列表（buildingId）
- xmxkbxx.ashx    逐套销控（按楼层 group）

状态映射（与官方 totalSaleNum 对齐已验证）：
    pactStatus 1=可售(预售可售) | 2=已认购 | 3=已签约 | 5=已备案
    pledgeStatus 2=已抵押 | 0=无   | closed=1 查封 | preSellStatus 0=非预售配套
"""
from __future__ import annotations
import json
import os
import sqlite3
import threading
import time
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

BASE = "https://zfcj.gz.gov.cn"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

# 4 栋楼基本信息（preSellNo 在 fdcxmjbxx 里也会返回，这里硬编码兜底）
BUILDINGS = [
    ("3#", "5441962c12af4493ab04cca2f7d47ad1"),
    ("4#", "6b23c8f890b546a6a53495ebfb40e003"),
    ("5#", "f58070fd22e14c53ad40ab1825a13be3"),
    ("6#", "189d6db0aab04bc295f5b67186bf4500"),
]

DB_PATH = Path(__file__).resolve().parent / "sales.db"
JSON_PATH = Path(__file__).resolve().parents[1] / "data" / "sales-control.json"
TIMEOUT = 15
# 请求互斥：避免并发拉取把源站打封
_fetch_lock = threading.Lock()


def _get_json(url: str, retries: int = 3) -> dict:
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": url.split("?")[0],
            })
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 + attempt * 3)
    raise RuntimeError(f"fetch failed {url}: {last}")


def _basic_info(s_project_id: str) -> dict:
    url = f"{BASE}/ysqgk/Api/WebApi/fdcxmjbxx.ashx?sProjectId={s_project_id}"
    return _get_json(url)["data"]["xmldxxxgxx"]


def _summary(s_project_id: str) -> dict:
    url = f"{BASE}/ysqgk/Api/WebApi/fdcxmjbxx.ashx?sProjectId={s_project_id}"
    return _get_json(url)["data"]["pzystspzysmjxx"]


def _building_id(s_project_id: str, pre_sell_no: str) -> str:
    url = (f"{BASE}/ysqgk/Api/WebApi/xmldxx.ashx?{s_project_id=}&{pre_sell_no=}")
    # xmldxx 用 query string 形参
    url = (f"{BASE}/ysqgk/Api/WebApi/xmldxx.ashx"
           f"?sProjectId={s_project_id}&sPreSellNo={pre_sell_no}")
    data = _get_json(url)["data"]
    if not data:
        raise RuntimeError(f"no building for {s_project_id}")
    return data[0]["buildingId"]


def _per_unit(s_project_id: str, pre_sell_no: str, building_id: str) -> list:
    url = (f"{BASE}/ysqgk/Api/WebApi/xmxkbxx.ashx"
           f"?sProjectId={s_project_id}&sPreSellNo={pre_sell_no}&buildingId={building_id}")
    return _get_json(url)["data"]


def _map_status(u: dict) -> tuple[str, str]:
    """返回 (statusKey, statusDesc)，与前端 types 完全一致。"""
    if u["houseFunction"] != "住宅":
        return "other", "non-residential"  # 与现有 data/sales-control.json 一致
    if u.get("closed") == 1:
        return "restricted", "查封"
    ps = u.get("pactStatus")
    if ps == 5:
        return "registered", "已备案"
    if ps == 3:
        return "contracted", "已签约"
    if ps == 2:
        return "subscribed", "已认购"
    if u.get("pledgeStatus") == 2 and ps == 1:
        return "mortgaged", "抵押中(不可售)"
    if ps == 1 and u.get("preSellStatus") == 1:
        return "presale", "预售可售"
    if u.get("preSellStatus") == 0:
        return "restricted", "不可销售"
    return "presale", "可售"


def _normalize_unit(u: dict, building_id_key: str, s_project_id: str, pre_sell_no: str) -> dict:
    status_key, status_desc = _map_status(u)
    return {
        "unitId": u["unitId"],
        "unitNum": u["unitNum"],
        "floor": u["floorNum"],
        "floorLabel": u["floorNum"],
        "houseFunction": u["houseFunction"],
        "isResidential": u["houseFunction"] == "住宅",
        "buildingArea": u["totalArea"],
        "usableArea": u["inArea"],
        "layout": (u["unitType"] or "").strip(),
        "pledgeStatus": u.get("pledgeStatus", 0),
        "pledgeDesc": "已抵押" if u.get("pledgeStatus") == 2 else "无抵押",
        "closed": u.get("closed", 0) == 1,
        "preSellStatus": u.get("preSellStatus", 0),
        "pactStatus": u.get("pactStatus", 0),
        "status": status_desc,
        "statusKey": status_key,
    }


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS units (
      unit_id TEXT PRIMARY KEY,
      unit_num TEXT,
      building TEXT NOT NULL,
      s_project_id TEXT NOT NULL,
      pre_sell_no TEXT NOT NULL,
      floor TEXT, floor_label TEXT,
      house_function TEXT, is_residential INTEGER,
      building_area REAL, usable_area REAL, layout TEXT,
      pledge_status INTEGER, pledge_desc TEXT,
      closed INTEGER, pre_sell_status INTEGER, pact_status INTEGER,
      status TEXT, status_key TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_units_building ON units(building);
    CREATE TABLE IF NOT EXISTS fetch_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT, finished_at TEXT,
      ok INTEGER, units INTEGER, error TEXT
    );
    CREATE TABLE IF NOT EXISTS kv (
      k TEXT PRIMARY KEY, v TEXT
    );
    """)


def fetch_once(db_path: Path = DB_PATH) -> dict:
    """拉一次 4 栋楼全量销控，覆盖写入 SQLite。返回统计 dict。"""
    if not _fetch_lock.acquire(timeout=10):
        return {"ok": False, "error": "another fetch in progress"}
    started = datetime.now(timezone.utc).isoformat()
    try:
        buildings_out: dict = {}
        for short, s_project_id in BUILDINGS:
            basic = _basic_info(s_project_id)
            pre_sell_no = basic.get("preSellNo") or ""
            bid = _building_id(s_project_id, pre_sell_no)
            raw_groups = _per_unit(s_project_id, pre_sell_no, bid)
            units = []
            for grp in raw_groups:
                for u in grp["groupData"]:
                    units.append(_normalize_unit(u, short, s_project_id, pre_sell_no))
            buildings_out[short] = {
                "sProjectId": s_project_id, "preSellNo": pre_sell_no, "units": units,
            }
            time.sleep(1)  # 礼貌间隔，不打扰源站

        total_units = sum(len(b["units"]) for b in buildings_out.values())
        finished = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S CST")

        conn = sqlite3.connect(db_path)
        try:
            _init_db(conn)
            conn.execute("DELETE FROM units")
            now = datetime.now(timezone.utc).isoformat()
            for short, b in buildings_out.items():
                for u in b["units"]:
                    conn.execute(
                        "INSERT OR REPLACE INTO units VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        (u["unitId"], u["unitNum"], short, b["sProjectId"], b["preSellNo"],
                         u["floor"], u["floorLabel"], u["houseFunction"],
                         int(u["isResidential"]), u["buildingArea"], u["usableArea"],
                         u["layout"], u["pledgeStatus"], u["pledgeDesc"],
                         int(u["closed"]), u["preSellStatus"], u["pactStatus"],
                         u["status"], u["statusKey"], now))
            conn.execute("INSERT INTO fetch_log(started_at,finished_at,ok,units,error) VALUES(?,?,?,?,?)",
                         (started, finished, 1, total_units, ""))
            conn.execute("INSERT OR REPLACE INTO kv(k,v) VALUES('last_fetched_at',?)", (finished,))
            conn.commit()
        finally:
            conn.close()

        return {"ok": True, "units": total_units, "fetched_at": finished}
    except Exception as e:  # noqa: BLE001
        # 失败也记日志，但不动旧数据（前端继续用上一次成功的数据）
        try:
            conn = sqlite3.connect(db_path)
            _init_db(conn)
            conn.execute("INSERT INTO fetch_log(started_at,finished_at,ok,units,error) VALUES(?,?,?,?,?)",
                         (started, finished if "finished" in dir() else "", 0, 0, str(e)))
            conn.commit(); conn.close()
        except Exception:
            pass
        return {"ok": False, "error": str(e)}
    finally:
        _fetch_lock.release()


def load_for_api(db_path: Path = DB_PATH) -> dict:
    """读 SQLite 吐和原 data/sales-control.json 同结构的 JSON（前端无感）。"""
    if not db_path.exists():
        return {"buildings": {}, "meta": {"fetched": "never", "source": "zfcj.gz.gov.cn"}}
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute("SELECT * FROM units ORDER BY building, CAST(floor_label AS INTEGER) DESC, unit_num").fetchall()
        buildings: dict = {}
        for r in rows:
            b = r["building"]
            buildings.setdefault(b, {"sProjectId": r["s_project_id"], "preSellNo": r["pre_sell_no"], "units": []})
            buildings[b]["units"].append({
                "unitId": r["unit_id"], "unitNum": r["unit_num"],
                "floor": r["floor"], "floorLabel": r["floor_label"],
                "houseFunction": r["house_function"], "isResidential": bool(r["is_residential"]),
                "buildingArea": r["building_area"], "usableArea": r["usable_area"],
                "layout": r["layout"], "pledgeStatus": r["pledge_status"], "pledgeDesc": r["pledge_desc"],
                "closed": bool(r["closed"]), "preSellStatus": r["pre_sell_status"],
                "pactStatus": r["pact_status"], "status": r["status"], "statusKey": r["status_key"],
            })
        fetched = conn.execute("SELECT v FROM kv WHERE k='last_fetched_at'").fetchone()
        return {
            "buildings": buildings,
            "meta": {"fetched": fetched["v"] if fetched else "unknown",
                     "source": "广州市住房和城乡建设局 zfcj.gz.gov.cn"},
        }
    finally:
        conn.close()


def dump_json(db_path: Path = DB_PATH, out_path: Path = JSON_PATH) -> dict:
    """读 SQLite 吐 JSON，原子覆盖 data/sales-control.json（失败不动旧文件）。"""
    data = load_for_api(db_path)
    if not data.get("buildings"):
        return {"ok": False, "error": "no data to dump"}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = out_path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, out_path)  # 原子替换：任何中途失败都保留旧 JSON
    return {"ok": True, "path": str(out_path)}


def last_status(db_path: Path = DB_PATH) -> dict:
    if not db_path.exists():
        return {"ever_fetched": False}
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        r = conn.execute("SELECT * FROM fetch_log ORDER BY id DESC LIMIT 1").fetchone()
        if not r:
            return {"ever_fetched": False}
        return {
            "ever_fetched": True,
            "started_at": r["started_at"], "finished_at": r["finished_at"],
            "ok": bool(r["ok"]), "units": r["units"], "error": r["error"],
        }
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "once":
        r = fetch_once()
        print(json.dumps(r, ensure_ascii=False, indent=2))
        if r.get("ok"):
            print(json.dumps(dump_json(), ensure_ascii=False, indent=2))
    elif len(sys.argv) > 1 and sys.argv[1] == "dump":
        print(json.dumps(dump_json(), ensure_ascii=False, indent=2))
    else:
        print("usage: fetcher.py once|dump")
