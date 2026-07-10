import { useState } from "react";

function LaborLocationsPage({ locations, setLocations }) {
  const [search, setSearch] = useState("");

  const filteredLocations = locations.filter((location) =>
    `${location.name} ${location.city} ${location.state} ${location.county} ${location.region} ${location.laborMarket}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addLocation() {
    setLocations([
      ...locations,
      {
        id: Date.now(),
        name: "New Labor Location",
        city: "",
        state: "",
        county: "",
        zip: "",
        region: "",
        laborMarket: "",
        country: "USA",
        active: true,
      },
    ]);
  }

  function updateLocation(id, field, value) {
    setLocations(
      locations.map((location) =>
        location.id === id
          ? {
              ...location,
              [field]: field === "active" ? Boolean(value) : value,
              modified: new Date().toISOString(),
            }
          : location
      )
    );
  }

  function deleteLocation(id) {
    setLocations(locations.filter((location) => location.id !== id));
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search labor locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addLocation}>+ New Location</button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table labor-locations-table">
          <thead>
            <tr>
              <th>Location Name</th>
              <th>City</th>
              <th>State</th>
              <th>County</th>
              <th>Region</th>
              <th>Labor Market</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredLocations.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <strong>No labor locations yet.</strong>
                    <p>Create the first location used for worker rates.</p>
                  </div>
                </td>
              </tr>
            )}

            {filteredLocations.map((location) => (
              <tr key={location.id}>
                <td>
                  <input
                    value={location.name || ""}
                    onChange={(e) =>
                      updateLocation(location.id, "name", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={location.city || ""}
                    onChange={(e) =>
                      updateLocation(location.id, "city", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={location.state || ""}
                    onChange={(e) =>
                      updateLocation(location.id, "state", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={location.county || ""}
                    onChange={(e) =>
                      updateLocation(location.id, "county", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={location.region || ""}
                    onChange={(e) =>
                      updateLocation(location.id, "region", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={location.laborMarket || ""}
                    onChange={(e) =>
                      updateLocation(
                        location.id,
                        "laborMarket",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <select
                    className="table-select"
                    value={location.active ? "Active" : "Inactive"}
                    onChange={(e) =>
                      updateLocation(
                        location.id,
                        "active",
                        e.target.value === "Active"
                      )
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </td>

                <td>
                  <button
                    className="danger-btn"
                    onClick={() => deleteLocation(location.id)}
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

export default LaborLocationsPage;