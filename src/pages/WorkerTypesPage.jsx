import { useState } from "react";

function WorkerTypesPage({
  workerTypes,
  setWorkerTypes,
  locations,
}) {
  const [search, setSearch] = useState("");
  const [selectedWorkerTypeId, setSelectedWorkerTypeId] = useState(null);
  const [activeTab, setActiveTab] = useState("Classification");

  const selectedWorkerType =
    workerTypes.find(
      (workerType) => workerType.id === selectedWorkerTypeId
    ) || null;

  const filteredWorkerTypes = workerTypes.filter((workerType) =>
    `${workerType.name} ${workerType.classification} ${workerType.trade}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addWorkerType() {
    const newWorkerType = {
      id: Date.now(),
      name: "New Trade Person Type",
      classification: "",
      trade: "",
      unit: "HR",
      active: true,
      notes: "",
      rates: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    setWorkerTypes([...workerTypes, newWorkerType]);
    setSelectedWorkerTypeId(newWorkerType.id);
    setActiveTab("Classification");
  }

  function updateWorkerType(id, field, value) {
    setWorkerTypes(
      workerTypes.map((workerType) =>
        workerType.id === id
          ? {
              ...workerType,
              [field]: value,
              modified: new Date().toISOString(),
            }
          : workerType
      )
    );
  }

  function deleteWorkerType(id) {
    setWorkerTypes(
      workerTypes.filter((workerType) => workerType.id !== id)
    );

    if (selectedWorkerTypeId === id) {
      setSelectedWorkerTypeId(null);
    }
  }

  function calculateRateComponent(baseWage, value, mode) {
  const numericBaseWage = Number(baseWage || 0);
  const numericValue = Number(value || 0);

  if (mode === "Percent") {
    return numericBaseWage * (numericValue / 100);
  }

  return numericValue;
}

function calculateRateSummary(rate) {
  const baseWage = Number(rate.baseWage || 0);

  const fringeBenefits = calculateRateComponent(
    baseWage,
    rate.fringeBenefits,
    rate.fringeBenefitsMode || "Dollars"
  );

  const payrollTaxes = calculateRateComponent(
    baseWage,
    rate.payrollTaxes,
    rate.payrollTaxesMode || "Percent"
  );

  const workersComp = calculateRateComponent(
    baseWage,
    rate.workersComp,
    rate.workersCompMode || "Percent"
  );

  const insuranceBurden = calculateRateComponent(
    baseWage,
    rate.insuranceBurden,
    rate.insuranceBurdenMode || "Percent"
  );

  const otherBurden = calculateRateComponent(
    baseWage,
    rate.otherBurden,
    rate.otherBurdenMode || "Dollars"
  );

  return {
    baseWage,
    fringeBenefits,
    payrollTaxes,
    workersComp,
    insuranceBurden,
    otherBurden,

    loadedRate:
      baseWage +
      fringeBenefits +
      payrollTaxes +
      workersComp +
      insuranceBurden +
      otherBurden,
  };
}

  function addRate(workerTypeId) {
    const defaultLocation = locations.find(
      (location) => location.active
    );

    setWorkerTypes(
      workerTypes.map((workerType) =>
        workerType.id === workerTypeId
          ? {
              ...workerType,
              rates: [
                ...(workerType.rates || []),
                {
                  id: Date.now(),
                  locationId: defaultLocation?.id || "",
                  effectiveDate: new Date()
                    .toISOString()
                    .slice(0, 10),
                  laborCondition: "Open Shop",
                  baseWage: 0,
                    fringeBenefits: 0,
  fringeBenefitsMode: "Dollars",
                   payrollTaxes: 0,
  payrollTaxesMode: "Percent",
                  workersCompMode: "Percent",
                   insuranceBurden: 0,
  insuranceBurdenMode: "Percent",
                  otherBurden: 0,
  otherBurdenMode: "Percent",
                  source: "",
                  notes: "",
                  burdenProfileId: null,
                },
              ],
              modified: new Date().toISOString(),
            }
          : workerType
      )
    );
  }

  function updateRate(workerTypeId, rateId, field, value) {
    const textFields = [
  "locationId",
  "effectiveDate",
  "laborCondition",
  "source",
  "notes",
  "fringeBenefitsMode",
  "payrollTaxesMode",
  "workersCompMode",
  "insuranceBurdenMode",
  "otherBurdenMode",
];

    setWorkerTypes(
      workerTypes.map((workerType) => {
        if (workerType.id !== workerTypeId) return workerType;

        return {
          ...workerType,
          rates: (workerType.rates || []).map((rate) =>
            rate.id === rateId
              ? {
                  ...rate,
                  [field]: textFields.includes(field)
                    ? value
                    : Number(value),
                }
              : rate
          ),
          modified: new Date().toISOString(),
        };
      })
    );
  }

  function deleteRate(workerTypeId, rateId) {
    setWorkerTypes(
      workerTypes.map((workerType) =>
        workerType.id === workerTypeId
          ? {
              ...workerType,
              rates: (workerType.rates || []).filter(
                (rate) => rate.id !== rateId
              ),
              modified: new Date().toISOString(),
            }
          : workerType
      )
    );
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search trade person types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addWorkerType}>
          + New Trade Person Type
        </button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table worker-types-table">
          <thead>
            <tr>
              <th>Trade Person Type</th>
              <th>Classification</th>
              <th>Trade</th>
              <th>Unit</th>
              <th>Rate Records</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkerTypes.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <strong>No trade person types yet.</strong>
                    <p>
                      Create the first reusable labor classification.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filteredWorkerTypes.map((workerType) => (
              <tr
                key={workerType.id}
                className={
                  selectedWorkerTypeId === workerType.id
                    ? "clickable-row selected-row"
                    : "clickable-row"
                }
                onClick={() => {
                  setSelectedWorkerTypeId(workerType.id);
                  setActiveTab("Classification");
                }}
              >
                <td>{workerType.name || "-"}</td>
                <td>{workerType.classification || "-"}</td>
                <td>{workerType.trade || "-"}</td>
                <td>{workerType.unit || "HR"}</td>
                <td>{(workerType.rates || []).length}</td>
                <td>
                  {workerType.active ? "Active" : "Inactive"}
                </td>

                <td className="assembly-actions">
                  <button
                    className="details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkerTypeId(workerType.id);
                      setActiveTab("Classification");
                    }}
                  >
                    Open
                  </button>

                  <button
                    className="danger-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkerType(workerType.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedWorkerType && (
        <section className="estimate-item-workspace">
          <div className="workspace-header">
            <div>
              <span className="workspace-eyebrow">
                Trade Person Type Workspace
              </span>

              <h2>
                {selectedWorkerType.name || "Trade Person Type"}
                {selectedWorkerType.classification
                  ? ` – ${selectedWorkerType.classification}`
                  : ""}
              </h2>
            </div>

            <button
              className="close-btn"
              onClick={() => setSelectedWorkerTypeId(null)}
            >
              Close
            </button>
          </div>

          <div className="workspace-tabs">
            {["Classification", "Rates", "Notes"].map((tab) => (
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
                  <span>Trade Person Type</span>
                  <input
                    value={selectedWorkerType.name || ""}
                    onChange={(e) =>
                      updateWorkerType(
                        selectedWorkerType.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="drawer-field">
                  <span>Classification</span>
                  <input
                    value={
                      selectedWorkerType.classification || ""
                    }
                    onChange={(e) =>
                      updateWorkerType(
                        selectedWorkerType.id,
                        "classification",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="drawer-field">
                  <span>Trade</span>
                  <input
                    value={selectedWorkerType.trade || ""}
                    onChange={(e) =>
                      updateWorkerType(
                        selectedWorkerType.id,
                        "trade",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="drawer-field">
                  <span>Unit</span>
                  <input
                    value={selectedWorkerType.unit || "HR"}
                    onChange={(e) =>
                      updateWorkerType(
                        selectedWorkerType.id,
                        "unit",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="drawer-field">
                  <span>Status</span>
                  <select
                    className="table-select"
                    value={
                      selectedWorkerType.active
                        ? "Active"
                        : "Inactive"
                    }
                    onChange={(e) =>
                      updateWorkerType(
                        selectedWorkerType.id,
                        "active",
                        e.target.value === "Active"
                      )
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {activeTab === "Rates" && (
            <div className="workspace-content">
              <div className="workspace-section-header">
                <div>
                  <h3>Location-Based Rate Build-Up</h3>
                  <p>
                    Add separate rate records by location,
                    effective date, and labor condition.
                  </p>
                </div>

                <button
                  onClick={() =>
                    addRate(selectedWorkerType.id)
                  }
                >
                  + Add Location Rate
                </button>
              </div>

              {(selectedWorkerType.rates || []).length === 0 ? (
                <div className="empty-state">
                  <strong>No rate records yet.</strong>
                  <p>
                    Add the first location-specific labor rate.
                  </p>
                </div>
              ) : (
                <div className="rate-card-list">
                  {(selectedWorkerType.rates || []).map(
                    (rate) => {
                      const rateSummary = calculateRateSummary(rate);
const loadedRate = rateSummary.loadedRate;

                      return (
                        <div
                          className="rate-build-card"
                          key={rate.id}
                        >
                          <div className="rate-card-header">
                            <div>
                              <strong>
                                {locations.find(
                                  (location) =>
                                    String(location.id) ===
                                    String(rate.locationId)
                                )?.name || "Location Rate"}
                              </strong>

                              <span>
                                {rate.laborCondition ||
                                  "Labor Condition"}
                              </span>
                            </div>

                            <button
                              className="danger-btn"
                              onClick={() =>
                                deleteRate(
                                  selectedWorkerType.id,
                                  rate.id
                                )
                              }
                            >
                              Delete Rate
                            </button>
                          </div>

                          <div className="workspace-grid">
                            <label className="drawer-field">
                              <span>Location</span>
                              <select
                                className="table-select"
                                value={rate.locationId || ""}
                                onChange={(e) =>
                                  updateRate(
                                    selectedWorkerType.id,
                                    rate.id,
                                    "locationId",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select location
                                </option>

                                {locations
                                  .filter(
                                    (location) =>
                                      location.active
                                  )
                                  .map((location) => (
                                    <option
                                      key={location.id}
                                      value={location.id}
                                    >
                                      {location.name}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <label className="drawer-field">
                              <span>Effective Date</span>
                              <input
                                type="date"
                                value={
                                  rate.effectiveDate || ""
                                }
                                onChange={(e) =>
                                  updateRate(
                                    selectedWorkerType.id,
                                    rate.id,
                                    "effectiveDate",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label className="drawer-field">
                              <span>Labor Condition</span>
                              <select
                                className="table-select"
                                value={
                                  rate.laborCondition ||
                                  "Open Shop"
                                }
                                onChange={(e) =>
                                  updateRate(
                                    selectedWorkerType.id,
                                    rate.id,
                                    "laborCondition",
                                    e.target.value
                                  )
                                }
                              >
                                <option>Open Shop</option>
                                <option>Union</option>
                                <option>
                                  Prevailing Wage
                                </option>
                                <option>PLA</option>
                              </select>
                            </label>

                            <label className="drawer-field">
                              <span>Base Wage / Hour</span>
                              <input
                                type="number"
                                step="0.01"
                                value={rate.baseWage || 0}
                                onChange={(e) =>
                                  updateRate(
                                    selectedWorkerType.id,
                                    rate.id,
                                    "baseWage",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label className="drawer-field">
  <span>Fringe Benefits</span>

  <div className="rate-input-group">
    <input
      type="number"
      step="0.01"
      value={rate.fringeBenefits || 0}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "fringeBenefits",
          e.target.value
        )
      }
    />

    <select
      className="rate-mode-select"
      value={rate.fringeBenefitsMode || "Dollars"}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "fringeBenefitsMode",
          e.target.value
        )
      }
    >
      <option value="Dollars">$/HR</option>
      <option value="Percent">% Base</option>
    </select>
  </div>

  <small className="calculated-rate-note">
    Hourly amount: ${rateSummary.fringeBenefits.toFixed(2)}
  </small>
</label>

                            <label className="drawer-field">
  <span>Payroll Taxes</span>

  <div className="rate-input-group">
    <input
      type="number"
      step="0.01"
      value={rate.payrollTaxes || 0}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "payrollTaxes",
          e.target.value
        )
      }
    />

    <select
      className="rate-mode-select"
      value={rate.payrollTaxesMode || "Percent"}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "payrollTaxesMode",
          e.target.value
        )
      }
    >
      <option value="Dollars">$/HR</option>
      <option value="Percent">% Base</option>
    </select>
  </div>

  <small className="calculated-rate-note">
    Hourly amount: ${rateSummary.payrollTaxes.toFixed(2)}
  </small>
</label>

                            <label className="drawer-field">
  <span>Workers’ Comp</span>

  <div className="rate-input-group">
    <input
      type="number"
      step="0.01"
      value={rate.workersComp || 0}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "workersComp",
          e.target.value
        )
      }
    />

    <select
      className="rate-mode-select"
      value={rate.workersCompMode || "Percent"}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "workersCompMode",
          e.target.value
        )
      }
    >
      <option value="Dollars">$/HR</option>
      <option value="Percent">% Base</option>
    </select>
  </div>

  <small className="calculated-rate-note">
    Hourly amount: ${rateSummary.workersComp.toFixed(2)}
  </small>
</label>

                            <label className="drawer-field">
  <span>Insurance / Burden</span>

  <div className="rate-input-group">
    <input
      type="number"
      step="0.01"
      value={rate.insuranceBurden || 0}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "insuranceBurden",
          e.target.value
        )
      }
    />

    <select
      className="rate-mode-select"
      value={rate.insuranceBurdenMode || "Percent"}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "insuranceBurdenMode",
          e.target.value
        )
      }
    >
      <option value="Dollars">$/HR</option>
      <option value="Percent">% Base</option>
    </select>
  </div>

  <small className="calculated-rate-note">
    Hourly amount: ${rateSummary.insuranceBurden.toFixed(2)}
  </small>
</label>

                            <label className="drawer-field">
  <span>Other Burden</span>

  <div className="rate-input-group">
    <input
      type="number"
      step="0.01"
      value={rate.otherBurden || 0}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "otherBurden",
          e.target.value
        )
      }
    />

    <select
      className="rate-mode-select"
      value={rate.otherBurdenMode || "Percent"}
      onChange={(e) =>
        updateRate(
          selectedWorkerType.id,
          rate.id,
          "otherBurdenMode",
          e.target.value
        )
      }
    >
      <option value="Dollars">$/HR</option>
      <option value="Percent">% Base</option>
    </select>
  </div>

  <small className="calculated-rate-note">
    Hourly amount: ${rateSummary.otherBurden.toFixed(2)}
  </small>
</label>

                            <label className="drawer-field">
                              <span>Source</span>
                              <input
                                value={rate.source || ""}
                                placeholder="Company standard, wage decision, union agreement..."
                                onChange={(e) =>
                                  updateRate(
                                    selectedWorkerType.id,
                                    rate.id,
                                    "source",
                                    e.target.value
                                  )
                                }
                              />
                            </label>
                          </div>

                          <div className="rate-summary">
                            <span>
                              Loaded Hourly Rate
                            </span>
                            <strong>
                              $
                              {loadedRate.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                              /HR
                            </strong>
                          </div>

                          <label className="drawer-field">
                            <span>Rate Notes</span>
                            <textarea
                              className="workspace-textarea rate-notes"
                              value={rate.notes || ""}
                              onChange={(e) =>
                                updateRate(
                                  selectedWorkerType.id,
                                  rate.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "Notes" && (
            <div className="workspace-content">
              <label className="drawer-field">
                <span>Trade Person Type Notes</span>
                <textarea
                  className="workspace-textarea"
                  value={selectedWorkerType.notes || ""}
                  onChange={(e) =>
                    updateWorkerType(
                      selectedWorkerType.id,
                      "notes",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default WorkerTypesPage;