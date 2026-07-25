// 广州住宅房贷 + 税费测算（依据 2025-2026 广州最新政策口径）
// 首付最低 15%、契税首套≤90㎡ 1% / ≤140 1.5% / >140 3% 二套统一 1%（北上广深二套 1%）
// 维修资金：广州带电梯住宅 105 元/㎡·建筑面积；无电梯 75 元/㎡

export type LoanType = 'commercial' | 'provident' | 'combo';

export interface CalcInput {
  totalPrice: number;       // 房屋总价 元
  buildingArea: number;     // 建面 ㎡（用于维修资金）
  firstHome: boolean;       // 是否首套
  loanType: LoanType;
  downPaymentRatio: number; // 首付比例 0-1
  years: number;            // 贷款年限
  commercialRate: number;   // 商贷年利率 0-1
  providentRate: number;    // 公积金年利率
  providentLoanAmount: number; // 组合贷中公积金贷金额 元（仅 combo 用）
}

export interface CalcResult {
  downPayment: number;
  loanPrincipal: number;
  monthlyPayment: number;     // 月供 元
  totalInterest: number;      // 总利息
  totalRepay: number;         // 还款总额
  deedTax: number;            // 契税
  repairFund: number;         // 维修资金
  taxTotal: number;
  providentMonthly?: number;
  commercialMonthly?: number;
}

const R = (x: number) => Math.round(x);

export function calcMortgage(inp: CalcInput): CalcResult {
  const downPayment = inp.totalPrice * inp.downPaymentRatio;
  let loanPrincipal = inp.totalPrice - downPayment;

  let commercialPart = 0;
  let providentPart = 0;
  if (inp.loanType === 'provident') {
    providentPart = loanPrincipal;
  } else if (inp.loanType === 'commercial') {
    commercialPart = loanPrincipal;
  } else {
    // 组合贷：优先公积金额度，其余商贷
    providentPart = Math.min(inp.providentLoanAmount, loanPrincipal);
    commercialPart = loanPrincipal - providentPart;
  }

  const monthlyRate = (rate: number) => rate / 12;
  const n = inp.years * 12;

  const annuityMonthly = (principal: number, annualRate: number) => {
    if (principal <= 0) return 0;
    const i = monthlyRate(annualRate);
    if (i === 0) return principal / n;
    return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  };

  const providentMonthly = annuityMonthly(providentPart, inp.providentRate);
  const commercialMonthly = annuityMonthly(commercialPart, inp.commercialRate);
  const monthlyPayment = providentMonthly + commercialMonthly;

  const totalRepay = monthlyPayment * n;
  const totalInterest = Math.max(0, totalRepay - loanPrincipal);

  // 契税（广州口径）
  let deedRate: number;
  if (inp.firstHome) {
    deedRate = inp.buildingArea <= 90 ? 0.01 : inp.buildingArea <= 140 ? 0.015 : 0.03;
  } else {
    deedRate = 0.01; // 广州二套住宅 1%
  }
  // 契税计税基数按房屋总价（实际成交价，这里用输入总价）
  const deedTax = inp.totalPrice * deedRate;

  // 维修资金：带电梯 105 元/㎡
  const repairFund = inp.buildingArea * 105;

  return {
    downPayment: R(downPayment),
    loanPrincipal: R(loanPrincipal),
    monthlyPayment: R(monthlyPayment),
    totalInterest: R(totalInterest),
    totalRepay: R(totalRepay),
    deedTax: R(deedTax),
    repairFund: R(repairFund),
    taxTotal: R(deedTax + repairFund),
    providentMonthly: inp.loanType !== 'commercial' ? R(providentMonthly) : undefined,
    commercialMonthly: inp.loanType !== 'provident' ? R(commercialMonthly) : undefined,
  };
}

export const DEFAULT_RATES = {
  commercial: 0.0315,   // 商贷 3.15%（LPR-基点示意）
  providentFirst5Plus: 0.0285, // 公积金 5 年以上 2.85%
  providentFirst5: 0.0275,
};

export const FLOOR_PRICE_DELTA = 350; // 每高一层约 +350 元/㎡（用于一房一价估算）
