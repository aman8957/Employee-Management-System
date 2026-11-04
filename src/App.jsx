
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Employees from "./pages/Employees";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import EmployeeDetails from "./pages/EmployeeDetails";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
