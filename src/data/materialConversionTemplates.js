// EstimateOS Material Conversion Templates
//
// Templates supply initial settings.
// They do not calculate quantities or prices.
// Applying a template must create an independent
// copy so estimators can customize each estimate.

export const MATERIAL_CONVERSION_TEMPLATES = [
  {
    id: "CONCRETE_SLAB",
    name: "Concrete Slab",
    description: "Area and slab thickness to volume",
    conversion: {
      mode: "GUIDED",
      method: "AREA_THICKNESS",
      takeoffUnit: "SF",
      outputUnit: "CY",
      inputs: {
        thickness: 4,
        thicknessUnit: "IN",
      },
    },
  },
  {
    id: "AGGREGATE_BASE",
    name: "Aggregate Base",
    description: "Area, thickness and density to weight",
    conversion: {
      mode: "GUIDED",
      method: "AREA_THICKNESS_DENSITY",
      takeoffUnit: "SF",
      outputUnit: "TON",
      inputs: {
        thickness: 6,
        thicknessUnit: "IN",
        density: "",
        densityUnit: "TON/CY",
      },
    },
  },
  {
    id: "ASPHALT_PAVING",
    name: "Asphalt Paving",
    description: "Area, thickness and density to weight",
    conversion: {
      mode: "GUIDED",
      method: "AREA_THICKNESS_DENSITY",
      takeoffUnit: "SF",
      outputUnit: "TON",
      inputs: {
        thickness: 2,
        thicknessUnit: "IN",
        density: "",
        densityUnit: "TON/CY",
      },
    },
  },
];

export function getMaterialConversionTemplate(id) {
  return (
    MATERIAL_CONVERSION_TEMPLATES.find(
      (template) => template.id === id
    ) || null
  );
}

export function createConversionFromTemplate(id) {
  const template = getMaterialConversionTemplate(id);

  if (!template) {
    return null;
  }

  return {
    ...template.conversion,
    inputs: {
      ...template.conversion.inputs,
    },
  };
}