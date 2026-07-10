import { useState } from "react";

function EstimateLineDrawer({
  selectedLine,
  setSelectedLine,
  updateLine,
  updateLaborBuildUp,
  updateMaterialBuildUp,
updateEquipmentBuildUp,
formatCurrency,
}) {
  const [activeTab, setActiveTab] = useState("Classification");

  if (!selectedLine) return null;

  const laborHours =
    selectedLine.laborBuildUp?.productionRate > 0
      ? Number(selectedLine.quantity || 0) /
        Number(selectedLine.laborBuildUp.productionRate || 1)
      : 0;

  function evaluateFormula(value) {
  if (typeof value === "number") return value;

  const safeValue = String(value).replace(/[^0-9+\-*/().\s]/g, "");

  try {
    const result = Function(`"use strict"; return (${safeValue})`)();
    return Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

const conversionFactor = evaluateFormula(
  selectedLine.materialBuildUp?.conversionFactor || 0
);

const materialQuantity =
  Number(selectedLine.quantity || 0) *
  conversionFactor *
  (1 + Number(selectedLine.materialBuildUp?.wastePercent || 0) / 100);

  const tabs = [
    "Classification",
    "Labor",
    "Material",
    "Equipment",
    "Subcontract",
    "Procurement",
  ];

  return (
    <div className="detail-drawer">
      <div className="drawer-header">
        <h2>{selectedLine.description || "Estimate Item"}</h2>
        <button className="close-btn" onClick={() => setSelectedLine(null)}>
          X
        </button>
      </div>

      <div className="drawer-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "drawer-tab active" : "drawer-tab"}
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
            <label className="drawer-field" key={field}>
              <span>{label}</span>
              <input
                value={selectedLine[field] || ""}
                onChange={(e) =>
                  updateLine(selectedLine.id, field, e.target.value)
                }
              />
            </label>
          ))}
        </div>
      )}

      {activeTab === "Labor" && (
        <div className="drawer-section">
          <h3>Labor Build-Up</h3>

          <label className="drawer-field">
            <span>Crew Type</span>
            <input
              value={selectedLine.laborBuildUp?.crewType || ""}
              onChange={(e) =>
                updateLaborBuildUp(selectedLine.id, "crewType", e.target.value)
              }
            />
          </label>

          <label className="drawer-field">
            <span>Crew Rate / Hour</span>
            <input
              type="number"
              value={selectedLine.laborBuildUp?.crewRate || 0}
              onChange={(e) =>
                updateLaborBuildUp(selectedLine.id, "crewRate", e.target.value)
              }
            />
          </label>

          <label className="drawer-field">
            <span>Production Rate</span>
            <input
              type="number"
              value={selectedLine.laborBuildUp?.productionRate || 0}
              onChange={(e) =>
                updateLaborBuildUp(
                  selectedLine.id,
                  "productionRate",
                  e.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Production Unit</span>
            <input
              value={selectedLine.laborBuildUp?.productionUnit || "SF/hour"}
              onChange={(e) =>
                updateLaborBuildUp(
                  selectedLine.id,
                  "productionUnit",
                  e.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Labor Markup %</span>
            <input
              type="number"
              value={selectedLine.laborBuildUp?.markupPercent || 0}
              onChange={(e) =>
                updateLaborBuildUp(
                  selectedLine.id,
                  "markupPercent",
                  e.target.value
                )
              }
            />
          </label>

          <div className="calc-summary">
            <p>
              <strong>Estimated Hours:</strong> {laborHours.toFixed(2)}
            </p>
            <p>
              <strong>Calculated Labor:</strong>{" "}
              {formatCurrency(selectedLine.laborTotal || 0)}
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
              value={selectedLine.materialBuildUp?.materialDescription || ""}
              onChange={(e) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "materialDescription",
                  e.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Material Unit</span>
            <input
              value={selectedLine.materialBuildUp?.materialUnit || "CY"}
              onChange={(e) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "materialUnit",
                  e.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Conversion Factor</span>
            <input
  type="text"
  value={selectedLine.materialBuildUp?.conversionFactor || ""}
  onChange={(e) =>
    updateMaterialBuildUp(
      selectedLine.id,
      "conversionFactor",
      e.target.value
    )
  }
/>
          </label>

          <label className="drawer-field">
            <span>Waste %</span>
            <input
              type="number"
              value={selectedLine.materialBuildUp?.wastePercent || 0}
              onChange={(e) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "wastePercent",
                  e.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Unit Cost</span>
            <input
              type="number"
              value={selectedLine.materialBuildUp?.unitCost || 0}
              onChange={(e) =>
                updateMaterialBuildUp(selectedLine.id, "unitCost", e.target.value)
              }
            />
          </label>

          <label className="drawer-field">
            <span>Tax %</span>
            <input
              type="number"
              value={selectedLine.materialBuildUp?.taxPercent || 0}
              onChange={(e) =>
                updateMaterialBuildUp(selectedLine.id, "taxPercent", e.target.value)
              }
            />
          </label>

          <label className="drawer-field">
            <span>Markup %</span>
            <input
              type="number"
              value={selectedLine.materialBuildUp?.markupPercent || 0}
              onChange={(e) =>
                updateMaterialBuildUp(
                  selectedLine.id,
                  "markupPercent",
                  e.target.value
                )
              }
            />
          </label>

          <div className="calc-summary">
            <p>
              <strong>Calculated Material Qty:</strong>{" "}
              {materialQuantity.toFixed(2)}{" "}
              {selectedLine.materialBuildUp?.materialUnit || ""}
            </p>
            <p>
              <strong>Calculated Material:</strong>{" "}
              {formatCurrency(selectedLine.materialTotal || 0)}
            </p>
          </div>
        </div>
      )}

      {activeTab === "Equipment" && (
  <div className="drawer-section">
    <h3>Equipment Build-Up</h3>

    <label className="drawer-field">
      <span>Equipment Description</span>
      <input
        value={selectedLine.equipmentBuildUp?.equipmentDescription || ""}
        onChange={(e) =>
          updateEquipmentBuildUp(
            selectedLine.id,
            "equipmentDescription",
            e.target.value
          )
        }
      />
    </label>

    <label className="drawer-field">
      <span>Quantity</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.quantity || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "quantity", e.target.value)
        }
      />
    </label>

    <label className="drawer-field">
      <span>Operating Hours</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.hours || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "hours", e.target.value)
        }
      />
    </label>

    <label className="drawer-field">
      <span>Hourly Rate</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.hourlyRate || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "hourlyRate", e.target.value)
        }
      />
    </label>

    <label className="drawer-field">
      <span>Standby Hours</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.standbyHours || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "standbyHours", e.target.value)
        }
      />
    </label>

    <label className="drawer-field">
      <span>Standby Rate</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.standbyRate || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "standbyRate", e.target.value)
        }
      />
    </label>

    <label className="drawer-field">
      <span>Markup %</span>
      <input
        type="number"
        value={selectedLine.equipmentBuildUp?.markupPercent || 0}
        onChange={(e) =>
          updateEquipmentBuildUp(selectedLine.id, "markupPercent", e.target.value)
        }
      />
    </label>

    <div className="calc-summary">
      <p>
        <strong>Calculated Equipment:</strong>{" "}
        {formatCurrency(selectedLine.equipmentTotal || 0)}
      </p>
    </div>
  </div>
)}

      {activeTab === "Subcontract" && (
        <div className="drawer-section">
          <h3>Subcontract</h3>
          <p>Subcontract proposal comparison coming soon.</p>
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
            <label className="drawer-field" key={field}>
              <span>{label}</span>
              <input
                value={selectedLine[field] || ""}
                onChange={(e) =>
                  updateLine(selectedLine.id, field, e.target.value)
                }
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default EstimateLineDrawer;