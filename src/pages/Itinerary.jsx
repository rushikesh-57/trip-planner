import { useEffect } from "react";

const days = [
  {
    date: "27 Dec",
    day: "Saturday — Day 1",
    summary: "Everyone arrives in Satara by evening at their own time.",
    places: [
      { name: "Satara (Arrival)", maps: "https://www.google.com/maps/search/?api=1&query=Satara", hours: "N/A" },
    ],
    travel: "Local arrivals",
    stay: "Overnight stay in Satara",
  },
  {
    date: "28 Dec",
    day: "Sunday — Day 2",
    summary: "Start early, have lunch on the way and reach Murudeshwar by night.",
    places: [
      { name: "Depart Satara (early)", maps: "https://www.google.com/maps/search/?api=1&query=Satara", hours: "N/A" },
      { name: "Lunch stop (en route)", maps: "https://www.google.com/maps/search/?api=1&query=highway+restaurant+near+Satara", hours: "Varies" },
    ],
    travel: "Drive (with stops) — expect a long day",
    stay: "Overnight stay in Murudeshwar",
  },
  {
    date: "29 Dec",
    day: "Monday — Day 3",
    summary:
      "Early morning temple visit in Murudeshwar, breakfast, then drive: Jog Falls → Sirsi (Sahasralingam) → Gokarna. Night stay in Gokarna.",
    places: [
      { name: "Murudeshwar Temple", maps: "https://www.google.com/maps/search/?api=1&query=Murudeshwar+Temple", hours: "06:00 AM – 09:00 PM" },
      { name: "Jog Falls", maps: "https://www.google.com/maps/search/?api=1&query=Jog+Falls", hours: "07:00 AM – 06:00 PM (best visibility during monsoon/after rain)" },
      { name: "Sirsi (Sahasralingam / Marikamba area)", maps: "https://www.google.com/maps/search/?api=1&query=Sirsi+Sahasralingam", hours: "06:00 AM – 08:00 PM" },
      { name: "Drive to Gokarna", maps: "https://www.google.com/maps/search/?api=1&query=Gokarna", hours: "N/A" },
    ],
    travel: "Murudeshwar → Jog Falls ~3.5h, Jog Falls → Sirsi ~2h, Sirsi → Gokarna ~2.5h",
    stay: "Overnight stay in Gokarna",
  },
  {
    date: "30 Dec",
    day: "Tuesday — Day 4",
    summary: "Breakfast, visit Yana Caves and Om Beach. Big party night in Gokarna — full fun evening.",
    places: [
      { name: "Yana Caves", maps: "https://www.google.com/maps/search/?api=1&query=Yana+Caves", hours: "08:00 AM – 05:00 PM" },
      { name: "Om Beach (Gokarna)", maps: "https://www.google.com/maps/search/?api=1&query=Om+Beach+Gokarna", hours: "Open 24 hours (public beach)" },
      { name: "Gokarna town (evening)", maps: "https://www.google.com/maps/search/?api=1&query=Gokarna+Town", hours: "Local shops/temples vary" },
    ],
    travel: "Gokarna → Yana ~1.5h, Yana → Om Beach ~1.5h",
    stay: "Overnight stay in Gokarna",
    note: "Party Night — enjoy! 💃🏻",
  },
  {
    date: "31 Dec",
    day: "Wednesday — Day 5",
    summary:
      "Relaxed morning and breakfast. Afternoon visit to Gokarna Temple, lunch, optional visit to Go-Garbh cave. Evening together in rooms — celebrate New Year.",
    places: [
      { name: "Relaxed morning / local stroll", maps: "https://www.google.com/maps/search/?api=1&query=Gokarna+beaches", hours: "N/A" },
      { name: "Gokarna Mahabaleshwar Temple", maps: "https://www.google.com/maps/search/?api=1&query=Gokarna+Mahabaleshwar+Temple", hours: "05:00 AM – 09:00 PM" },
      { name: "Go-Garbh cave (optional)", maps: "https://www.google.com/maps/search/?api=1&query=Go+Garbh+cave+Gokarna", hours: "08:00 AM – 06:00 PM (approx.)" },
    ],
    travel: "Local travel in Gokarna",
    stay: "Overnight stay in Gokarna",
    note: "Happy New Year! 🎆",
  },
  {
    date: "1 Jan",
    day: "Thursday — Day 6",
    summary:
      "Early morning departure for return journey. Expect traffic; plan stops based on timing. Options depending on arrival time: Pune (if early) or Chafal / Satara (if delayed).",
    places: [
      { name: "Depart Gokarna (early)", maps: "https://www.google.com/maps/search/?api=1&query=Gokarna", hours: "N/A" },
      { name: "Pune (optional stop)", maps: "https://www.google.com/maps/search/?api=1&query=Pune", hours: "N/A" },
      { name: "Chafal / Satara (alternative stop)", maps: "https://www.google.com/maps/search/?api=1&query=Satara", hours: "N/A" },
    ],
    travel: "Expect heavy traffic on return day",
    stay: "Return home / en route stops (Pune or Chafal / Satara depending on time)",
  },
];

export default function Itinerary() {
  useEffect(() => {
    // placeholder for sticky headers or scroll behavior
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Itinerary</h2>
        <div className="timeline-list">
          {days.map((d) => (
            <div key={d.date} className="it-day card-small">
              <div className="it-header">
                <div>
                  <div className="it-date">{d.date}</div>
                  <div className="it-dayname">{d.day}</div>
                </div>
              </div>

              <p className="muted">{d.summary}</p>

              <div className="muted">Stay: {d.stay}</div>

              <div style={{ marginTop: 8 }}>Planned places / stops:</div>
              <ul>
                {d.places.map((p) => (
                  <li key={p.name} style={{ marginBottom: 6 }}>
                    <a href={p.maps} target="_blank" rel="noreferrer" style={{ color: "#0369a1", textDecoration: "none" }}>
                      {p.name}
                    </a>
                    <div className="muted" style={{ fontSize: "0.9rem" }}>Hours: {p.hours}</div>
                  </li>
                ))}
              </ul>

              <div className="muted">Travel notes: {d.travel}</div>

              {d.note && <div className="badge" style={{ marginTop: 8 }}>{d.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}