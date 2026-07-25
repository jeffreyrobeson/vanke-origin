import raw from '../../data/sales-control.json';
import type { BuildingId, BuildingInfo, LayoutPlan, UnitInfo } from '../types';

interface RawUnit {
  unitId: string; unitNum: string; floor: string; floorLabel: string;
  houseFunction: string; isResidential: boolean; buildingArea: number; usableArea: number;
  layout: string; pledgeStatus: number; pledgeDesc: string; closed: boolean;
  preSellStatus: number; pactStatus: number; status: string; statusKey: string;
}
interface RawBuilding { sProjectId: string; preSellNo: string; units: RawUnit[]; }
interface RawData { meta: { fetched: string; source: string }; buildings: Record<string, RawBuilding>; }

const DATA = raw as unknown as RawData;

export const PROJECT_METADATA = {
  name: '万科傲璟',
  subName: '荷花苑住宅项目',
  developer: '广州市溪桐房地产有限公司',
  competencyNo: '粤房开证字贰0110133',
  address: '广州市荔湾区茶滘街乐怡居社区喜鹊路',
  district: '荔湾区',
  street: '茶滘街道',
  community: '乐怡居社区',
  totalBuildingIds: ['3#', '4#', '5#', '6#'] as BuildingId[],
  landTenure: '70年住宅产权',
  salesHotline: '以售楼处现场公示为准',
  authorityDomain: 'https://zfcj.gz.gov.cn',
  dataFetchedAt: DATA.meta.fetched,
  dataSource: DATA.meta.source,
};

// 官方楼盘基本信息（来自 fdcxmjbxx.ashx）
const OFFICIAL_BASIC: Record<BuildingId, Omit<BuildingInfo, 'id' | 'officialUrl' | 'xkbUrl'>> = {
  '3#': {
    name: '荷花苑住宅项目自编3#', shortName: '3#',
    sProjectId: '5441962c12af4493ab04cca2f7d47ad1', preSellNo: '20250046',
    developerId: 'bd50a6abf257423cb1c32fbfca85a4fc',
    floors: [], floorMax: 44, totalBuildingArea: 25620,
    presaleLicense: '穗房预字第20250046号', address: '荔湾区茶滘街乐怡居社区喜鹊路286号',
    competencyNo: PROJECT_METADATA.competencyNo,
    allowPresellNum: 214, allowPresellArea: 23032.4371,
    totalSaleNum: 171, totalSaleArea: 17261.7276,
    totalNosoldNum: 94, totalNosoldArea: 8001.5228,
    soldRate: 80, description: '主推 3 房 2 厅及 2 房 2 厅实用户型，每层 6 户梯户比，去化稳健的主力楼栋。',
  },
  '4#': {
    name: '荷花苑住宅项目自编4#', shortName: '4#',
    sProjectId: '6b23c8f890b546a6a53495ebfb40e003', preSellNo: '20250102',
    developerId: 'bd50a6abf257423cb1c32fbfca85a4fc',
    floors: [], floorMax: 44, totalBuildingArea: 25628.06,
    presaleLicense: '穗房预字第20250102号', address: '荔湾区茶滘街乐怡居社区喜鹊路284号',
    competencyNo: PROJECT_METADATA.competencyNo,
    allowPresellNum: 214, allowPresellArea: 23278.1028,
    totalSaleNum: 141, totalSaleArea: 13817.8089,
    totalNosoldNum: 126, totalNosoldArea: 11604.5939,
    soldRate: 66, description: '与 3# 户型矩阵一致，地处项目中部，去化节奏略缓于 3#。',
  },
  '5#': {
    name: '荷花苑住宅项目自编5#', shortName: '5#',
    sProjectId: 'f58070fd22e14c53ad40ab1825a13be3', preSellNo: '20260145',
    developerId: 'bd50a6abf257423cb1c32fbfca85a4fc',
    floors: [], floorMax: 40, totalBuildingArea: 26210.23,
    presaleLicense: '穗房预字第20260145号', address: '荔湾区茶滘街乐怡居社区喜鹊路282号',
    competencyNo: PROJECT_METADATA.competencyNo,
    allowPresellNum: 187, allowPresellArea: 23169.4057,
    totalSaleNum: 1, totalSaleArea: 92.1331,
    totalNosoldNum: 195, totalNosoldArea: 25401.4498,
    soldRate: 1, description: '2026 年新取证楼栋，主打 4 房 2 厅大户型，目前刚启动推售。',
  },
  '6#': {
    name: '荷花苑住宅自编6#', shortName: '6#',
    sProjectId: '189d6db0aab04bc295f5b67186bf4500', preSellNo: '20250292',
    developerId: 'bd50a6abf257423cb1c32fbfca85a4fc',
    floors: [], floorMax: 45, totalBuildingArea: 27701.73,
    presaleLicense: '穗房预字第20250292号', address: '荔湾区茶滘街乐怡居社区喜鹊路288号',
    competencyNo: PROJECT_METADATA.competencyNo,
    allowPresellNum: 208, allowPresellArea: 24485.0229,
    totalSaleNum: 119, totalSaleArea: 12533.9593,
    totalNosoldNum: 140, totalNosoldArea: 14524.7819,
    soldRate: 57, description: '主打 3 房 2 厅 / 4 房 2 厅改善产品，46 层规划为项目最高楼栋之一。',
  },
};

