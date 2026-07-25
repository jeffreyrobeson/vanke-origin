export type BuildingId = '3#' | '4#' | '5#' | '6#';

/** 与广州市住建局销控表 statusKey 一一对应 */
export type UnitStatusKey =
  | 'presale'      // 预售可售
  | 'subscribed'   // 已认购
  | 'contracted'   // 已签约
  | 'registered'   // 已备案
  | 'mortgaged'    // 抵押中（不可售）
  | 'restricted'   // 查封 / 不可销售 / 非住宅
  | 'other';       // 非住宅配套（不计入住宅销控）

export interface BuildingInfo {
  id: BuildingId;
  name: string;
  shortName: string;
  sProjectId: string;
  preSellNo: string;
  officialUrl: string;
  xkbUrl: string;
  floors: string[];
  floorMax: number;
  totalBuildingArea: number;   // 总建面 ㎡
  presaleLicense: string;
  address: string;
  developerId: string;
  competencyNo: string;
  // 销控汇总（来自官方 pzystspzysmjxx）
  allowPresellNum: number;     // 批准预售套数
  allowPresellArea: number;    // 批准预售面积 ㎡
  totalSaleNum: number;       // 已售套数
  totalSaleArea: number;      // 已售面积 ㎡
  totalNosoldNum: number;     // 未售套数
  totalNosoldArea: number;    // 未售面积 ㎡
  soldRate: number;           // 去化率 %
  description: string;
}

export interface UnitInfo {
  unitId: string;
  unitNum: string;            // 房号 如 4302
  floor: string;              // 楼层 (可能含 "天面"/"屋面")
  buildingId: BuildingId;
  buildingName: string;
  sProjectId: string;
  preSellNo: string;
  isResidential: boolean;
  houseFunction: string;      // 住宅 / 其他
  buildingArea: number;       // 建面 ㎡
  usableArea: number;         // 套内 ㎡
  layout: string;             // 如 3房2厅
  pledgeStatus: number;
  pledgeDesc: string;
  closed: boolean;            // 查封
  preSellStatus: number;
  pactStatus: number;
  status: string;             // 中文状态描述
  statusKey: UnitStatusKey;
  officialUnitUrl: string;
}

export interface LayoutPlan {
  id: string;
  name: string;
  title: string;       // 如 85㎡ 精致三房
  buildings: string;    // 所属楼栋
  rooms: string;        // 如 3室2厅2卫
  area: number;         // 建面 ㎡
  usableArea: number;   // 套内 ㎡
  usableAreaRatio: number; // 套内实用率
  orientation: string;
  priceRange: number;  // 估算单价 元/㎡（用于测算器深链）
  features: string[];
  description: string;
}
