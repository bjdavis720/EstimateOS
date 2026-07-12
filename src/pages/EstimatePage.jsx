import EstimateLineDrawer from "../components/EstimateLineDrawer";

function EstimatePage({
  estimateLines,
  selectedLine,
  setSelectedLine,
  updateLine,
  updateLaborBuildUp,
  updateCrewLaborBuildUp,
  updateMaterialBuildUp,
  updateEquipmentBuildUp,
  getLineTotal,
  formatCurrency,
  formatNumber,
  crews,
  resources,
  locations,
}) {
  return (
    <div className="estimate-page">
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
                  ? total /
                    Number(line.quantity)
                  : 0;

              const isSelected =
                String(selectedLine?.id) ===
                String(line.id);

              return (
                <tr
                  key={line.id}
                  onClick={() =>
                    setSelectedLine(line)
                  }
                  className={
                    isSelected
                      ? "clickable-row selected-row"
                      : "clickable-row"
                  }
                >
                  <td>
                    <input
                      value={
                        line.description || ""
                      }
                      onChange={(event) =>
                        updateLine(
                          line.id,
                          "description",
                          event.target.value
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    />
                  </td>

                  <td>
                    <input
                      value={formatNumber(
                        line.quantity
                      )}
                      onChange={(event) =>
                        updateLine(
                          line.id,
                          "quantity",
                          event.target.value.replace(
                            /,/g,
                            ""
                          )
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    />
                  </td>

                  <td>
                    <input
                      value={line.unit || ""}
                      onChange={(event) =>
                        updateLine(
                          line.id,
                          "unit",
                          event.target.value
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
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
                        value={formatNumber(
                          line[field]
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            field,
                            event.target.value.replace(
                              /,/g,
                              ""
                            )
                          )
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      />
                    </td>
                  ))}

                  <td className="cost-unit-cell">
                    ${costPerUnit.toFixed(2)} /{" "}
                    {line.unit}
                  </td>

                  <td className="total-cell">
                    {formatCurrency(total)}
                  </td>

                  <td>
                    <button
                      className="details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
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

      <div className="record-workspace-container">
        {selectedLine ? (
          <EstimateLineDrawer
            selectedLine={selectedLine}
            setSelectedLine={
              setSelectedLine
            }
            updateLine={updateLine}
            updateLaborBuildUp={
              updateLaborBuildUp
            }
            updateCrewLaborBuildUp={
              updateCrewLaborBuildUp
            }
            updateMaterialBuildUp={
              updateMaterialBuildUp
            }
            updateEquipmentBuildUp={
              updateEquipmentBuildUp
            }
            formatCurrency={
              formatCurrency
            }
            crews={crews}
            resources={resources}
            locations={locations}
            mode="estimate"
          />
        ) : (
          <div className="record-workspace-empty">
            <strong>
              Select an estimate line
            </strong>

            <p>
              Select a line above to open its
              full estimating workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EstimatePage;