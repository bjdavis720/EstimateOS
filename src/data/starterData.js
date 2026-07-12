export const starterCostItems = [
  {
    id: 1,
    description:
      "Fine grading / compaction labor",
    category: "Labor",
    unit: "HR",
    trade: "Earthwork",
    costCode: "312000",
    defaultUnitCost: 85,
    productivity: "",
  },
  {
    id: 2,
    description:
      "Skid steer / compact equipment",
    category: "Equipment",
    unit: "HR",
    trade: "Earthwork",
    costCode: "312000",
    defaultUnitCost: 95,
    productivity: "",
  },
  {
    id: 3,
    description: "Ready-mix concrete",
    category: "Material",
    unit: "CY",
    trade: "Concrete",
    costCode: "033000",
    defaultUnitCost: 165,
    productivity: "",
  },
];

export const starterLocations = [
  {
    id: 1,
    name: "Raleigh, NC",
    city: "Raleigh",
    state: "NC",
    county: "Wake",
    zip: "",
    region: "Southeast",
    laborMarket: "Raleigh-Durham",
    country: "USA",
    active: true,
  },
  {
    id: 2,
    name: "Grand Portage, MN",
    city: "Grand Portage",
    state: "MN",
    county: "Cook",
    zip: "",
    region: "Upper Midwest",
    laborMarket:
      "Northeast Minnesota",
    country: "USA",
    active: true,
  },
  {
    id: 3,
    name: "Dunseith, ND",
    city: "Dunseith",
    state: "ND",
    county: "Rolette",
    zip: "",
    region: "Upper Midwest",
    laborMarket:
      "North Central North Dakota",
    country: "USA",
    active: true,
  },
];

export const starterResources = [
  {
    id: 1,
    resourceType: "Labor",
    name: "Carpenter",
    classification: "Journeyman",
    trade: "Carpentry",
    unit: "HR",
    active: true,
    notes: "",
    rates: [],
  },
  {
    id: 2,
    resourceType: "Labor",
    name: "Laborer",
    classification: "General",
    trade: "Laborers",
    unit: "HR",
    active: true,
    notes: "",
    rates: [],
  },
  {
    id: 3,
    resourceType: "Labor",
    name: "Equipment Operator",
    classification: "Skid Steer",
    trade: "Operating Engineers",
    unit: "HR",
    active: true,
    notes: "",
    rates: [],
  },
];

export function createStarterCrews() {
  return [
    {
      id: 1,
      name: "Concrete Form Crew",
      trade: "Concrete",
      unit: "HR",
      locationId: 1,
      effectiveDate: new Date()
        .toISOString()
        .slice(0, 10),
      productionRate: 0,
      productionUnit: "LF/HR",
      shiftHours: 8,
      availableCrewCount: 1,
      members: [],
      notes: "",
      active: true,
    },
  ];
}
