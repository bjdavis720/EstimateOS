import { useMemo, useState } from "react";

function AssembliesPage({
  assemblies,
  crews,
  resources,
  locations,
  selectedAssembly,
  setSelectedAssembly,
  addAssembly,
  updateAssemblyRecord,
  deleteAssembly,
  duplicateAssembly,
  getCrewCostSummary,
  formatCurrency,
}) {
  const [search, setSearch] = useState("");

  const filteredAssemblies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assemblies.filter((assembly) => {
      const searchableText = [
        assembly.description,
        assembly.masterFormat,
        assembly.uniformat,
        assembly.system,
        assembly.trade,
        assembly.costCode,
        assembly.unit,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [assemblies, search]);

  const selectedCrew = useMemo(() => {
    if (!selectedAssembly?.crewId) return null;

    return crews.find(
      (crew) =>
        String(crew.id) ===
        String(selectedAssembly.crewId)
    );
  }, [crews, selectedAssembly]);

  const crewSummary = useMemo(() => {
    if (!selectedAssembly?.crewId) {
      return {
        crew: null,
        laborHourlyCost: 0,
        equipmentHourlyCost: 0,
        totalHourlyCost: 0,
      };
    }

    return getCrewCostSummary(
      selectedAssembly.crewId
    );
  }, [
    selectedAssembly?.crewId,
    selectedAssembly?.modified,
    crews,
    resources,
    getCrewCostSummary,
  ]);

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString();
  }

  function getLocationName(locationId) {
    const location = locations.find(
      (item) =>
        String(item.id) === String(locationId)
    );

    return location?.name || "-";
  }

  function getResourceName(resourceId) {
    const resource = resources.find(
      (item) =>
        String(item.id) === String(resourceId)
    );

    return resource?.name || "Unknown Resource";
  }

  function getResourceType(resourceId) {
    const resource = resources.find(
      (item) =>
        String(item.id) === String(resourceId)
    );

    return resource?.resourceType || "Labor";
  }

  function updateField(field, value) {
    if (!selectedAssembly) return;

    updateAssemblyRecord(selectedAssembly.id, {
      [field]: value,
    });
  }

  function updateNumericField(field, value) {
    updateField(field, Number(value || 0));
  }

  function handleCrewChange(value) {
    updateField("crewId", value);
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search assemblies..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button onClick={addAssembly}>
          + New Assembly
        </button>
      </div>

      <div
  style={{
    display: "grid",
    gap: "20px",
  }}
>
        <div className="table-wrap">
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Assembly</th>
                <th>CSI</th>
                <th>Trade</th>
                <th>Unit</th>
                <th>Crew</th>
                <th>Cost / Unit</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssemblies.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <strong>
                        No assemblies yet.
                      </strong>

                      <p>
                        Create your first reusable
                        estimate assembly.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {filteredAssemblies.map(
                (assembly) => {
                  const crew = crews.find(
                    (item) =>
                      String(item.id) ===
                      String(assembly.crewId)
                  );

                  const isSelected =
                    String(selectedAssembly?.id) ===
                    String(assembly.id);

                  return (
                    <tr
                      key={assembly.id}
                      style={{
                        background: isSelected
                          ? "rgba(246, 139, 31, 0.08)"
                          : undefined,
                      }}
                    >
                      <td>
                        <button
                          type="button"
                          className="details-btn"
                          onClick={() =>
                            setSelectedAssembly(
                              assembly
                            )
                          }
                          style={{
                            width: "100%",
                            textAlign: "left",
                          }}
                        >
                          {assembly.description ||
                            "Untitled Assembly"}
                        </button>
                      </td>

                      <td>
                        {assembly.masterFormat ||
                          "-"}
                      </td>

                      <td>
                        {assembly.trade || "-"}
                      </td>

                      <td>
                        {assembly.unit || "-"}
                      </td>

                      <td>
                        {crew?.name || "Not Assigned"}
                      </td>

                      <td>
                        {formatCurrency(
                          assembly.totalCostPerUnit
                        )}
                      </td>

                      <td>
                        {formatDate(
                          assembly.modified
                        )}
                      </td>

                      <td className="assembly-actions">
                        <button
                          className="details-btn"
                          onClick={() =>
                            setSelectedAssembly(
                              assembly
                            )
                          }
                        >
                          Open
                        </button>

                        <button
                          className="details-btn"
                          onClick={() =>
                            duplicateAssembly(
                              assembly.id
                            )
                          }
                        >
                          Copy
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() =>
                            deleteAssembly(
                              assembly.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {selectedAssembly && (
          <section className="record-workspace">
            <div className="record-workspace-header">
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                  }}
                >
                  Assembly Recipe
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#6b7280",
                  }}
                >
                  Crew-driven reusable estimating
                  assembly
                </p>
              </div>

              <button
                type="button"
                className="details-btn"
                onClick={() =>
                  setSelectedAssembly(null)
                }
              >
                Close
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                display: "grid",
                gap: "22px",
              }}
            >
              <div>
                <h3>Classification</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <label>
                    Assembly Description
                    <input
                      value={
                        selectedAssembly.description ||
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Unit
                    <input
                      value={
                        selectedAssembly.unit || ""
                      }
                      onChange={(event) =>
                        updateField(
                          "unit",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    CSI / MasterFormat
                    <input
                      value={
                        selectedAssembly.masterFormat ||
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "masterFormat",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    UniFormat
                    <input
                      value={
                        selectedAssembly.uniformat ||
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "uniformat",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    System
                    <input
                      value={
                        selectedAssembly.system || ""
                      }
                      onChange={(event) =>
                        updateField(
                          "system",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Trade
                    <input
                      value={
                        selectedAssembly.trade || ""
                      }
                      onChange={(event) =>
                        updateField(
                          "trade",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Cost Code
                    <input
                      value={
                        selectedAssembly.costCode ||
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "costCode",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Bid Package
                    <input
                      value={
                        selectedAssembly.bidPackage ||
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "bidPackage",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3>Crew</h3>

                <label>
                  Crew Library
                  <select
                    value={
                      selectedAssembly.crewId || ""
                    }
                    onChange={(event) =>
                      handleCrewChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select a crew...
                    </option>

                    {crews
                      .filter(
                        (crew) =>
                          crew.active !== false
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

                {selectedCrew ? (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "grid",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <span>Labor Location</span>
                        <strong
                          style={{
                            display: "block",
                          }}
                        >
                          {getLocationName(
                            selectedCrew.locationId
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Effective Date</span>
                        <strong
                          style={{
                            display: "block",
                          }}
                        >
                          {selectedCrew.effectiveDate ||
                            "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Production Rate</span>
                        <strong
                          style={{
                            display: "block",
                          }}
                        >
                          {Number(
                            selectedCrew.productionRate ||
                              0
                          ).toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Production Unit</span>
                        <strong
                          style={{
                            display: "block",
                          }}
                        >
                          {selectedCrew.productionUnit ||
                            "-"}
                        </strong>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table className="estimate-table">
                        <thead>
                          <tr>
                            <th>Resource</th>
                            <th>Type</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(
                            selectedCrew.members || []
                          ).length === 0 && (
                            <tr>
                              <td colSpan="3">
                                No crew resources
                                assigned.
                              </td>
                            </tr>
                          )}

                          {(
                            selectedCrew.members || []
                          ).map(
                            (member, index) => {
                              const resourceId =
                                member.resourceId ??
                                member.workerTypeId ??
                                "";

                              return (
                                <tr
                                  key={
                                    member.id ||
                                    `${resourceId}-${index}`
                                  }
                                >
                                  <td>
                                    {getResourceName(
                                      resourceId
                                    )}
                                  </td>

                                  <td>
                                    {getResourceType(
                                      resourceId
                                    )}
                                  </td>

                                  <td>
                                    {Number(
                                      member.quantity ||
                                        0
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#6b7280",
                    }}
                  >
                    Select a crew to populate labor,
                    equipment, location, and
                    productivity.
                  </p>
                )}
              </div>

              <div>
                <h3>Crew Cost Summary</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div className="summary-card">
                    <span>Labor / Hour</span>
                    <strong>
                      {formatCurrency(
                        crewSummary.laborHourlyCost
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Equipment / Hour</span>
                    <strong>
                      {formatCurrency(
                        crewSummary.equipmentHourlyCost
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Crew / Hour</span>
                    <strong>
                      {formatCurrency(
                        crewSummary.totalHourlyCost
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Crew Markup</span>

                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="number"
                        value={
                          selectedAssembly.crewMarkupPercent ||
                          0
                        }
                        onChange={(event) =>
                          updateNumericField(
                            "crewMarkupPercent",
                            event.target.value
                          )
                        }
                      />

                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3>Assembly Cost Per Unit</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div className="summary-card">
                    <span>Labor</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.laborCostPerUnit
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Equipment</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.equipmentCostPerUnit
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Material</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.materialCostPerUnit
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Subcontract</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.subcontractCostPerUnit
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Other</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.otherCostPerUnit
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Total Assembly</span>
                    <strong>
                      {formatCurrency(
                        selectedAssembly.totalCostPerUnit
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <h3>Recipe Components</h3>

                <p
                  style={{
                    marginBottom: 0,
                    color: "#6b7280",
                  }}
                >
                  Materials, additional equipment,
                  subcontract, and other cost item
                  editors will be added in the next
                  controlled step. Existing assembly
                  data has already been migrated into
                  those arrays.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AssembliesPage;