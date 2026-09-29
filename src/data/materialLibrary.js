
import {
  createConversionFromTemplate,
} from "./materialConversionTemplates.js";

// Initial material definitions.
// Prices and densities are deliberately not assumed.
export const STARTER_MATERIALS = [
  {
    id: "MAT-CONCRETE-001",
    code: "03-3000-001",
    name: "Ready-Mix Concrete",
    category: "Concrete",
    description: "",
    purchaseUnit: "CY",
    conversionTemplateId: "CONCRETE_SLAB",
  },
  {
    id: "MAT-AGGREGATE-001",
    code: "31-2000-001",
    name: "Aggregate Base",
    category: "Earthwork",
    description: "",
    purchaseUnit: "TON",
    conversionTemplateId: "AGGREGATE_BASE",
  },
  {
    id: "MAT-ASPHALT-001",
    code: "32-1200-001",
    name: "Asphalt Paving",
    category: "Paving",
    description: "",
    purchaseUnit: "TON",
    conversionTemplateId: "ASPHALT_PAVING",
  },
];

// Generate an independent material record.
export function createMaterial(overrides = {}) {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    code: "",
    name: "",
    category: "",
    description: "",
    purchaseUnit: "",
    conversionTemplateId: "",
    defaultConversion: null,
    referenceUnitCost: 0,
    pricingLocation: "",
    pricingDate: "",
    pricingSource: "",
    isActive: true,
    created: timestamp,
    modified: timestamp,
    ...overrides,
  };
}

// Convert a starter definition into a complete
// independent library record.
export function createStarterMaterials() {
  return STARTER_MATERIALS.map((material) =>
    createMaterial({
      ...material,
      defaultConversion:
        createConversionFromTemplate(
          material.conversionTemplateId
        ),
    })
  );
}

// Create an estimate-specific copy of a library
// material without sharing nested objects.
export function createEstimateMaterialSnapshot(material) {
  const baseline = {
    materialDescription: material.name,
    materialUnit: material.purchaseUnit,
    conversion: material.defaultConversion
      ? structuredClone(material.defaultConversion)
      : null,
    unitCost: material.referenceUnitCost ?? 0,
  };

  return {
    materialId: material.id,

    // Preserve the original library values.
    libraryBaseline: structuredClone(baseline),

    // Editable estimate-specific values.
    ...baseline,
    conversion: baseline.conversion
      ? structuredClone(baseline.conversion)
      : null,

    // Independent estimate settings.
    wastePercent: 0,
    taxPercent: 0,
    markupPercent: 0,
  };
}
