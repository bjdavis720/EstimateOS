import { useState } from "react";

function CrewsPage({
  crews,
  setCrews,
  workerTypes,
  locations,
}) {
  const [search, setSearch] = useState("");
  const [selectedCrewId, setSelectedCrewId] = useState(null);
  const [activeTab, setActiveTab] = useState("Composition");

  const selectedCrew =
    crews.find((crew) => crew.id === selectedCrewId) || null;

  const filteredCrews = crews.filter((crew) =>
    `${crew.name} ${crew.trade} ${crew.productionUnit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addCrew() {
    const defaultLocation = locations.find(
      (location) => location.active
    );

    const newCrew = {
      id: Date.now(),
      name: "New Crew",
      trade: "",
      unit: "HR",
      locationId: defaultLocation?.id || "",
      effectiveDate: new Date().toISOString().slice(0, 10),
      productionRate: 0,
      productionUnit: "EA/HR",
      shiftHours: 8,
      availableCrewCount: 1,
      members: [],
      notes: "",
      active: true,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    setCrews([...crews, newCrew]);
    setSelectedCrewId(newCrew.id);
    setActiveTab("Composition");
  }

  function updateCrew(id, field, value) {
    const numericFields = [
      "productionRate",
      "shiftHours",
      "availableCrewCount",
    ];

    setCrews(
      crews.map((crew) =>
        crew.id === id
          ? {
              ...crew,
              [field]: numericFields.includes(field)
                ? Number(value)
                : value,
              modified: new Date().toISOString(),
            }
          : crew
      )
    );
  }

  function deleteCrew(id) {
    setCrews(crews.filter((crew) => crew.id !== id));

    if (selectedCrewId === id) {
      setSelectedCrewId(null);
    }
  }

  function addCrewMember(crewId) {
    const firstWorkerType = workerTypes.find(
      (workerType) => workerType.active
    );

    if (!firstWorkerType) return;

    setCrews(
      crews.map((crew) =>
        crew.id === crewId
          ? {
              ...crew,
              members: [
                ...(crew.members || []),
                {
                  id: Date.now(),
                  workerTypeId: firstWorkerType.id,
                  quantity: 1,
                },
              ],
              modified: new Date().toISOString(),
            }
          : crew
      )
    );
  }

  function updateCrewMember(
    crewId,
    memberId,
    field,
    value
  ) {
    setCrews(
      crews.map((crew) => {
        if (crew.id !== crewId) return crew;

        return {
          ...crew,
          members: (crew.members || []).map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  [field]:
                    field === "quantity"
                      ? Number(value)
                      : value,
                }
              : member
          ),
          modified: new Date().toISOString(),
        };
      })
    );
  }

  function deleteCrewMember(crewId, memberId) {
    setCrews(
      crews.map((crew) =>
        crew.id === crewId
          ? {
              ...crew,
              members: (crew.members || []).filter(
                (member) => member.id !== memberId
              ),
              modified: new Date().toISOString(),
            }
          : crew
      )
    );
  }

  function calculateRateComponent(baseWage, value, mode) {
    const numericBaseWage = Number(baseWage || 0);
    const numericValue = Number(value || 0);

    if (mode === "Percent") {
      return numericBaseWage * (numericValue / 100);
    }

    return numericValue;
  }

  function calculateLoadedRate(rate) {
    if (!rate) return 0;

    const baseWage = Number(rate.baseWage || 0);

    return (
      baseWage +
      calculateRateComponent(
        baseWage,
        rate.fringeBenefits,
        rate.fringeBenefitsMode || "Dollars"
      ) +
      calculateRateComponent(
        baseWage,
        rate.payrollTaxes,
        rate.payrollTaxesMode || "Percent"
      ) +
      calculateRateComponent(
        baseWage,
        rate.workersComp,
        rate.workersCompMode || "Percent"
      ) +
      calculateRateComponent(
        baseWage,
        rate.insuranceBurden,
        rate.insuranceBurdenMode || "Percent"
      ) +
      calculateRateComponent(
        baseWage,
        rate.otherBurden,
        rate.otherBurdenMode || "Percent"
      )
    );
  }

  function getApplicableRate(workerType, crew) {
    const matchingRates = (workerType.rates || [])
      .filter(
        (rate) =>
          String(rate.locationId) ===
            String(crew.locationId) &&
          (!crew.effectiveDate ||
            !rate.effectiveDate ||
            rate.effectiveDate <= crew.effectiveDate)
      )
      .sort((a, b) =>
        String(b.effectiveDate || "").localeCompare(
          String(a.effectiveDate || "")
        )
      );

    return matchingRates[0] || null;
  }

  function getCrewSummary(crew) {
    return (crew.members || []).reduce(
      (summary, member) => {
        const workerType = workerTypes.find(
          (item) =>
            String(item.id) ===
            String(member.workerTypeId)
        );

        const rate = workerType
          ? getApplicableRate(workerType, crew)
          : null;

        const loadedRate = calculateLoadedRate(rate);
        const quantity = Number(member.quantity || 0);

        return {
          crewSize: summary.crewSize + quantity,
          hourlyCost:
            summary.hourlyCost + quantity * loadedRate,
        };
      },
      {
        crewSize: 0,
        hourlyCost: 0,
      }
    );
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search crews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addCrew}>+ New Crew</button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table crews-table">
          <thead>
            <tr>
              <th>Crew</th>
              <th>Trade</th>
              <th>Members</th>
              <th>Crew Size</th>
              <th>Hourly Cost</th>
              <th>Production</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCrews.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <strong>No crews yet.</strong>
                    <p>
                      Create the first reusable labor crew.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filteredCrews.map((crew) => {
              const summary = getCrewSummary(crew);

              return (
                <tr
                  key={crew.id}
                  className={
                    selectedCrewId === crew.id
                      ? "clickable-row selected-row"
                      : "clickable-row"
                  }
                  onClick={() => {
                    setSelectedCrewId(crew.id);
                    setActiveTab("Composition");
                  }}
                >
                  <td>{crew.name || "-"}</td>
                  <td>{crew.trade || "-"}</td>
                  <td>{(crew.members || []).length}</td>
                  <td>{summary.crewSize}</td>
                  <td>
                    $
                    {summary.hourlyCost.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                    /HR
                  </td>
                  <td>
                    {Number(crew.productionRate || 0)}{" "}
                    {crew.productionUnit || ""}
                  </td>
                  <td>
                    {crew.active ? "Active" : "Inactive"}
                  </td>

                  <td className="assembly-actions">
                    <button
                      className="details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrewId(crew.id);
                        setActiveTab("Composition");
                      }}
                    >
                      Open
                    </button>

                    <button
                      className="danger-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCrew(crew.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCrew && (() => {
        const summary = getCrewSummary(selectedCrew);

        return (
          <section className="estimate-item-workspace">
            <div className="workspace-header">
              <div>
                <span className="workspace-eyebrow">
                  Crew Workspace
                </span>
                <h2>{selectedCrew.name || "Crew"}</h2>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedCrewId(null)}
              >
                Close
              </button>
            </div>

            <div className="workspace-tabs">
              {[
                "Composition",
                "Productivity",
                "Notes",
              ].map((tab) => (
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

            {activeTab === "Composition" && (
              <div className="workspace-content">
                <div className="workspace-grid">
                  <label className="drawer-field">
                    <span>Crew Name</span>
                    <input
                      value={selectedCrew.name || ""}
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="drawer-field">
                    <span>Trade</span>
                    <input
                      value={selectedCrew.trade || ""}
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "trade",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="drawer-field">
                    <span>Labor Location</span>
                    <select
                      className="table-select"
                      value={selectedCrew.locationId || ""}
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
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
                          (location) => location.active
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
                    <span>Rate Effective Date</span>
                    <input
                      type="date"
                      value={
                        selectedCrew.effectiveDate || ""
                      }
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "effectiveDate",
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
                        selectedCrew.active
                          ? "Active"
                          : "Inactive"
                      }
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
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

                <div className="workspace-section-header">
                  <div>
                    <h3>Crew Composition</h3>
                    <p>
                      Add trade persons and set the number
                      assigned to this crew.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      addCrewMember(selectedCrew.id)
                    }
                  >
                    + Add Trade Person
                  </button>
                </div>

                <div className="table-wrap">
                  <table className="crew-members-table">
                    <thead>
                      <tr>
                        <th>Trade Person Type</th>
                        <th>Quantity</th>
                        <th>Loaded Rate</th>
                        <th>Extended / HR</th>
                        <th>Rate Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(selectedCrew.members || []).length ===
                        0 && (
                        <tr>
                          <td colSpan="6">
                            <div className="empty-state">
                              <strong>
                                No trade persons added.
                              </strong>
                              <p>
                                Add the first member of this
                                crew.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {(selectedCrew.members || []).map(
                        (member) => {
                          const workerType =
                            workerTypes.find(
                              (item) =>
                                String(item.id) ===
                                String(
                                  member.workerTypeId
                                )
                            );

                          const rate = workerType
                            ? getApplicableRate(
                                workerType,
                                selectedCrew
                              )
                            : null;

                          const loadedRate =
                            calculateLoadedRate(rate);

                          const extended =
                            loadedRate *
                            Number(member.quantity || 0);

                          return (
                            <tr key={member.id}>
                              <td>
                                <select
                                  className="table-select"
                                  value={
                                    member.workerTypeId ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateCrewMember(
                                      selectedCrew.id,
                                      member.id,
                                      "workerTypeId",
                                      e.target.value
                                    )
                                  }
                                >
                                  {workerTypes
                                    .filter(
                                      (item) => item.active
                                    )
                                    .map((item) => (
                                      <option
                                        key={item.id}
                                        value={item.id}
                                      >
                                        {item.name}
                                        {item.classification
                                          ? ` – ${item.classification}`
                                          : ""}
                                      </option>
                                    ))}
                                </select>
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={
                                    member.quantity || 0
                                  }
                                  onChange={(e) =>
                                    updateCrewMember(
                                      selectedCrew.id,
                                      member.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                $
                                {loadedRate.toFixed(2)}
                                /HR
                              </td>

                              <td>
                                ${extended.toFixed(2)}
                                /HR
                              </td>

                              <td>
                                {rate
                                  ? "Rate Found"
                                  : "No Matching Rate"}
                              </td>

                              <td>
                                <button
                                  className="danger-btn"
                                  onClick={() =>
                                    deleteCrewMember(
                                      selectedCrew.id,
                                      member.id
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="crew-summary-row">
                  <div className="crew-summary-card">
                    <span>Total Crew Size</span>
                    <strong>{summary.crewSize}</strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>Loaded Crew Cost</span>
                    <strong>
                      $
                      {summary.hourlyCost.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      /HR
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Productivity" && (
              <div className="workspace-content">
                <div className="workspace-grid">
                  <label className="drawer-field">
                    <span>Production Rate</span>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        selectedCrew.productionRate || 0
                      }
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "productionRate",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="drawer-field">
                    <span>Production Unit</span>
                    <input
                      value={
                        selectedCrew.productionUnit || ""
                      }
                      placeholder="SF/HR, LF/HR, CY/DAY..."
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "productionUnit",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="drawer-field">
                    <span>Shift Hours</span>
                    <input
                      type="number"
                      step="0.5"
                      value={
                        selectedCrew.shiftHours || 0
                      }
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "shiftHours",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="drawer-field">
                    <span>Available Crew Count</span>
                    <input
                      type="number"
                      step="1"
                      value={
                        selectedCrew.availableCrewCount || 0
                      }
                      onChange={(e) =>
                        updateCrew(
                          selectedCrew.id,
                          "availableCrewCount",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <div className="crew-summary-row">
                  <div className="crew-summary-card">
                    <span>Hourly Production</span>
                    <strong>
                      {Number(
                        selectedCrew.productionRate || 0
                      ).toLocaleString()}{" "}
                      {selectedCrew.productionUnit || ""}
                    </strong>
                  </div>

                  <div className="crew-summary-card">
                    <span>Production per Shift</span>
                    <strong>
                      {(
                        Number(
                          selectedCrew.productionRate || 0
                        ) *
                        Number(selectedCrew.shiftHours || 0)
                      ).toLocaleString()}{" "}
                      {selectedCrew.productionUnit || ""}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div className="workspace-content">
                <label className="drawer-field">
                  <span>Crew Notes</span>
                  <textarea
                    className="workspace-textarea"
                    value={selectedCrew.notes || ""}
                    onChange={(e) =>
                      updateCrew(
                        selectedCrew.id,
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
      })()}
    </div>
  );
}

export default CrewsPage;