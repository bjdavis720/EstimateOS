export function formatNumber(
  value,
  options = {}
) {
  return Number(value || 0).toLocaleString(
    undefined,
    options
  );
}

export function formatCurrency(
  value,
  options = {}
) {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  return Number(value || 0).toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits,
      maximumFractionDigits,
    }
  );
}

export function formatHourlyCurrency(
  value,
  options = {}
) {
  return `${formatCurrency(
    value,
    options
  )}/HR`;
}
