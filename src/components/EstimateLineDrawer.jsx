import { useState } from "react";
import { getEstimateWorkspaceData } from "../calculations/estimateWorkspaceCalculations";
import {
  calculateMaterialBuildUpTotal,
} from "../calculations/estimateCalculations";

function getMaterialOverrideStatus(material) {
  if (!material?.materialId) {
    return "NONE";
  }

  const baseline = material.libraryBaseline;

  if (!baseline) {
    return "LEGACY";
  }

  const normalizeConversion = (conversion) => {
    if (!conversion) return null;

    const copy = structuredClone(conversion);

    if (copy.inputs) {
      for (const field of [
        "thickness",
        "density",
      ]) {
        if (
          copy.inputs[field] !== undefined &&
          copy.inputs[field] !== ""
        ) {
          copy.inputs[field] =
            Number(copy.inputs[field]);
        }
      }
    }

    return copy;
  };

  const isCustomized =
    material.materialDescription !==
      baseline.materialDescription ||
    material.materialUnit !==
      baseline.materialUnit ||
    Number(material.unitCost ?? 0) !==
      Number(baseline.unitCost ?? 0) ||
    JSON.stringify(
      normalizeConversion(material.conversion)
    ) !==
      JSON.stringify(
        normalizeConversion(baseline.conversion)
      );

  return isCustomized ? "CUSTOMIZED" : "DEFAULT";
}

