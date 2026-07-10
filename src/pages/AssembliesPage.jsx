import { useState } from "react";

function AssembliesPage({
  assemblies,
  addAssembly,
  updateAssembly,
  deleteAssembly,
  duplicateAssembly,
  setSelectedAssembly,
}) {
  const [search, setSearch] = useState("");

  const filteredAssemblies = assemblies.filter((assembly) =>
    `${assembly.description} ${assembly.masterFormat} ${assembly.trade} ${assembly.unit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search assemblies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addAssembly}>+ New Assembly</button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table">
          <thead>
            <tr>
              <th>Assembly</th>
              <th>CSI</th>
              <th>Trade</th>
              <th>Unit</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssemblies.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <strong>No assemblies yet.</strong>
                    <p>Create your first reusable estimate assembly.</p>
                  </div>
                </td>
              </tr>
            )}

            {filteredAssemblies.map((assembly) => (
              <tr key={assembly.id}>
                <td>
                  <input
                    value={assembly.description || ""}
                    onChange={(e) =>
                      updateAssembly(
                        assembly.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={assembly.masterFormat || ""}
                    onChange={(e) =>
                      updateAssembly(
                        assembly.id,
                        "masterFormat",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    value={assembly.trade || ""}
                    onChange={(e) =>
                      updateAssembly(assembly.id, "trade", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={assembly.unit || ""}
                    onChange={(e) =>
                      updateAssembly(assembly.id, "unit", e.target.value)
                    }
                  />
                </td>

                <td>{formatDate(assembly.modified)}</td>

                <td className="assembly-actions">
                  <button
  className="details-btn"
  onClick={() => setSelectedAssembly(assembly)}
>
  Open
</button>
                  <button
                    className="details-btn"
                    onClick={() => duplicateAssembly(assembly.id)}
                  >
                    Copy
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => deleteAssembly(assembly.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssembliesPage;