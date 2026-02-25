import BeastDealCard from "./BeastDealCard";
import ProductListItem from "../../common/ProductListItem";
import "../../../styles/layout/_deals-section.scss";

// Mock Data
const listData = [
  {
    title: "Headphones",
    items: [
      {
        id: 1,
        title: "Bose QuietComfort 45",
        price: 249,
        oldPrice: 329,
        rating: 5,
        image: "https://via.placeholder.com/80?text=Headphones",
      },
      {
        id: 2,
        title: "Sony WH-1000XM5",
        price: 348,
        oldPrice: 399,
        rating: 4,
        image: "https://via.placeholder.com/80?text=Sony",
      },
      {
        id: 3,
        title: "JBL Live 660NC",
        price: 99,
        oldPrice: 199,
        rating: 4,
        image: "https://via.placeholder.com/80?text=JBL",
      },
    ],
  },
  {
    title: "Laptops & PC",
    items: [
      {
        id: 4,
        title: "MacBook Air M2",
        price: 999,
        oldPrice: 1199,
        rating: 5,
        image: "https://via.placeholder.com/80?text=MacBook",
      },
      {
        id: 5,
        title: "Dell XPS 13 Plus",
        price: 1249,
        oldPrice: 1449,
        rating: 4,
        image: "https://via.placeholder.com/80?text=Dell",
      },
      {
        id: 6,
        title: "HP Spectre x360",
        price: 1099,
        oldPrice: 1299,
        rating: 5,
        image: "https://via.placeholder.com/80?text=HP",
      },
    ],
  },
  {
    title: "Cameras",
    items: [
      {
        id: 7,
        title: "Canon EOS R6",
        price: 2299,
        oldPrice: 2499,
        rating: 5,
        image: "https://via.placeholder.com/80?text=Canon",
      },
      {
        id: 8,
        title: "Sony Alpha a7 IV",
        price: 2498,
        oldPrice: 2698,
        rating: 5,
        image: "https://via.placeholder.com/80?text=Sony",
      },
      {
        id: 9,
        title: "Nikon Z6 II",
        price: 1996,
        oldPrice: 2196,
        rating: 4,
        image: "https://via.placeholder.com/80?text=Nikon",
      },
    ],
  },
];

const DealsContainer = () => {
  return (
    <section className="deals-section">
      <div className="container">
        <div className="deals-grid">
          {/* Column 1: Beast Deal (Large) */}
          <div className="grid-col beast-col">
            <BeastDealCard />
          </div>

          {/* Columns 2, 3, 4: Product Lists */}
          {listData.map((category, index) => (
            <div key={index} className="grid-col list-col">
              <h3 className="column-title">{category.title}</h3>
              <div className="list-items">
                {category.items.map((item) => (
                  <ProductListItem key={item.id} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsContainer;
