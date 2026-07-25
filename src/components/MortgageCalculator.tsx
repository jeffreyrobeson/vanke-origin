import { useMemo, useState, useEffect } from 'react';
import { Calculator, Coins, Home, Percent, Banknote, TrendingUp, Info } from 'lucide-react';
import { calcMortgage, DEFAULT_RATES } from '../lib/mortgage';
import type { LoanType } from '../lib/mortgage';

interface Props {
  initialTotalPriceWan: number;
}

export function MortgageCalculator({ initialTotalPriceWan }: Props) {
  const [totalPrice, setTotalPrice] = useState(initialTotalPriceWan * 10000);
  const [buildingArea, setBuildingArea] = useState(100);
  const [firstHome, setFirstHome] = useState(true);
  const [loanType, setLoanType] = useState<LoanType>('commercial');
  const [downRatio, setDownRatio] = useState(0.15);
  const [years, setYears] = useState(30);
  const [commercialRate, setCommercialRate] = useState(DEFAULT_RATES.commercial);
  const [providentRate, setProvidentRate] = useState(DEFAULT_RATES.providentFirst5Plus);
  const [providentLoanAmount, setProvidentLoanAmount] = useState(400000);
  const [useProvidentRate50, setUseProvidentRate50] = useState(false);

  useEffect(() => { setTotalPrice(initialTotalPriceWan * 10000); }, [initialTotalPriceWan]);
  useEffect(() => { setProvidentRate(useProvidentRate50 ? DEFAULT_RATES.providentFirst5 : DEFAULT_RATES.providentFirst5Plus); }, [useProvidentRate50]);

  const result = useMemo(() => calcMortgage({
    totalPrice, buildingArea, firstHome, loanType, downPaymentRatio: downRatio, years,
    commercialRate, providentRate, providentLoanAmount,
  }), [totalPrice, buildingArea, firstHome, loanType, downRatio, years, commercialRate, providentRate, providentLoanAmount]);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Calculator className="text-amber-400" size={22} />
        <div>
          <h2 className="text-lg font-black text-white">广州房贷与税费精准测算器</h2>
          <div className="text-xs text-slate-400">支持商业贷款 / 纯公积金 / 组合贷款，自动核算契税、住宅专项维修资金及月供还款明细</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* 输入面板 */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <Slider label="房屋总价" suffix="万元" value={totalPrice / 10000} step={1} min={50} max={1500} onChange={(v) => setTotalPrice(v * 10000)} />
          <Slider label="建筑面积" suffix="㎡" value={buildingArea} step={1} min={40} max={300} onChange={setBuildingArea} />

          <div>
            <div className="text-sm text-slate-300 mb-1.5 font-medium">首/二套</div>
            <div className="flex gap-2">
              {[{ v: true, l: '首套' }, { v: false, l: '二套' }].map((o) => (
                <button key={o.l} onClick={() => setFirstHome(o.v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border ${firstHome === o.v ? 'bg-amber-500 text-slate-950 border-transparent' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-300 mb-1.5 font-medium flex items-center gap-1"><Percent size={13} className="text-amber-400" /> 首付比例（广州最低 15%）</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: 0.15, l: '15%' }, { v: 0.2, l: '20%' }, { v: 0.3, l: '30%' }, { v: 0.4, l: '40%' }, { v: 0.7, l: '70%全款' },
              ].map((o) => (
                <button key={o.l} onClick={() => setDownRatio(o.v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${downRatio === o.v ? 'bg-amber-500 text-slate-950 border-transparent' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-300 mb-1.5 font-medium">贷款方式</div>
            <div className="flex gap-2">
              {([
                { v: 'commercial' as LoanType, l: '商业贷款' },
                { v: 'provident' as LoanType, l: '纯公积金' },
                { v: 'combo' as LoanType, l: '组合贷款' },
              ]).map((o) => (
                <button key={o.v} onClick={() => setLoanType(o.v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border ${loanType === o.v ? 'bg-amber-500 text-slate-950 border-transparent' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{o.l}</button>
              ))}
            </div>
          </div>

          <Slider label="贷款年限" suffix="年" value={years} step={5} min={5} max={30} onChange={setYears} />

          {loanType !== 'provident' && (
            <Slider label="商贷年利率" suffix="%" value={commercialRate * 100} step={0.05} min={1} max={8} onChange={(v) => setCommercialRate(v / 100)} />
          )}
          {loanType !== 'commercial' && (
            <div className="space-y-2">
              <Slider label="公积金年利率" suffix="%" value={providentRate * 100} step={0.05} min={1} max={5} onChange={(v) => setProvidentRate(v / 100)} />
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={useProvidentRate50} onChange={(e) => setUseProvidentRate50(e.target.checked)} className="accent-amber-500" />
                适用 5 年以下公积金利率（2.75%）
              </label>
            </div>
          )}
          {loanType === 'combo' && (
            <Slider label="公积金贷款额度" suffix="万元" value={providentLoanAmount / 10000} step={5} min={5} max={120} onChange={(v) => setProvidentLoanAmount(v * 10000)} />
          )}
        </div>

        {/* 结果面板 */}
        <div className="space-y-4">
          {/* 月供大标 */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-slate-950 shadow-xl shadow-amber-500/20">
            <div className="text-sm font-bold opacity-80 flex items-center gap-1"><Banknote size={14} /> 月供（等额本息）</div>
            <div className="mt-1 text-4xl font-black">{result.monthlyPayment.toLocaleString()} <span className="text-lg font-bold">元/月</span></div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-950/15 rounded-lg p-2">
                <div className="opacity-70 text-xs">贷款本金</div>
                <div className="font-bold">{(result.loanPrincipal / 10000).toFixed(1)} 万</div>
              </div>
              <div className="bg-slate-950/15 rounded-lg p-2">
                <div className="opacity-70 text-xs">总利息</div>
                <div className="font-bold">{(result.totalInterest / 10000).toFixed(1)} 万</div>
              </div>
            </div>
            {loanType === 'combo' && (
              <div className="mt-2 text-xs flex gap-4">
                <span>公积金月供 {result.providentMonthly?.toLocaleString()}</span>
                <span>商贷月供 {result.commercialMonthly?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* 税费明细 */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><Coins size={15} className="text-amber-400" /> 购房税费与维修资金</h3>
            <Line label={`${firstHome ? '首套' : '二套'}契税`} value={result.deedTax} />
            <Line label="住宅专项维修资金（带电梯 105 元/㎡）" value={result.repairFund} />
            <div className="border-t border-slate-800 my-2" />
            <Line label="税费合计（一次性支出）" value={result.taxTotal} highlight />
            <div className="mt-2 text-[11px] text-slate-500 flex items-start gap-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              首套契税：≤90㎡ 1%，≤140㎡ 1.5%，{'>140㎡ 3%'}；广州二套住宅 1%。维修资金按建面 ×105 元/㎡。
            </div>
          </div>

          {/* 总支出 + 还款 */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-1.5"><TrendingUp size={15} className="text-amber-400" /> 购房总支出与还款</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Box label="首付" value={`${(result.downPayment / 10000).toFixed(1)} 万`} />
              <Box label="税费（一次性）" value={`${(result.taxTotal / 10000).toFixed(1)} 万`} />
              <Box label="还款总额" value={`${(result.totalRepay / 10000).toFixed(1)} 万`} tone="amber" />
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              首付 + 税费 = <b className="text-amber-400">{((result.downPayment + result.taxTotal) / 10000).toFixed(1)} 万</b>（已支付）+ 贷款 {result.monthlyPayment.toLocaleString()} 元/月 × {years * 12} 期
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, suffix, value, step, min, max, onChange }: { label: string; suffix: string; value: number; step: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300 font-medium flex items-center gap-1"><Home size={13} className="text-slate-500" /> {label}</span>
        <span className="font-mono font-bold text-amber-400">{value} {suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-500" />
    </div>
  );
}

function Line({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between text-sm py-1.5 ${highlight ? 'text-amber-400 font-bold text-base' : 'text-slate-300'}`}>
      <span className="flex items-center gap-1">{label}</span>
      <span className="font-mono">{value.toLocaleString()} 元</span>
    </div>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-lg font-black ${tone === 'amber' ? 'text-amber-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
