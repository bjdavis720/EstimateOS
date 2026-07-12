export function createBlankEstimateLine() {
  return {
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

    crewLaborTotal: 0,
    crewEquipmentTotal: 0,

    laborBuildUp: {
      crewId: "",
      crewType: "",
      crewRate: 0,
      productionRate: 0,
      productionUnit: "SF/DAY",
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
      calculatedTotal: 0,
    },

    subcontractBuildUp: [],
    otherBuildUp: [],
    subcontractorProposals: [],
  };
}

export function createBlankAssembly() {
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

export function migrateLegacyAssembly(assembly) {
  const legacyMaterial =
    assembly.materialBuildUp || {};

  const legacyEquipment =
    assembly.equipmentBuildUp || {};

  const hasLegacyMaterial =
    legacyMaterial.materialDescription ||
    Number(legacyMaterial.unitCost || 0) !== 0 ||
    Number(
      legacyMaterial.conversionFactor || 0
    ) !== 0;

  const hasLegacyEquipment =
    legacyEquipment.equipmentDescription ||
    Number(
      legacyEquipment.hourlyRate || 0
    ) !== 0 ||
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
                legacyMaterial.conversionFactor ||
                0,
              wastePercent:
                legacyMaterial.wastePercent || 0,
              unitCost:
                legacyMaterial.unitCost || 0,
              taxPercent:
                legacyMaterial.taxPercent || 0,
              markupPercent:
                legacyMaterial.markupPercent ||
                0,
            },
          ]
        : [];

  const migratedEquipment =
    Array.isArray(
      assembly.additionalEquipment
    )
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
                legacyEquipment.markupPercent ||
                0,
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

    additionalEquipment:
      migratedEquipment,

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
