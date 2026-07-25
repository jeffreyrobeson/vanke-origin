import { useState } from 'react';
import type { ReactElement } from 'react';
import { Home, Ruler, Compass, ArrowRight, Calculator, Maximize } from 'lucide-react';
import { LAYOUT_PLANS, BUILDINGS } from '../data/projectData';
import type { LayoutPlan } from '../types';

interface Props {
  onOpenCalculatorWithPrice: (priceWan: number) => void;
}

export function FloorPlans({ onOpenCalculatorWithPrice }: Props) {
  const [active, setActive] = useState<LayoutPlan>(LAYOUT_PLANS[0]);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Home className="text-amber-400" size={22} />
        <div>
          <h2 className="text-lg font-black text-white">臻品户型赏析</h2>
          <div className="text-xs text-slate-400">85㎡ 精致三房 / 115㎡ 舒适四房 / 129㎡ 尊享楼王 / 143㎡ 奢阔大平层</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* 户型卡片列表 */}
        <div className="lg:col-span-1 space-y-3">
          {LAYOUT_PLANS.map((p) => (
            <button key={p.id} onClick={() => setActive(p)}
              className={`w-full text-left rounded-2xl border p-4 transition ${active.id === p.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black text-white">{p.title}</div>
                  <div className="text-xs text-amber-400 font-medium mt-0.5">{p.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">{p.area}<span className="text-xs text-slate-500">㎡</span></div>
                  <div className="text-[10px] text-slate-500">实用率 {(p.usableAreaRatio * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.features.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5"><Compass size={10} /> {p.orientation}</span>
                <span>·</span>
                <span>所属 {p.buildings}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 户型详情 */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="aspect-video bg-slate-950 relative overflow-hidden"
            style={{ backgroundImage: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` }}>
            {/* 平面示意 SVG */}
            <FloorPlanSvg id={active.id} />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-amber-400 font-black text-sm px-3 py-1 rounded-lg border border-amber-500/30">{active.name}</div>
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-slate-300 text-xs px-3 py-1 rounded-lg border border-slate-700 inline-flex items-center gap-1"><Maximize size={11} /> 建面 {active.area}㎡</div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-black text-white">{active.title}</h3>
                <div className="text-sm text-slate-400 mt-0.5">{active.rooms} · {active.orientation} · 套内 {active.usableArea}㎡（实用率 {(active.usableAreaRatio * 100).toFixed(1)}%）</div>
              </div>
              <button onClick={() => onOpenCalculatorWithPrice(Math.round(active.priceRange * active.area / 10000))}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg">
                <Calculator size={15} /> 测算此户型总价
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{active.description}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {active.features.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/40 rounded-lg px-2 py-1.5 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-800">
              <span className="inline-flex items-center gap-1"><Ruler size={11} /> 参考单价 {active.priceRange.toLocaleString()} 元/㎡</span>
              <span>所在楼栋：</span>
              <div className="flex gap-1">{active.buildings.split(' / ').map((b) => <span key={b} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">{b}</span>)}</div>
              <ArrowRight className="text-slate-700" size={12} />
              <button onClick={() => { /* 跳到销控：HACK 通过 URL */ window.dispatchEvent(new CustomEvent('goto-matrix', { detail: active.buildings.split(' / ')[0] })); }}
                className="text-amber-400 hover:text-amber-300">看该户型在售房源</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 简化户型平面示意（不同 id 画不同盒子布局） */
function FloorPlanSvg({ id }: { id: string }) {
  // 用 4 种不同布局示意
  const variants: Record<string, ReactElement> = {
    A1: (
      <g stroke="#f59e0b" strokeWidth="0.18" fill="none">
        <rect x="3" y="4" width="10" height="3" />  <text x="8" y="5.8" className="fill-amber-400" style={{ fontSize: 1 }}>主卧</text>
        <rect x="3" y="7" width="6" height="3" />   <text x="6" y="8.8" className="fill-amber-400" style={{ fontSize: 1 }}>次卧</text>
        <rect x="9" y="7" width="4" height="2" />  <text x="11" y="8.2" className="fill-amber-400" style={{ fontSize: 0.9 }}>卫</text>
        <rect x="13" y="4" width="6" height="6" fill="#f59e0b22" /><text x="16" y="7" className="fill-amber-200" style={{ fontSize: 1.2 }}>客餐厅·阳台</text>
        <rect x="13" y="10" width="3" height="2" /> <text x="14.5" y="11.2" className="fill-amber-400" style={{ fontSize: 0.9 }}>厨房</text>
      </g>
    ),
    B1: (
      <g stroke="#f59e0b" strokeWidth="0.18" fill="none">
        <rect x="3" y="4" width="4" height="3" /><rect x="7" y="4" width="4" height="3" /><rect x="11" y="4" width="3" height="3" />
        <rect x="14" y="4" width="5" height="3" />
        <rect x="3" y="7" width="16" height="4" fill="#f59e0b22" /><text x="9" y="9.5" className="fill-amber-200" style={{ fontSize: 1.4 }}>横厅 + 双阳台</text>
        <rect x="3" y="11" width="16" height="2" /><text x="11" y="12.2" className="fill-amber-400" style={{ fontSize: 1 }}>四房 · 双卫 · 主卧套房</text>
      </g>
    ),
    C1: (
      <g stroke="#f59e0b" strokeWidth="0.18" fill="none">
        <rect x="3" y="4" width="16" height="3" fill="#f59e0b22" /><text x="9" y="6" className="fill-amber-200" style={{ fontSize: 1.4 }}>7 米巨幕横厅</text>
        <rect x="3" y="7" width="5" height="4" /><rect x="8" y="7" width="3" height="2" /><rect x="8" y="9" width="3" height="2" /><rect x="11" y="7" width="3" height="4" /><rect x="14" y="7" width="5" height="4" />
        <rect x="3" y="11" width="16" height="2" /><text x="9" y="12.2" className="fill-amber-400" style={{ fontSize: 1 }}>双主卧套房 · 专梯入户</text>
      </g>
    ),
    D1: (
      <g stroke="#f59e0b" strokeWidth="0.18" fill="none">
        <rect x="3" y="4" width="6" height="3" fill="#f59e0b22" /><rect x="9" y="4" width="4" height="3" /><rect x="13" y="4" width="6" height="3" fill="#f59e0b22" />
        <text x="5" y="5.8" className="fill-amber-200" style={{ fontSize: 0.9 }}>中西双厨</text><text x="15" y="5.8" className="fill-amber-200" style={{ fontSize: 0.9 }}>私享电梯厅</text>
        <rect x="3" y="7" width="16" height="4" fill="#f59e0b22" /><text x="7" y="9.5" className="fill-amber-200" style={{ fontSize: 1.5 }}>270° 阔景大横厅</text>
        <rect x="3" y="11" width="7" height="3" /><rect x="10" y="11" width="4" height="3" /><rect x="14" y="11" width="5" height="3" />
        <text x="5" y="13" className="fill-amber-400" style={{ fontSize: 0.9 }}>主卧一</text><text x="11" y="13" className="fill-amber-400" style={{ fontSize: 0.9 }}>卫</text><text x="14.5" y="13" className="fill-amber-400" style={{ fontSize: 0.9 }}>主卧二</text>
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 22 14" className="absolute inset-0 w-full h-full p-4">{variants[id]}</svg>
  );
}
