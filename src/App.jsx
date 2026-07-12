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
import EstimateItemsPage from "./pages/EstimateItemsPage";
import LaborLocationsPage from "./pages/LaborLocationsPage";
import ResourcesPage from "./pages/ResourcesPage";
import CrewsPage from "./pages/CrewsPage";
import {
  calculateEquipmentResourceRate,
  calculateLaborResourceRate,
  getApplicableResourceRate,
} from "./calculations/crewCalculations";
import {
  calculateEquipmentBuildUpTotal,
  calculateMaterialBuildUpTotal,
  getEstimateLineTotal,
} from "./calculations/estimateCalculations";
import {
  calculateAssemblyTotals,
} from "./calculations/assemblyCalculations";
import {
  createBlankAssembly,
  createBlankEstimateLine,
  migrateLegacyAssembly,
} from "./data/recordFactories";
import {
  createStarterCrews,
  starterCostItems,
  starterLocations,
  starterResources,
} from "./data/starterData";
import {
  readStoredJson,
  writeStoredJson,
} from "./storage/localStorage";
import {
  formatCurrency,
  formatNumber,
} from "./utils/formatting";

const blankLine =
  createBlankEstimateLine();


function App() {
  const [activePage, setActivePage] = useState("Estimate");
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [locations, setLocations] =
  useState(() =>
    readStoredJson(
      "estimateos_locations",
      starterLocations
    )
  );

  const [assemblies, setAssemblies] = useState(
  () => {
    const storedAssemblies =
  readStoredJson(
    "estimateos_assemblies",
    []
  );

return storedAssemblies.map(
  migrateLegacyAssembly
);
  }
);
  const [costItems, setCostItems] =
  useState(() =>
    readStoredJson(
      "estimateos_cost_items",
      starterCostItems
    )
  );
const [resources, setResources] = useState(() => {
  const savedResources = localStorage.getItem(
    "estimateos_resources"
  );

  if (savedResources) {
    try {
      const parsedResources = JSON.parse(savedResources);

      return parsedResources.map((resource) => ({
        ...resource,
        resourceType: resource.resourceType || "Labor",
        rates: resource.rates || [],
      }));
    } catch (error) {
      console.error(
        "Unable to read EstimateOS resources:",
        error
      );
    }
  }

  const savedWorkerTypes = localStorage.getItem(
    "estimateos_worker_types"
  );

  if (savedWorkerTypes) {
    try {
      const parsedWorkerTypes = JSON.parse(savedWorkerTypes);

      return parsedWorkerTypes.map((workerType) => ({
        ...workerType,
        resourceType: "Labor",
        rates: workerType.rates || [],
      }));
    } catch (error) {
      console.error(
        "Unable to migrate EstimateOS worker types:",
        error
      );
    }
  }

  return starterResources.map((resource) => ({
    ...resource,
    rates: resource.rates || [],
  }));
});
const [crews, setCrews] = useState(() => {
  const saved = localStorage.getItem("estimateos_crews");

 const loadedCrews = saved
  ? JSON.parse(saved)
  : createStarterCrews();

  return loadedCrews.map((crew) => ({
    ...crew,

    members: (crew.members || []).map((member) => ({
      ...member,

      // Migrate the old workerTypeId field without
      // losing existing crew assignments.
      resourceId:
        member.resourceId ??
        member.workerTypeId ??
        "",
    })),
  }));
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
  writeStoredJson(
    "estimateos_lines",
    estimateLines
  );
}, [estimateLines]);
useEffect(() => {
  writeStoredJson(
    "estimateos_assemblies",
    assemblies
  );
}, [assemblies]);

useEffect(() => {
  writeStoredJson(
    "estimateos_cost_items",
    costItems
  );
}, [costItems]);

useEffect(() => {
  writeStoredJson(
    "estimateos_locations",
    locations
  );
}, [locations]);

useEffect(() => {
  writeStoredJson(
    "estimateos_resources",
    resources
  );
}, [resources]);

useEffect(() => {
  writeStoredJson(
    "estimateos_crews",
    crews
  );
}, [crews]);
    
useEffect(() => {
  // Intentional cache refresh when crew/resource
  // master data changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setAssemblies((currentAssemblies) => {
    let changed = false;

    const recalculatedAssemblies =
      currentAssemblies.map((assembly) => {
        const recalculated =
          recalculateAssembly(assembly);

        const assemblyChanged =
          recalculated.laborCostPerUnit !==
            assembly.laborCostPerUnit ||
          recalculated.materialCostPerUnit !==
            assembly.materialCostPerUnit ||
          recalculated.equipmentCostPerUnit !==
            assembly.equipmentCostPerUnit ||
          recalculated.subcontractCostPerUnit !==
            assembly.subcontractCostPerUnit ||
          recalculated.otherCostPerUnit !==
            assembly.otherCostPerUnit ||
          recalculated.totalCostPerUnit !==
            assembly.totalCostPerUnit ||
          recalculated.productionRate !==
            assembly.productionRate ||
          recalculated.productionUnit !==
            assembly.productionUnit ||
          recalculated.crewLocationId !==
            assembly.crewLocationId ||
          recalculated.crewEffectiveDate !==
            assembly.crewEffectiveDate;

        if (assemblyChanged) {
          changed = true;
        }

        return assemblyChanged
          ? recalculated
          : assembly;
      });

    return changed
      ? recalculatedAssemblies
      : currentAssemblies;
  });
    // recalculateAssembly closes over the latest
  // crews and resources.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [crews, resources]);


useEffect(() => {
  // Intentional cache refresh when crew/resource
  // master data changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setEstimateLines((currentLines) => {
    let changed = false;

    const recalculatedLines =
      currentLines.map((line) => {
        if (!line.laborBuildUp?.crewId) {
          return line;
        }

        const recalculated =
          recalculateCrewDrivenLine(line);

        const lineChanged =
          recalculated.laborTotal !==
            line.laborTotal ||
          recalculated.equipmentTotal !==
            line.equipmentTotal ||
          recalculated.laborBuildUp?.crewRate !==
            line.laborBuildUp?.crewRate ||
          recalculated.laborBuildUp
            ?.productionRate !==
            line.laborBuildUp?.productionRate;

        if (lineChanged) {
          changed = true;
        }

        return lineChanged
          ? recalculated
          : line;
      });

    return changed
      ? recalculatedLines
      : currentLines;
  });
    // recalculateCrewDrivenLine closes over the
  // latest crews and resources.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [crews, resources]);

function addLine() {
  const newLine = {
    ...createBlankEstimateLine(),
    id: Date.now(),
  };

  setEstimateLines(
    (currentLines) => [
      ...currentLines,
      newLine,
    ]
  );

  setSelectedLine(newLine);
}
function addAssembly() {
  const newAssembly =
    createBlankAssembly();

  setAssemblies(
    (currentAssemblies) => [
      ...currentAssemblies,
      newAssembly,
    ]
  );

  setSelectedAssembly(newAssembly);
}

function updateAssemblyRecord(id, updates) {
  setAssemblies((currentAssemblies) => {
    const updatedAssemblies =
      currentAssemblies.map((assembly) => {
        if (
          String(assembly.id) !== String(id)
        ) {
          return assembly;
        }

        const updatedAssembly = {
          ...assembly,
          ...updates,
          modified: new Date().toISOString(),
        };

        return recalculateAssembly(
          updatedAssembly
        );
      });

    return updatedAssemblies;
  });
}

function deleteAssembly(id) {
  setAssemblies((currentAssemblies) =>
    currentAssemblies.filter(
      (assembly) =>
        String(assembly.id) !== String(id)
    )
  );

  if (
    String(selectedAssembly?.id) ===
    String(id)
  ) {
    setSelectedAssembly(null);
  }
}

function duplicateAssembly(id) {
  const original = assemblies.find(
    (assembly) =>
      String(assembly.id) === String(id)
  );

  if (!original) return;

  const timestamp = new Date().toISOString();

  const copy = {
    ...structuredClone(original),
    id: Date.now(),
    description: `${original.description} Copy`,
    created: timestamp,
    modified: timestamp,

    materials: (
      original.materials || []
    ).map((item, index) => ({
      ...item,
      id: Date.now() + index + 1,
    })),

    additionalEquipment: (
      original.additionalEquipment || []
    ).map((item, index) => ({
      ...item,
      id: Date.now() + index + 100,
    })),

    subcontractItems: (
      original.subcontractItems || []
    ).map((item, index) => ({
      ...item,
      id: Date.now() + index + 200,
    })),

    otherItems: (
      original.otherItems || []
    ).map((item, index) => ({
      ...item,
      id: Date.now() + index + 300,
    })),
  };

  setAssemblies((currentAssemblies) => [
    ...currentAssemblies,
    copy,
  ]);

  setSelectedAssembly(copy);
}

function updateLine(id, field, value) {
  setEstimateLines((currentLines) => {
    const updatedLines = currentLines.map((line) => {
      if (line.id !== id) return line;

      const updatedLine = {
        ...line,

        [field]:
          field.includes("Total") ||
          field === "quantity"
            ? Number(value)
            : value,
      };

      if (
        field === "quantity" &&
        updatedLine.laborBuildUp?.crewId
      ) {
        return recalculateCrewDrivenLine(
          updatedLine
        );
      }

      return updatedLine;
    });

    const updatedSelectedLine =
      updatedLines.find((line) => line.id === id);

    if (updatedSelectedLine) {
      setSelectedLine(updatedSelectedLine);
    }

    return updatedLines;
  });
}


function getCrewCostSummary(crewId) {
  const crew = crews.find(
    (item) => String(item.id) === String(crewId)
  );

  if (!crew) {
    return {
      crew: null,
      laborHourlyCost: 0,
      equipmentHourlyCost: 0,
      totalHourlyCost: 0,
    };
  }

  const summary = (crew.members || []).reduce(
    (totals, member) => {
      const resourceId =
        member.resourceId ??
        member.workerTypeId ??
        "";

      const resource = resources.find(
        (item) =>
          String(item.id) === String(resourceId)
      );

      if (!resource) return totals;

      const rate = getApplicableResourceRate(
        resource,
        crew
      );

      const resourceType =
        resource.resourceType || "Labor";

      const hourlyRate =
        resourceType === "Equipment"
          ? calculateEquipmentResourceRate(rate)
          : calculateLaborResourceRate(rate);

      const extendedRate =
        hourlyRate * Number(member.quantity || 0);

      return {
        laborHourlyCost:
          totals.laborHourlyCost +
          (resourceType === "Labor"
            ? extendedRate
            : 0),

        equipmentHourlyCost:
          totals.equipmentHourlyCost +
          (resourceType === "Equipment"
            ? extendedRate
            : 0),
      };
    },
    {
      laborHourlyCost: 0,
      equipmentHourlyCost: 0,
    }
  );

  return {
    crew,
    ...summary,
    totalHourlyCost:
      summary.laborHourlyCost +
      summary.equipmentHourlyCost,
  };
}


function recalculateAssembly(assembly) {
  const {
    crew,
    laborHourlyCost,
    equipmentHourlyCost,
  } = getCrewCostSummary(
    assembly.crewId
  );

  const totals = calculateAssemblyTotals({
    assembly,
    crew,
    laborHourlyCost,
    equipmentHourlyCost,
  });

  return {
    ...assembly,

    ...totals,

    crewLocationId:
      crew?.locationId || "",

    crewEffectiveDate:
      crew?.effectiveDate || "",
  };
}

function recalculateCrewDrivenLine(line) {
  const crewId = line.laborBuildUp?.crewId;

  const previousCrewEquipmentTotal = Number(
    line.crewEquipmentTotal || 0
  );

  const directEquipmentTotal =
    line.equipmentBuildUp?.calculatedTotal !==
    undefined
      ? Number(
          line.equipmentBuildUp.calculatedTotal || 0
        )
      : Math.max(
          0,
          Number(line.equipmentTotal || 0) -
            previousCrewEquipmentTotal
        );

  if (!crewId) {
    return {
      ...line,

      laborBuildUp: {
        ...(line.laborBuildUp || {}),
        crewId: "",
        crewType: "",
        crewRate: 0,
      },

      crewLaborTotal: 0,
      crewEquipmentTotal: 0,
      laborTotal: 0,
      equipmentTotal: directEquipmentTotal,

      equipmentBuildUp: {
        ...(line.equipmentBuildUp || {}),
        calculatedTotal: directEquipmentTotal,
      },
    };
  }

  const {
    crew,
    laborHourlyCost,
    equipmentHourlyCost,
    totalHourlyCost,
  } = getCrewCostSummary(crewId);

  if (!crew) return line;

  const quantity = Number(line.quantity || 0);

  const productionRate = Number(
    crew.productionRate || 0
  );

  const crewHours =
    productionRate > 0
      ? quantity / productionRate
      : 0;

  const markupPercent = Number(
    line.laborBuildUp?.markupPercent || 0
  );

  const markupFactor =
    1 + markupPercent / 100;

  const crewLaborTotal =
    crewHours * laborHourlyCost * markupFactor;

  const crewEquipmentTotal =
    crewHours * equipmentHourlyCost * markupFactor;

  return {
    ...line,

    laborBuildUp: {
      ...(line.laborBuildUp || {}),

      crewId: crew.id,
      crewType: crew.name,
      crewRate: totalHourlyCost,

      productionRate,
      productionUnit:
        crew.productionUnit || "EA/HR",

      crewLocationId: crew.locationId || "",
      crewEffectiveDate: crew.effectiveDate || "",
    },

    crewLaborTotal: Math.round(crewLaborTotal),

    crewEquipmentTotal: Math.round(
      crewEquipmentTotal
    ),

    laborTotal: Math.round(crewLaborTotal),

    equipmentBuildUp: {
      ...(line.equipmentBuildUp || {}),
      calculatedTotal: directEquipmentTotal,
    },

    equipmentTotal: Math.round(
      directEquipmentTotal +
        crewEquipmentTotal
    ),
  };
}
function updateLaborBuildUp(id, field, value) {
  setEstimateLines((currentLines) => {
    const updatedLines = currentLines.map((line) => {
      if (line.id !== id) return line;

      const updatedLaborBuildUp = {
        ...(line.laborBuildUp || {}),

        [field]:
          field === "crewType" ||
          field === "productionUnit"
            ? value
            : Number(value),
      };

      const quantity = Number(
        line.quantity || 0
      );

      const crewRate = Number(
        updatedLaborBuildUp.crewRate || 0
      );

      const productionRate = Number(
        updatedLaborBuildUp.productionRate || 0
      );

      const markupPercent = Number(
        updatedLaborBuildUp.markupPercent || 0
      );

      const hours =
        productionRate > 0
          ? quantity / productionRate
          : 0;

      const laborTotal =
        hours *
        crewRate *
        (1 + markupPercent / 100);

      return {
        ...line,
        laborBuildUp: updatedLaborBuildUp,
        laborTotal: Math.round(laborTotal),
      };
    });

    const updatedSelectedLine =
      updatedLines.find(
        (line) => line.id === id
      );

    if (updatedSelectedLine) {
      setSelectedLine(
        updatedSelectedLine
      );
    }

    return updatedLines;
  });
}
function updateCrewLaborBuildUp(id, field, value) {
  setEstimateLines((currentLines) => {
    const updatedLines = currentLines.map((line) => {
      if (line.id !== id) return line;

      const updatedLine = {
        ...line,

        laborBuildUp: {
          ...(line.laborBuildUp || {}),

          [field]:
            field === "markupPercent"
              ? Number(value)
              : value,
        },
      };

      return recalculateCrewDrivenLine(updatedLine);
    });

    const updatedSelectedLine =
      updatedLines.find((line) => line.id === id);

    if (updatedSelectedLine) {
      setSelectedLine(updatedSelectedLine);
    }

    return updatedLines;
  });
}

function updateMaterialBuildUp(
  id,
  field,
  value
) {
  setEstimateLines((currentLines) => {
    const updatedLines = currentLines.map(
      (line) => {
        if (line.id !== id) return line;

        const updatedMaterialBuildUp = {
          ...(line.materialBuildUp || {}),

          [field]:
            field ===
              "materialDescription" ||
            field === "materialUnit" ||
            field === "conversionFactor"
              ? value
              : Number(value),
        };

        const { materialTotal } =
          calculateMaterialBuildUpTotal(
            line.quantity,
            updatedMaterialBuildUp
          );

        return {
          ...line,
          materialBuildUp:
            updatedMaterialBuildUp,
          materialTotal:
            Math.round(materialTotal),
        };
      }
    );

    const updatedSelectedLine =
      updatedLines.find(
        (line) => line.id === id
      );

    if (updatedSelectedLine) {
      setSelectedLine(
        updatedSelectedLine
      );
    }

    return updatedLines;
  });
}
function updateEquipmentBuildUp(
  id,
  field,
  value
) {
  setEstimateLines((currentLines) => {
    const updatedLines = currentLines.map(
      (line) => {
        if (line.id !== id) return line;

        const updatedEquipmentBuildUp = {
          ...(line.equipmentBuildUp || {}),

          [field]:
            field ===
            "equipmentDescription"
              ? value
              : Number(value),
        };

        const directEquipmentTotal =
          calculateEquipmentBuildUpTotal(
            updatedEquipmentBuildUp
          );

        const crewEquipmentTotal = Number(
          line.crewEquipmentTotal || 0
        );

        return {
          ...line,

          equipmentBuildUp: {
            ...updatedEquipmentBuildUp,
            calculatedTotal:
              Math.round(
                directEquipmentTotal
              ),
          },

          equipmentTotal: Math.round(
            directEquipmentTotal +
              crewEquipmentTotal
          ),
        };
      }
    );

    const updatedSelectedLine =
      updatedLines.find(
        (line) => line.id === id
      );

    if (updatedSelectedLine) {
      setSelectedLine(
        updatedSelectedLine
      );
    }

    return updatedLines;
  });
}

  const getLineTotal =
  getEstimateLineTotal;


  const estimateTotal = estimateLines.reduce(
    (sum, line) => sum + getLineTotal(line),
    0
  );

  function renderPage() {
    if (activePage === "Home") return <EstimateHome />;
    if (activePage === "Assemblies") {
  return (
    <AssembliesPage
      assemblies={assemblies}
      crews={crews}
      resources={resources}
      locations={locations}
      selectedAssembly={selectedAssembly}
      setSelectedAssembly={
        setSelectedAssembly
      }
      addAssembly={addAssembly}
      updateAssemblyRecord={
        updateAssemblyRecord
      }
      deleteAssembly={deleteAssembly}
      duplicateAssembly={
        duplicateAssembly
      }
      getCrewCostSummary={
        getCrewCostSummary
      }
      formatCurrency={formatCurrency}
    />
  );
}
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
if (activePage === "Resources")
  return (
    <ResourcesPage
      resources={resources}
      setResources={setResources}
      locations={locations}
    />
  );
  if (activePage === "Crews")
  return (
    <CrewsPage
      crews={crews}
      setCrews={setCrews}
      resources={resources}
      locations={locations}
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
  selectedLine={selectedLine}
  setSelectedLine={setSelectedLine}
  updateLine={updateLine}
  updateLaborBuildUp={
    updateLaborBuildUp
  }
  updateCrewLaborBuildUp={
    updateCrewLaborBuildUp
  }
  updateMaterialBuildUp={
    updateMaterialBuildUp
  }
  updateEquipmentBuildUp={
    updateEquipmentBuildUp
  }
  getLineTotal={getLineTotal}
  formatCurrency={formatCurrency}
  formatNumber={formatNumber}
  crews={crews}
  resources={resources}
  locations={locations}
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

      
    </div>
  );
}

export default App;