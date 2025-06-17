import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SchedulePage } from "@/pages/SchedulePage";
import { AppointmentsListPage } from "@/pages/AppointmentsListPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/appointments" element={<AppointmentsListPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
