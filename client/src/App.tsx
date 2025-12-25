import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { DataEntry } from "@/pages/DataEntry";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/start" element={<DataEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
