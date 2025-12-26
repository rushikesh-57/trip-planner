import { useState } from "react";

const checklist = [
  "ID / Aadhar / Driving License",
  "Chargers & power bank",
  "Medications",
  "Swimwear & towels",
  "Sunscreen",
  "Cash & cards",
  "Masks & sanitizer",
];

export default function Preparation() {
  const [done, setDone] = useState({});
  const toggle = (i) => setDone(d => ({...d, [i]: !d[i]}));

  return (
    <div className="container">
      <div className="card">
        <h2>Packing checklist</h2>
        <ul>
          {checklist.map((it, i) => (
            <li key={i} className={done[i] ? "muted done" : ""}>
              <label>
                <input type="checkbox" checked={!!done[i]} onChange={() => toggle(i)} /> {it}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}