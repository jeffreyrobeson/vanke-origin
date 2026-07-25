import { useState } from 'react';
import type { ReactNode } from 'react';
import { Building2, ShieldCheck, PieChart, FileText, MapPin, Calculator, Menu, X, ExternalLink, Zap } from 'lucide-react';
import { PROJECT_METADATA, BUILDINGS } from '../data/projectData';
import type { BuildingId } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const NAV = [
  { id: 'matrix', label: '楼栋销控公示', icon: Building2 },
  { id: 'query', label: '官方一键查询', icon: ShieldCheck, badge: '自动验证码' },
  { id: 'analytics', label: '网签数据分析', icon: PieChart },
  { id: 'layouts', label: '户型赏析', icon: FileText },
  { id: 'overview', label: '项目概况', icon: MapPin },
  { id: 'calculator', label: '房贷税费测算', icon: Calculator },
];

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const buildingKeys = Object.keys(BUILDINGS) as BuildingId[];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-xl">
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-4 py-1.5 text-xs text-amber-50 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-amber-500/30">官方公示</span>
          <span className="truncate">广州市住建局数据实时同步 · 荷花苑 {buildingKeys.join(' / ')} 销控已更新（采集于 {PROJECT_METADATA.dataFetchedAt}）</span>
        </div>
        <span className="hidden md:inline text-amber-200/90 text-[11px] shrink-0 flex items-center gap-1"><Zap size={10} /> 数据来源：{PROJECT_METADATA.dataSource}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button className="flex items-center gap-3" onClick={() => setActiveTab('matrix')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/30">傲</div>
            <div className="text-left">
              <div className="font-black text-lg leading-tight">{PROJECT_METADATA.name} <span className="text-amber-400 text-sm font-bold">· 荷花苑</span></div>
              <div className="text-[11px] text-slate-400 leading-tight">楼盘公示 & 房屋交易查询系统</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = activeTab === n.id;
              return (
                <button key={n.id} onClick={() => setActiveTab(n.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}>
                  <Icon size={15} /> {n.label}
                  {n.badge && <span className="ml-1 text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">{n.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className="lg:hidden relative">
            <button onClick={() => setMobileOpen((o) => !o)} className="p-2 rounded-lg text-slate-200 hover:bg-slate-800">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {mobileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-2 z-50">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button key={n.id} onClick={() => { setActiveTab(n.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeTab === n.id ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-700'}`}>
                      <Icon size={15} /> {n.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function ExternalLinkRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm">
      {children} <ExternalLink size={12} />
    </a>
  );
}
