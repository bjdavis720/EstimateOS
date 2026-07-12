import { useState } from "react";

function CrewsPage({
  crews,
  setCrews,
  resources,
  locations,
}) {
  const [search, setSearch] = useState("");
  const [selectedCrewId, setSelectedCrewId] =
    useState(null);
  const [activeTab, setActiveTab] =
    useState("Composition");

  const selectedCrew =
    crews.find((crew) => crew.id === selectedCrewId) ||
    null;

  const filteredCrews = crews.filter((crew) =>
    `${crew.name} ${crew.trade} ${crew.productionUnit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function createId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function addCrew() {
    const defaultLocation = locations.find(
      (location) => location.active
    );

    const newCrew = {
      id: createId(),
      name: "New Crew",
      trade: "",
      unit: "HR",
      locationId: defaultLocation?.id || "",
      effectiveDate: new Date()
        .toISOString()
        .slice(0, 10),
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
    setCrews(
      crews.filter((crew) => crew.id !== id)
    );

    if (selectedCrewId === id) {
      setSelectedCrewId(null);
    }
  }

  function addCrewMember(crewId) {
    const firstResource = resources.find(
      (resource) => resource.active
    );

    if (!firstResource) return;

    setCrews(
      crews.map((crew) =>
        crew.id === crewId
          ? {
              ...crew,

              members: [
                ...(crew.members || []),
                {
                  id: createId(),
                  resourceId: firstResource.id,
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

        members: (crew.members || []).map((member) => {
          if (member.id !== memberId) return member;

          if (field === "resourceId") {
            const {
              workerTypeId,
              ...memberWithoutOldWorkerTypeId
            } = member;

            return {
              ...memberWithoutOldWorkerTypeId,
              resourceId: value,
            };
          }

          return {
            ...member,
            [field]:
              field === "quantity"
                ? Number(value)
                : value,
          };
        }),

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

  function calculateRateComponent(
    baseWage,
    value,
    mode
  ) {
    const numericBaseWage = Number(baseWage || 0);
    const numericValue = Number(value || 0);

    if (mode === "Percent") {
      return numericBaseWage * (numericValue / 100);
    }

    return numericValue;
  }

  function calculateLaborRate(rate) {
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

  function calculateEquipmentRate(rate) {
    if (!rate) return 0;

    const ownershipCost = Number(
      rate.ownershipCost || 0
    );

    const fuelCost = Number(rate.fuelCost || 0);

    const maintenanceCost = Number(
      rate.maintenanceCost || 0
    );

    const otherOperatingCost = Number(
      rate.otherOperatingCost || 0
    );

    const markupPercent = Number(
      rate.markupPercent || 0
    );

    const directOperatingCost =
      ownershipCost +
      fuelCost +
      maintenanceCost +
      otherOperatingCost;

    return (
      directOperatingCost *
      (1 + markupPercent / 100)
    );
  }

  function getApplicableRate(resource, crew) {
    const matchingRates = (resource.rates || [])
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

  function getResourceRate(resource, crew) {
    const rate = getApplicableRate(resource, crew);

    if (!rate) {
      return {
        rate: null,
        hourlyRate: 0,
      };
    }

    const resourceType =
  resource?.resourceType || "Unknown";

    return {
      rate,

      hourlyRate:
        resourceType === "Equipment"
          ? calculateEquipmentRate(rate)
          : calculateLaborRate(rate),
    };
  }

  function getCrewSummary(crew) {
    return (crew.members || []).reduce(
      (summary, member) => {
        const resource = resources.find(
          (item) =>
            String(item.id) ===
            String(
              member.resourceId ??
                member.workerTypeId
            )
        );

        if (!resource) {
          return summary;
        }

        const { hourlyRate } = getResourceRate(
          resource,
          crew
        );

        const quantity = Number(
          member.quantity || 0
        );

        const extendedCost =
          quantity * hourlyRate;

        const resourceType =
          resource.resourceType || "Labor";

        return {
          laborCount:
            summary.laborCount +
            (resourceType === "Labor"
              ? quantity
              : 0),

          equipmentCount:
            summary.equipmentCount +
            (resourceType === "Equipment"
              ? quantity
              : 0),

          totalResourceCount:
            summary.totalResourceCount + quantity,

          laborCost:
            summary.laborCost +
            (resourceType === "Labor"
              ? extendedCost
              : 0),

          equipmentCost:
            summary.equipmentCost +
            (resourceType === "Equipment"
              ? extendedCost
              : 0),

          totalCrewCost:
            summary.totalCrewCost +
            extendedCost,
        };
      },
      {
        laborCount: 0,
        equipmentCount: 0,
        totalResourceCount: 0,
        laborCost: 0,
        equipmentCost: 0,
        totalCrewCost: 0,
      }
    );
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  function getResourceLabel(resource) {
    if (!resource) return "Unknown Resource";

    const resourceType =
      resource.resourceType || "Labor";

    const detail =
      resourceType === "Equipment"
        ? resource.equipmentClass
        : resource.classification;

    return `${resource.name || "Resource"}${
      detail ? ` – ${detail}` : ""
    }`;
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search crews..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button onClick={addCrew}>
          + New Crew
        </button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table crews-table">
          <thead>
            <tr>
              <th>Crew</th>
              <th>Trade</th>
              <th>Labor</th>
              <th>Equipment</th>
              <th>Labor Cost</th>
              <th>Equipment Cost</th>
              <th>Total Crew Cost</th>
              <th>Production</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCrews.length === 0 && (
              <tr>
                <td colSpan="10">
                  <div className="empty-state">
                    <strong>No crews yet.</strong>

                    <p>
                      Create the first reusable labor
                      and equipment crew.
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

                  <td>{summary.laborCount}</td>

                  <td>
                    {summary.equipmentCount}
                  </td>

                  <td>
                    $
                    {formatCurrency(
                      summary.laborCost
                    )}
                    /HR
                  </td>

                  <td>
                    $
                    {formatCurrency(
                      summary.equipmentCost
                    )}
                    /HR
                  </td>

                  <td>
                    <strong>
                      $
                      {formatCurrency(
                        summary.totalCrewCost
                      )}
                      /HR
                    </strong>
                  </td>

                  <td>
                    {Number(
                      crew.productionRate || 0
                    )}{" "}
                    {crew.productionUnit || ""}
                  </td>

                  <td>
                    {crew.active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td className="assembly-actions">
                    <button
                      className="details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCrewId(crew.id);
                        setActiveTab("Composition");
                      }}
                    >
                      Open
                    </button>

                    <button
                      className="danger-btn"
                      onClick={(event) => {
                        event.stopPropagation();
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

      {selectedCrew &&
        (() => {
          const summary =
            getCrewSummary(selectedCrew);

          return (
            <section className="estimate-item-workspace">
              <div className="workspace-header">
                <div>
                  <span className="workspace-eyebrow">
                    Crew Workspace
                  </span>

                  <h2>
                    {selectedCrew.name || "Crew"}
                  </h2>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setSelectedCrewId(null)
                  }
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
                    onClick={() =>
                      setActiveTab(tab)
                    }
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
                        value={
                          selectedCrew.name || ""
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "name",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>Trade</span>

                      <input
                        value={
                          selectedCrew.trade || ""
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "trade",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>Labor Location</span>

                      <select
                        className="table-select"
                        value={
                          selectedCrew.locationId ||
                          ""
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "locationId",
                            event.target.value
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
                      <span>
                        Rate Effective Date
                      </span>

                      <input
                        type="date"
                        value={
                          selectedCrew.effectiveDate ||
                          ""
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "effectiveDate",
                            event.target.value
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
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "active",
                            event.target.value ===
                              "Active"
                          )
                        }
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>
                      </select>
                    </label>
                  </div>

                  <div className="workspace-section-header">
                    <div>
                      <h3>Crew Composition</h3>

                      <p>
                        Add Labor and Equipment
                        resources and set the quantity
                        assigned to this crew.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        addCrewMember(
                          selectedCrew.id
                        )
                      }
                    >
                      + Add Resource
                    </button>
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
                          <th>Rate Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(selectedCrew.members || [])
                          .length === 0 && (
                          <tr>
                            <td colSpan="7">
                              <div className="empty-state">
                                <strong>
                                  No resources added.
                                </strong>

                                <p>
                                  Add the first Labor or
                                  Equipment resource to
                                  this crew.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}

                        {(
                          selectedCrew.members || []
                        ).map((member) => {
                          const currentResourceId =
                            member.resourceId ??
                            member.workerTypeId ??
                            "";

                          const resource =
                            resources.find(
                              (item) =>
                                String(item.id) ===
                                String(
                                  currentResourceId
                                )
                            );

                          const {
                            rate,
                            hourlyRate,
                          } = resource
                            ? getResourceRate(
                                resource,
                                selectedCrew
                              )
                            : {
                                rate: null,
                                hourlyRate: 0,
                              };

                          const quantity = Number(
                            member.quantity || 0
                          );

                          const extended =
                            hourlyRate * quantity;

                          const resourceType =
                            resource?.resourceType ||
                            "Labor";

                          return (
                            <tr key={member.id}>
                              <td>
                                <select
                                  className="table-select"
                                  value={
                                    currentResourceId
                                  }
                                  onChange={(event) =>
                                    updateCrewMember(
                                      selectedCrew.id,
                                      member.id,
                                      "resourceId",
                                      event.target.value
                                    )
                                  }
                                >
                                  {resources
                                    .filter(
                                      (item) =>
                                        item.active
                                    )
                                    .sort((a, b) => {
                                      const typeCompare =
                                        String(
                                          a.resourceType ||
                                            "Labor"
                                        ).localeCompare(
                                          String(
                                            b.resourceType ||
                                              "Labor"
                                          )
                                        );

                                      if (
                                        typeCompare !== 0
                                      ) {
                                        return typeCompare;
                                      }

                                      return String(
                                        a.name || ""
                                      ).localeCompare(
                                        String(
                                          b.name || ""
                                        )
                                      );
                                    })
                                    .map((item) => (
                                      <option
                                        key={item.id}
                                        value={item.id}
                                      >
                                        {getResourceLabel(
                                          item
                                        )}
                                      </option>
                                    ))}
                                </select>
                              </td>

                              <td>
                                {resourceType}
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={quantity}
                                  onChange={(event) =>
                                    updateCrewMember(
                                      selectedCrew.id,
                                      member.id,
                                      "quantity",
                                      event.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>
                                $
                                {formatCurrency(
                                  hourlyRate
                                )}
                                /HR
                              </td>

                              <td>
                                $
                                {formatCurrency(
                                  extended
                                )}
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
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="crew-summary-row">
                    <div className="crew-summary-card">
                      <span>
                        Labor Resources
                      </span>

                      <strong>
                        {summary.laborCount}
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>
                        Equipment Resources
                      </span>

                      <strong>
                        {summary.equipmentCount}
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>Labor Cost</span>

                      <strong>
                        $
                        {formatCurrency(
                          summary.laborCost
                        )}
                        /HR
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>Equipment Cost</span>

                      <strong>
                        $
                        {formatCurrency(
                          summary.equipmentCost
                        )}
                        /HR
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>Total Crew Cost</span>

                      <strong>
                        $
                        {formatCurrency(
                          summary.totalCrewCost
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
                          selectedCrew.productionRate ||
                          0
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
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
                          selectedCrew.productionUnit ||
                          ""
                        }
                        placeholder="SF/HR, LF/HR, CY/DAY..."
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "productionUnit",
                            event.target.value
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
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "shiftHours",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>
                        Available Crew Count
                      </span>

                      <input
                        type="number"
                        step="1"
                        value={
                          selectedCrew.availableCrewCount ||
                          0
                        }
                        onChange={(event) =>
                          updateCrew(
                            selectedCrew.id,
                            "availableCrewCount",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="crew-summary-row">
                    <div className="crew-summary-card">
                      <span>
                        Hourly Production
                      </span>

                      <strong>
                        {Number(
                          selectedCrew.productionRate ||
                            0
                        ).toLocaleString()}{" "}
                        {selectedCrew.productionUnit ||
                          ""}
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>
                        Production per Shift
                      </span>

                      <strong>
                        {(
                          Number(
                            selectedCrew.productionRate ||
                              0
                          ) *
                          Number(
                            selectedCrew.shiftHours || 0
                          )
                        ).toLocaleString()}{" "}
                        {selectedCrew.productionUnit ||
                          ""}
                      </strong>
                    </div>

                    <div className="crew-summary-card">
                      <span>
                        Cost per Production Unit
                      </span>

                      <strong>
                        $
                        {formatCurrency(
                          Number(
                            selectedCrew.productionRate ||
                              0
                          ) > 0
                            ? summary.totalCrewCost /
                                Number(
                                  selectedCrew.productionRate
                                )
                            : 0
                        )}
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
                      value={
                        selectedCrew.notes || ""
                      }
                      onChange={(event) =>
                        updateCrew(
                          selectedCrew.id,
                          "notes",
                          event.target.value
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