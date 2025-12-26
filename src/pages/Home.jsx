import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Home() {
  const user = useContext(UserContext);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const membersRef = doc(db, "users", user.uid, "data", "members");
    getDoc(membersRef).then((snap) => {
      setMembers((snap.exists() && snap.data().list) || []);
    });
  }, [user]);

  const vehicles = [
    { name: "Innova", seats: 7 },
    { name: "Harrier", seats: 5 },
  ];
  const seatsTotal = vehicles.reduce((s, v) => s + v.seats, 0);
  const perPerson = 6230;
  const organizer = "Ashwin";

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">मुरुडेश्वर – गोकर्ण सहल</h2>
        <div className="row small">
          <div>Dates</div>
          <div className="muted">27 Dec – 1 Jan</div>
        </div>
      </div>

      <div className="card">
        <h3>Participants ({members.length})</h3>
        <div className="chip-container">
          {members.map((m) => <span key={m} className="chip">{m}</span>)}
        </div>
      </div>

      <div className="card">
        <h3>Quick timeline</h3>
        <ol className="timeline">
          <li>27 Dec — Arrive Satara in the evening (overnight stay in Satara)</li>
          <li>28 Dec — Depart early from Satara; lunch en route; reach Murudeshwar by night (stay in Murudeshwar)</li>
          <li>29 Dec — Early Murudeshwar temple visit and breakfast; Jog Falls → Sirsi (Sahasralingam) → Drive to Gokarna (overnight in Gokarna)</li>
          <li>30 Dec — Visit Yana Caves and Om Beach; party night in Gokarna 🎉</li>
          <li>31 Dec — Relaxed morning, afternoon Gokarna Temple, optional Go‑Garbh cave; New Year celebration 🎆</li>
          <li>1 Jan — Early departure for return; expect traffic — stops/options: Pune (if early) or Chafal / Satara depending on timing</li>
        </ol>
      </div>
    </div>
  );
}