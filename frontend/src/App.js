import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/librarian" element={<LibrarianDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;