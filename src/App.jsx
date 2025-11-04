import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Usage from "./pages/Usage";
import ProductInfo from "./pages/ProductInfo";
import ProductDetail from "./pages/ProductDetail";
import ProductDetailView from "./pages/ProductDetailView";
import MyPage from "./pages/Mypage";
import EstimateDetail from "./pages/EstimateDetail";
import ProgressBar from "./components/ProgressBar";
import UserGuide from "./pages/UserGuide";
import UserGuideDetail from "./pages/UserGuideDetail.jsx";
import FindPassword from "./pages/FindPassword.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register", "/usage"];

  return (
    <>
      <ProgressBar />
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/info" element={<ProductInfo />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/guide/:id" element={<UserGuideDetail />} />
        <Route path="/product/:productName" element={<ProductDetail />} />
        <Route path="/estimate/:id" element={<EstimateDetail />} />
        <Route path="/findpassword" element={<FindPassword />} />
        <Route path="/reset-password" element={<PasswordReset />} />

        <Route
          path="/product/:productName/:id"
          element={<ProductDetailView />}
        />
      </Routes>
    </>
  );
}

export default App;
