const Sidebar = () => {
  const categories = [
    { name: "Smartphone", hasSubmenu: true },
    { name: "Computer", hasSubmenu: true },
    { name: "Camera", hasSubmenu: false },
    { name: "Headphones", hasSubmenu: false },
    { name: "PC Gaming", hasSubmenu: false },
    { name: "Tablets", hasSubmenu: false },
    { name: "Television", hasSubmenu: false },
    { name: "Watches", hasSubmenu: false },
    { name: "Speakers", hasSubmenu: false },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar_nav">
        {categories.map((cat, index) => (
          <div key={index} className="menu_item_container">
            <button className="menu_item">
              <div className="item_label">
                <i
                  className={`icon_${cat.name.toLowerCase().replace(" ", "_")}`}
                ></i>
                <span>{cat.name}</span>
              </div>
              {cat.hasSubmenu && <span className="chevron"></span>}
            </button>

            {cat.hasSubmenu && (
              <div className="mega_menu">
                <div className="menu_column">
                  <h3>Brands</h3>
                  <ul>
                    <li>Samsung</li>
                    <li>Sony</li>
                    <li>JBL</li>
                    <li>Xiaomi</li>
                    <li>Apple</li>
                  </ul>
                </div>
                <div className="menu_column">
                  <h3>Devices</h3>
                  <ul>
                    <li>Printers & Ink</li>
                    <li>Projector & Screen</li>
                    <li>Network Adapter</li>
                    <li>Photocopy & Scanner</li>
                    <li>broadband</li>
                  </ul>
                </div>
                <div className="menu_column">
                  <h3>Prices</h3>
                  <ul>
                    <li>Up to 500$</li>
                    <li>500$ to 1.000$</li>
                    <li>1.000$ to 2.000$</li>
                    <li>3.000$ to 4.000$</li>
                    <li>5000$ & above</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
