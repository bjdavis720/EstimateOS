function EstimatePage({
  estimateLines,
  setSelectedLine,
  updateLine,
  getLineTotal,
  formatCurrency,
  formatNumber,
}) {
  return (
    <div className="table-wrap">
      <table className="estimate-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Labor</th>
            <th>Material</th>
            <th>Equipment</th>
            <th>Subcontract</th>
            <th>Other</th>
            <th>Cost/Unit</th>
            <th>Total</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
  {estimateLines.map((line) => {
    const total = getLineTotal(line);

    const costPerUnit =
      Number(line.quantity || 0) > 0
        ? total / Number(line.quantity)
        : 0;

    return (
      <tr
        key={line.id}
        onClick={() => setSelectedLine(line)}
        className="clickable-row"
      >
        <td>
          <input
            value={line.description}
            onChange={(e) =>
              updateLine(line.id, "description", e.target.value)
            }
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        <td>
          <input
            value={formatNumber(line.quantity)}
            onChange={(e) =>
              updateLine(line.id, "quantity", e.target.value.replace(/,/g, ""))
            }
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        <td>
          <input
            value={line.unit}
            onChange={(e) => updateLine(line.id, "unit", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        {[
          "laborTotal",
          "materialTotal",
          "equipmentTotal",
          "subcontractTotal",
          "otherTotal",
        ].map((field) => (
          <td key={field}>
            <input
              value={formatNumber(line[field])}
              onChange={(e) =>
                updateLine(line.id, field, e.target.value.replace(/,/g, ""))
              }
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        ))}

        <td className="cost-unit-cell">
  ${costPerUnit.toFixed(2)} / {line.unit}
</td>

        <td className="total-cell">{formatCurrency(total)}</td>

        <td>
          <button
            className="details-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLine(line);
            }}
          >
            Open
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  );
}

export default EstimatePage;