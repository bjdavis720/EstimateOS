
import { useState } from "react";
import { createMaterial } from "../data/materialLibrary";
import {
  MATERIAL_CONVERSION_TEMPLATES,
  createConversionFromTemplate,
} from "../data/materialConversionTemplates";

const EMPTY_FORM = {
  code: "",
  name: "",
  category: "",
  description: "",
  purchaseUnit: "",
  conversionTemplateId: "",
  referenceUnitCost: 0,
  pricingLocation: "",
  pricingSource: "",
  defaultConversion: null,
};

function MaterialsPage({ materials, setMaterials }) {
  const [search, setSearch] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] =
    useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  const filteredMaterials = materials.filter((material) =>
    [
      material.code,
      material.name,
      material.category,
      material.description,
      material.purchaseUnit,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const selectedMaterial = materials.find(
    (material) => material.id === selectedMaterialId
  );

  function startNew() {
    setSelectedMaterialId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  }

  function selectMaterial(material) {
    setSelectedMaterialId(material.id);
    setForm(null);
    setError("");
  }

  function startEdit() {
    setForm({
      code: selectedMaterial.code || "",
      name: selectedMaterial.name || "",
      category: selectedMaterial.category || "",
      description: selectedMaterial.description || "",
      purchaseUnit: selectedMaterial.purchaseUnit || "",
      conversionTemplateId:
        selectedMaterial.conversionTemplateId || "",
      referenceUnitCost:
        selectedMaterial.referenceUnitCost ?? 0,
      pricingLocation:
        selectedMaterial.pricingLocation || "",
      pricingSource:
        selectedMaterial.pricingSource || "",
        defaultConversion: selectedMaterial.defaultConversion
  ? structuredClone(selectedMaterial.defaultConversion)
  : null,
    });
    setError("");
  }

  function updateField(field, value) {
  setForm((previous) => {
    const updated = {
      ...previous,
      [field]: value,
    };

    if (field === "conversionTemplateId") {
      const conversion = value
        ? createConversionFromTemplate(value)
        : null;

      updated.defaultConversion = conversion;

      if (conversion) {
        updated.purchaseUnit = conversion.outputUnit;
      }
    }

    return updated;
  });

  setError("");
}

  function saveMaterial(event) {
    event.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();

    if (!code || !name || !form.purchaseUnit.trim()) {
      setError(
        "Code, material name and purchase unit are required."
      );
      return;
    }

    const duplicate = materials.some(
      (material) =>
        material.code.trim().toLowerCase() ===
          code.toLowerCase() &&
        material.id !== selectedMaterialId
    );

    if (duplicate) {
      setError("A material with this code already exists.");
      return;
    }

    const defaultConversion = form.defaultConversion
  ? structuredClone(form.defaultConversion)
  : null;

    
     // A template's output unit must match the
    // material's purchasing unit.
    if (
      defaultConversion &&
      form.purchaseUnit !== defaultConversion.outputUnit
    ) {
      setError(
        "The purchase unit must match the selected conversion template."
      );
      return;
    }

    const changes = {
      ...form,
      code,
      name,
      category: form.category.trim(),
      description: form.description.trim(),
      purchaseUnit: form.purchaseUnit.trim(),
      referenceUnitCost: Number(
        form.referenceUnitCost
      ),
      defaultConversion,
    };

    if (
      !Number.isFinite(changes.referenceUnitCost) ||
      changes.referenceUnitCost < 0
    ) {
      setError("Enter a valid reference unit cost.");
      return;
    }

    if (selectedMaterial) {
      setMaterials((previous) =>
        previous.map((material) =>
          material.id === selectedMaterial.id
            ? {
                ...material,
                ...changes,
                modified: new Date().toISOString(),
              }
            : material
        )
      );
    } else {
      const newMaterial = createMaterial(changes);

      setMaterials((previous) => [
        ...previous,
        newMaterial,
      ]);

      setSelectedMaterialId(newMaterial.id);
    }

    setForm(null);
    setError("");
  }

  return (
    <div className="materials-page">
      <div className="page-header">
        <div>
          <h2>Material Library</h2>
          <p>
            Manage reusable material definitions,
            measurement units and reference pricing.
          </p>
        </div>

        <button type="button" onClick={startNew}>
          + New Material
        </button>
      </div>

      <div className="drawer-section materials-library-card">
  <div className="materials-library-heading">
    <div>
      <h3>Library Materials</h3>
      <p>
        {filteredMaterials.length} of {materials.length}
        {" "}materials
      </p>
    </div>
  </div>

        <input
          type="search"
          placeholder="Search by code, material, category or unit..."
className="materials-library-search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className="table-wrap">
          <table className="data-table materials-library-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Material</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredMaterials.map((material) => (
                <tr
                  key={material.id}
                  className={
                    material.id === selectedMaterialId
                      ? "selected-row"
                      : "clickable-row"
                  }
                  onClick={() =>
                    selectMaterial(material)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{material.code}</td>
<td>{material.name}</td>
<td>{material.category}</td>

<td>
  <span className="materials-unit-badge">
    {material.purchaseUnit}
  </span>
</td>

<td>
  <span
    className={
      material.isActive
        ? "materials-status active"
        : "materials-status inactive"
    }
  >
    {material.isActive ? "Active" : "Inactive"}
  </span>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMaterials.length === 0 && (
          <p>No matching materials found.</p>
        )}
      </div>

      {selectedMaterial && !form && (
        <div className="drawer-section">
          <h3>{selectedMaterial.name}</h3>

          <p>
            <strong>Code:</strong>{" "}
            {selectedMaterial.code}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {selectedMaterial.category || "—"}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {selectedMaterial.description || "—"}
          </p>

          <p>
            <strong>Purchase Unit:</strong>{" "}
            {selectedMaterial.purchaseUnit}
          </p>

          <p>
            <strong>Conversion Template:</strong>{" "}
            {MATERIAL_CONVERSION_TEMPLATES.find(
              (template) =>
                template.id ===
                selectedMaterial.conversionTemplateId
            )?.name || "None"}
          </p>

          <p>
            <strong>Reference Unit Cost:</strong>{" "}
            $
            {Number(
              selectedMaterial.referenceUnitCost || 0
            ).toFixed(2)}
          </p>

          <button type="button" onClick={startEdit}>
            Edit Material
          </button>
        </div>
      )}

      {form && (
        <form
          className="drawer-section"
          onSubmit={saveMaterial}
        >
          <h3>
            {selectedMaterial
              ? "Edit Material"
              : "New Material"}
          </h3>

          {[
            ["code", "Material Code"],
            ["name", "Material Name"],
            ["category", "Category"],
            ["description", "Description"],
          ].map(([field, label]) => (
            <label
              key={field}
              className="drawer-field"
            >
              <span>{label}</span>
              <input
                value={form[field]}
                onChange={(event) =>
                  updateField(
                    field,
                    event.target.value
                  )
                }
              />
            </label>
          ))}

          <label className="drawer-field">
            <span>Conversion Template</span>

            <select
              value={form.conversionTemplateId}
              onChange={(event) =>
                updateField(
                  "conversionTemplateId",
                  event.target.value
                )
              }
            >
              <option value="">None</option>

              {MATERIAL_CONVERSION_TEMPLATES.map(
                (template) => (
                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </option>
                )
              )}
            </select>
          </label>
          {form.defaultConversion && (
  <div className="drawer-section">
    <h4>Default Conversion Settings</h4>

    <label className="drawer-field">
      <span>Default Thickness</span>
      <input
        type="number"
        min="0"
        step="any"
        value={
          form.defaultConversion.inputs?.thickness ?? ""
        }
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            defaultConversion: {
              ...previous.defaultConversion,
              inputs: {
                ...previous.defaultConversion.inputs,
                thickness: event.target.value,
              },
            },
          }))
        }
      />
    </label>

    <label className="drawer-field">
      <span>Thickness Unit</span>
      <select
        value={
          form.defaultConversion.inputs?.thicknessUnit ||
          "IN"
        }
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            defaultConversion: {
              ...previous.defaultConversion,
              inputs: {
                ...previous.defaultConversion.inputs,
                thicknessUnit: event.target.value,
              },
            },
          }))
        }
      >
        <option value="IN">Inches</option>
        <option value="FT">Feet</option>
        <option value="MM">Millimeters</option>
        <option value="M">Meters</option>
      </select>
    </label>

    {form.defaultConversion.method ===
      "AREA_THICKNESS_DENSITY" && (
      <>
        <label className="drawer-field">
          <span>Default Density</span>
          <input
            type="number"
            min="0"
            step="any"
            value={
              form.defaultConversion.inputs?.density ?? ""
            }
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                defaultConversion: {
                  ...previous.defaultConversion,
                  inputs: {
                    ...previous.defaultConversion.inputs,
                    density: event.target.value,
                  },
                },
              }))
            }
          />
        </label>

        <label className="drawer-field">
          <span>Density Unit</span>
          <select
            value={
              form.defaultConversion.inputs?.densityUnit ||
              "TON/CY"
            }
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                defaultConversion: {
                  ...previous.defaultConversion,
                  inputs: {
                    ...previous.defaultConversion.inputs,
                    densityUnit: event.target.value,
                  },
                },
              }))
            }
          >
            <option value="TON/CY">TON/CY</option>
            <option value="LB/CF">LB/CF</option>
            <option value="KG/CM">KG/CM</option>
          </select>
        </label>
      </>
    )}
  </div>
)}

          <label className="drawer-field">
            <span>Purchase Unit</span>
            <input
              value={form.purchaseUnit}
              onChange={(event) =>
                updateField(
                  "purchaseUnit",
                  event.target.value.toUpperCase()
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Reference Unit Cost ($)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={form.referenceUnitCost}
              onChange={(event) =>
                updateField(
                  "referenceUnitCost",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Pricing Location</span>
            <input
              value={form.pricingLocation}
              onChange={(event) =>
                updateField(
                  "pricingLocation",
                  event.target.value
                )
              }
            />
          </label>

          <label className="drawer-field">
            <span>Pricing Source</span>
            <input
              value={form.pricingSource}
              onChange={(event) =>
                updateField(
                  "pricingSource",
                  event.target.value
                )
              }
            />
          </label>

          {error && (
            <p role="alert" style={{ color: "crimson" }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button type="submit">
              Save Material
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MaterialsPage;
