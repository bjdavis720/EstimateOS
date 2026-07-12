export function calculateAssemblyMaterialCostPerUnit(
  item
) {
  const quantityPerUnit = Number(
    item?.quantityPerUnit || 0
  );

  const wasteFactor =
    1 +
    Number(item?.wastePercent || 0) / 100;

  const taxFactor =
    1 +
    Number(item?.taxPercent || 0) / 100;

  const markupFactor =
    1 +
    Number(item?.markupPercent || 0) / 100;

  return (
    quantityPerUnit *
    wasteFactor *
    Number(item?.unitCost || 0) *
    taxFactor *
    markupFactor
  );
}

export function calculateAssemblyEquipmentCostPerUnit(
  item
) {
  const quantity = Number(
    item?.quantity || 0
  );

  const operatingCost =
    quantity *
    Number(item?.hoursPerUnit || 0) *
    Number(item?.hourlyRate || 0);

  const standbyCost =
    quantity *
    Number(
      item?.standbyHoursPerUnit || 0
    ) *
    Number(item?.standbyRate || 0);

  const markupFactor =
    1 +
    Number(item?.markupPercent || 0) / 100;

  return (
    operatingCost + standbyCost
  ) * markupFactor;
}

export function calculateAssemblySimpleCostPerUnit(
  item
) {
  const quantityPerUnit = Number(
    item?.quantityPerUnit || 0
  );

  const unitCost = Number(
    item?.unitCost || 0
  );

  const markupFactor =
    1 +
    Number(item?.markupPercent || 0) / 100;

  return (
    quantityPerUnit *
    unitCost *
    markupFactor
  );
}

export function calculateAssemblyTotals({
  assembly,
  crew,
  laborHourlyCost,
  equipmentHourlyCost,
}) {
  const productionRate = Number(
    crew?.productionRate ||
      assembly?.productionRate ||
      0
  );

  const productionUnit =
    crew?.productionUnit ||
    assembly?.productionUnit ||
    "EA/HR";

  const crewMarkupFactor =
    1 +
    Number(
      assembly?.crewMarkupPercent || 0
    ) /
      100;

  const laborCostPerUnit =
    productionRate > 0
      ? (Number(laborHourlyCost || 0) /
          productionRate) *
        crewMarkupFactor
      : 0;

  const crewEquipmentCostPerUnit =
    productionRate > 0
      ? (Number(equipmentHourlyCost || 0) /
          productionRate) *
        crewMarkupFactor
      : 0;

  const materialCostPerUnit = (
    assembly?.materials || []
  ).reduce(
    (total, item) =>
      total +
      calculateAssemblyMaterialCostPerUnit(
        item
      ),
    0
  );

  const additionalEquipmentCostPerUnit = (
    assembly?.additionalEquipment || []
  ).reduce(
    (total, item) =>
      total +
      calculateAssemblyEquipmentCostPerUnit(
        item
      ),
    0
  );

  const subcontractCostPerUnit = (
    assembly?.subcontractItems || []
  ).reduce(
    (total, item) =>
      total +
      calculateAssemblySimpleCostPerUnit(
        item
      ),
    0
  );

  const otherCostPerUnit = (
    assembly?.otherItems || []
  ).reduce(
    (total, item) =>
      total +
      calculateAssemblySimpleCostPerUnit(
        item
      ),
    0
  );

  const equipmentCostPerUnit =
    crewEquipmentCostPerUnit +
    additionalEquipmentCostPerUnit;

  const totalCostPerUnit =
    laborCostPerUnit +
    materialCostPerUnit +
    equipmentCostPerUnit +
    subcontractCostPerUnit +
    otherCostPerUnit;

  return {
    productionRate,
    productionUnit,
    laborCostPerUnit,
    materialCostPerUnit,
    equipmentCostPerUnit,
    subcontractCostPerUnit,
    otherCostPerUnit,
    totalCostPerUnit,
  };
}
