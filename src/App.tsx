// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ControlPage from "./pages/ControlPage";
import DashboardPage from "./pages/DashboardPage";
import AccessLogPage from "./pages/AccessLog";
import SettingPage from "./pages/SettingPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<AccessLogPage />} />
        <Route path="/access-setting" element={<SettingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
