function EstimatePage({
  estimateLines,
  setSelectedLine,
  updateLine,
  getLineTotal,
  formatCurrency,
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
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {estimateLines.map((line) => (
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
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, "quantity", e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </td>

              <td>
                <input
                  value={line.unit}
                  onChange={(e) =>
                    updateLine(line.id, "unit", e.target.value)
                  }
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
                    value={line[field]}
                    onChange={(e) =>
                      updateLine(line.id, field, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              ))}

              <td className="total-cell">
                {formatCurrency(getLineTotal(line))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EstimatePage;