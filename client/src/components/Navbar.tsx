import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { asyncLogout } from "../store/authSlice";
import { RootState } from "../store/store";
import { useState } from "react";

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = async () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  const handleLogout = () => {
    dispatch(asyncLogout() as any);
  };

  const handleSearch = () => {
    console.log("Selected Tag:", searchQuery);
    navigate(`/category?tag=${searchQuery}`);
  };

  return (
    <div className="w-screen relative py-2 z-50" style={{ backgroundColor: '#111154' }}>
      <div className="flex items-center font-mono h-full px-12 justify-between z-50" style={{ backgroundColor: '#111154' }}>
        <h1 className="text-3xl font-black text-slate-200 z-50">
          <Link to={"/"} className="text-inherit">
            <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="CodeNex Logo" />
          </Link>
        </h1>
        <div className="flex items-center z-50" style={{ backgroundColor: '#111154' }}>
          <Link to={"/status"} className="mr-8 hover:underline text-white">
            MY SUBMISSION
          </Link>
          {/* <select
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-8 p-1 px-3 rounded-sm"
          >
            <option value="">Add problem category</option>
            <option value="math">math</option>
            <option value="sorting">sorting</option>
            <option value="string">string</option>
            <option value="graph">graph</option>
            <option value="dynamic programming">dynamic programming</option>
            <option value="divide n conquer">divide n conquer</option>
            <option value="greedy">greedy</option>
            <option value="tree">tree</option>
          </select> */}
          <button onClick={handleSearch} className="mr-8 p-1 px-3 border border-slate-300 rounded-sm text-white hover:bg-white hover:text-black">
            Filter Problems
          </button>
          <Link to={"/create"} className="mr-8 p-1 px-3 border border-slate-300 rounded-sm text-white hover:bg-white hover:text-black">
            SET PROBLEM
          </Link>
          {user && (
            <div
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={handleLogout}
            >
              <img
                src={user.image}
                alt=""
                className="w-8 h-8 rounded-full object-cover object-center"
              />
              <p className="m-0 text-white text-sm hover:underline">
                {user.displayName}
              </p>
            </div>
          )}
          {!user && (
            <button className="p-1 px-3 bg-white rounded" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>
      <div className="absolute w-full h-full bg-[#322b39] top-0 -z-1" style={{ backgroundColor: '#111154' }}></div>
    </div>
  );
}
