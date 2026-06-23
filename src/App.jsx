import { useEffect, useState } from "react";
import "./App.css";

import EstimateSidebar from "./components/EstimateSidebar";
import EstimatePage from "./pages/EstimatePage";
import AssembliesPage from "./pages/AssembliesPage";
import TakeoffPage from "./pages/TakeoffPage";
import BidLevelingPage from "./pages/BidLevelingPage";
import ProcurementPage from "./pages/ProcurementPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import EstimateHome from "./pages/EstimateHome";

const blankLine = {
  description: "",
  quantity: 0,
  unit: "SF",
  masterFormat: "",
  uniformat: "",
  system: "",
  wbs1: "",
  wbs2: "",
  wbs3: "",
  wbs4: "",
  location1: "",
  location2: "",
  location3: "",
  bidPackage: "",
  trade: "",
  costCode: "",
  phase: "",
  laborTotal: 0,
  materialTotal: 0,
  equipmentTotal: 0,
  subcontractTotal: 0,
  otherTotal: 0,
  laborBuildUp: [],
  materialBuildUp: [],
  equipmentBuildUp: [],
  subcontractBuildUp: [],
  otherBuildUp: [],
  subcontractorProposals: [],
};

function App() {
  const [activePage, setActivePage] = useState("Estimate");
  const [selectedLine, setSelectedLine] = useState(null);

  const [estimateLines, setEstimateLines] = useState(() => {
    const saved = localStorage.getItem("estimateos_lines");
    return saved
      ? JSON.parse(saved)
      : [
          {
            ...blankLine,
            id: 1,
            description: '4" Slab on Grade',
            quantity: 10000,
            unit: "SF",
            masterFormat: "03 30 00",
            uniformat: "B1010",
            system: "Structure",
            wbs1: "CP-2 Structure",
            location1: "Level 1",
            bidPackage: "Concrete",
            trade: "Concrete",
            costCode: "033000",
            phase: "Structure",
            laborTotal: 25000,
            materialTotal: 45000,
            equipmentTotal: 5000,
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("estimateos_lines", JSON.stringify(estimateLines));
  }, [estimateLines]);

  function addLine() {
    setEstimateLines([...estimateLines, { ...blankLine, id: Date.now() }]);
  }

  function updateLine(id, field, value) {
    setEstimateLines(
      estimateLines.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]:
                field.includes("Total") || field === "quantity"
                  ? Number(value)
                  : value,
            }
          : line
      )
    );

    if (selectedLine?.id === id) {
      setSelectedLine({
        ...selectedLine,
        [field]:
          field.includes("Total") || field === "quantity"
            ? Number(value)
            : value,
      });
    }
  }

  function getLineTotal(line) {
    return (
      Number(line.laborTotal || 0) +
      Number(line.materialTotal || 0) +
      Number(line.equipmentTotal || 0) +
      Number(line.subcontractTotal || 0) +
      Number(line.otherTotal || 0)
    );
  }

  function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString()}`;
  }

  const estimateTotal = estimateLines.reduce(
    (sum, line) => sum + getLineTotal(line),
    0
  );

  function renderPage() {
    if (activePage === "Home") return <EstimateHome />;
    if (activePage === "Assemblies") return <AssembliesPage />;
    if (activePage === "Takeoff") return <TakeoffPage />;
    if (activePage === "Bid Leveling") return <BidLevelingPage />;
    if (activePage === "Procurement") return <ProcurementPage />;
    if (activePage === "Reports") return <ReportsPage />;
    if (activePage === "Settings") return <SettingsPage />;

    return (
      <>
        <section className="summary-row">
          <div className="summary-card">
            <span>Total Estimate</span>
            <strong>{formatCurrency(estimateTotal)}</strong>
          </div>
          <div className="summary-card">
            <span>Estimate Lines</span>
            <strong>{estimateLines.length}</strong>
          </div>
        </section>

        <EstimatePage
          estimateLines={estimateLines}
          setSelectedLine={setSelectedLine}
          updateLine={updateLine}
          getLineTotal={getLineTotal}
          formatCurrency={formatCurrency}
        />
      </>
    );
  }

  return (
    <div className="app-shell">
      <EstimateSidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main">
        <header className="hero">
          <div>
            <h1>{activePage}</h1>
            <p>
              Estimate engine, cost build-ups, bid leveling, and schedule
              intelligence.
            </p>
          </div>

          {activePage === "Estimate" && (
            <button onClick={addLine}>+ Add Estimate Line</button>
          )}
        </header>

        {renderPage()}
      </main>

      {selectedLine && (
        <div className="detail-drawer">
          <div className="drawer-header">
            <h2>{selectedLine.description || "Estimate Item"}</h2>
            <button className="close-btn" onClick={() => setSelectedLine(null)}>
              X
            </button>
          </div>

          <div className="drawer-section">
            <h3>Classification</h3>
            {[
              ["MasterFormat", "masterFormat"],
              ["Uniformat", "uniformat"],
              ["System", "system"],
              ["WBS 1", "wbs1"],
              ["WBS 2", "wbs2"],
              ["WBS 3", "wbs3"],
              ["Location 1", "location1"],
              ["Location 2", "location2"],
              ["Location 3", "location3"],
            ].map(([label, field]) => (
              <label className="drawer-field" key={field}>
                <span>{label}</span>
                <input
                  value={selectedLine[field] || ""}
                  onChange={(e) =>
                    updateLine(selectedLine.id, field, e.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className="drawer-section">
            <h3>Costs</h3>
            {[
              ["Labor", "laborTotal"],
              ["Material", "materialTotal"],
              ["Equipment", "equipmentTotal"],
              ["Subcontract", "subcontractTotal"],
              ["Other", "otherTotal"],
            ].map(([label, field]) => (
              <label className="drawer-field" key={field}>
                <span>{label}</span>
                <input
                  value={selectedLine[field] || 0}
                  onChange={(e) =>
                    updateLine(selectedLine.id, field, e.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className="drawer-section">
            <h3>Procurement</h3>
            {[
              ["Bid Package", "bidPackage"],
              ["Trade", "trade"],
              ["Cost Code", "costCode"],
              ["Phase", "phase"],
            ].map(([label, field]) => (
              <label className="drawer-field" key={field}>
                <span>{label}</span>
                <input
                  value={selectedLine[field] || ""}
                  onChange={(e) =>
                    updateLine(selectedLine.id, field, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;