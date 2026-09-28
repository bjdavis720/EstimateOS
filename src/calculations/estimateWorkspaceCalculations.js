import {
  calculateEquipmentResourceRate,
  calculateLaborResourceRate,
  getApplicableResourceRate,
} from "./crewCalculations";

import {
  calculateMaterialBuildUpTotal,
} from "./estimateCalculations";

function getCrewDisplaySummary({
  crew,
  resources,
}) {
  if (!crew) {
    return {
      members: [],
      laborHourlyCost: 0,
      equipmentHourlyCost: 0,
      totalHourlyCost: 0,
    };
  }

  const members = (crew.members || []).map(
    (member) => {
      const resourceId =
        member.resourceId ??
        member.workerTypeId ??
        "";

      const resource = resources.find(
        (item) =>
          String(item.id) ===
          String(resourceId)
      );

      const rate = resource
        ? getApplicableResourceRate(
            resource,
            crew
          )
        : null;

      const resourceType =
        resource?.resourceType || "Unknown";

      const hourlyRate =
        resourceType === "Equipment"
          ? calculateEquipmentResourceRate(
              rate
            )
          : calculateLaborResourceRate(rate);

      const quantity = Number(
        member.quantity || 0
      );

      return {
        ...member,
        resource,
        resourceType,
        rate,
        hourlyRate,
        extendedRate:
          quantity * hourlyRate,
      };
    }
  );

  const laborHourlyCost = members.reduce(
    (sum, member) =>
      sum +
      (member.resourceType === "Labor"
        ? member.extendedRate
        : 0),
    0
  );

  const equipmentHourlyCost =
    members.reduce(
      (sum, member) =>
        sum +
        (member.resourceType === "Equipment"
          ? member.extendedRate
          : 0),
      0
    );

  return {
    members,
    laborHourlyCost,
    equipmentHourlyCost,
    totalHourlyCost:
      laborHourlyCost +
      equipmentHourlyCost,
  };
}

export function getEstimateWorkspaceData({
  selectedLine,
  crews = [],
  resources = [],
  locations = [],
}) {
  if (!selectedLine) {
    return {
      selectedCrew: null,
      selectedCrewLocation: null,

      crewSummary: {
        members: [],
        laborHourlyCost: 0,
        equipmentHourlyCost: 0,
        totalHourlyCost: 0,
      },

      crewHours: 0,
      crewLaborTotal: 0,
      crewEquipmentTotal: 0,

      laborHours: 0,

      conversionFactor: 0,
      materialQuantity: 0,
    };
  }

  const selectedCrew = crews.find(
    (crew) =>
      String(crew.id) ===
      String(
        selectedLine.laborBuildUp?.crewId ||
          ""
      )
  );

  const crewSummary =
    getCrewDisplaySummary({
      crew: selectedCrew,
      resources,
    });

  const estimateQuantity = Number(
    selectedLine.quantity || 0
  );

  const crewProductionRate = Number(
    selectedCrew?.productionRate || 0
  );

  const crewHours =
    crewProductionRate > 0
      ? estimateQuantity /
        crewProductionRate
      : 0;

  const crewMarkupPercent = Number(
    selectedLine.laborBuildUp
      ?.markupPercent || 0
  );

  const crewMarkupFactor =
    1 + crewMarkupPercent / 100;

  const crewLaborTotal =
    crewHours *
    crewSummary.laborHourlyCost *
    crewMarkupFactor;

  const crewEquipmentTotal =
    crewHours *
    crewSummary.equipmentHourlyCost *
    crewMarkupFactor;

  const laborProductionRate = Number(
    selectedLine.laborBuildUp
      ?.productionRate || 0
  );

  const laborHours =
    laborProductionRate > 0
      ? estimateQuantity /
        laborProductionRate
      : 0;

   const materialCalculation =
    calculateMaterialBuildUpTotal(
      estimateQuantity,
      selectedLine.materialBuildUp
    );

  const conversionFactor =
    materialCalculation.calculatedConversion;

  const materialQuantity =
    materialCalculation.materialQuantity;

  const selectedCrewLocation =
    locations.find(
      (location) =>
        String(location.id) ===
        String(selectedCrew?.locationId)
    ) || null;

  return {
    selectedCrew,
    selectedCrewLocation,

    crewSummary,

    crewHours,
    crewLaborTotal,
    crewEquipmentTotal,

    laborHours,

    conversionFactor,
    materialQuantity,
  };
}