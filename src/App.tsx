import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SchedulePage } from "@/pages/SchedulePage";
import { AppointmentsListPage } from "@/pages/AppointmentsListPage";
import { ADKQueryPage } from "@/pages/ADKQueryPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/appointments" element={<AppointmentsListPage />} />
          <Route path="/adk" element={<ADKQueryPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
