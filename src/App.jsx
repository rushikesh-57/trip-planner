import { createContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Itinerary from "./pages/Itinerary";
import Expenses from "./pages/Expenses";
import Fun from "./pages/Fun";
import Preparation from "./pages/Preparation";

export const UserContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  if (!user) {
    return (
      <div className="login-screen">
        <h1>काफिला — मुरुडेश्वर – गोकर्ण सहल</h1>
        <p className="muted">सहलीसाठी लॉगिन करा</p>
        <button onClick={login}>Login with Google</button>
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="itinerary" element={<Itinerary />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="fun" element={<Fun />} />
            <Route path="preparation" element={<Preparation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}