function officialProjectUrl(id: string) {
  return `https://zfcj.gz.gov.cn/zfcj/fyxx/projectdetail/index.html?sProjectId=${id}`;
}
function officialXkbUrl(id: string, preSellNo: string) {
  return `https://zfcj.gz.gov.cn/zfcj/fyxx/xkb/index.html?sProjectId=${id}&sPreSellNo=${preSellNo}`;
}

// 构建每栋楼信息（含真实楼层数组）
function buildBuildings(): Record<BuildingId, BuildingInfo> {
  const result = {} as Record<BuildingId, BuildingInfo>;
  for (const id of ['3#', '4#', '5#', '6#'] as BuildingId[]) {
    const b = OFFICIAL_BASIC[id];
    const units = DATA.buildings[id].units;
    // 楼层去重 + 排序（天面/屋面排末尾）
    const numericFloors = new Set<number>();
    const specialFloors: string[] = [];
    for (const u of units) {
      const f = u.floorLabel;
      if (/^-?\d+$/.test(f)) numericFloors.add(Number(f));
      else if (!specialFloors.includes(f)) specialFloors.push(f);
    }
    const floors = [...numericFloors].sort((a, b) => a - b).map(String).concat(...specialFloors);
    result[id] = {
      id,
      ...b,
      floors,
      floorMax: floors.length,
      officialUrl: officialProjectUrl(b.sProjectId),
      xkbUrl: officialXkbUrl(b.sProjectId, b.preSellNo),
    };
  }
  return result;
}

export const BUILDINGS: Record<BuildingId, BuildingInfo> = buildBuildings();

// 构建所有单元（住宅 + 配套）
export const UNITS: UnitInfo[] = (() => {
  const list: UnitInfo[] = [];
  for (const id of ['3#', '4#', '5#', '6#'] as BuildingId[]) {
    const b = BUILDINGS[id];
    for (const u of DATA.buildings[id].units) {
      list.push({
        unitId: u.unitId,
        unitNum: u.unitNum,
        floor: u.floorLabel,
        buildingId: id,
        buildingName: b.name,
        sProjectId: b.sProjectId,
        preSellNo: b.preSellNo,
        isResidential: u.isResidential,
        houseFunction: u.houseFunction,
        buildingArea: u.buildingArea,
        usableArea: u.usableArea,
        layout: u.layout,
        pledgeStatus: u.pledgeStatus,
        pledgeDesc: u.pledgeDesc,
        closed: u.closed,
        preSellStatus: u.preSellStatus,
        pactStatus: u.pactStatus,
        status: u.status,
        statusKey: u.statusKey as UnitInfo['statusKey'],
        officialUnitUrl: `${b.xkbUrl}#unit-${u.unitNum}-${u.floor}`,
      });
    }
  }
  return list;
})();

export function unitsOfBuilding(id: BuildingId): UnitInfo[] {
  return UNITS.filter((u) => u.buildingId === id);
}

export function residentialUnits(id: BuildingId): UnitInfo[] {
  return unitsOfBuilding(id).filter((u) => u.isResidential);
}

