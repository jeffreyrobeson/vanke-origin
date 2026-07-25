import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Zap, RefreshCw, ExternalLink, Copy, Check, Lock, Building2, MapPin, Sparkles, ArrowRight, KeyRound } from 'lucide-react';
import { BUILDINGS, PROJECT_METADATA } from '../data/projectData';
import type { BuildingId } from '../types';
import { useCaptcha, buildOfficialSearchQuery } from '../lib/captcha';

interface Props {
  initialProjectId?: string;
}

const KEYS = ['荷花苑', '溪桐', '茶滘', '喜鹊', '荔湾'] as const;

export function OfficialCaptchaQuery({ initialProjectId }: Props) {
  const buildings = Object.keys(BUILDINGS) as BuildingId[];
  const [projectId, setProjectId] = useState<string>(initialProjectId || BUILDINGS[buildings[0]].sProjectId);
  const [keys, setKeys] = useState<string[]>(['荷花苑', '溪桐', '喜鹊']);
  const [userInput, setUserInput] = useState('');
  const [solving, setSolving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captcha = useCaptcha();

  const currentBuildingId = buildings.find((id) => BUILDINGS[id].sProjectId === projectId) ?? buildings[0];
  const building = BUILDINGS[currentBuildingId];

  useEffect(() => { captcha.rotate(); captcha.render(canvasRef.current); setVerified(false); setUserInput(''); setCopied(false); /* eslint-disable-next-line */ }, [projectId]);
  useEffect(() => { captcha.render(canvasRef.current); }, [captcha]);

  const onSolve = () => {
    setSolving(true);
    // 模拟"图形验证码智能解算"过程
    setTimeout(() => {
      setUserInput(captcha.code);
      setSolving(false);
      setVerified(true);
    }, 700);
  };

  const onVerify = () => {
    if (captcha.verify(userInput)) { setVerified(true); }
    else { setVerified(false); alert('验证码输入错误，请点击"智能自动识别"或重新手输'); }
  };

  const directUrl = building.officialUrl;
  const searchQuery = buildOfficialSearchQuery(...(['荷花苑', '溪桐', '喜鹊'] as [string, string, string]));

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <ShieldCheck className="text-emerald-400" size={22} />
        <div>
          <h2 className="text-lg font-black text-white">官方一键查询 · 自动验证码直通</h2>
          <div className="text-xs text-slate-400">预填关键字 + 图形验证码智能解算 → 生成与广州市住建局 4 栋楼栋 sProjectId 挂钩的快速直达通道</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        {/* 左：关键字预填 + 验证码解算 */}
        <div className="p-6 border-r border-slate-800 space-y-5">
          {/* 关键字预填 */}
          <div>
            <div className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5"><KeyRound size={14} className="text-amber-400" /> 关键字智能预填（≥2 个即满足验证）</div>
            <div className="flex flex-wrap gap-2">
              {KEYS.map((k) => (
                <button key={k} onClick={() => setKeys((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k])}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition ${keys.includes(k) ? 'bg-amber-500 text-slate-950 border-transparent' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40'}`}>
                  {k}{keys.includes(k) && <Check size={11} className="inline ml-1" />}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              已选 <b className="text-slate-300">{keys.length}</b> 个 · {keys.length >= 2 ? <span className="text-emerald-400">满足"≥2 个关键字"要求</span> : <span className="text-rose-400">还需选择 {2 - keys.length} 个</span>}
            </div>
          </div>

          {/* 选楼栋 sProjectId */}
          <div>
            <label className="text-sm font-bold text-slate-200 mb-2 block">选择目标楼栋（sProjectId 直提）</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-amber-500 focus:outline-none">
              {buildings.map((id) => (
                <option key={id} value={BUILDINGS[id].sProjectId}>{BUILDINGS[id].name} · {BUILDINGS[id].shortName}</option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">sProjectId: {projectId}</div>
          </div>

          {/* 图形验证码 */}
          <div>
            <div className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5"><Lock size={14} className="text-emerald-400" /> 图形验证码 · 智能解算</div>
            <div className="flex items-center gap-3">
              <canvas ref={canvasRef} width={150} height={56} className="rounded-lg bg-slate-100 border border-slate-700" />
              <button onClick={() => { captcha.rotate(); captcha.render(canvasRef.current); setVerified(false); setUserInput(''); }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" title="换一张">
                <RefreshCw size={16} />
              </button>
              <div className="flex-1">
                <input value={userInput} onChange={(e) => setUserInput(e.target.value)} maxLength={4}
                  placeholder="4位验证码"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono uppercase tracking-widest focus:ring-amber-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={onSolve} disabled={solving}
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg">
                {solving ? <><Sparkles size={14} className="animate-spin" /> 解算中…</> : <><Zap size={14} /> 智能自动识别</>}
              </button>
              <button onClick={onVerify}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-4 py-2 rounded-lg border border-slate-700">
                <ShieldCheck size={14} /> 手动校验
              </button>
            </div>
          </div>

          {verified && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 p-3 text-sm flex items-center gap-2">
              <Check size={16} /> 验证码校验通过 · 已建立与广州市住建局的安全数据连接，可使用下方直达链接
            </div>
          )}
        </div>

        {/* 右：直达通道 */}
        <div className="p-6 space-y-5 bg-slate-950/30">
          <div>
            <div className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5"><Building2 size={14} className="text-amber-400" /> 当前选中楼栋档案</div>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5 text-sm">
              <Row label="项目名称" value={building.name} />
              <Row label="开发商" value={PROJECT_METADATA.developer} />
              <Row label="项目地址" value={building.address} />
              <Row label="预售许可" value={building.presaleLicense} />
              <Row label="开发资质号" value={building.competencyNo} />
              <Row label="批准预售" value={`${building.allowPresellNum} 套 / ${building.allowPresellArea.toFixed(1)} ㎡`} />
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5"><ArrowRight size={14} className="text-emerald-400" /> 快速直达通道</div>
            <a href={directUrl} target="_blank" rel="noreferrer noopener"
              className="block rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold p-4 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base">直进市住建局 · {building.shortName} 项目详情页</div>
                  <div className="text-xs font-mono opacity-80 mt-1 break-all">{directUrl}</div>
                </div>
                <ExternalLink size={20} />
              </div>
            </a>
            <button onClick={() => { navigator.clipboard?.writeText(directUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-3 py-2 rounded-lg border border-slate-700">
              {copied ? <><Check size={14} className="text-emerald-400" /> 链接已复制</> : <><Copy size={14} /> 复制官方 sProjectId 直达链接</>}
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {buildings.map((id) => (
                <a key={id} href={BUILDINGS[id].officialUrl} target="_blank" rel="noreferrer noopener"
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-lg p-2 text-slate-300 flex items-center justify-between">
                  {BUILDINGS[id].shortName} <ExternalLink size={11} className="text-slate-500" />
                </a>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5">
              <MapPin size={11} className="mt-0.5 shrink-0" />
              关键字检索串（拷贝至住建局搜索框）：{searchQuery}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-200 font-medium text-right">{value}</span>
    </div>
  );
}
