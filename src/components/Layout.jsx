import { Outlet, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useContext } from "react";
import { UserContext } from "../App";

export default function Layout() {
  const user = useContext(UserContext);

  return (
    <div className="app">
      <header className="sticky-header">
        <div className="header-left">
          <div className="trip-title">मुरुडेश्वर – गोकर्ण सहल</div>
          <div className="trip-dates">27 Dec – 1 Jan</div>
        </div>
        <div className="header-right">
          <div className="user-name">👋 {user.displayName}</div>
          <button className="logout-btn" onClick={() => signOut(auth)}>Logout</button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({isActive})=> isActive? "nav-item active":"nav-item"}>Home</NavLink>
        <NavLink to="/itinerary" className={({isActive})=> isActive? "nav-item active":"nav-item"}>Itinerary</NavLink>
        <NavLink to="/expenses" className={({isActive})=> isActive? "nav-item active":"nav-item"}>Expenses</NavLink>
        <NavLink to="/fun" className={({isActive})=> isActive? "nav-item active":"nav-item"}>Fun</NavLink>
        <NavLink to="/preparation" className={({isActive})=> isActive? "nav-item active":"nav-item"}>Prep</NavLink>
      </nav>
    </div>
  );
}