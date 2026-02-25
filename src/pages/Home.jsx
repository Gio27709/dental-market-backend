import Header from "../components/layout/Header";
import Hero from "../components/layout/home/Hero";
import TopCategories from "../components/layout/home/TopCategories";
import PromoBanners from "../components/layout/home/PromoBanners";
import DealsContainer from "../components/layout/home/DealsContainer";
import BrandsTicker from "../components/layout/home/BrandsTicker";
import TopSelling from "../components/layout/home/TopSelling";
import TwoColumnBanners from "../components/layout/home/TwoColumnBanners";
import NewProduct from "../components/layout/home/NewProduct";
import Footer from "../components/layout/Footer";
import DealOfTheDay from "../components/layout/home/DealOfTheDay";
// import DealsSection from "../components/layout/home/DealsSection";

const Home = () => {
  return (
    <div className="global_home mx-auto">
      <Header />
      <Hero />
      <TopCategories />
      <PromoBanners />
      <DealsContainer />
      <BrandsTicker />
      <DealOfTheDay />
      <TopSelling />
      <TwoColumnBanners />
      <NewProduct />
      <Footer />
      {/* <DealsSection /> */}
    </div>
  );
};

export default Home;
