export function calculateRateComponent(
  baseWage,
  value,
  mode
) {
  const numericBaseWage = Number(
    baseWage || 0
  );

  const numericValue = Number(value || 0);

  if (mode === "Percent") {
    return (
      numericBaseWage *
      (numericValue / 100)
    );
  }

  return numericValue;
}

export function calculateLaborResourceRate(
  rate
) {
  if (!rate) return 0;

  const baseWage = Number(
    rate.baseWage || 0
  );

  return (
    baseWage +
    calculateRateComponent(
      baseWage,
      rate.fringeBenefits,
      rate.fringeBenefitsMode || "Dollars"
    ) +
    calculateRateComponent(
      baseWage,
      rate.payrollTaxes,
      rate.payrollTaxesMode || "Percent"
    ) +
    calculateRateComponent(
      baseWage,
      rate.workersComp,
      rate.workersCompMode || "Percent"
    ) +
    calculateRateComponent(
      baseWage,
      rate.insuranceBurden,
      rate.insuranceBurdenMode || "Percent"
    ) +
    calculateRateComponent(
      baseWage,
      rate.otherBurden,
      rate.otherBurdenMode || "Percent"
    )
  );
}

export function calculateEquipmentResourceRate(
  rate
) {
  if (!rate) return 0;

  const directOperatingCost =
    Number(rate.ownershipCost || 0) +
    Number(rate.fuelCost || 0) +
    Number(rate.maintenanceCost || 0) +
    Number(rate.otherOperatingCost || 0);

  const markupPercent = Number(
    rate.markupPercent || 0
  );

  return (
    directOperatingCost *
    (1 + markupPercent / 100)
  );
}

export function getApplicableResourceRate(
  resource,
  rateContext
) {
  if (!resource || !rateContext) {
    return null;
  }

  const matchingRates = (
    resource.rates || []
  )
    .filter(
      (rate) =>
        String(rate.locationId) ===
          String(
            rateContext.locationId || ""
          ) &&
        (!rateContext.effectiveDate ||
          !rate.effectiveDate ||
          rate.effectiveDate <=
            rateContext.effectiveDate)
    )
    .sort((a, b) =>
      String(
        b.effectiveDate || ""
      ).localeCompare(
        String(a.effectiveDate || "")
      )
    );

  return matchingRates[0] || null;
}
