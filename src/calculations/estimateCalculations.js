import {
  evaluateFormula,
  evaluateFormulaResult,
} from "../utils/evaluateFormula";

import {
  calculateGuidedQuantity,
} from "./quantityConversions";

export function calculateMaterialBuildUpTotal(
  estimateQuantity,
  materialBuildUp
) {
  const quantity = Number(
    estimateQuantity || 0
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

  const conversion = materialBuildUp?.conversion;

 let enteredConversion;
let calculatedConversion = 0;
let conversionIsValid;
let conversionError;
let materialQuantity = 0;
let netMaterialQuantity = 0;

  if (conversion?.mode === "GUIDED") {
    const result = calculateGuidedQuantity({
      method: conversion.method,
      takeoffQuantity: quantity,
      takeoffUnit: conversion.takeoffUnit,
      inputs: conversion.inputs || {},
      outputUnit: conversion.outputUnit,
      wastePercent,
    });

    conversionIsValid = result.isValid;
    conversionError = result.error;

    if (result.isValid) {
      calculatedConversion =
        result.conversionFactor;

      netMaterialQuantity =
        result.netQuantity;

      materialQuantity =
        result.purchaseQuantity;
    }

    enteredConversion =
      conversion.method || "";
  } else {
    // Preserve existing estimates and
    // existing custom formula behavior.

    const conversionInput =
      materialBuildUp?.conversionFormula !==
        undefined &&
      materialBuildUp?.conversionFormula !==
        null &&
      materialBuildUp?.conversionFormula !== ""
        ? materialBuildUp.conversionFormula
        : materialBuildUp?.conversionFactor ?? 0;

    const conversionResult =
      evaluateFormulaResult(conversionInput);

    enteredConversion =
      String(conversionInput);

    calculatedConversion =
      conversionResult.value;

    conversionIsValid =
      conversionResult.isValid;

    conversionError =
      conversionResult.error;

    netMaterialQuantity =
      quantity * calculatedConversion;

    materialQuantity =
      netMaterialQuantity *
      (1 + wastePercent / 100);
  }

  const baseMaterial =
    materialQuantity * unitCost;

  const materialWithTax =
    baseMaterial *
    (1 + taxPercent / 100);

  const materialTotal =
    materialWithTax *
    (1 + markupPercent / 100);

  return {
    enteredConversion,
    calculatedConversion,
    conversionIsValid,
    conversionError,
    netMaterialQuantity,
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

export { evaluateFormula };