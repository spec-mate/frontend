import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Introduce from "./pages/Introduce";
import Usage from "./pages/Usage";

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
      </Routes>
    </>
  );
}

export default App;
