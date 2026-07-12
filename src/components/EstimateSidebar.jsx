const logoVertical = "/estimateos-logo-vertical.png";

function EstimateSidebar({ activePage, setActivePage }) {
  const pages = [
    "Home",
    "Estimate",
    "Estimate Items",
    "Assemblies",
    "Labor Locations",
    "Resources",
    "Crews",
    "Takeoff",
    "Bid Leveling",
    "Procurement",
    "Reports",
    "Settings",
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src={logoVertical}
          alt="EstimateOS"
          className="sidebar-logo"
        />
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