import { useEffect, useState } from "react";
import EstimateLineDrawer from "../components/EstimateLineDrawer";
import {
  calculateMaterialBuildUpTotal,
} from "../calculations/estimateCalculations";

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
  materials,
  applyLibraryMaterial,
}) {
  const defaultVisibleColumns = {
  description: true,
  quantity: true,
  unit: true,
  labor: true,
  material: true,
  materialBase: false,
  materialTax: false,
  materialMarkup: false,
  equipment: true,
  subcontract: true,
  other: true,
  costPerUnit: true,
  total: true,
};

const [visibleColumns, setVisibleColumns] = useState(() => {
  try {
    const storedColumns = localStorage.getItem(
      "estimateos_estimate_columns"
    );

    return storedColumns
      ? {
          ...defaultVisibleColumns,
          ...JSON.parse(storedColumns),
        }
      : defaultVisibleColumns;
  } catch {
    return defaultVisibleColumns;
  }
});
useEffect(() => {
  localStorage.setItem(
    "estimateos_estimate_columns",
    JSON.stringify(visibleColumns)
  );
}, [visibleColumns]);

  const columnOptions = [
    ["description", "Description"],
    ["quantity", "Quantity"],
    ["unit", "Unit"],
    ["labor", "Labor"],
    ["material", "Material"],
    ["materialBase", "Base Material"],
    ["materialTax", "Material Tax"],
    ["materialMarkup", "Material Markup"],
    ["equipment", "Equipment"],
    ["subcontract", "Subcontract"],
    ["other", "Other"],
    ["costPerUnit", "Cost / Unit"],
    ["total", "Total"],
  ];

  return (
    <div className="estimate-page">
      <div className="estimate-table-toolbar">
        <details className="estimate-columns-control">
          <summary>Columns</summary>

          <div className="estimate-columns-menu">
            {columnOptions.map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={visibleColumns[key]}
                  onChange={(event) =>
                    setVisibleColumns((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                />

                <span>{label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      <div className="table-wrap">
        <table className="estimate-table">
          <thead>
            <tr>
              <th className="estimate-details-column">
                Details
              </th>

              {visibleColumns.description && (
                <th>Description</th>
              )}

              {visibleColumns.quantity && (
                <th>Qty</th>
              )}

              {visibleColumns.unit && (
                <th>Unit</th>
              )}

              {visibleColumns.labor && (
                <th>Labor</th>
              )}

              {visibleColumns.material && (
                <th>Material</th>
              )}

              {visibleColumns.materialBase && (
                <th>Base Material</th>
              )}

              {visibleColumns.materialTax && (
                <th>Mat. Tax</th>
              )}

              {visibleColumns.materialMarkup && (
                <th>Mat. Markup</th>
              )}

              {visibleColumns.equipment && (
                <th>Equipment</th>
              )}

              {visibleColumns.subcontract && (
                <th>Subcontract</th>
              )}

              {visibleColumns.other && (
                <th>Other</th>
              )}

              {visibleColumns.costPerUnit && (
                <th>Cost/Unit</th>
              )}

              {visibleColumns.total && (
                <th>Total</th>
              )}
            </tr>
          </thead>

          <tbody>
            {estimateLines.map((line) => {
              const total = getLineTotal(line);

              const costPerUnit =
                Number(line.quantity || 0) > 0
                  ? total / Number(line.quantity)
                  : 0;

              const materialCalculation =
                calculateMaterialBuildUpTotal(
                  line.quantity,
                  line.materialBuildUp || {}
                );

              const materialBase =
                materialCalculation.baseMaterial || 0;

              const materialTax =
                materialCalculation.taxAmount || 0;

              const materialMarkup =
                materialCalculation.markupAmount || 0;

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
                  <td className="estimate-details-column">
                    <button
                      type="button"
                      className="details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedLine(line);
                      }}
                    >
                      Open
                    </button>
                  </td>

                  {visibleColumns.description && (
                    <td>
                      <input
                        value={line.description || ""}
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
                  )}

                  {visibleColumns.quantity && (
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
                  )}

                  {visibleColumns.unit && (
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
                  )}

                  {visibleColumns.labor && (
                    <td>
                      <input
                        value={formatNumber(
                          line.laborTotal
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "laborTotal",
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
                  )}

                  {visibleColumns.material && (
                    <td>
                      <input
                        value={formatNumber(
                          line.materialTotal
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "materialTotal",
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
                  )}

                  {visibleColumns.materialBase && (
  <td>
    <input
      value={formatNumber(
        Math.round(materialBase)
      )}
      readOnly
      tabIndex={-1}
    />
  </td>
)}

{visibleColumns.materialTax && (
  <td>
    <input
      value={formatNumber(
        Math.round(materialTax)
      )}
      readOnly
      tabIndex={-1}
    />
  </td>
)}

{visibleColumns.materialMarkup && (
  <td>
    <input
      value={formatNumber(
        Math.round(materialMarkup)
      )}
      readOnly
      tabIndex={-1}
    />
  </td>
)}

                  {visibleColumns.equipment && (
                    <td>
                      <input
                        value={formatNumber(
                          line.equipmentTotal
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "equipmentTotal",
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
                  )}

                  {visibleColumns.subcontract && (
                    <td>
                      <input
                        value={formatNumber(
                          line.subcontractTotal
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "subcontractTotal",
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
                  )}

                  {visibleColumns.other && (
                    <td>
                      <input
                        value={formatNumber(
                          line.otherTotal
                        )}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "otherTotal",
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
                  )}

                  {visibleColumns.costPerUnit && (
                    <td className="cost-unit-cell">
                      ${costPerUnit.toFixed(2)} /{" "}
                      {line.unit}
                    </td>
                  )}

                  {visibleColumns.total && (
                    <td className="total-cell">
                      {formatCurrency(total)}
                    </td>
                  )}
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
            setSelectedLine={setSelectedLine}
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
            formatCurrency={formatCurrency}
            crews={crews}
            resources={resources}
            locations={locations}
            materials={materials}
            applyLibraryMaterial={
              applyLibraryMaterial
            }
            mode="estimate"
          />
        ) : (
          <div className="record-workspace-empty">
            <strong>
              Select an estimate line
            </strong>

            <p>
              Select a line above to open its full
              estimating workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EstimatePage;