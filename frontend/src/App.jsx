import React from "react";
import Landing from "./pages/Landing.jsx";
import { Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication.jsx";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Authentication />} />
      </Routes>
    </div>
  );
}