import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddProblem from "./pages/AddProblem";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";
import Status from "./pages/Status";
import Category from "./pages/Category";
import { asyncLogin } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(asyncLogin() as any);
  }, []);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/create" element={<AddProblem />} />
        <Route path="/status" element={<Status />} />
        <Route path="/category" element={<Category />} />
        {/* This route was added for testing purpose */}
        {/* <Route path="/test" element={<Test />} /> */}
      </Routes>
    </div>
  );
}

export default App;
// All routes described here