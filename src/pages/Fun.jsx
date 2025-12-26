import { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export default function Fun() {
  const user = useContext(UserContext);
  const [songName, setSongName] = useState("");
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "fun", "playlist");
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setPlaylist(snap.data().songs || []);
        } else {
          // initialize
          setDoc(docRef, { songs: [] }).catch(() => {});
          setPlaylist([]);
        }
      },
      (err) => {
        console.error("Playlist snapshot error:", err);
      }
    );
    return () => unsub();
  }, [user]);

  const addSong = async () => {
    if (!songName.trim() || !user) return;
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const song = {
      id,
      name: songName.trim(),
      addedBy: user.displayName || user.email || "Unknown",
      votes: [], // store voter uids
      createdAt: new Date(),
    };
    const docRef = doc(db, "users", user.uid, "fun", "playlist");
    try {
      const next = [song, ...(playlist || [])];
      setPlaylist(next);
      await setDoc(docRef, { songs: next });
    } catch (e) {
      console.error("Failed to add song:", e);
    } finally {
      setSongName("");
    }
  };

  const removeSong = async (id) => {
    if (!user || !window.confirm("Remove this song?")) return;
    const docRef = doc(db, "users", user.uid, "fun", "playlist");
    const next = (playlist || []).filter((s) => s.id !== id);
    try {
      setPlaylist(next);
      await setDoc(docRef, { songs: next });
    } catch (e) {
      console.error("Failed to remove song:", e);
    }
  };

  // one vote per person across all songs
  const voteSong = async (songId) => {
    if (!user) return;
    const uid = user.uid;
    const alreadyVotedAnywhere = (playlist || []).some((s) => (s.votes || []).includes(uid));
    if (alreadyVotedAnywhere) {
      alert("You have already voted.");
      return;
    }
    const docRef = doc(db, "users", user.uid, "fun", "playlist");
    const next = (playlist || []).map((s) =>
      s.id === songId ? { ...s, votes: [...(s.votes || []), uid] } : s
    );
    try {
      setPlaylist(next);
      await setDoc(docRef, { songs: next });
    } catch (e) {
      console.error("Failed to vote:", e);
    }
  };

  const userHasVoted = () => {
    if (!user) return false;
    return (playlist || []).some((s) => (s.votes || []).includes(user.uid));
  };

  // button styles (inline to ensure immediate effect)
  const voteBtnBase = {
    minHeight: 40,
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  };
  const removeBtnStyle = {
    minHeight: 40,
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  };
  const disabledStyle = { opacity: 0.6, cursor: "not-allowed" };

  return (
    <div className="container">
      <div className="card">
        <h2>Group Playlist</h2>
        <input placeholder="Song name" value={songName} onChange={(e) => setSongName(e.target.value)} />
        <div className="row" style={{ marginTop: 8 }}>
          <button onClick={addSong} disabled={!songName.trim()} style={{ ...voteBtnBase, background: "#06b6d4", color: "#fff", width: "100%" }}>
            Add to playlist
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {playlist.length === 0 ? (
            <p className="empty-state">Playlist is empty — add a song!</p>
          ) : (
            playlist.map((s) => {
              const count = (s.votes || []).length;
              const votedByUser = user && (s.votes || []).includes(user.uid);
              const globalVoted = userHasVoted();
              const voteBtnStyle = {
                ...voteBtnBase,
                background: votedByUser ? "#10b981" : "#0ea5a4",
                color: "#fff",
                marginRight: 6,
                ...(globalVoted && !votedByUser ? disabledStyle : {}),
              };

              return (
                <div key={s.id} className="row" style={{ alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: "0.9rem" }}>added by {s.addedBy}</div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>Votes: {count}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => voteSong(s.id)}
                      style={voteBtnStyle}
                      disabled={globalVoted && !votedByUser}
                      aria-pressed={votedByUser}
                    >
                      {votedByUser ? "Voted" : "Vote"}
                    </button>
                    <button onClick={() => removeSong(s.id)} style={removeBtnStyle}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}