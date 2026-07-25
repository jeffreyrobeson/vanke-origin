import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BuildingMatrix } from './components/BuildingMatrix';
import { OfficialCaptchaQuery } from './components/OfficialCaptchaQuery';
import { SalesAnalytics } from './components/SalesAnalytics';
import { FloorPlans } from './components/FloorPlans';
import { ProjectOverview } from './components/ProjectOverview';
import { MortgageCalculator } from './components/MortgageCalculator';
import { UnitDetailModal } from './components/UnitDetailModal';
import { Footer } from './components/Footer';
import { BUILDINGS } from './data/projectData';
import type { BuildingId, UnitInfo } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('matrix');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId>('3#');
  const [selectedUnit, setSelectedUnit] = useState<UnitInfo | null>(null);
  const [captchaProjectId, setCaptchaProjectId] = useState<string | undefined>(undefined);
  const [calcInitialPriceWan, setCalcInitialPriceWan] = useState<number>(430);

  const openCaptcha = (sProjectId?: string) => {
    setCaptchaProjectId(sProjectId);
    setActiveTab('query');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };
  const openCalculator = (priceWan: number) => {
    setCalcInitialPriceWan(priceWan);
    setActiveTab('calculator');
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // 从 FloorPlans "看该户型在售房源" 跳回销控
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail as BuildingId;
      if (id && (['3#', '4#', '5#', '6#'].includes(id as string))) {
        setSelectedBuilding(id as BuildingId);
        setActiveTab('matrix');
        window.scrollTo({ top: 320, behavior: 'smooth' });
      }
    };
    window.addEventListener('goto-matrix', handler);
    return () => window.removeEventListener('goto-matrix', handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <HeroBanner
        onSelectBuilding={(id) => { setSelectedBuilding(id); setActiveTab('matrix'); }}
        onOpenCaptcha={() => openCaptcha()}
        onOpenAnalytics={() => { setActiveTab('analytics'); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'matrix' && (
          <BuildingMatrix
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            onSelectUnit={setSelectedUnit}
            onOpenCaptcha={(s) => openCaptcha(s)}
          />
        )}
        {activeTab === 'query' && (
          <OfficialCaptchaQuery initialProjectId={captchaProjectId} />
        )}
        {activeTab === 'analytics' && <SalesAnalytics />}
        {activeTab === 'layouts' && <FloorPlans onOpenCalculatorWithPrice={openCalculator} />}
        {activeTab === 'overview' && <ProjectOverview />}
        {activeTab === 'calculator' && <MortgageCalculator initialTotalPriceWan={calcInitialPriceWan} />}
      </main>

      <UnitDetailModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onOpenCaptcha={(s) => openCaptcha(s)}
        onOpenCalculatorWithPrice={openCalculator}
      />

      <Footer onOpenCaptcha={() => openCaptcha()} />
    </div>
  );
}
