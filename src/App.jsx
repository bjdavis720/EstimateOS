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
const starterResources = [
  {
    id: 1,
    resourceType: "Labor",
    name: "Carpenter",
    classification: "Journeyman",
    trade: "Carpentry",
    unit: "HR",
    active: true,
    notes: "",
  },
  {
    id: 2,
    resourceType: "Labor",
    name: "Laborer",
    classification: "General",
    trade: "Laborers",
    unit: "HR",
    active: true,
    notes: "",
  },
  {
    id: 3,
    resourceType: "Labor",
    name: "Equipment Operator",
    classification: "Skid Steer",
    trade: "Operating Engineers",
    unit: "HR",
    active: true,
    notes: "",
  },
];
const starterCrews = [
  {
    id: 1,
    name: "Concrete Form Crew",
    trade: "Concrete",
    unit: "HR",
    locationId: 1,
    effectiveDate: new Date().toISOString().slice(0, 10),
    productionRate: 0,
    productionUnit: "LF/HR",
    shiftHours: 8,
    availableCrewCount: 1,
    members: [],
    notes: "",
    active: true,
  },
];
function createBlankAssembly() {
  const timestamp = new Date().toISOString();

  return {
    id: Date.now(),
    description: "New Assembly",
    unit: "EA",

    masterFormat: "",
    uniformat: "",
    system: "",
    trade: "",
    costCode: "",
    bidPackage: "",
    phase: "",

    crewId: "",
    crewMarkupPercent: 0,

    productionRate: 0,
    productionUnit: "EA/HR",

    materials: [],
    additionalEquipment: [],
    subcontractItems: [],
    otherItems: [],

    laborCostPerUnit: 0,
    materialCostPerUnit: 0,
    equipmentCostPerUnit: 0,
    subcontractCostPerUnit: 0,
    otherCostPerUnit: 0,
    totalCostPerUnit: 0,

    created: timestamp,
    modified: timestamp,
  };
}

function migrateLegacyAssembly(assembly) {
  const legacyMaterial =
    assembly.materialBuildUp || {};

  const legacyEquipment =
    assembly.equipmentBuildUp || {};

  const hasLegacyMaterial =
    legacyMaterial.materialDescription ||
    Number(legacyMaterial.unitCost || 0) !== 0 ||
    Number(legacyMaterial.conversionFactor || 0) !==
      0;

  const hasLegacyEquipment =
    legacyEquipment.equipmentDescription ||
    Number(legacyEquipment.hourlyRate || 0) !== 0 ||
    Number(legacyEquipment.hours || 0) !== 0;

  const migratedMaterials =
    Array.isArray(assembly.materials)
      ? assembly.materials
      : hasLegacyMaterial
        ? [
            {
              id: Date.now() + 1,
              description:
                legacyMaterial.materialDescription ||
                "",
              unit:
                legacyMaterial.materialUnit || "EA",
              quantityPerUnit:
                legacyMaterial.conversionFactor || 0,
              wastePercent:
                legacyMaterial.wastePercent || 0,
              unitCost:
                legacyMaterial.unitCost || 0,
              taxPercent:
                legacyMaterial.taxPercent || 0,
              markupPercent:
                legacyMaterial.markupPercent || 0,
            },
          ]
        : [];

  const migratedEquipment =
    Array.isArray(assembly.additionalEquipment)
      ? assembly.additionalEquipment
      : hasLegacyEquipment
        ? [
            {
              id: Date.now() + 2,
              description:
                legacyEquipment.equipmentDescription ||
                "",
              quantity:
                legacyEquipment.quantity || 1,
              hoursPerUnit:
                legacyEquipment.hours || 0,
              hourlyRate:
                legacyEquipment.hourlyRate || 0,
              standbyHoursPerUnit:
                legacyEquipment.standbyHours || 0,
              standbyRate:
                legacyEquipment.standbyRate || 0,
              markupPercent:
                legacyEquipment.markupPercent || 0,
            },
          ]
        : [];

  return {
    ...createBlankAssembly(),
    ...assembly,

    id: assembly.id || Date.now(),

    crewId:
      assembly.crewId ??
      assembly.laborBuildUp?.crewId ??
      "",

    crewMarkupPercent:
      assembly.crewMarkupPercent ??
      assembly.laborBuildUp?.markupPercent ??
      0,

    productionRate:
      assembly.productionRate ??
      assembly.laborBuildUp?.productionRate ??
      0,

    productionUnit:
      assembly.productionUnit ??
      assembly.laborBuildUp?.productionUnit ??
      "EA/HR",

    materials: migratedMaterials,

    additionalEquipment: migratedEquipment,

    subcontractItems:
      assembly.subcontractItems ||
      assembly.subcontractBuildUp ||
      [],

    otherItems:
      assembly.otherItems ||
      assembly.otherBuildUp ||
      [],

    created:
      assembly.created ||
      new Date().toISOString(),

    modified:
      assembly.modified ||
      new Date().toISOString(),
  };
}
function App() {
  const [activePage, setActivePage] = useState("Estimate");
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [locations, setLocations] = useState(() => {
  const saved = localStorage.getItem("estimateos_locations");
  return saved ? JSON.parse(saved) : starterLocations;
});

  const [assemblies, setAssemblies] = useState(
  () => {
    const saved = localStorage.getItem(
      "estimateos_assemblies"
    );

    if (!saved) return [];

    try {
      const parsedAssemblies =
        JSON.parse(saved);

      return parsedAssemblies.map(
        migrateLegacyAssembly
      );
    } catch (error) {
      console.error(
        "Unable to read EstimateOS assemblies:",
        error
      );

      return [];
    }
  }
);
  const [costItems, setCostItems] = useState(() => {
  const saved = localStorage.getItem("estimateos_cost_items");
  return saved ? JSON.parse(saved) : starterCostItems;
});
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
    : starterCrews;

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
useEffect(() => {
  localStorage.setItem(
    "estimateos_resources",
    JSON.stringify(resources)
  );
}, [resources]);
useEffect(() => {
  localStorage.setItem(
    "estimateos_crews",
    JSON.stringify(crews)
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

  function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
  function addLine() {
    setEstimateLines([...estimateLines, { ...blankLine, id: Date.now() }]);
  }
  function addAssembly() {
  const newAssembly = createBlankAssembly();

  setAssemblies((currentAssemblies) => [
    ...currentAssemblies,
    newAssembly,
  ]);

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

  function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString()}`;
  }

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