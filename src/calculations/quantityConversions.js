// EstimateOS Universal Quantity Conversion Engine
// Phase 1: Area x Thickness -> Volume
//
// This module does not depend on React, estimate
// records, or material-specific pricing.

const LENGTH_TO_FEET = {
  IN: 1 / 12,
  FT: 1,
  MM: 1 / 304.8,
  M: 1 / 0.3048,
};

const AREA_TO_SQUARE_FEET = {
  SF: 1,
  SY: 9,
  SM: 10.7639104167,
};

const VOLUME_FROM_CUBIC_FEET = {
  CF: 1,
  CY: 1 / 27,
  CM: 0.028316846592,
};

function validNonnegativeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}

function invalidResult(message) {
  return {
    isValid: false,
    error: message,
    netQuantity: null,
    wasteQuantity: null,
    purchaseQuantity: null,
    conversionFactor: null,
  };
}

export function calculateGuidedQuantity({
  method,
  takeoffQuantity,
  takeoffUnit,
  inputs = {},
  outputUnit,
  wastePercent = 0,
}) {
  if (method !== "AREA_THICKNESS") {
    return invalidResult(
      "Unsupported conversion method."
    );
  }

  const quantity = validNonnegativeNumber(
    takeoffQuantity
  );

  const thickness = validNonnegativeNumber(
    inputs.thickness
  );

  const waste = validNonnegativeNumber(
    wastePercent
  );

  const areaFactor =
    AREA_TO_SQUARE_FEET[takeoffUnit];

  const thicknessFactor =
    LENGTH_TO_FEET[inputs.thicknessUnit];

  const volumeFactor =
    VOLUME_FROM_CUBIC_FEET[outputUnit];

  if (quantity === null) {
    return invalidResult(
      "Enter a valid takeoff quantity."
    );
  }

  if (thickness === null) {
    return invalidResult(
      "Enter a valid thickness."
    );
  }

  if (waste === null) {
    return invalidResult(
      "Enter a valid waste percentage."
    );
  }

  if (
    areaFactor === undefined ||
    thicknessFactor === undefined ||
    volumeFactor === undefined
  ) {
    return invalidResult(
      "Unsupported or incompatible units."
    );
  }

  // Convert area to square feet and
  // thickness to feet.
  const squareFeet = quantity * areaFactor;

  const thicknessFeet =
    thickness * thicknessFactor;

  // Calculate volume in cubic feet.
  const cubicFeet =
    squareFeet * thicknessFeet;

  // Convert to the requested volume unit.
  const netQuantity =
    cubicFeet * volumeFactor;

  const wasteQuantity =
    netQuantity * (waste / 100);

  const purchaseQuantity =
    netQuantity + wasteQuantity;

  // Conversion per one takeoff unit.
  const conversionFactor =
    areaFactor *
    thicknessFeet *
    volumeFactor;

  return {
    isValid: true,
    error: "",
    method,
    takeoffUnit,
    outputUnit,
    netQuantity,
    wasteQuantity,
    purchaseQuantity,
    conversionFactor,
  };
}