import { useState } from "react";
import EstimateItemWorkspace from "../components/EstimateItemWorkspace";

function EstimateItemsPage({ costItems, setCostItems }) {
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);

  const selectedItem =
    costItems.find((item) => item.id === selectedItemId) || null;

  const filteredItems = costItems.filter((item) =>
    `${item.description} ${item.category} ${item.trade} ${item.costCode} ${item.unit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addEstimateItem() {
    const newItem = {
      id: Date.now(),
      description: "New Estimate Item",
      category: "Labor",
      unit: "EA",
      trade: "",
      costCode: "",
      defaultUnitCost: 0,
      productivity: "",
      notes: "",
    };

    setCostItems([...costItems, newItem]);
    setSelectedItemId(newItem.id);
  }

  function updateEstimateItem(id, field, value) {
    setCostItems(
      costItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "defaultUnitCost"
                  ? Number(value)
                  : value,
              modified: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function deleteEstimateItem(id) {
    setCostItems(costItems.filter((item) => item.id !== id));

    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }

  return (
    <div className="assembly-page">
      <div className="assembly-toolbar">
        <input
          className="assembly-search"
          placeholder="Search estimate items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={addEstimateItem}>
          + New Estimate Item
        </button>
      </div>

      <div className="table-wrap">
        <table className="estimate-table estimate-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Trade</th>
              <th>Cost Code</th>
              <th>Default Unit Cost</th>
              <th>Productivity</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <strong>No estimate items yet.</strong>
                    <p>
                      Create the first reusable estimating knowledge item.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={
                  selectedItemId === item.id
                    ? "clickable-row selected-row"
                    : "clickable-row"
                }
                onClick={() => setSelectedItemId(item.id)}
              >
                <td>{item.description || "-"}</td>
                <td>{item.category || "-"}</td>
                <td>{item.unit || "-"}</td>
                <td>{item.trade || "-"}</td>
                <td>{item.costCode || "-"}</td>
                <td>
                  ${Number(item.defaultUnitCost || 0).toLocaleString()}
                </td>
                <td>{item.productivity || "-"}</td>

                <td className="assembly-actions">
                  <button
                    className="details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    Open
                  </button>

                  <button
                    className="danger-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEstimateItem(item.id);
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

      <EstimateItemWorkspace
        selectedItem={selectedItem}
        updateEstimateItem={updateEstimateItem}
        closeWorkspace={() => setSelectedItemId(null)}
      />
    </div>
  );
}

export default EstimateItemsPage;