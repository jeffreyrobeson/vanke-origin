import { Building2, MapPin, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { BUILDINGS, PROJECT_METADATA, projectSummary } from '../data/projectData';
import type { BuildingId } from '../types';

interface HeroProps {
  onSelectBuilding: (id: BuildingId) => void;
  onOpenCaptcha: () => void;
  onOpenAnalytics: () => void;
}

export function HeroBanner({ onSelectBuilding, onOpenCaptcha, onOpenAnalytics }: HeroProps) {
  const sum = projectSummary();
  const buildingIds = Object.keys(BUILDINGS) as BuildingId[];

  return (
    <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #f59e0b55 0, transparent 40%), radial-gradient(circle at 80% 70%, #6366f155 0, transparent 45%)' }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full font-medium mb-4">
              <ShieldCheck size={13} /> 广州市住建局官方数据对接 · 第 {buildingIds.length} 期公示
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              万科傲璟 · <span className="text-amber-400">荷花苑</span><br />
              <span className="text-2xl lg:text-3xl text-slate-300 font-bold">楼盘公示与房屋交易查询</span>
            </h1>
            <p className="mt-4 text-slate-400 text-base max-w-2xl leading-relaxed">
              完整收录 荷花苑住宅项目自编 <b className="text-slate-200">3# / 4# / 5# / 6#</b> 四栋楼销控图，
              支持按楼层、户型与房源状态快速筛选；一键解算图形验证码并直达广州市住建局原网查验；
              提供网签行情分析、户型赏析与广州房贷税费精准测算。
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin size={13} /> {PROJECT_METADATA.address}</span>
              <span>·</span>
              <span>开发商：{PROJECT_METADATA.developer}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onOpenCaptcha}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20">
                <ShieldCheck size={18} /> 官方一键查询
              </button>
              <button onClick={onOpenAnalytics}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl transition border border-slate-700">
                <TrendingUp size={18} /> 网签数据分析
              </button>
            </div>

            {/* 统计条 */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="收录楼栋" value={sum.buildings} unit="栋" />
              <Stat label="住宅房源" value={sum.totalUnits} unit="套" />
              <Stat label="已售去化" value={`${sum.soldRate}%`} unit={`${sum.sold} 套`} highlight />
              <Stat label="可售房源" value={sum.available} unit="套" />
            </div>
          </div>

          {/* 右侧楼栋卡片 */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {buildingIds.map((id) => {
                const b = BUILDINGS[id];
                return (
                  <button key={id} onClick={() => onSelectBuilding(id)}
                    className="group text-left bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 transition relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-6xl font-black text-slate-800/40 group-hover:text-amber-500/10 transition">{b.shortName.replace('#', '')}</div>
                    <div className="relative">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <Building2 size={15} /> {b.shortName}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 leading-snug truncate">{b.name}</div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-xl font-black text-white">{b.soldRate}<span className="text-xs text-slate-400">%</span></div>
                          <div className="text-[10px] text-slate-500">去化率</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-300 font-bold">{b.allowPresellNum} 套</div>
                          <div className="text-[10px] text-slate-500">批准预售</div>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style={{ width: `${b.soldRate}%` }} />
                      </div>
                      <div className="mt-3 text-xs text-amber-400 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        查看 3D 销控 <ArrowRight size={12} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, unit, highlight }: { label: string; value: string | number; unit: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className={`text-2xl font-black ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-slate-500">{unit}</div>
    </div>
  );
}
