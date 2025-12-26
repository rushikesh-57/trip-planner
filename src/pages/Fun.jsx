import { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

export default function Fun() {
  const user = useContext(UserContext);
  const [songName, setSongName] = useState("");
  const [playlist, setPlaylist] = useState([]);

  // Shared playlist document for the trip (visible to everyone)
  const PLAYLIST_DOC = doc(db, "trips", "murudeshwar_gokarna", "fun", "playlist");

  useEffect(() => {
    if (!user) return;

    // Subscribe to shared playlist
    const unsub = onSnapshot(
      PLAYLIST_DOC,
      (snap) => {
        if (snap.exists()) {
          setPlaylist(snap.data().songs || []);
        } else {
          // initialize shared playlist if missing
          setDoc(PLAYLIST_DOC, { songs: [] }).catch(() => {});
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
      addedByUid: user.uid,
      votes: [], // store voter uids
      createdAt: new Date(),
    };

    try {
      // optimistic update locally
      const next = [song, ...(playlist || [])];
      setPlaylist(next);
      await setDoc(PLAYLIST_DOC, { songs: next });
    } catch (e) {
      console.error("Failed to add song:", e);
    } finally {
      setSongName("");
    }
  };

  const removeSong = async (id) => {
    if (!user || !window.confirm("Remove this song?")) return;
    // allow removal only by the adder or organizer (simple rule)
    const target = (playlist || []).find((s) => s.id === id);
    if (!target) return;
    if (target.addedByUid !== user.uid) {
      alert("Only the person who added the song can remove it.");
      return;
    }

    const next = (playlist || []).filter((s) => s.id !== id);
    try {
      setPlaylist(next);
      await setDoc(PLAYLIST_DOC, { songs: next });
    } catch (e) {
      console.error("Failed to remove song:", e);
    }
  };

  // one vote per person across all songs; users cannot vote their own songs
  const voteSong = async (songId) => {
    if (!user) return;
    const uid = user.uid;

    // prevent voting own song
    const target = (playlist || []).find((s) => s.id === songId);
    if (!target) return;
    if (target.addedByUid === uid) {
      alert("You cannot vote for your own suggestion.");
      return;
    }

    // check if user already voted anywhere
    const alreadyVotedAnywhere = (playlist || []).some((s) => (s.votes || []).includes(uid));
    if (alreadyVotedAnywhere) {
      alert("You have already voted for a song.");
      return;
    }

    const next = (playlist || []).map((s) =>
      s.id === songId ? { ...s, votes: [...(s.votes || []), uid] } : s
    );

    try {
      setPlaylist(next);
      await setDoc(PLAYLIST_DOC, { songs: next });
    } catch (e) {
      console.error("Failed to vote:", e);
    }
  };

  const userHasVoted = () => {
    if (!user) return false;
    return (playlist || []).some((s) => (s.votes || []).includes(user.uid));
  };

  // button styles (inline for immediate effect)
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
          <button
            onClick={addSong}
            disabled={!songName.trim()}
            style={{ ...voteBtnBase, background: "#06b6d4", color: "#fff", width: "100%" }}
          >
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
                    <div className="muted" style={{ fontSize: "0.9rem" }}>
                      added by {s.addedBy}
                    </div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      Votes: {count}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => voteSong(s.id)}
                      style={voteBtnStyle}
                      disabled={globalVoted && !votedByUser}
                      aria-pressed={votedByUser}
                      title={s.addedByUid === user.uid ? "Cannot vote your own suggestion" : ""}
                    >
                      {s.addedByUid === user.uid ? "Own" : votedByUser ? "Voted" : "Vote"}
                    </button>
                    <button onClick={() => removeSong(s.id)} style={removeBtnStyle}>
                      Remove
                    </button>
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