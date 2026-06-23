function EstimateSidebar({ activePage, setActivePage }) {
  const pages = [
    "Home",
    "Estimate",
    "Assemblies",
    "Takeoff",
    "Bid Leveling",
    "Procurement",
    "Reports",
    "Settings",
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">E</span>

        <div>
          <strong>EstimateOS</strong>
          <small>Preconstruction Engine</small>
        </div>
      </div>

      {pages.map((page) => (
        <button
          key={page}
          className={
            activePage === page
              ? "nav-btn active"
              : "nav-btn"
          }
          onClick={() => setActivePage(page)}
        >
          {page}
        </button>
      ))}
    </aside>
  );
}

export default EstimateSidebar;