import { ShieldCheck, ExternalLink, Github } from 'lucide-react';
import { PROJECT_METADATA, BUILDINGS } from '../data/projectData';
import type { BuildingId } from '../types';

interface FooterProps {
  onOpenCaptcha: () => void;
}

export function Footer({ onOpenCaptcha }: FooterProps) {
  const ids = Object.keys(BUILDINGS) as BuildingId[];
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 text-sm">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black">傲</div>
              <div className="font-black text-white">{PROJECT_METADATA.name}</div>
            </div>
            <p className="text-xs leading-relaxed">基于广州市住建局公示数据构建的楼盘公示与交易查询工具。</p>
          </div>
          <div>
            <div className="text-white font-bold mb-2">快速查询</div>
            <button onClick={onOpenCaptcha} className="block text-xs hover:text-amber-400 mb-1">官方一键验证码查询</button>
            {['3#', '4#', '5#', '6#'].map((b) => (
              <a key={b} href={BUILDINGS[b as BuildingId].xkbUrl} target="_blank" rel="noreferrer noopener" className="block text-xs hover:text-amber-400 mb-1">{b} 楼栋销控原网</a>
            ))}
          </div>
          <div>
            <div className="text-white font-bold mb-2">数据来源</div>
            <a href="https://zfcj.gz.gov.cn" target="_blank" rel="noreferrer noopener" className="block text-xs hover:text-amber-400 mb-1">广州市住房和城乡建设局</a>
            <a href={`https://zfcj.gz.gov.cn/zfcj/fyxx/projectdetail/index.html?sProjectId=${BUILDINGS[ids[0]].sProjectId}`} target="_blank" rel="noreferrer noopener" className="text-xs hover:text-amber-400 block">原网项目详情页</a>
            <div className="text-xs mt-2 text-slate-600">采集时间：{PROJECT_METADATA.dataFetchedAt}</div>
          </div>
          <div>
            <div className="text-white font-bold mb-2">免责声明</div>
            <p className="text-xs leading-relaxed">本站为公示辅助工具，展示数据来自官方渠道但可能存在更新延迟，所有房源状态、价格、预售信息以广州市住建局网签系统实时数据为最终依据。投资有风险，决策需谨慎。</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">
          <span>© 2026 万科傲璟 · 荷花苑楼盘公示工具 · 非官方产品，与开发商无隶属关系</span>
          <span className="flex items-center gap-3">
            <a href="https://zfcj.gz.gov.cn" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-amber-400"><ShieldCheck size={11} /> 官方公示</a>
            <a href="https://github.com/jeffreyrobeson/vanke-origin" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-amber-400"><Github size={11} /> 参考结构 <ExternalLink size={10} /></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
