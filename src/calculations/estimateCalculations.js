export function evaluateFormula(value) {
  if (typeof value === "number") {
    return value;
  }

  const safeValue = String(value).replace(
    /[^0-9+\-*/().\s]/g,
    ""
  );

  if (!safeValue.trim()) {
    return 0;
  }

  try {
    const result = Function(
      `"use strict"; return (${safeValue})`
    )();

    return Number.isFinite(result)
      ? result
      : 0;
  } catch {
    return 0;
  }
}

export function calculateMaterialBuildUpTotal(
  estimateQuantity,
  materialBuildUp
) {
  const quantity = Number(
    estimateQuantity || 0
  );

  const conversionFactor = evaluateFormula(
    materialBuildUp?.conversionFactor || 0
  );

  const wastePercent = Number(
    materialBuildUp?.wastePercent || 0
  );

  const unitCost = Number(
    materialBuildUp?.unitCost || 0
  );

  const taxPercent = Number(
    materialBuildUp?.taxPercent || 0
  );

  const markupPercent = Number(
    materialBuildUp?.markupPercent || 0
  );

  const materialQuantity =
    quantity *
    conversionFactor *
    (1 + wastePercent / 100);

  const baseMaterial =
    materialQuantity * unitCost;

  const materialWithTax =
    baseMaterial *
    (1 + taxPercent / 100);

  const materialTotal =
    materialWithTax *
    (1 + markupPercent / 100);

  return {
    materialQuantity,
    materialTotal,
  };
}

export function calculateEquipmentBuildUpTotal(
  equipmentBuildUp
) {
  const quantity = Number(
    equipmentBuildUp?.quantity || 0
  );

  const hours = Number(
    equipmentBuildUp?.hours || 0
  );

  const hourlyRate = Number(
    equipmentBuildUp?.hourlyRate || 0
  );

  const standbyHours = Number(
    equipmentBuildUp?.standbyHours || 0
  );

  const standbyRate = Number(
    equipmentBuildUp?.standbyRate || 0
  );

  const markupPercent = Number(
    equipmentBuildUp?.markupPercent || 0
  );

  const operatingCost =
    quantity * hours * hourlyRate;

  const standbyCost =
    quantity *
    standbyHours *
    standbyRate;

  return (
    operatingCost + standbyCost
  ) * (1 + markupPercent / 100);
}

export function getEstimateLineTotal(line) {
  return (
    Number(line?.laborTotal || 0) +
    Number(line?.materialTotal || 0) +
    Number(line?.equipmentTotal || 0) +
    Number(line?.subcontractTotal || 0) +
    Number(line?.otherTotal || 0)
  );
}
