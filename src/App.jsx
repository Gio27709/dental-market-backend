import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const safeLazy = (importFn) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Error cargando el módulo, reintentando...", error);
      window.location.reload();
      return { default: () => null };
    }
  });
};

const Home = safeLazy(() => import("./pages/Home"));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense
          fallback={
            <div className="loading-screen">
              <p>Is loading...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
