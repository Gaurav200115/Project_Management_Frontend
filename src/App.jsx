import Login from "./pages/login.jsx";
import ProjectPage from "./pages/project.jsx";
import MainProjectPage from "./pages/main_project.jsx";
import EditTranscriptPage from "./pages/edit_transcript.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/main_project" element={<MainProjectPage />} />
        <Route path="/edit_transcript" element={<EditTranscriptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
