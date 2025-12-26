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
    const normalized = songName.trim().toLowerCase();
    // prevent duplicates (case-insensitive, trim)
    const exists = (playlist || []).some(
      (s) => (s.name || "").trim().toLowerCase() === normalized
    );
    if (exists) {
      alert("This song has already been suggested.");
      return;
    }

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
    // allow removal only by the adder
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

  // toggle vote per song (one vote max per song per user) and allow undo
  const voteSong = async (songId) => {
    if (!user) return;
    const uid = user.uid;

    try {
      const snap = await getDoc(PLAYLIST_DOC);
      const current = snap.exists() ? snap.data().songs || [] : (playlist || []);
      const next = current.map((s) => {
        if (s.id !== songId) return s;
        const votes = Array.isArray(s.votes) ? s.votes.slice() : [];
        if (votes.includes(uid)) {
          // undo vote
          return { ...s, votes: votes.filter((v) => v !== uid) };
        } else {
          // add vote (only once per song)
          return { ...s, votes: [...votes, uid] };
        }
      });
      // optimistic update and persist
      setPlaylist(next);
      await setDoc(PLAYLIST_DOC, { songs: next });
    } catch (e) {
      console.error("Failed to toggle vote:", e);
    }
  };

  // compute max votes to highlight top songs
  const maxVotes = playlist.length ? Math.max(...playlist.map((s) => (Array.isArray(s.votes) ? s.votes.length : 0))) : 0;

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
              const votes = Array.isArray(s.votes) ? s.votes : [];
              const count = votes.length;
              const votedByUser = user && votes.includes(user.uid);
              const voteBtnStyle = {
                ...voteBtnBase,
                background: votedByUser ? "#10b981" : "#0ea5a4",
                color: "#fff",
                marginRight: 6,
              };

              const topHighlight = count > 0 && count === maxVotes;

              return (
                <div
                  key={s.id}
                  className="row"
                  style={{
                    alignItems: "center",
                    gap: 8,
                    border: topHighlight ? "2px solid #f59e0b" : undefined,
                    boxShadow: topHighlight ? "0 6px 18px rgba(245,158,11,0.08)" : undefined,
                    padding: topHighlight ? 12 : undefined,
                    borderRadius: topHighlight ? 10 : undefined,
                    background: topHighlight ? "#fffaf0" : undefined,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{s.name}</span>
                      {topHighlight && <span className="badge" style={{ marginLeft: 8 }}>Top</span>}
                    </div>
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
                      aria-pressed={votedByUser}
                      title={votedByUser ? "Undo your vote" : "Vote for this song"}
                    >
                      {votedByUser ? "Undo" : "Vote"}
                    </button>
                    <button
                      onClick={() => removeSong(s.id)}
                      style={removeBtnStyle}
                      title={s.addedByUid === user.uid ? "Remove your song" : "Only the adder can remove"}
                    >
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