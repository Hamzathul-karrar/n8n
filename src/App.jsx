import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WorkflowEditor from "./components/WorkflowEditor";
import "./styles/global.css";
import "./styles/dashboard.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/workflow/:id"
          element={<WorkflowEditor />}
        />
        <Route
          path="*"
          element={
            <div className="app-container">
              <Sidebar />
              <div className="main-container">
                <Routes>
                  <Route path="/" element={<Dashboard section="overview" />} />
                  <Route path="/admin" element={<Dashboard section="admin" />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
