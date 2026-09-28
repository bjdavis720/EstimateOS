import { useState } from "react";
import { getEstimateWorkspaceData } from "../calculations/estimateWorkspaceCalculations";

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
  mode = "estimate",
}) {
  const [activeTab, setActiveTab] =
    useState("Classification");

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
  materialQuantity,
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

            <input
              value={
                selectedLine.materialBuildUp
                  ?.materialUnit || "CY"
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "materialUnit",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Conversion Factor</span>

            <input
              type="text"
              value={
                selectedLine.materialBuildUp
                  ?.conversionFactor || ""
              }
              onChange={(event) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "conversionFactor",
                  event.target.value
                )
              }
            />
          </label>

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

          <div className="calc-summary">
            <p>
              <strong>
                Calculated Material Qty:
              </strong>{" "}
              {materialQuantity.toFixed(2)}{" "}
              {selectedLine.materialBuildUp
                ?.materialUnit || ""}
            </p>

            <p>
              <strong>
                Calculated Material:
              </strong>{" "}
              {formatCurrency(
                selectedLine.materialTotal || 0
              )}
            </p>
          </div>
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