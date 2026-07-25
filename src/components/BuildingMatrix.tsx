import { useMemo, useState } from 'react';
import { Filter, Building2, Layers, Search, ExternalLink, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BUILDINGS, residentialUnits, STATUS_META, unitsOfBuilding } from '../data/projectData';
import type { BuildingInfo, BuildingId, UnitInfo, UnitStatusKey } from '../types';

interface Props {
  selectedBuilding: BuildingId;
  setSelectedBuilding: (id: BuildingId) => void;
  onSelectUnit: (u: UnitInfo) => void;
  onOpenCaptcha: (sProjectId: string) => void;
}

const STATUS_ORDER: UnitStatusKey[] = ['presale', 'subscribed', 'contracted', 'registered', 'mortgaged', 'restricted'];

export function BuildingMatrix({ selectedBuilding, setSelectedBuilding, onSelectUnit, onOpenCaptcha }: Props) {
  const [statuses, setStatuses] = useState<Set<UnitStatusKey>>(new Set(STATUS_ORDER));
  const [layoutFilter, setLayoutFilter] = useState<string>('all');
  const [floorRange, setFloorRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [showNonResidential, setShowNonResidential] = useState(false);

  const building = BUILDINGS[selectedBuilding];
  const allUnits = unitsOfBuilding(selectedBuilding);
  const resUnits = residentialUnits(selectedBuilding);

  const layouts = useMemo(() => Array.from(new Set(resUnits.map((u) => u.layout).filter(Boolean))).sort(), [resUnits]);

  const filtered = useMemo(() => {
    return allUnits.filter((u) => {
      if (!statuses.has(u.statusKey)) return false;
      if (layoutFilter !== 'all' && u.layout !== layoutFilter) return false;
      if (!u.isResidential && !showNonResidential) return false;
      if (floorRange !== 'all' && u.isResidential) {
        const f = parseInt(u.floor, 10);
        if (isNaN(f)) return true;
        const midLow = 15, midHigh = 30;
        if (floorRange === 'low' && f > midLow) return false;
        if (floorRange === 'high' && f < midHigh) return false;
        if (floorRange === 'mid' && (f < midLow + 1 || f > midHigh - 1)) return false;
      }
      return true;
    });
  }, [allUnits, statuses, layoutFilter, floorRange, showNonResidential]);

  // 按楼层分组（楼层从高到低）
  const byFloor = useMemo<Array<[string, UnitInfo[]]>>(() => {
    const m = new Map<string, UnitInfo[]>();
    for (const u of filtered) {
      if (!m.has(u.floor)) m.set(u.floor, []);
      m.get(u.floor)!.push(u);
    }
    return Array.from(m.entries()).sort((a, b) => {
      const fa = parseInt(a[0], 10), fb = parseInt(b[0], 10);
      const na = isNaN(fa) ? -999 : fa, nb = isNaN(fb) ? -999 : fb;
      return nb - na;
    });
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const u of resUnits) c[u.statusKey] = (c[u.statusKey] || 0) + 1;
    return c;
  }, [resUnits]);

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="text-amber-400" size={22} />
          <div>
            <h2 className="text-lg font-black text-white">{building.name} · 销控公示</h2>
            <div className="text-xs text-slate-400">预售许可证 {building.presaleLicense} · 楼栋 {building.shortName} · 共 {building.allowPresellNum} 套批准预售</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={building.xkbUrl} target="_blank" rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
            <ExternalLink size={12} /> 住建局原网销控
          </a>
          <button onClick={() => onOpenCaptcha(building.sProjectId)}
            className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg">
            <ShieldCheck size={12} /> 一键查询
          </button>
        </div>
      </div>

      {/* 楼栋切换 */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 flex items-center gap-1"><Layers size={12} /> 楼栋：</span>
        {(Object.keys(BUILDINGS) as BuildingId[]).map((id) => (
          <button key={id} onClick={() => setSelectedBuilding(id)}
            className={`px-3 py-1 rounded-lg text-sm font-bold transition ${id === selectedBuilding ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {id}
          </button>
        ))}
        <button onClick={() => setShowNonResidential((s) => !s)}
          className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium border ${showNonResidential ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
          {showNonResidential ? '✓ 含配套/阁楼' : '仅住宅'}
        </button>
      </div>

      {/* 筛选条 */}
      <div className="px-6 py-3 border-b border-slate-800 flex flex-wrap gap-x-6 gap-y-3 text-sm bg-slate-950/40">
        {/* 状态 legend + 筛选 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-500" />
          {STATUS_ORDER.map((k) => {
            const m = STATUS_META[k];
            const on = statuses.has(k);
            return (
              <button key={k} onClick={() => setStatuses((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; })}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition ${on ? `${m.bg} ${m.text} border-transparent` : 'bg-transparent border-slate-700 text-slate-500'}`}>
                <span className={`w-2.5 h-2.5 rounded-sm ${m.bg}`} />
                {m.label} <span className="opacity-70">{counts[k] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-3 border-b border-slate-800 flex flex-wrap items-center gap-3 text-sm bg-slate-950/40">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">户型：</span>
          <select value={layoutFilter} onChange={(e) => setLayoutFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-amber-500 focus:outline-none">
            <option value="all">全部户型</option>
            {layouts.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">楼层：</span>
          <select value={floorRange} onChange={(e) => setFloorRange(e.target.value as typeof floorRange)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-amber-500 focus:outline-none">
            <option value="all">全部楼层</option>
            <option value="low">低区 (≤15F)</option>
            <option value="mid">中区 (16-29F)</option>
            <option value="high">高区 (≥30F)</option>
          </select>
        </div>
        <span className="ml-auto text-xs text-slate-500">显示 {filtered.length} / {allUnits.length} 单元</span>
      </div>

      {/* 销控图主体 */}
      <div className="px-6 py-5 overflow-x-auto matrix-scroll">
        <FloorAxis building={building} />
        <div className="mt-2 space-y-1">
          {byFloor.map(([floor, units]) => (
            <div key={floor} className="flex items-center gap-2">
              <div className="w-12 shrink-0 text-right text-xs text-slate-500 font-mono">{floor}F</div>
              <div className="flex gap-1 flex-wrap">
                {units.map((u) => <UnitCell key={u.unitId} unit={u} onClick={() => onSelectUnit(u)} />)}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <Search className="opacity-40" size={32} />
            当前筛选条件下没有匹配房源，请放宽筛选范围
          </div>
        )}
      </div>
    </section>
  );
}

function FloorAxis({ building }: { building: BuildingInfo }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
      <div className="w-12 shrink-0 text-right">楼层</div>
      <div className="flex gap-1">
        <span className="bg-slate-800 px-2 py-0.5 rounded">房号 → 由左至右 01 / 02 / 03 …，颜色表示房源状态</span>
      </div>
      <div className="ml-auto text-slate-600">{building.floors.length} 个楼层标签</div>
    </div>
  );
}

interface UnitCellProps { unit: UnitInfo; onClick: () => void }
function UnitCell({ unit, onClick }: UnitCellProps) {
  const m = STATUS_META[unit.statusKey];
  const isRes = unit.isResidential;
  return (
    <button onClick={onClick}
      title={`${unit.unitNum} · ${unit.layout || unit.houseFunction} · ${unit.status}\n建面 ${unit.buildingArea}㎡ 套内 ${unit.usableArea}㎡`}
      className={`relative w-16 h-14 rounded-md text-[10px] font-bold flex flex-col items-center justify-center ring-1 ${m.bg} ${m.text} ${m.ring} ${!isRes ? 'opacity-50' : ''} hover:scale-110 hover:z-10 transition`}>
      <span className="leading-none">{unit.unitNum}</span>
      <span className="text-[8px] opacity-90 leading-none mt-0.5">{isRes ? `${unit.buildingArea}㎡` : unit.houseFunction.slice(0, 2)}</span>
    </button>
  );
}
