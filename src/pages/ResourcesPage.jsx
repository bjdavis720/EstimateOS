import { useState } from "react";

function ResourcesPage({
  resources,
  setResources,
  locations,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedResourceId, setSelectedResourceId] =
    useState(null);
  const [activeTab, setActiveTab] = useState("Details");

  const selectedResource =
    resources.find(
      (resource) => resource.id === selectedResourceId
    ) || null;

  const filteredResources = resources.filter((resource) => {
    const resourceType =
      resource.resourceType || "Labor";

    const matchesType =
      typeFilter === "All" ||
      resourceType === typeFilter;

    const searchableText = [
      resource.name,
      resourceType,
      resource.classification,
      resource.equipmentClass,
      resource.trade,
      resource.manufacturer,
      resource.model,
      resource.ownership,
      resource.unit,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesType &&
      searchableText.includes(search.toLowerCase())
    );
  });

  function createResourceId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function addResource(resourceType = "Labor") {
    const now = new Date().toISOString();

    const newResource = {
      id: createResourceId(),
      resourceType,
      name:
        resourceType === "Equipment"
          ? "New Equipment Resource"
          : "New Labor Resource",

      classification: "",
      equipmentClass: "",
      trade: "",

      manufacturer: "",
      model: "",
      ownership: "Owned",

      unit: "HR",
      active: true,
      notes: "",
      rates: [],

      created: now,
      modified: now,
    };

    setResources([...resources, newResource]);
    setSelectedResourceId(newResource.id);
    setActiveTab("Details");
  }

  function updateResource(id, field, value) {
  setResources((currentResources) =>
    currentResources.map((resource) => {
      if (String(resource.id) !== String(id)) {
        return resource;
      }

      const updatedResource = {
        ...resource,
        [field]: value,
        modified: new Date().toISOString(),
      };

      if (field === "resourceType") {
        const defaultNames = [
          "New Labor Resource",
          "New Equipment Resource",
        ];

        if (defaultNames.includes(resource.name)) {
          updatedResource.name =
            value === "Equipment"
              ? "New Equipment Resource"
              : "New Labor Resource";
        }
      }

      return updatedResource;
    })
  );
}

  function deleteResource(id) {
    setResources(
      resources.filter((resource) => resource.id !== id)
    );

    if (selectedResourceId === id) {
      setSelectedResourceId(null);
    }
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

  function calculateLaborRateSummary(rate) {
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
      rate.otherBurdenMode || "Percent"
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

  function calculateEquipmentRateSummary(rate) {
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

    const operatingRate =
      directOperatingCost *
      (1 + markupPercent / 100);

    const standbyRate = Number(
      rate.standbyRate || 0
    );

    return {
      ownershipCost,
      fuelCost,
      maintenanceCost,
      otherOperatingCost,
      directOperatingCost,
      markupPercent,
      operatingRate,
      standbyRate,
    };
  }

  function addRate(resourceId) {
    const resource = resources.find(
      (item) => item.id === resourceId
    );

    if (!resource) return;

    const defaultLocation = locations.find(
      (location) => location.active
    );

    const commonRateFields = {
      id: createResourceId(),
      locationId: defaultLocation?.id || "",
      effectiveDate: new Date()
        .toISOString()
        .slice(0, 10),
      source: "",
      notes: "",
    };

    const laborRateFields = {
      laborCondition: "Open Shop",

      baseWage: 0,

      fringeBenefits: 0,
      fringeBenefitsMode: "Dollars",

      payrollTaxes: 0,
      payrollTaxesMode: "Percent",

      workersComp: 0,
      workersCompMode: "Percent",

      insuranceBurden: 0,
      insuranceBurdenMode: "Percent",

      otherBurden: 0,
      otherBurdenMode: "Percent",

      burdenProfileId: null,
    };

    const equipmentRateFields = {
      ownershipCost: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      otherOperatingCost: 0,
      markupPercent: 0,
      standbyRate: 0,
    };

    const newRate = {
      ...commonRateFields,
      ...(resource.resourceType === "Equipment"
        ? equipmentRateFields
        : laborRateFields),
    };

    setResources(
      resources.map((item) =>
        item.id === resourceId
          ? {
              ...item,
              rates: [
                ...(item.rates || []),
                newRate,
              ],
              modified: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function updateRate(
    resourceId,
    rateId,
    field,
    value
  ) {
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

    setResources(
      resources.map((resource) => {
        if (resource.id !== resourceId) {
          return resource;
        }

        return {
          ...resource,

          rates: (resource.rates || []).map((rate) =>
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

  function deleteRate(resourceId, rateId) {
    setResources(
      resources.map((resource) =>
        resource.id === resourceId
          ? {
              ...resource,

              rates: (resource.rates || []).filter(
                (rate) => rate.id !== rateId
              ),

              modified: new Date().toISOString(),
            }
          : resource
      )
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

  function getResourceClassification(resource) {
    if (
      (resource.resourceType || "Labor") ===
      "Equipment"
    ) {
      return resource.equipmentClass || "-";
    }

    return resource.classification || "-";
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search resources..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className="workspace-tabs">
          {["All", "Labor", "Equipment"].map(
            (filter) => (
              <button
                key={filter}
                className={
                  typeFilter === filter
                    ? "workspace-tab active"
                    : "workspace-tab"
                }
                onClick={() => setTypeFilter(filter)}
              >
                {filter}
              </button>
            )
          )}
        </div>

        <button onClick={() => addResource("Labor")}>
          + New Resource
        </button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table worker-types-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Classification</th>
              <th>Trade</th>
              <th>Unit</th>
              <th>Rate Records</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredResources.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <strong>No resources found.</strong>
                    <p>
                      Create a Labor or Equipment
                      resource.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filteredResources.map((resource) => {
              const resourceType =
                resource.resourceType || "Labor";

              return (
                <tr
                  key={resource.id}
                  className={
                    selectedResourceId === resource.id
                      ? "clickable-row selected-row"
                      : "clickable-row"
                  }
                  onClick={() => {
                    setSelectedResourceId(resource.id);
                    setActiveTab("Details");
                  }}
                >
                  <td>{resource.name || "-"}</td>

                  <td>{resourceType}</td>

                  <td>
                    {getResourceClassification(
                      resource
                    )}
                  </td>

                  <td>{resource.trade || "-"}</td>

                  <td>{resource.unit || "HR"}</td>

                  <td>
                    {(resource.rates || []).length}
                  </td>

                  <td>
                    {resource.active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td className="assembly-actions">
                    <button
                      className="details-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedResourceId(
                          resource.id
                        );
                        setActiveTab("Details");
                      }}
                    >
                      Open
                    </button>

                    <button
                      className="danger-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteResource(resource.id);
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

      {selectedResource && (
        <section className="estimate-item-workspace">
          <div className="workspace-header">
            <div>
              <span className="workspace-eyebrow">
                Resource Workspace
              </span>

              <h2>
                {selectedResource.name || "Resource"}

                {(selectedResource.resourceType ||
                  "Labor") === "Labor" &&
                selectedResource.classification
                  ? ` – ${selectedResource.classification}`
                  : ""}

                {selectedResource.resourceType ===
                  "Equipment" &&
                selectedResource.equipmentClass
                  ? ` – ${selectedResource.equipmentClass}`
                  : ""}
              </h2>
            </div>

            <button
              className="close-btn"
              onClick={() =>
                setSelectedResourceId(null)
              }
            >
              Close
            </button>
          </div>

          <div className="workspace-tabs">
            {["Details", "Rates", "Notes"].map(
              (tab) => (
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
              )
            )}
          </div>

          {activeTab === "Details" && (
            <div className="workspace-content">
              <div className="workspace-grid">
                <label className="drawer-field">
                  <span>Resource Type</span>

                  <select
                    className="table-select"
                    value={
                      selectedResource.resourceType ||
                      "Labor"
                    }
                    onChange={(event) =>
                      updateResource(
                        selectedResource.id,
                        "resourceType",
                        event.target.value
                      )
                    }
                  >
                    <option value="Labor">
                      Labor
                    </option>

                    <option value="Equipment">
                      Equipment
                    </option>
                  </select>
                </label>

                <label className="drawer-field">
                  <span>Resource Name</span>

                  <input
                    value={selectedResource.name || ""}
                    onChange={(event) =>
                      updateResource(
                        selectedResource.id,
                        "name",
                        event.target.value
                      )
                    }
                  />
                </label>

                {(selectedResource.resourceType ||
                  "Labor") === "Labor" && (
                  <label className="drawer-field">
                    <span>Classification</span>

                    <input
                      value={
                        selectedResource.classification ||
                        ""
                      }
                      placeholder="Journeyman, Foreman, Apprentice..."
                      onChange={(event) =>
                        updateResource(
                          selectedResource.id,
                          "classification",
                          event.target.value
                        )
                      }
                    />
                  </label>
                )}

                {selectedResource.resourceType ===
                  "Equipment" && (
                  <>
                    <label className="drawer-field">
                      <span>Equipment Class</span>

                      <input
                        value={
                          selectedResource.equipmentClass ||
                          ""
                        }
                        placeholder="Crane, Excavator, Forklift..."
                        onChange={(event) =>
                          updateResource(
                            selectedResource.id,
                            "equipmentClass",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>Manufacturer</span>

                      <input
                        value={
                          selectedResource.manufacturer ||
                          ""
                        }
                        placeholder="Caterpillar, Deere, JLG..."
                        onChange={(event) =>
                          updateResource(
                            selectedResource.id,
                            "manufacturer",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>Model</span>

                      <input
                        value={
                          selectedResource.model || ""
                        }
                        onChange={(event) =>
                          updateResource(
                            selectedResource.id,
                            "model",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="drawer-field">
                      <span>Ownership</span>

                      <select
                        className="table-select"
                        value={
                          selectedResource.ownership ||
                          "Owned"
                        }
                        onChange={(event) =>
                          updateResource(
                            selectedResource.id,
                            "ownership",
                            event.target.value
                          )
                        }
                      >
                        <option value="Owned">
                          Owned
                        </option>

                        <option value="Rented">
                          Rented
                        </option>

                        <option value="Leased">
                          Leased
                        </option>

                        <option value="Subcontract">
                          Subcontract
                        </option>
                      </select>
                    </label>
                  </>
                )}

                <label className="drawer-field">
                  <span>Trade</span>

                  <input
                    value={
                      selectedResource.trade || ""
                    }
                    onChange={(event) =>
                      updateResource(
                        selectedResource.id,
                        "trade",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="drawer-field">
                  <span>Unit</span>

                  <select
                    className="table-select"
                    value={
                      selectedResource.unit || "HR"
                    }
                    onChange={(event) =>
                      updateResource(
                        selectedResource.id,
                        "unit",
                        event.target.value
                      )
                    }
                  >
                    <option value="HR">HR</option>
                    <option value="DAY">DAY</option>
                    <option value="WK">WK</option>
                    <option value="MO">MO</option>
                    <option value="EA">EA</option>
                  </select>
                </label>

                <label className="drawer-field">
                  <span>Status</span>

                  <select
                    className="table-select"
                    value={
                      selectedResource.active
                        ? "Active"
                        : "Inactive"
                    }
                    onChange={(event) =>
                      updateResource(
                        selectedResource.id,
                        "active",
                        event.target.value === "Active"
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
            </div>
          )}

          {activeTab === "Rates" && (
            <div className="workspace-content">
              <div className="workspace-section-header">
                <div>
                  <h3>
                    Location-Based{" "}
                    {selectedResource.resourceType ===
                    "Equipment"
                      ? "Equipment"
                      : "Labor"}{" "}
                    Rates
                  </h3>

                  <p>
                    Maintain rate records by location
                    and effective date.
                  </p>
                </div>

                <button
                  onClick={() =>
                    addRate(selectedResource.id)
                  }
                >
                  + Add Location Rate
                </button>
              </div>

              {(selectedResource.rates || []).length ===
              0 ? (
                <div className="empty-state">
                  <strong>
                    No rate records yet.
                  </strong>

                  <p>
                    Add the first location-specific
                    rate.
                  </p>
                </div>
              ) : (
                <div className="rate-card-list">
                  {(selectedResource.rates || []).map(
                    (rate) => {
                      const locationName =
                        locations.find(
                          (location) =>
                            String(location.id) ===
                            String(rate.locationId)
                        )?.name || "Location Rate";

                      const isEquipment =
                        selectedResource.resourceType ===
                        "Equipment";

                      const laborSummary =
                        calculateLaborRateSummary(rate);

                      const equipmentSummary =
                        calculateEquipmentRateSummary(
                          rate
                        );

                      return (
                        <div
                          className="rate-build-card"
                          key={rate.id}
                        >
                          <div className="rate-card-header">
                            <div>
                              <strong>
                                {locationName}
                              </strong>

                              <span>
                                {isEquipment
                                  ? selectedResource.ownership ||
                                    "Equipment"
                                  : rate.laborCondition ||
                                    "Labor Condition"}
                              </span>
                            </div>

                            <button
                              className="danger-btn"
                              onClick={() =>
                                deleteRate(
                                  selectedResource.id,
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
                                value={
                                  rate.locationId || ""
                                }
                                onChange={(event) =>
                                  updateRate(
                                    selectedResource.id,
                                    rate.id,
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
                                Effective Date
                              </span>

                              <input
                                type="date"
                                value={
                                  rate.effectiveDate || ""
                                }
                                onChange={(event) =>
                                  updateRate(
                                    selectedResource.id,
                                    rate.id,
                                    "effectiveDate",
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            {!isEquipment && (
                              <label className="drawer-field">
                                <span>
                                  Labor Condition
                                </span>

                                <select
                                  className="table-select"
                                  value={
                                    rate.laborCondition ||
                                    "Open Shop"
                                  }
                                  onChange={(event) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "laborCondition",
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="Open Shop">
                                    Open Shop
                                  </option>

                                  <option value="Union">
                                    Union
                                  </option>

                                  <option value="Prevailing Wage">
                                    Prevailing Wage
                                  </option>

                                  <option value="PLA">
                                    PLA
                                  </option>
                                </select>
                              </label>
                            )}
                          </div>

                          {!isEquipment && (
                            <>
                              <div className="workspace-grid">
                                <label className="drawer-field">
                                  <span>
                                    Base Wage / Hour
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.baseWage || 0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "baseWage",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <RateComponentField
                                  label="Fringe Benefits"
                                  value={
                                    rate.fringeBenefits
                                  }
                                  mode={
                                    rate.fringeBenefitsMode ||
                                    "Dollars"
                                  }
                                  calculatedValue={
                                    laborSummary.fringeBenefits
                                  }
                                  onValueChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "fringeBenefits",
                                      value
                                    )
                                  }
                                  onModeChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "fringeBenefitsMode",
                                      value
                                    )
                                  }
                                />

                                <RateComponentField
                                  label="Payroll Taxes"
                                  value={
                                    rate.payrollTaxes
                                  }
                                  mode={
                                    rate.payrollTaxesMode ||
                                    "Percent"
                                  }
                                  calculatedValue={
                                    laborSummary.payrollTaxes
                                  }
                                  onValueChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "payrollTaxes",
                                      value
                                    )
                                  }
                                  onModeChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "payrollTaxesMode",
                                      value
                                    )
                                  }
                                />

                                <RateComponentField
                                  label="Workers’ Comp"
                                  value={
                                    rate.workersComp
                                  }
                                  mode={
                                    rate.workersCompMode ||
                                    "Percent"
                                  }
                                  calculatedValue={
                                    laborSummary.workersComp
                                  }
                                  onValueChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "workersComp",
                                      value
                                    )
                                  }
                                  onModeChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "workersCompMode",
                                      value
                                    )
                                  }
                                />

                                <RateComponentField
                                  label="Insurance / Burden"
                                  value={
                                    rate.insuranceBurden
                                  }
                                  mode={
                                    rate.insuranceBurdenMode ||
                                    "Percent"
                                  }
                                  calculatedValue={
                                    laborSummary.insuranceBurden
                                  }
                                  onValueChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "insuranceBurden",
                                      value
                                    )
                                  }
                                  onModeChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "insuranceBurdenMode",
                                      value
                                    )
                                  }
                                />

                                <RateComponentField
                                  label="Other Burden"
                                  value={
                                    rate.otherBurden
                                  }
                                  mode={
                                    rate.otherBurdenMode ||
                                    "Percent"
                                  }
                                  calculatedValue={
                                    laborSummary.otherBurden
                                  }
                                  onValueChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "otherBurden",
                                      value
                                    )
                                  }
                                  onModeChange={(value) =>
                                    updateRate(
                                      selectedResource.id,
                                      rate.id,
                                      "otherBurdenMode",
                                      value
                                    )
                                  }
                                />
                              </div>

                              <div className="rate-summary">
                                <span>
                                  Loaded Labor Rate
                                </span>

                                <strong>
                                  $
                                  {formatCurrency(
                                    laborSummary.loadedRate
                                  )}
                                  /HR
                                </strong>
                              </div>
                            </>
                          )}

                          {isEquipment && (
                            <>
                              <div className="workspace-grid">
                                <label className="drawer-field">
                                  <span>
                                    Ownership / Rental Cost
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.ownershipCost ||
                                      0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "ownershipCost",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <label className="drawer-field">
                                  <span>
                                    Fuel Cost / Hour
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.fuelCost || 0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "fuelCost",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <label className="drawer-field">
                                  <span>
                                    Maintenance / Hour
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.maintenanceCost ||
                                      0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "maintenanceCost",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <label className="drawer-field">
                                  <span>
                                    Other Operating Cost
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.otherOperatingCost ||
                                      0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "otherOperatingCost",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <label className="drawer-field">
                                  <span>
                                    Markup %
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.markupPercent || 0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "markupPercent",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>

                                <label className="drawer-field">
                                  <span>
                                    Standby Rate / Hour
                                  </span>

                                  <input
                                    type="number"
                                    step="0.01"
                                    value={
                                      rate.standbyRate || 0
                                    }
                                    onChange={(event) =>
                                      updateRate(
                                        selectedResource.id,
                                        rate.id,
                                        "standbyRate",
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>
                              </div>

                              <div className="crew-summary-row">
                                <div className="crew-summary-card">
                                  <span>
                                    Direct Operating Cost
                                  </span>

                                  <strong>
                                    $
                                    {formatCurrency(
                                      equipmentSummary.directOperatingCost
                                    )}
                                    /HR
                                  </strong>
                                </div>

                                <div className="crew-summary-card">
                                  <span>
                                    Loaded Operating Rate
                                  </span>

                                  <strong>
                                    $
                                    {formatCurrency(
                                      equipmentSummary.operatingRate
                                    )}
                                    /HR
                                  </strong>
                                </div>

                                <div className="crew-summary-card">
                                  <span>
                                    Standby Rate
                                  </span>

                                  <strong>
                                    $
                                    {formatCurrency(
                                      equipmentSummary.standbyRate
                                    )}
                                    /HR
                                  </strong>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="workspace-grid">
                            <label className="drawer-field">
                              <span>Source</span>

                              <input
                                value={
                                  rate.source || ""
                                }
                                placeholder="Company standard, rental quote, wage decision..."
                                onChange={(event) =>
                                  updateRate(
                                    selectedResource.id,
                                    rate.id,
                                    "source",
                                    event.target.value
                                  )
                                }
                              />
                            </label>
                          </div>

                          <label className="drawer-field">
                            <span>Rate Notes</span>

                            <textarea
                              className="workspace-textarea rate-notes"
                              value={rate.notes || ""}
                              onChange={(event) =>
                                updateRate(
                                  selectedResource.id,
                                  rate.id,
                                  "notes",
                                  event.target.value
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
                <span>Resource Notes</span>

                <textarea
                  className="workspace-textarea"
                  value={selectedResource.notes || ""}
                  onChange={(event) =>
                    updateResource(
                      selectedResource.id,
                      "notes",
                      event.target.value
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

function RateComponentField({
  label,
  value,
  mode,
  calculatedValue,
  onValueChange,
  onModeChange,
}) {
  return (
    <label className="drawer-field">
      <span>{label}</span>

      <div className="rate-input-group">
        <input
          type="number"
          step="0.01"
          value={value || 0}
          onChange={(event) =>
            onValueChange(event.target.value)
          }
        />

        <select
          className="rate-mode-select"
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value)
          }
        >
          <option value="Dollars">$/HR</option>
          <option value="Percent">% Base</option>
        </select>
      </div>

      <small className="calculated-rate-note">
        Hourly amount: $
        {Number(calculatedValue || 0).toFixed(2)}
      </small>
    </label>
  );
}

export default ResourcesPage;