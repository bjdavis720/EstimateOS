import { useState } from "react";

function EstimateItemWorkspace({
  selectedItem,
  updateEstimateItem,
  closeWorkspace,
}) {
  const [activeTab, setActiveTab] = useState("Classification");

  if (!selectedItem) return null;

  const tabs = [
    "Classification",
    "Labor",
    "Material",
    "Equipment",
    "Subcontract",
    "Other",
    "History",
    "Vendors",
    "Documents",
    "Notes",
  ];

  return (
    <section className="estimate-item-workspace">
      <div className="workspace-header">
        <div>
          <span className="workspace-eyebrow">Estimate Item Workspace</span>
          <h2>{selectedItem.description || "Estimate Item"}</h2>
        </div>

        <button className="close-btn" onClick={closeWorkspace}>
          Close
        </button>
      </div>

      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "workspace-tab active"
                : "workspace-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Classification" && (
        <div className="workspace-content">
          <div className="workspace-grid">
            <label className="drawer-field">
              <span>Description</span>
              <input
                value={selectedItem.description || ""}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "description",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Category</span>
              <select
                className="table-select"
                value={selectedItem.category || "Labor"}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "category",
                    e.target.value
                  )
                }
              >
                <option>Labor</option>
                <option>Material</option>
                <option>Equipment</option>
                <option>Subcontract</option>
                <option>Other</option>
              </select>
            </label>

            <label className="drawer-field">
              <span>Unit</span>
              <input
                value={selectedItem.unit || ""}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "unit",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Trade</span>
              <input
                value={selectedItem.trade || ""}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "trade",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Cost Code</span>
              <input
                value={selectedItem.costCode || ""}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "costCode",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Default Unit Cost</span>
              <input
                type="number"
                value={selectedItem.defaultUnitCost || 0}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "defaultUnitCost",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="drawer-field">
              <span>Productivity</span>
              <input
                value={selectedItem.productivity || ""}
                onChange={(e) =>
                  updateEstimateItem(
                    selectedItem.id,
                    "productivity",
                    e.target.value
                  )
                }
              />
            </label>
          </div>
        </div>
      )}

      {activeTab === "Labor" && (
        <div className="workspace-content">
          <h3>Labor Build-Up</h3>
          <p>Labor build-up fields will be added here.</p>
        </div>
      )}

      {activeTab === "Material" && (
        <div className="workspace-content">
          <h3>Material Build-Up</h3>
          <p>Material build-up fields will be added here.</p>
        </div>
      )}

      {activeTab === "Equipment" && (
        <div className="workspace-content">
          <h3>Equipment Build-Up</h3>
          <p>Equipment build-up fields will be added here.</p>
        </div>
      )}

      {activeTab === "Subcontract" && (
        <div className="workspace-content">
          <h3>Subcontract Build-Up</h3>
          <p>Subcontract pricing and proposal history will be added here.</p>
        </div>
      )}

      {activeTab === "Other" && (
        <div className="workspace-content">
          <h3>Other Costs</h3>
          <p>Other cost components will be added here.</p>
        </div>
      )}

      {activeTab === "History" && (
        <div className="workspace-content">
          <h3>Historical Costs</h3>
          <p>Estimate, bid, award, and actual cost history will appear here.</p>
        </div>
      )}

      {activeTab === "Vendors" && (
        <div className="workspace-content">
          <h3>Vendor History</h3>
          <p>Vendor quotes and supplier history will appear here.</p>
        </div>
      )}

      {activeTab === "Documents" && (
        <div className="workspace-content">
          <h3>Documents</h3>
          <p>Specifications, quotes, and supporting files will appear here.</p>
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="workspace-content">
          <label className="drawer-field">
            <span>Notes</span>
            <textarea
              className="workspace-textarea"
              value={selectedItem.notes || ""}
              onChange={(e) =>
                updateEstimateItem(
                  selectedItem.id,
                  "notes",
                  e.target.value
                )
              }
            />
          </label>
        </div>
      )}
    </section>
  );
}

export default EstimateItemWorkspace;