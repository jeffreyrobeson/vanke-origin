import { MapPin, Building2, FileCheck, Users, BadgeCheck, ExternalLink } from 'lucide-react';
import { BUILDINGS, PROJECT_METADATA } from '../data/projectData';
import type { BuildingId } from '../types';

export function ProjectOverview() {
  const buildingIds = Object.keys(BUILDINGS) as BuildingId[];

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <MapPin className="text-amber-400" size={22} />
        <div>
          <h2 className="text-lg font-black text-white">项目概况与区位</h2>
          <div className="text-xs text-slate-400">万科傲璟（荷花苑）· 广州市荔湾区茶滘街乐怡居社区</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* 项目卡片 */}
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><Building2 size={16} className="text-amber-400" /> 项目基本信息</h3>
          <div className="space-y-2 text-sm">
            <KV label="项目名称" value={PROJECT_METADATA.name} />
            <KV label="备案名称" value={PROJECT_METADATA.subName} />
            <KV label="开发商" value={PROJECT_METADATA.developer} />
            <KV label="开发资质" value={PROJECT_METADATA.competencyNo} />
            <KV label="所在区域" value={`${PROJECT_METADATA.district} · ${PROJECT_METADATA.street}`} />
            <KV label="项目地址" value={PROJECT_METADATA.address} />
            <KV label="所属社区" value={PROJECT_METADATA.community} />
            <KV label="产权年限" value={PROJECT_METADATA.landTenure} />
          </div>
          <a href={`https://zfcj.gz.gov.cn/zfcj/fyxx/projectdetail/index.html?sProjectId=${BUILDINGS[buildingIds[0]].sProjectId}`} target="_blank" rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm">
            市住建局项目主页 <ExternalLink size={12} />
          </a>
        </div>

        {/* 楼栋一览 */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><FileCheck size={16} className="text-amber-400" /> 四栋楼栋预售证与销控</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-800">
                  <th className="text-left py-2 font-medium">楼栋</th>
                  <th className="text-left py-2 font-medium">地址</th>
                  <th className="text-left py-2 font-medium">预售许可证</th>
                  <th className="text-right py-2 font-medium">批准预售</th>
                  <th className="text-right py-2 font-medium">已售</th>
                  <th className="text-right py-2 font-medium">去化率</th>
                </tr>
              </thead>
              <tbody>
                {buildingIds.map((id) => {
                  const b = BUILDINGS[id];
                  return (
                    <tr key={id} className="border-b border-slate-800/60 hover:bg-slate-950/40">
                      <td className="py-2.5"><span className="font-black text-amber-400">{b.shortName}</span><div className="text-[10px] text-slate-500">{b.floors.length} 层</div></td>
                      <td className="py-2.5 text-slate-300 text-xs">{b.address}</td>
                      <td className="py-2.5 text-slate-400 text-xs font-mono">{b.presaleLicense}</td>
                      <td className="py-2.5 text-right text-slate-300">{b.allowPresellNum}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">{b.totalSaleNum}</td>
                      <td className="py-2.5 text-right">
                        <span className={`font-bold ${b.soldRate >= 60 ? 'text-emerald-400' : b.soldRate >= 30 ? 'text-amber-400' : 'text-rose-400'}`}>{b.soldRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 开发商信息 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><Users size={16} className="text-amber-400" /> 开发商</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-2xl">溪</div>
            <div>
              <div className="font-bold text-white">{PROJECT_METADATA.developer}</div>
              <div className="text-xs text-slate-500">资质号 {PROJECT_METADATA.competencyNo}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            本项目开发商为 <b className="text-slate-200">{PROJECT_METADATA.developer}</b>，
            由广州市住建局核发房地产开发资质，资质号 {PROJECT_METADATA.competencyNo}。
            四栋楼栋分别于 2025/2026 年度取得商品房预售许可证。
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><BadgeCheck size={16} className="text-amber-400" /> 安全提示</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2"><BadgeCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 购房前请务必登录广州市住建局核验项目预售许可证、网签状态与单元抵押查封情况。</li>
            <li className="flex gap-2"><BadgeCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 任何要求资金走对公账户之外的"内部房源""提前付款"均属违规，请拒绝。</li>
            <li className="flex gap-2"><BadgeCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 验码直通：</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {buildingIds.map((id) => (
              <a key={id} href={BUILDINGS[id].officialUrl} target="_blank" rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700">
                {BUILDINGS[id].shortName} <ExternalLink size={11} className="text-slate-500" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 py-2">
        本站数据采集自 {PROJECT_METADATA.dataSource}（{PROJECT_METADATA.dataFetchedAt}），仅供公示参考，最终以官方及网签信息为准。
      </p>
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-200 font-medium text-right">{value}</span>
    </div>
  );
}