// 销控状态标签 / 颜色（全局统一）
export const STATUS_META: Record<UnitInfo['statusKey'], { label: string; desc: string; bg: string; text: string; ring: string }> = {
  presale:    { label: '预售可售', desc: '已取得预售许可且未被认购/签约/备案，可直接认购', bg: 'bg-emerald-500', text: 'text-emerald-50', ring: 'ring-emerald-400' },
  subscribed: { label: '已认购',   desc: '已签订认购书、待网签', bg: 'bg-amber-500', text: 'text-amber-50', ring: 'ring-amber-400' },
  contracted: { label: '已签约',   desc: '已网签商品房买卖合同', bg: 'bg-sky-500', text: 'text-sky-50', ring: 'ring-sky-400' },
  registered: { label: '已备案',   desc: '合同已在住建部门完成备案登记', bg: 'bg-indigo-500', text: 'text-indigo-50', ring: 'ring-indigo-400' },
  mortgaged:  { label: '抵押中',   desc: '该单元处于在建工程抵押状态，暂不可销售', bg: 'bg-rose-500', text: 'text-rose-50', ring: 'ring-rose-400' },
  restricted: { label: '查封/不可售', desc: '司法查封或不可对外销售', bg: 'bg-zinc-600', text: 'text-zinc-100', ring: 'ring-zinc-400' },
  other:      { label: '非住宅',    desc: '配套用房（电房/车库/阁楼等），不计入住宅销控', bg: 'bg-slate-700', text: 'text-slate-300', ring: 'ring-slate-500' },
};

// 户型赏析（对应需求 85/115/129/143 四档；面积与真实楼层户型对应）
export const LAYOUT_PLANS: LayoutPlan[] = [
  {
    id: 'A1', name: 'A1 精致三房', title: '85㎡ 3房2厅2卫',
    buildings: '3# / 4#', rooms: '3室2厅2卫', area: 85, usableArea: 66.3, usableAreaRatio: 0.78,
    orientation: '南向采光', priceRange: 48000,
    features: ['S 墙收纳体系', 'LDK 一元化客餐厅', '南北双面采光', '主卧独立套房'],
    description: '紧凑实用三房，餐客厅面宽约 3.6 米衔接景观阳台，全屋飘窗设计，3#/4# 主力上车户型。',
  },
  {
    id: 'B1', name: 'B1 舒适四房', title: '115㎡ 4房2厅2卫',
    buildings: '3# / 4# / 6#', rooms: '4室2厅2卫', area: 115, usableArea: 90.3, usableAreaRatio: 0.785,
    orientation: '南北通透', priceRange: 51000,
    features: ['全景双阳台', '多功能第四房', '双次卧全明', '独立玄关收纳'],
    description: '一步到位改善四房，南北双向对流，独立玄关系统，多出现在 3#/4#/6# 中高楼层。',
  },
  {
    id: 'C1', name: 'C1 尊享楼王', title: '129㎡ 4房2厅2卫',
    buildings: '5# / 6#', rooms: '4室2厅2卫', area: 129, usableArea: 100.5, usableAreaRatio: 0.779,
    orientation: '东南楼王', priceRange: 54000,
    features: ['约 7 米横厅巨幕', '星级双套房', '专梯入户玄关', '转角阔景阳台'],
    description: '经典楼王户型，大面宽横厅与无界阳台融为一体，5#/6# 主推改善大四房，园林景观尽收眼底。',
  },
  {
    id: 'D1', name: 'D1 奢阔大平层', title: '143㎡ 4房2厅3卫',
    buildings: '6#', rooms: '4室2厅3卫', area: 143, usableArea: 148.55, usableAreaRatio: 0.80,
    orientation: '正南朝向', priceRange: 56000,
    features: ['双主卧全套房', '中西双厨岛台', '私家独立电梯厅', '270° 阔景视野'],
    description: '6# 顶层复式奢阔大平层作品，独立私享电梯厅、中西双厨与奢华双主卧套房，尽显尊贵气度。',
  },
];

// 全项目汇总
export function projectSummary() {
  const residential = UNITS.filter((u) => u.isResidential);
  const sold = residential.filter((u) =>
    ['registered', 'contracted', 'subscribed'].includes(u.statusKey));
  const available = residential.filter((u) => u.statusKey === 'presale');
  const mortgaged = residential.filter((u) => u.statusKey === 'mortgaged');
  return {
    totalUnits: residential.length,
    sold: sold.length,
    available: available.length,
    mortgaged: mortgaged.length,
    soldRate: Math.round((sold.length / residential.length) * 1000) / 10,
    buildings: 4,
  };
}
