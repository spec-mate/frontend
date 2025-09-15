import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Introduce from "./pages/Introduce";
import Usage from "./pages/Usage";
import ProductInfo from "./pages/ProductInfo";
import ProductDetail from "./pages/ProductDetail";
import ProductDetailView from "./pages/ProductDetailView";

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register", "/usage"];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/info" element={<ProductInfo />} />
        <Route path="/product/:productName" element={<ProductDetail />} />
        <Route
          path="/product/:productName/:id"
          element={<ProductDetailView />}
        />
      </Routes>
    </>
  );
}

export default App;
