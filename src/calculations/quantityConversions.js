// EstimateOS Universal Quantity Conversion Engine
//
// Supported methods:
// 1. AREA_THICKNESS
//    Area x Thickness -> Volume
//
// 2. AREA_THICKNESS_DENSITY
//    Area x Thickness x Density -> Weight
//
// TON = US short ton (2,000 LB)
// CM = Cubic Meter (existing EstimateOS unit)

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

const POUNDS_PER_KILOGRAM = 2.20462262185;

const WEIGHT_FROM_POUNDS = {
  LB: 1,
  TON: 1 / 2000,
  KG: 1 / POUNDS_PER_KILOGRAM,
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
  const supportedMethods = [
    "AREA_THICKNESS",
    "AREA_THICKNESS_DENSITY",
  ];

  if (!supportedMethods.includes(method)) {
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
    thicknessFactor === undefined
  ) {
    return invalidResult(
      "Unsupported or incompatible units."
    );
  }

  // Calculate volume in cubic feet.
  const squareFeet = quantity * areaFactor;

  const thicknessFeet =
    thickness * thicknessFactor;

  const cubicFeet =
    squareFeet * thicknessFeet;

  // Conversion per one takeoff unit.
  const cubicFeetPerTakeoffUnit =
    areaFactor * thicknessFeet;

  let netQuantity;
  let conversionFactor;

  if (method === "AREA_THICKNESS") {
    const volumeFactor =
      VOLUME_FROM_CUBIC_FEET[outputUnit];

    if (volumeFactor === undefined) {
      return invalidResult(
        "Unsupported volume output unit."
      );
    }

    netQuantity =
      cubicFeet * volumeFactor;

    conversionFactor =
      cubicFeetPerTakeoffUnit * volumeFactor;
  }

  if (method === "AREA_THICKNESS_DENSITY") {
    const density = validNonnegativeNumber(
      inputs.density
    );

    const densityUnit = inputs.densityUnit;

    const weightFactor =
      WEIGHT_FROM_POUNDS[outputUnit];

    if (density === null) {
      return invalidResult(
        "Enter a valid material density."
      );
    }

    if (weightFactor === undefined) {
      return invalidResult(
        "Unsupported weight output unit."
      );
    }

    // Convert density into pounds
    // per cubic foot.
    let poundsPerCubicFoot;

    switch (densityUnit) {
      case "TON/CY":
        poundsPerCubicFoot =
          (density * 2000) / 27;
        break;

      case "LB/CF":
        poundsPerCubicFoot = density;
        break;

      case "KG/CM":
        poundsPerCubicFoot =
          density *
          POUNDS_PER_KILOGRAM *
          VOLUME_FROM_CUBIC_FEET.CM;
        break;

      default:
        return invalidResult(
          "Unsupported density unit."
        );
    }

    const pounds =
      cubicFeet * poundsPerCubicFoot;

    netQuantity =
      pounds * weightFactor;

    conversionFactor =
      cubicFeetPerTakeoffUnit *
      poundsPerCubicFoot *
      weightFactor;
  }

  if (
    !Number.isFinite(netQuantity) ||
    !Number.isFinite(conversionFactor)
  ) {
    return invalidResult(
      "Calculation exceeds supported numeric limits."
    );
  }

  const wasteQuantity =
    netQuantity * (waste / 100);

  const purchaseQuantity =
    netQuantity + wasteQuantity;

  if (
    !Number.isFinite(wasteQuantity) ||
    !Number.isFinite(purchaseQuantity)
  ) {
    return invalidResult(
      "Calculated quantity exceeds supported numeric limits."
    );
  }

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