import { X, ShieldCheck, Calculator, ExternalLink, Home, Ruler, Compass, FileCheck, Building2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { STATUS_META, BUILDINGS } from '../data/projectData';
import type { UnitInfo } from '../types';
import { FLOOR_PRICE_DELTA } from '../lib/mortgage';

interface Props {
  unit: UnitInfo | null;
  onClose: () => void;
  onOpenCaptcha: (sProjectId: string) => void;
  onOpenCalculatorWithPrice: (totalWan: number) => void;
}

export function UnitDetailModal({ unit, onClose, onOpenCaptcha, onOpenCalculatorWithPrice }: Props) {
  if (!unit) return null;
  const b = BUILDINGS[unit.buildingId];
  const meta = STATUS_META[unit.statusKey];
  const floor = parseInt(unit.floor, 10);
  const isRes = unit.isResidential;

  // 估算单价：用楼栋均价基准 + 楼层修正（官方未公示一房一价，这里给估算）
  const estUnitPrice = isRes ? 48000 + (isNaN(floor) ? 0 : (floor - 1) * FLOOR_PRICE_DELTA) : 0;
  const estTotal = isRes ? Math.round(estUnitPrice * unit.buildingArea) : 0;
  const totalWan = Math.round(estTotal / 10000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Home className="text-amber-400" size={18} />
            <h3 className="font-black text-white">{b.shortName} {unit.unitNum} <span className="text-slate-500 text-sm font-normal">· {unit.floor}F</span></h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* 状态 */}
          <div className={`rounded-xl ${meta.bg} ${meta.text} p-3`}>
            <div className="flex items-center gap-2 font-black text-lg">{meta.label}</div>
            <div className="text-sm opacity-90 mt-0.5">{meta.desc}</div>
          </div>

          {!isRes ? (
            <div className="text-sm text-slate-400 bg-slate-950/40 rounded-lg p-3 border border-slate-800">
              该单元为{unit.houseFunction}，不计入住宅销控公示范围。
              <div className="mt-1 text-xs text-slate-500">房号 {unit.unitNum} · 楼层 {unit.floor}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field icon={<Ruler size={14} />} label="建筑面积" value={`${unit.buildingArea} ㎡`} />
                <Field icon={<Ruler size={14} />} label="套内面积" value={`${unit.usableArea} ㎡`} />
                <Field icon={<Building2 size={14} />} label="户型" value={unit.layout} />
                <Field icon={<Compass size={14} />} label="实用率" value={`${Math.round(unit.usableArea / unit.buildingArea * 1000) / 10}%`} />
                <Field icon={<FileCheck size={14} />} label="抵押状态" value={unit.pledgeDesc} />
                <Field icon={<FileCheck size={14} />} label="预售许可" value={unit.preSellStatus === 1 ? '已纳入预售' : '未纳入预售'} />
              </div>

              {/* 估算一房一价 */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <div className="text-amber-400 font-bold mb-2 flex items-center gap-1.5"><Calculator size={14} /> 估算一房一价（仅供参考）</div>
                <div className="flex justify-between text-slate-300"><span>估算建面单价</span><span className="font-mono font-bold text-white">{estUnitPrice.toLocaleString()} 元/㎡</span></div>
                <div className="flex justify-between text-slate-300 mt-1"><span>估算总价</span><span className="font-mono font-bold text-amber-400">{totalWan} 万元</span></div>
                <div className="mt-2 text-[11px] text-slate-500">说明：广州市住建局销控公示未公开逐套成交价，本估算基于楼栋均价 + 楼层修正（每高一档 +{FLOOR_PRICE_DELTA} 元/㎡）。</div>
              </div>
            </>
          )}

          {/* 跳官方查验 */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => onOpenCaptcha(b.sProjectId)} disabled={!isRes}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg">
              <ShieldCheck size={15} /> 直达住建局查验此房
            </button>
            <button onClick={() => onOpenCalculatorWithPrice(totalWan)} disabled={!isRes}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-sm px-4 py-2 rounded-lg border border-slate-700">
              <Calculator size={15} /> 用此总价进测算
            </button>
            <a href={b.xkbUrl} target="_blank" rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm px-2 py-2">
              销控原网 <ExternalLink size={13} />
            </a>
          </div>

          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-800">
            sProjectId: <span className="font-mono text-slate-500">{b.sProjectId}</span> · preSellNo: <span className="font-mono text-slate-500">{b.preSellNo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800">
      <div className="text-slate-500 text-xs flex items-center gap-1">{icon} {label}</div>
      <div className="text-white font-bold mt-0.5">{value || '—'}</div>
    </div>
  );
}
