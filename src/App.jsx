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
import EstimateLineDrawer from "./components/EstimateLineDrawer";
import EstimateItemsPage from "./pages/EstimateItemsPage";
import LaborLocationsPage from "./pages/LaborLocationsPage";


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

  laborBuildUp: {
  crewType: "",
  crewRate: 0,
  productionRate: 0,
  productionUnit: "SF/day",
  markupPercent: 0,
},
  materialBuildUp: {
  materialDescription: "",
  materialUnit: "CY",
  conversionFactor: 0,
  wastePercent: 0,
  unitCost: 0,
  taxPercent: 0,
  markupPercent: 0,
},
equipmentBuildUp: {
  equipmentDescription: "",
  quantity: 1,
  hours: 0,
  hourlyRate: 0,
  standbyHours: 0,
  standbyRate: 0,
  markupPercent: 0,
},
  subcontractBuildUp: [],
  otherBuildUp: [],
  subcontractorProposals: [],
};
const starterCostItems = [
  {
    id: 1,
    description: "Fine grading / compaction labor",
    category: "Labor",
    unit: "HR",
    trade: "Earthwork",
    costCode: "312000",
    defaultUnitCost: 85,
    productivity: "",
  },
  {
    id: 2,
    description: "Skid steer / compact equipment",
    category: "Equipment",
    unit: "HR",
    trade: "Earthwork",
    costCode: "312000",
    defaultUnitCost: 95,
    productivity: "",
  },
  {
    id: 3,
    description: "Ready-mix concrete",
    category: "Material",
    unit: "CY",
    trade: "Concrete",
    costCode: "033000",
    defaultUnitCost: 165,
    productivity: "",
  },
];
const starterLocations = [
  {
    id: 1,
    name: "Raleigh, NC",
    city: "Raleigh",
    state: "NC",
    county: "Wake",
    zip: "",
    region: "Southeast",
    laborMarket: "Raleigh-Durham",
    country: "USA",
    active: true,
  },
  {
    id: 2,
    name: "Grand Portage, MN",
    city: "Grand Portage",
    state: "MN",
    county: "Cook",
    zip: "",
    region: "Upper Midwest",
    laborMarket: "Northeast Minnesota",
    country: "USA",
    active: true,
  },
  {
    id: 3,
    name: "Dunseith, ND",
    city: "Dunseith",
    state: "ND",
    county: "Rolette",
    zip: "",
    region: "Upper Midwest",
    laborMarket: "North Central North Dakota",
    country: "USA",
    active: true,
  },
];
function App() {
  const [activePage, setActivePage] = useState("Estimate");
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [locations, setLocations] = useState(() => {
  const saved = localStorage.getItem("estimateos_locations");
  return saved ? JSON.parse(saved) : starterLocations;
});

  const [assemblies, setAssemblies] = useState(() => {
    const saved = localStorage.getItem("estimateos_assemblies");
    return saved ? JSON.parse(saved) : [];
  });
  const [costItems, setCostItems] = useState(() => {
  const saved = localStorage.getItem("estimateos_cost_items");
  return saved ? JSON.parse(saved) : starterCostItems;
});

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
          laborBuildUp: {
            crewType: "Concrete Place/Finish Crew",
            crewRate: 425,
            productionRate: 850,
            productionUnit: "SF/hour",
            markupPercent: 35,
          },
          laborTotal: 25000,
          materialBuildUp: {
            materialDescription: "4,000 PSI Concrete",
            materialUnit: "CY",
            conversionFactor: 0.01235,
            wastePercent: 5,
            unitCost: 165,
            taxPercent: 7,
            markupPercent: 10,
          },
          equipmentTotal: 5000,
        },
      ];
});
    

  

  useEffect(() => {
    localStorage.setItem("estimateos_lines", JSON.stringify(estimateLines));
  }, [estimateLines]);
  useEffect(() => {
  localStorage.setItem(
    "estimateos_assemblies",
    JSON.stringify(assemblies)
  );
}, [assemblies]);
useEffect(() => {
  localStorage.setItem(
    "estimateos_cost_items",
    JSON.stringify(costItems)
  );
}, [costItems]);
useEffect(() => {
  localStorage.setItem(
    "estimateos_locations",
    JSON.stringify(locations)
  );
}, [locations]);

  function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
  function addLine() {
    setEstimateLines([...estimateLines, { ...blankLine, id: Date.now() }]);
  }
  function addAssembly() {
  const assembly = {
    ...blankLine,
    id: Date.now(),
    description: "New Assembly",
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };

  setAssemblies([...assemblies, assembly]);
}
function updateAssembly(id, field, value) {
  setAssemblies(
    assemblies.map((assembly) =>
      assembly.id === id
        ? {
            ...assembly,
            [field]: value,
            modified: new Date().toISOString(),
          }
        : assembly
    )
  );
}
function updateSelectedAssembly(id, field, value) {
  const updatedAssemblies = assemblies.map((assembly) =>
    assembly.id === id
      ? {
          ...assembly,
          [field]:
            field.includes("Total") || field === "quantity"
              ? Number(value)
              : value,
          modified: new Date().toISOString(),
        }
      : assembly
  );

  setAssemblies(updatedAssemblies);

  const updatedAssembly = updatedAssemblies.find((a) => a.id === id);
  if (updatedAssembly) setSelectedAssembly(updatedAssembly);
}
function deleteAssembly(id) {
  setAssemblies(
    assemblies.filter((assembly) => assembly.id !== id)
  );
}
function duplicateAssembly(id) {
  const original = assemblies.find((a) => a.id === id);

  if (!original) return;

  const copy = {
    ...structuredClone(original),
    id: Date.now(),
    description: `${original.description} Copy`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };

  setAssemblies([...assemblies, copy]);
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
function updateLaborBuildUp(id, field, value) {
  setEstimateLines(
    estimateLines.map((line) => {
      if (line.id !== id) return line;

      const updatedLaborBuildUp = {
        ...(line.laborBuildUp || {}),
        [field]:
          field === "crewType" || field === "productionUnit"
            ? value
            : Number(value),
      };

      const quantity = Number(line.quantity || 0);
      const crewRate = Number(updatedLaborBuildUp.crewRate || 0);
      const productionRate = Number(updatedLaborBuildUp.productionRate || 0);
      const markupPercent = Number(updatedLaborBuildUp.markupPercent || 0);

      const hours = productionRate > 0 ? quantity / productionRate : 0;
      const baseLabor = hours * crewRate;
      const laborTotal = baseLabor * (1 + markupPercent / 100);

      const updatedLine = {
        ...line,
        laborBuildUp: updatedLaborBuildUp,
        laborTotal: Math.round(laborTotal),
      };

      if (selectedLine?.id === id) {
        setSelectedLine(updatedLine);
      }

      return updatedLine;
    })
  );
}

function updateMaterialBuildUp(id, field, value) {
  setEstimateLines(
    estimateLines.map((line) => {
      if (line.id !== id) return line;
      function evaluateFormula(value) {
  if (typeof value === "number") return value;

  const safeValue = String(value).replace(/[^0-9+\-*/().\s]/g, "");

  try {
    const result = Function(`"use strict"; return (${safeValue})`)();
    return Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

      const updatedMaterialBuildUp = {
        ...(line.materialBuildUp || {}),
        [field]:
  field === "materialDescription" ||
  field === "materialUnit" ||
  field === "conversionFactor"
    ? value
    : Number(value),
      };

      const quantity = Number(line.quantity || 0);
      const conversionFactor = evaluateFormula(
  updatedMaterialBuildUp.conversionFactor || 0
);
      const wastePercent = Number(updatedMaterialBuildUp.wastePercent || 0);
      const unitCost = Number(updatedMaterialBuildUp.unitCost || 0);
      const taxPercent = Number(updatedMaterialBuildUp.taxPercent || 0);
      const markupPercent = Number(updatedMaterialBuildUp.markupPercent || 0);

      const materialQuantity =
        quantity * conversionFactor * (1 + wastePercent / 100);

      const baseMaterial = materialQuantity * unitCost;
      const materialWithTax = baseMaterial * (1 + taxPercent / 100);
      const materialTotal = materialWithTax * (1 + markupPercent / 100);

      const updatedLine = {
        ...line,
        materialBuildUp: updatedMaterialBuildUp,
        materialTotal: Math.round(materialTotal),
      };

      if (selectedLine?.id === id) {
        setSelectedLine(updatedLine);
      }

      return updatedLine;
    })
  );
}
function updateEquipmentBuildUp(id, field, value) {
  setEstimateLines(
    estimateLines.map((line) => {
      if (line.id !== id) return line;

      const updatedEquipmentBuildUp = {
        ...(line.equipmentBuildUp || {}),
        [field]: field === "equipmentDescription" ? value : Number(value),
      };

      const quantity = Number(updatedEquipmentBuildUp.quantity || 0);
      const hours = Number(updatedEquipmentBuildUp.hours || 0);
      const hourlyRate = Number(updatedEquipmentBuildUp.hourlyRate || 0);
      const standbyHours = Number(updatedEquipmentBuildUp.standbyHours || 0);
      const standbyRate = Number(updatedEquipmentBuildUp.standbyRate || 0);
      const markupPercent = Number(updatedEquipmentBuildUp.markupPercent || 0);

      const operatingCost = quantity * hours * hourlyRate;
      const standbyCost = quantity * standbyHours * standbyRate;
      const equipmentTotal =
        (operatingCost + standbyCost) * (1 + markupPercent / 100);

      const updatedLine = {
        ...line,
        equipmentBuildUp: updatedEquipmentBuildUp,
        equipmentTotal: Math.round(equipmentTotal),
      };

      if (selectedLine?.id === id) {
        setSelectedLine(updatedLine);
      }

      return updatedLine;
    })
  );
}
function updateAssemblyLaborBuildUp(id, field, value) {
  updateAssemblyBuildUp(id, "laborBuildUp", field, value);
}

function updateAssemblyMaterialBuildUp(id, field, value) {
  updateAssemblyBuildUp(id, "materialBuildUp", field, value);
}

function updateAssemblyEquipmentBuildUp(id, field, value) {
  updateAssemblyBuildUp(id, "equipmentBuildUp", field, value);
}

function updateAssemblyBuildUp(id, buildUpKey, field, value) {
  const updatedAssemblies = assemblies.map((assembly) => {
    if (assembly.id !== id) return assembly;

    const updatedBuildUp = {
      ...(assembly[buildUpKey] || {}),
      [field]:
        field.includes("Description") ||
        field === "crewType" ||
        field === "productionUnit" ||
        field === "materialUnit" ||
        field === "conversionFactor"
          ? value
          : Number(value),
    };

    let totals = {};

    if (buildUpKey === "laborBuildUp") {
      const quantity = Number(assembly.quantity || 0);
      const crewRate = Number(updatedBuildUp.crewRate || 0);
      const productionRate = Number(updatedBuildUp.productionRate || 0);
      const markupPercent = Number(updatedBuildUp.markupPercent || 0);

      const hours = productionRate > 0 ? quantity / productionRate : 0;
      totals.laborTotal = Math.round(hours * crewRate * (1 + markupPercent / 100));
    }

    if (buildUpKey === "materialBuildUp") {
      const quantity = Number(assembly.quantity || 0);
      const conversionFactor = Number(updatedBuildUp.conversionFactor || 0);
      const wastePercent = Number(updatedBuildUp.wastePercent || 0);
      const unitCost = Number(updatedBuildUp.unitCost || 0);
      const taxPercent = Number(updatedBuildUp.taxPercent || 0);
      const markupPercent = Number(updatedBuildUp.markupPercent || 0);

      const materialQty = quantity * conversionFactor * (1 + wastePercent / 100);
      const baseMaterial = materialQty * unitCost;
      totals.materialTotal = Math.round(
        baseMaterial * (1 + taxPercent / 100) * (1 + markupPercent / 100)
      );
    }

    if (buildUpKey === "equipmentBuildUp") {
      const quantity = Number(updatedBuildUp.quantity || 0);
      const hours = Number(updatedBuildUp.hours || 0);
      const hourlyRate = Number(updatedBuildUp.hourlyRate || 0);
      const standbyHours = Number(updatedBuildUp.standbyHours || 0);
      const standbyRate = Number(updatedBuildUp.standbyRate || 0);
      const markupPercent = Number(updatedBuildUp.markupPercent || 0);

      const operatingCost = quantity * hours * hourlyRate;
      const standbyCost = quantity * standbyHours * standbyRate;

      totals.equipmentTotal = Math.round(
        (operatingCost + standbyCost) * (1 + markupPercent / 100)
      );
    }

    return {
      ...assembly,
      [buildUpKey]: updatedBuildUp,
      ...totals,
      modified: new Date().toISOString(),
    };
  });

  setAssemblies(updatedAssemblies);

  const updatedAssembly = updatedAssemblies.find((a) => a.id === id);
  if (updatedAssembly) setSelectedAssembly(updatedAssembly);
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
    if (activePage === "Assemblies")
  return (
    <AssembliesPage
      assemblies={assemblies}
      addAssembly={addAssembly}
      updateAssembly={updateAssembly}
      deleteAssembly={deleteAssembly}
      duplicateAssembly={duplicateAssembly}
      setSelectedAssembly={setSelectedAssembly}
    />
  );
    if (activePage === "Takeoff") return <TakeoffPage />;
    if (activePage === "Bid Leveling") return <BidLevelingPage />;
    if (activePage === "Procurement") return <ProcurementPage />;
    if (activePage === "Reports") return <ReportsPage />;
    if (activePage === "Settings") return <SettingsPage />;
    if (activePage === "Estimate Items")
  return (
    <EstimateItemsPage
      costItems={costItems}
      setCostItems={setCostItems}
    />
  );
  if (activePage === "Labor Locations")
  return (
    <LaborLocationsPage
      locations={locations}
      setLocations={setLocations}
    />
  );

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
  formatNumber={formatNumber}
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
        {selectedLine && (
  <EstimateLineDrawer
    selectedLine={selectedLine}
    setSelectedLine={setSelectedLine}
    updateLine={updateLine}
    updateLaborBuildUp={updateLaborBuildUp}
    updateMaterialBuildUp={updateMaterialBuildUp}
    updateEquipmentBuildUp={updateEquipmentBuildUp}
    formatCurrency={formatCurrency}
    mode="estimate"
  />
)}

{selectedAssembly && (
  <EstimateLineDrawer
    selectedLine={selectedAssembly}
    setSelectedLine={setSelectedAssembly}
    updateLine={updateSelectedAssembly}
    updateLaborBuildUp={updateAssemblyLaborBuildUp}
    updateMaterialBuildUp={updateAssemblyMaterialBuildUp}
    updateEquipmentBuildUp={updateAssemblyEquipmentBuildUp}
    formatCurrency={formatCurrency}
    mode="assembly"
  />
)}
      </main>

      
    </div>
  );
}

export default App;