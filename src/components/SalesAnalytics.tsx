import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { PieChart, TrendingUp, TrendingDown, BarChart3, Layers, Activity } from 'lucide-react';
import { BUILDINGS, residentialUnits, UNITS, STATUS_META } from '../data/projectData';
import type { BuildingId, UnitStatusKey } from '../types';

export function SalesAnalytics() {
  const buildingIds = Object.keys(BUILDINGS) as BuildingId[];

  // 每栋状态分布
  const perBuilding = useMemo(() => buildingIds.map((id) => {
    const us = residentialUnits(id);
    const sold = us.filter((u) => ['registered', 'contracted', 'subscribed'].includes(u.statusKey)).length;
    const avail = us.filter((u) => u.statusKey === 'presale').length;
    const mort = us.filter((u) => u.statusKey === 'mortgaged').length;
    return {
      id,
      name: BUILDINGS[id].shortName,
      total: us.length,
      sold, avail, mort,
      soldRate: us.length ? Math.round((sold / us.length) * 1000) / 10 : 0,
      presell: BUILDINGS[id].allowPresellNum,
    };
  }), [buildingIds]);

  const maxRate = Math.max(...perBuilding.map((p) => p.soldRate));

  // 全项目状态汇总
  const statusSummary = useMemo(() => {
    const res = UNITS.filter((u) => u.isResidential);
    const m: Record<string, number> = {};
    for (const u of res) m[u.statusKey] = (m[u.statusKey] || 0) + 1;
    return m;
  }, []);

  // 楼层价格梯度（基于 48000 + floor*350 估算）
  const floorBuckets = useMemo(() => {
    const buckets = [{ label: '低区 1-15F', lo: 1, hi: 15, vals: [] as number[] }, { label: '中区 16-29F', lo: 16, hi: 29, vals: [] as number[] }, { label: '高区 ≥30F', lo: 30, hi: 99, vals: [] as number[] }];
    for (const u of UNITS.filter((x) => x.isResidential)) {
      const f = parseInt(u.floor, 10);
      if (isNaN(f)) continue;
      const price = 48000 + (f - 1) * 350;
      buckets.find((b) => f >= b.lo && f <= b.hi)?.vals.push(price);
    }
    return buckets.map((b) => ({ label: b.label, avg: b.vals.length ? Math.round(b.vals.reduce((a, x) => a + x, 0) / b.vals.length) : 0, min: b.vals.length ? Math.min(...b.vals) : 0, max: b.vals.length ? Math.max(...b.vals) : 0 }));
  }, []);

  const totalSold = perBuilding.reduce((a, p) => a + p.sold, 0);
  const totalAvail = perBuilding.reduce((a, p) => a + p.avail, 0);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <PieChart className="text-amber-400" size={22} />
        <div>
          <h2 className="text-lg font-black text-white">网签行情 · 销售分析大屏</h2>
          <div className="text-xs text-slate-400">基于广州市住建局销控数据，按楼栋 / 状态 / 高低楼层梯度交叉分析</div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<Activity />} label="全项目已售" value={`${totalSold}`} unit="套" tone="emerald" />
        <Kpi icon={<BarChart3 />} label="全项目可售" value={`${totalAvail}`} unit="套" tone="amber" />
        <Kpi icon={<TrendingUp />} label="整体去化率" value={`${Math.round((totalSold / (totalSold + totalAvail || 1)) * 1000) / 10}%`} unit="" tone="indigo" highlight />
        <Kpi icon={<Layers />} label="预售批准" value={`${perBuilding.reduce((a, p) => a + p.presell, 0)}`} unit="套" tone="sky" />
      </div>

      {/* 四栋去化率对比 */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-1.5"><BarChart3 size={16} className="text-amber-400" /> 四大楼栋去化率对比</h3>
        <div className="space-y-3">
          {perBuilding.map((p) => (
            <div key={p.id}>
              <div className="flex items-center text-sm mb-1">
                <span className="font-bold text-white w-12">{p.name}</span>
                <span className="text-slate-500 text-xs flex-1 ml-2">已售 {p.sold}/{p.total} · 批准预售 {p.presell} · 抵押 {p.mort}</span>
                <span className="font-mono text-amber-400 font-bold">{p.soldRate}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                  style={{ width: `${(p.soldRate / Math.max(maxRate, 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* 状态分布饼图（CSS 实现） */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-1.5"><PieChart size={16} className="text-amber-400" /> 全项目房源状态分布</h3>
          <StatusDonut summary={statusSummary} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {(Object.keys(STATUS_META) as UnitStatusKey[]).filter((k) => k !== 'other').map((k) => {
              const m = STATUS_META[k];
              return (
                <div key={k} className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-3 h-3 rounded-sm ${m.bg}`} />
                  {m.label} <span className="text-slate-500 ml-auto">{statusSummary[k] || 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 高低楼层价格梯度 */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-1.5"><TrendingUp size={16} className="text-amber-400" /> 高低楼层价格梯度溢价</h3>
          <div className="space-y-3">
            {floorBuckets.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{b.label}</span>
                  <span className="font-mono text-slate-300">{b.avg.toLocaleString()} 元/㎡ <span className="text-slate-600">({b.min.toLocaleString()}~{b.max.toLocaleString()})</span></span>
                </div>
                <div className="h-7 bg-slate-800 rounded-lg flex items-center px-2 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500/40 to-amber-500/40 rounded-lg" style={{ width: `${Math.min(100, (b.avg / 60000) * 100)}%` }} />
                  <span className="relative text-xs font-mono text-white">{b.avg.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-slate-500">说明：高低区间价差 ≈ {(floorBuckets[2].avg - floorBuckets[0].avg).toLocaleString()} 元/㎡，高区溢价明显。</div>
        </div>
      </div>

      {/* 网签进度条 */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-1.5"><Activity size={16} className="text-amber-400" /> 网签进度可视化（按楼栋）</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perBuilding.map((p) => (
            <div key={p.id} className="bg-slate-950/40 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-lg text-white">{p.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.soldRate >= 60 ? 'bg-emerald-500/20 text-emerald-400' : p.soldRate >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>{p.soldRate >= 60 ? '热销' : p.soldRate >= 30 ? '在售' : '待启'}</span>
              </div>
              <ProgressRing rate={p.soldRate} />
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>已售 <b className="text-emerald-400">{p.sold}</b></span>
                <span>可售 <b className="text-amber-400">{p.avail}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Kpi({ icon, label, value, unit, tone, highlight }: { icon: ReactNode; label: string; value: string; unit: string; tone: string; highlight?: boolean }) {
  const tones: Record<string, string> = { emerald: 'text-emerald-400', amber: 'text-amber-400', indigo: 'text-indigo-400', sky: 'text-sky-400' };
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-900 border-slate-800'}`}>
      <div className={`flex items-center gap-1.5 text-xs ${tones[tone]}`}>{icon} {label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value} <span className="text-xs text-slate-500 font-medium">{unit}</span></div>
    </div>
  );
}

function StatusDonut({ summary }: { summary: Record<string, number> }) {
  const keys = ['presale', 'subscribed', 'contracted', 'registered', 'mortgaged'] as UnitStatusKey[];
  const total = keys.reduce((a, k) => a + (summary[k] || 0), 0);
  let acc = 0;
  const segs = keys.map((k) => {
    const v = summary[k] || 0;
    const pct = total ? v / total : 0;
    const start = acc;
    acc += pct;
    return { k, start, end: acc, v };
  }).filter((s) => s.v > 0);
  return (
    <div className="flex items-center justify-center py-2">
      <svg viewBox="0 0 42 42" className="w-44 h-44">
        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#1e293b" strokeWidth="6" />
        {segs.map((s) => {
          const a = s.start * 100, b = s.end * 100;
          const color: Record<string, string> = { presale: '#10b981', subscribed: '#f59e0b', contracted: '#0ea5e9', registered: '#6366f1', mortgaged: '#f43f5e' };
          const dash = `${Math.max(b - a, 0.1)} ${100 - Math.max(b - a, 0.1)}`;
          const rot = -90 + a * 3.6;
          return <circle key={s.k} cx="21" cy="21" r="15.9155" fill="transparent" stroke={color[s.k]} strokeWidth="6" strokeDasharray={dash} strokeDashoffset={0} transform={`rotate(${rot} 21 21)`} />;
        })}
        <text x="21" y="20" textAnchor="middle" className="fill-white" style={{ fontSize: 5, fontWeight: 800 }}>{total}</text>
        <text x="21" y="25" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 2.6 }}>套住宅</text>
      </svg>
    </div>
  );
}

function ProgressRing({ rate }: { rate: number }) {
  const r = 26, c = 2 * Math.PI * r;
  const off = c - (Math.min(rate, 100) / 100) * c;
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-28 h-28">
        <circle cx="32" cy="32" r={r} fill="transparent" stroke="#1e293b" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="transparent" stroke="url(#g)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 32 32)" style={{ transition: 'stroke-dashoffset .5s' }} />
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fde68a" /></linearGradient></defs>
        <text x="32" y="34" textAnchor="middle" className="fill-amber-400" style={{ fontSize: 9, fontWeight: 800 }}>{rate}%</text>
        <text x="32" y="42" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 3.5 }}>已网签</text>
      </svg>
    </div>
  );
}