function EstimateLineDrawer({
  selectedLine,
  setSelectedLine,
  updateLine,
  updateLaborBuildUp,
  updateCrewLaborBuildUp,
  updateMaterialBuildUp,
  updateEquipmentBuildUp,
  formatCurrency,
  crews = [],
  resources = [],
  locations = [],
  materials = [],
applyLibraryMaterial,
  mode = "estimate",
}) {
  const [activeTab, setActiveTab] =
    useState("Classification");
  const [materialSearch, setMaterialSearch] =
  useState("");

  if (!selectedLine) return null;
const workspace =
  getEstimateWorkspaceData({
    selectedLine,
    crews,
    resources,
    locations,
  });

const {
  selectedCrew,
  selectedCrewLocation,
  crewSummary,
  crewHours,
  crewLaborTotal,
  crewEquipmentTotal,
  laborHours,
  } = workspace;



  const tabs = [
    "Classification",
    "Labor",
    "Material",
    "Equipment",
    "Subcontract",
    "Procurement",
  ];

  return (
    <section className="record-workspace">
      <div className="record-workspace-header">
        <h2>
          {selectedLine.description ||
            "Estimate Item"}
        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setSelectedLine(null)
          }
        >
          Close
        </button>
      </div>

      <div className="record-workspace-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "drawer-tab active"
                : "drawer-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Classification" && (
        <div className="drawer-section">
          <h3>Classification</h3>

          {[
            ["MasterFormat", "masterFormat"],
            ["Uniformat", "uniformat"],
            ["System", "system"],
            ["WBS 1", "wbs1"],
            ["WBS 2", "wbs2"],
            ["WBS 3", "wbs3"],
            ["Location 1", "location1"],
            ["Location 2", "location2"],
            ["Location 3", "location3"],
          ].map(([label, field]) => (
            <label
              className="drawer-field"
              key={field}
            >
              <span>{label}</span>

              <input
                value={
                  selectedLine[field] || ""
                }
                onChange={(event) =>
                  updateLine(
                    selectedLine.id,
                    field,
                    event.target.value
                  )
                }
              />
            </label>
          ))}
        </div>
      )}

      {activeTab === "Labor" &&
        mode === "estimate" && (
          <div className="drawer-section">
            <h3>Crew Build-Up</h3>

            <label className="drawer-field">
              <span>Crew</span>

              <select
                className="table-select"
                value={
                  selectedLine.laborBuildUp
                    ?.crewId || ""
                }
                onChange={(event) =>
                  updateCrewLaborBuildUp(
                    selectedLine.id,
                    "crewId",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select crew
                </option>

                {crews
                  .filter(
                    (crew) => crew.active
                  )
                  .sort((a, b) =>
                    String(
                      a.name || ""
                    ).localeCompare(
                      String(b.name || "")
                    )
                  )
                  .map((crew) => (
                    <option
                      key={crew.id}
                      value={crew.id}
                    >
                      {crew.name}
                    </option>
                  ))}
              </select>
            </label>

            {!selectedCrew && (
              <div className="empty-state">
                <strong>
                  No crew selected.
                </strong>

                <p>
                  Select an active crew to pull
                  labor, equipment, and
                  productivity rates into this
                  estimate item.
                </p>
              </div>
            )}

            {selectedCrew && (
              <>
                <div className="crew-summary-row">
                  <div className="crew-summary-card">
                    <span>Labor Location</span>

                    <strong>
                      {selectedCrewLocation?.name ||
                        "No Location"}
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>Rate Date</span>

                    <strong>
                      {selectedCrew.effectiveDate ||
                        "-"}
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>Production</span>

                    <strong>
                      {Number(
                        selectedCrew.productionRate ||
                          0
                      ).toLocaleString()}{" "}
                      {selectedCrew.productionUnit ||
                        ""}
                    </strong>
                  </div>
                </div>

                <div className="workspace-section-header">
                  <div>
                    <h3>Crew Composition</h3>

                    <p>
                      Composition is controlled by
                      the Crew Builder.
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="crew-members-table">
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Rate / HR</th>
                        <th>Extended / HR</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {crewSummary.members.length ===
                        0 && (
                        <tr>
                          <td colSpan="6">
                            <div className="empty-state">
                              <strong>
                                Crew has no
                                resources.
                              </strong>
                            </div>
                          </td>
                        </tr>
                      )}

                      {crewSummary.members.map(
                        (member) => (
                          <tr key={member.id}>
                            <td>
                              {member.resource?.name ||
                                "Unknown Resource"}
                            </td>

                            <td>
                              {member.resourceType}
                            </td>

                            <td>
                              {Number(
                                member.quantity || 0
                              )}
                            </td>

                            <td>
                              {formatCurrency(
                                member.hourlyRate
                              )}
                              /HR
                            </td>

                            <td>
                              {formatCurrency(
                                member.extendedRate
                              )}
                              /HR
                            </td>

                            <td>
                              {member.rate
                                ? "Rate Found"
                                : "No Matching Rate"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <label className="drawer-field">
                  <span>
                    Crew Markup %
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      selectedLine.laborBuildUp
                        ?.markupPercent || 0
                    }
                    onChange={(event) =>
                      updateCrewLaborBuildUp(
                        selectedLine.id,
                        "markupPercent",
                        event.target.value
                      )
                    }
                  />
                </label>

                <div className="crew-summary-row">
                  <div className="crew-summary-card">
                    <span>
                      Labor Cost / HR
                    </span>

                    <strong>
                      {formatCurrency(
                        crewSummary.laborHourlyCost
                      )}
                      /HR
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>
                      Equipment Cost / HR
                    </span>

                    <strong>
                      {formatCurrency(
                        crewSummary.equipmentHourlyCost
                      )}
                      /HR
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>
                      Total Crew Cost / HR
                    </span>

                    <strong>
                      {formatCurrency(
                        crewSummary.totalHourlyCost
                      )}
                      /HR
                    </strong>
                  </div>
                </div>

                <div className="crew-summary-row">
                  <div className="crew-summary-card">
                    <span>
                      Estimated Crew Hours
                    </span>

                    <strong>
                      {crewHours.toFixed(2)} HR
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>Labor Total</span>

                    <strong>
                      {formatCurrency(
                        crewLaborTotal
                      )}
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>
                      Crew Equipment Total
                    </span>

                    <strong>
                      {formatCurrency(
                        crewEquipmentTotal
                      )}
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>
                      Combined Crew Total
                    </span>

                    <strong>
                      {formatCurrency(
                        crewLaborTotal +
                          crewEquipmentTotal
                      )}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      {activeTab === "Labor" &&
        mode === "assembly" && (
          <div className="drawer-section">
            <h3>Labor Build-Up</h3>

            <label className="drawer-field">
              <span>Crew Type</span>

              <input
                value={
                  selectedLine.laborBuildUp
                    ?.crewType || ""
                }
                onChange={(event) =>
                  updateLaborBuildUp(
                    selectedLine.id,
                    "crewType",
                    event.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Crew Rate / Hour</span>

              <input
                type="number"
                value={
                  selectedLine.laborBuildUp
                    ?.crewRate || 0
                }
                onChange={(event) =>
                  updateLaborBuildUp(
                    selectedLine.id,
                    "crewRate",
                    event.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Production Rate</span>

              <input
                type="number"
                value={
                  selectedLine.laborBuildUp
                    ?.productionRate || 0
                }
                onChange={(event) =>
                  updateLaborBuildUp(
                    selectedLine.id,
                    "productionRate",
                    event.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Production Unit</span>

              <input
                value={
                  selectedLine.laborBuildUp
                    ?.productionUnit ||
                  "SF/hour"
                }
                onChange={(event) =>
                  updateLaborBuildUp(
                    selectedLine.id,
                    "productionUnit",
                    event.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Labor Markup %</span>

              <input
                type="number"
                value={
                  selectedLine.laborBuildUp
                    ?.markupPercent || 0
                }
                onChange={(event) =>
                  updateLaborBuildUp(
                    selectedLine.id,
                    "markupPercent",
                    event.target.value
                  )
                }
              />
            </label>

            <div className="calc-summary">
              <p>
                <strong>
                  Estimated Hours:
                </strong>{" "}
                {laborHours.toFixed(2)}
              </p>

              <p>
                <strong>
                  Calculated Labor:
                </strong>{" "}
                {formatCurrency(
                  selectedLine.laborTotal || 0
                )}
              </p>
            </div>
          </div>
        )}

      {activeTab === "Material" && (
        <div className="drawer-section">
          <h3>Material Build-Up</h3>
          <div className="calc-summary">
  <div className="material-section-heading">
  <span className="material-section-number">1</span>
  <div>
    <h4>Material Selection</h4>
    <p>Select a library material or review estimate-specific changes.</p>
  </div>
</div>
  {(() => {
  const status = getMaterialOverrideStatus(
    selectedLine.materialBuildUp
  );

  if (status === "NONE") {
    return null;
  }

  const labels = {
    DEFAULT: "Library defaults",
    CUSTOMIZED: "Customized for this estimate",
    LEGACY: "Existing material — baseline unavailable",
  };

  return (
    <p
      className="material-override-status"
      data-status={status}
    >
      {labels[status]}
    </p>
  );
})()}

  <div className="material-library-selector">
  <label className="drawer-field">
    <span>Search Library Materials</span>

    <input
      type="search"
      placeholder="Search code, name, category..."
      value={materialSearch}
      onChange={(event) =>
        setMaterialSearch(event.target.value)
      }
    />
  </label>

  {(() => {
    const selectedMaterialId =
      selectedLine.materialBuildUp?.materialId;

    const selectedMaterial = materials.find(
      (material) =>
        material.id === selectedMaterialId
    );

    const query = materialSearch
      .trim()
      .toLowerCase();

    const matchingMaterials = materials
      .filter((material) => material.isActive)
      .filter((material) =>
        [
          material.code,
          material.name,
          material.category,
          material.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );

    return (
      <>
        <div className="material-library-current">
          <strong>Current Material</strong>

          <div>
            {selectedMaterial
              ? `${selectedMaterial.code} - ${selectedMaterial.name}`
              : selectedMaterialId
                ? "Previously selected material unavailable"
                : "No library material selected"}
          </div>
        </div>

        {query && (
          <div className="material-library-results">
            {matchingMaterials.length === 0 ? (
              <p>No matching materials found.</p>
            ) : (
              matchingMaterials.map((material) => (
                <div
                  key={material.id}
                  className="material-library-result"
                >
                  <div>
                    <strong>
                      {material.code} - {material.name}
                    </strong>

                    <small>
                      {material.category || "Uncategorized"}
                      {" | "}
                      {material.purchaseUnit}
                    </small>
                  </div>

                  <button
                    type="button"
                    disabled={
                      material.id === selectedMaterialId
                    }
                    onClick={() => {
                      applyLibraryMaterial(
                        selectedLine.id,
                        material.id
                      );

                      setMaterialSearch("");
                    }}
                  >
                    {material.id === selectedMaterialId
                      ? "Selected"
                      : "Apply"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </>
    );
  })()}
</div>
</div>
          {/* MATERIAL CONVERSION METHOD */}

{(() => {
  const material = selectedLine.materialBuildUp || {};
  const conversion = material.conversion || {};

  const conversionMode =
    conversion.mode ||
    (material.conversionFormula
      ? "FORMULA"
      : "DIRECT");

  const updateConversion = (changes) => {
    updateMaterialBuildUp(
      selectedLine.id,
      "conversion",
      {
        ...conversion,
        ...changes,
      }
    );
  };

  return (
  <div className="calc-summary material-conversion-section">
      <div className="material-section-heading">
  <span className="material-section-number">2</span>

  <div>
    <h4>Quantity Conversion</h4>
    <p>
      Configure how takeoff quantities become
      purchasable material quantities.
    </p>
  </div>
</div>

      <label className="drawer-field">
        <span>Conversion Method</span>

        <select
          value={conversionMode}
          onChange={(event) => {
            const nextMode = event.target.value;

            if (nextMode === "GUIDED") {
              updateConversion({
                mode: "GUIDED",
                method: "AREA_THICKNESS",
                takeoffUnit:
                  selectedLine.unit || "SF",
                outputUnit: "CY",
                inputs: {
                  thickness:
                    conversion.inputs
                      ?.thickness ?? 4,
                  thicknessUnit:
                    conversion.inputs
                      ?.thicknessUnit || "IN",
                },
              });
            } else {
              updateConversion({
                mode: nextMode,
              });
            }
          }}
        >
          <option value="DIRECT">
            Direct Conversion Factor
          </option>

          <option value="FORMULA">
            Custom Formula
          </option>

          <option value="GUIDED">
            Guided Conversion
          </option>
        </select>
      </label>

      {conversionMode === "GUIDED" && (
        <>
          <label className="drawer-field">
            <span>Conversion Type</span>

            <select
  value={
    conversion.method ||
    "AREA_THICKNESS"
  }
  onChange={(event) => {
    const nextMethod = event.target.value;

    updateConversion({
      method: nextMethod,
      outputUnit:
        nextMethod === "AREA_THICKNESS_DENSITY"
          ? "TON"
          : "CY",
      inputs: {
        ...(conversion.inputs || {}),
        density:
          conversion.inputs?.density ?? 1.5,
        densityUnit:
          conversion.inputs?.densityUnit ||
          "TON/CY",
      },
    });
  }}
>
  <option value="AREA_THICKNESS">
    Area × Thickness → Volume
  </option>

  <option value="AREA_THICKNESS_DENSITY">
    Area × Thickness × Density → Weight
  </option>
</select>
          </label>

          <label className="drawer-field">
            <span>Takeoff Unit</span>

            <select
              value={
                conversion.takeoffUnit ||
                selectedLine.unit ||
                "SF"
              }
              onChange={(event) =>
                updateConversion({
                  takeoffUnit:
                    event.target.value,
                })
              }
            >
              <option value="SF">SF</option>
              <option value="SY">SY</option>
              <option value="SM">SM</option>
            </select>
          </label>

          <label className="drawer-field">
            <span>Thickness</span>

            <input
              type="number"
              min="0"
              step="any"
              value={
                conversion.inputs
                  ?.thickness ?? 4
              }
              onChange={(event) =>
                updateConversion({
                  inputs: {
                    ...(conversion.inputs || {}),
                    thickness:
                      event.target.value,
                  },
                })
              }
            />
          </label>

          <label className="drawer-field">
            <span>Thickness Unit</span>

            <select
              value={
                conversion.inputs
                  ?.thicknessUnit || "IN"
              }
              onChange={(event) =>
                updateConversion({
                  inputs: {
                    ...(conversion.inputs || {}),
                    thicknessUnit:
                      event.target.value,
                  },
                })
              }
            >
              <option value="IN">Inches</option>
              <option value="FT">Feet</option>
              <option value="MM">Millimeters</option>
              <option value="M">Meters</option>
            </select>
          </label>
{conversion.method ===
  "AREA_THICKNESS_DENSITY" && (
  <>
    <label className="drawer-field">
      <span>Material Density</span>

      <input
        type="number"
        min="0"
        step="any"
        value={
          conversion.inputs?.density ?? 1.5
        }
        onChange={(event) =>
          updateConversion({
            inputs: {
              ...(conversion.inputs || {}),
              density: event.target.value,
            },
          })
        }
      />
    </label>

    <label className="drawer-field">
      <span>Density Unit</span>

      <select
        value={
          conversion.inputs?.densityUnit ||
          "TON/CY"
        }
        onChange={(event) =>
          updateConversion({
            inputs: {
              ...(conversion.inputs || {}),
              densityUnit: event.target.value,
            },
          })
        }
      >
        <option value="TON/CY">
          US Tons / Cubic Yard
        </option>
        <option value="LB/CF">
          Pounds / Cubic Foot
        </option>
        <option value="KG/CM">
          Kilograms / Cubic Meter
        </option>
      </select>
    </label>
  </>
)}
          <label className="drawer-field">
            <span>Output Unit</span>

            <select
  value={
    conversion.outputUnit ||
    (conversion.method ===
    "AREA_THICKNESS_DENSITY"
      ? "TON"
      : "CY")
  }
  onChange={(event) =>
    updateConversion({
      outputUnit: event.target.value,
    })
  }
>
  {conversion.method ===
  "AREA_THICKNESS_DENSITY" ? (
    <>
      <option value="TON">
        US Short Tons
      </option>
      <option value="LB">
        Pounds
      </option>
      <option value="KG">
        Kilograms
      </option>
    </>
  ) : (
    <>
      <option value="CY">
        Cubic Yards
      </option>
      <option value="CF">
        Cubic Feet
      </option>
      <option value="CM">
        Cubic Meters
      </option>
    </>
  )}
</select>
          </label>
        </>
      )}
    </div>
  );
})()}
<div className="material-pricing-section">
  <div className="material-section-heading">
    <span className="material-section-number">3</span>

    <div>
      <h4>Material Pricing</h4>
      <p>
        Define purchasing, waste, tax and markup
        assumptions for this estimate.
      </p>
    </div>
  </div>

  <div className="material-pricing-grid">
          <label className="drawer-field">
            <span>Material Description</span>

            <input
              value={
                selectedLine.materialBuildUp
                  ?.materialDescription || ""
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "materialDescription",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
  <span>Material Unit</span>

  {selectedLine.materialBuildUp
    ?.conversion?.mode === "GUIDED" ? (
    <input
      type="text"
      value={
        selectedLine.materialBuildUp
          .conversion.outputUnit || "CY"
      }
      readOnly
    />
  ) : (
    <input
      value={
        selectedLine.materialBuildUp
          ?.materialUnit || ""
      }
      onChange={(event) =>
        updateMaterialBuildUp(
          selectedLine.id,
          "materialUnit",
          event.target.value
        )
      }
    />
  )}
</label>

          {(() => {
  const material =
    selectedLine.materialBuildUp || {};

  const conversionMode =
    material.conversion?.mode ||
    (material.conversionFormula
      ? "FORMULA"
      : "DIRECT");

  if (conversionMode === "GUIDED") {
    return null;
  }

  const isFormula =
    conversionMode === "FORMULA";

  return (
    <label className="drawer-field">
      <span>
        {isFormula
          ? "Conversion Formula"
          : "Conversion Factor"}
      </span>

      <input
        type="text"
        value={
          isFormula
            ? material.conversionFormula ?? ""
            : material.conversionFactor ?? ""
        }
        placeholder={
          isFormula
            ? "Example: =4/12/27"
            : "Example: 0.012345679"
        }
        onChange={(event) =>
          updateMaterialBuildUp(
            selectedLine.id,
            isFormula
              ? "conversionFormula"
              : "conversionFactor",
            event.target.value
          )
        }
      />
    </label>
  );
})()}

          <label className="drawer-field">
            <span>Waste %</span>

            <input
              type="number"
              value={
                selectedLine.materialBuildUp
                  ?.wastePercent || 0
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "wastePercent",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Unit Cost</span>

            <input
              type="number"
              value={
                selectedLine.materialBuildUp
                  ?.unitCost || 0
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "unitCost",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Tax %</span>

            <input
              type="number"
              value={
                selectedLine.materialBuildUp
                  ?.taxPercent || 0
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "taxPercent",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Markup %</span>


            <input
              type="number"
              value={
                selectedLine.materialBuildUp
                  ?.markupPercent || 0
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "markupPercent",
                  event.target.value
                )
              }
            />
          </label>
            </div>
</div>

          {(() => {
  const material =
    selectedLine.materialBuildUp || {};

  const calculation =
    calculateMaterialBuildUpTotal(
      selectedLine.quantity,
      material
    );

  const isGuided =
    material.conversion?.mode === "GUIDED";

  const unit = isGuided
    ? material.conversion.outputUnit || "CY"
    : material.materialUnit || "";

  return (
  <div className="calc-summary material-conversion-section">
      {!calculation.conversionIsValid && (
        <p role="alert">
          Conversion error:{" "}
          {calculation.conversionError}
        </p>
      )}

      <div className="material-cost-summary">
  <div className="material-section-heading">
    <span className="material-section-number">4</span>

    <div>
      <h4>Material Cost Summary</h4>
      <p>
        Review the calculated purchase quantity and
        resulting material cost.
      </p>
    </div>
  </div>

  {calculation.conversionIsValid && (
    <>
      <div className="material-summary-primary">
        <div className="material-summary-highlight">
          <span>Purchase Quantity</span>
          <strong>
            {calculation.materialQuantity.toFixed(2)}{" "}
            {unit}
          </strong>
        </div>

        <div className="material-summary-highlight">
          <span>Total Material Cost</span>
          <strong>
            {formatCurrency(
              selectedLine.materialTotal || 0
            )}
          </strong>
        </div>
      </div>

      <div className="material-summary-details">
        <div>
          <span>Net Material Quantity</span>
          <strong>
            {calculation.netMaterialQuantity.toFixed(2)}{" "}
            {unit}
          </strong>
        </div>

        <div>
          <span>Waste Quantity</span>
          <strong>
            {(
              calculation.materialQuantity -
              calculation.netMaterialQuantity
            ).toFixed(2)}{" "}
            {unit}
          </strong>
        </div>

        <div>
          <span>Calculated Conversion</span>
          <strong>
            {calculation.calculatedConversion.toFixed(8)}
          </strong>
        </div>
      </div>
    </>
  )}

  {!calculation.conversionIsValid && (
    <div className="material-summary-primary">
      <div className="material-summary-highlight">
        <span>Total Material Cost</span>
        <strong>
          {formatCurrency(
            selectedLine.materialTotal || 0
          )}
        </strong>
      </div>
    </div>
    )}
</div>
</div>

  );
})()}
        </div>
      )}

      {activeTab === "Equipment" && (
        <div className="drawer-section">
          <h3>
            Additional Equipment Build-Up
          </h3>

          {mode === "estimate" &&
            Number(
              selectedLine.crewEquipmentTotal ||
                0
            ) > 0 && (
              <div className="calc-summary">
                <p>
                  <strong>
                    Equipment Included in Crew:
                  </strong>{" "}
                  {formatCurrency(
                    selectedLine.crewEquipmentTotal
                  )}
                </p>

                <p>
                  Add only equipment that is not
                  already included in the selected
                  crew.
                </p>
              </div>
            )}

          <label className="drawer-field">
            <span>
              Equipment Description
            </span>

            <input
              value={
                selectedLine.equipmentBuildUp
                  ?.equipmentDescription || ""
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "equipmentDescription",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Quantity</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.quantity || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "quantity",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Operating Hours</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.hours || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "hours",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Hourly Rate</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.hourlyRate || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "hourlyRate",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Standby Hours</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.standbyHours || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "standbyHours",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Standby Rate</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.standbyRate || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "standbyRate",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">

            <span>Markup %</span>

            <input
              type="number"
              value={
                selectedLine.equipmentBuildUp
                  ?.markupPercent || 0
              }
              onChange={(event) =>
                updateEquipmentBuildUp(
                  selectedLine.id,
                  "markupPercent",
                  event.target.value
                )
              }
            />
          </label>


          <div className="calc-summary">
            <p>
              <strong>
                Total Equipment:
              </strong>{" "}
              {formatCurrency(
                selectedLine.equipmentTotal || 0
              )}
            </p>
          </div>
        </div>
      )}

      {activeTab === "Subcontract" && (
        <div className="drawer-section">
          <h3>Subcontract</h3>

          <p>
            Subcontract proposal comparison
            coming soon.
          </p>
        </div>
      )}

      {activeTab === "Procurement" && (
        <div className="drawer-section">
          <h3>Procurement</h3>

          {[
            ["Bid Package", "bidPackage"],
            ["Trade", "trade"],
            ["Cost Code", "costCode"],
            ["Phase", "phase"],
          ].map(([label, field]) => (
            <label
              className="drawer-field"
              key={field}
            >
              <span>{label}</span>

              <input
                value={
                  selectedLine[field] || ""
                }
                onChange={(event) =>
                  updateLine(
                    selectedLine.id,
                    field,
                    event.target.value
                  )
                }
              />
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

export default EstimateLineDrawer;