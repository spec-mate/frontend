import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Introduce from "./pages/Introduce";

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register"];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/introduce" element={<Introduce />} />
      </Routes>
    </>
  );
}

export default App;
