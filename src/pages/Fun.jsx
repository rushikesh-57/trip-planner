import { useState } from "react";

export default function Fun() {
  const [votes, setVotes] = useState({ Party:0, Travel:0, Marathi:0, Hindi:0, English:0 });
  const [polls, setPolls] = useState({ sleepFirst: {}, bestDriver: {} });

  const vote = (key) => setVotes(prev => ({...prev, [key]: (prev[key]||0)+1}));
  const togglePoll = (poll, option) => setPolls(prev=>({ ...prev, [poll]: { ...(prev[poll]||{}), [option]: (prev[poll]?.[option]||0)+1 } }));

  return (
    <div className="container">
      <div className="card">
        <h2>Music voting</h2>
        <div className="chip-container">
          <button className="chip btn-chip" onClick={()=>vote("Party")}>Party ({votes.Party})</button>
          <button className="chip btn-chip" onClick={()=>vote("Travel")}>Travel ({votes.Travel})</button>
          <button className="chip btn-chip" onClick={()=>vote("Marathi")}>Marathi ({votes.Marathi})</button>
          <button className="chip btn-chip" onClick={()=>vote("Hindi")}>Hindi ({votes.Hindi})</button>
          <button className="chip btn-chip" onClick={()=>vote("English")}>English ({votes.English})</button>
        </div>
      </div>
    </div>
  );
}