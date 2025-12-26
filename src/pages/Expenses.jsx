import { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "../App";
import "../index.css";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

export default function Expenses() {
  const user = useContext(UserContext);

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [memberName, setMemberName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [description, setDescription] = useState("");
  const [splits, setSplits] = useState({});
  const [splitType, setSplitType] = useState("equal");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    if (!user) return;
    const membersRef = doc(db, "users", user.uid, "data", "members");

    // Seed default participant list if user has no members saved yet
    const defaultMembers = [
      "Aditya",
      "Ashutosh",
      "Ashwin",
      "Kedar",
      "Krushna",
      "Prathamesh",
      "Rushikesh",
      "Shrutika",
      "Sushama",
      "Tejas",
    ];

    getDoc(membersRef).then(async (snap) => {
      if (snap.exists()) {
        const list = snap.data().list || [];
        // if doc exists but empty, seed defaults (safe-only-if-empty)
        if (!Array.isArray(list) || list.length === 0) {
          setMembers(defaultMembers);
          try {
            await setDoc(membersRef, { list: defaultMembers });
          } catch (e) {
            console.error("Failed to seed default members:", e);
          }
        } else {
          setMembers(list);
        }
      } else {
        // no members doc yet -> seed defaults
        setMembers(defaultMembers);
        try {
          await setDoc(membersRef, { list: defaultMembers });
        } catch (e) {
          console.error("Failed to create members doc:", e);
        }
      }
    });

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const q = query(expensesRef);
    const unsub = onSnapshot(q, (ks) => {
      const ex = [];
      ks.forEach((d) => ex.push({ id: d.id, ...d.data() }));
      setExpenses(
        ex.sort(
          (a, b) =>
            new Date(
              b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt
            ) -
            new Date(
              a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt
            )
        )
      );
    });
    return () => unsub();
  }, [user]);

  useEffect(() => setSelectedMembers(members), [members]);

  const toggleMember = (member) => {
    setSelectedMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  const addMember = async () => {
    if (!memberName.trim() || !user) return;
    const newMembers = [...members, memberName.trim()];
    setMembers(newMembers);
    const membersRef = doc(db, "users", user.uid, "data", "members");
    await setDoc(membersRef, { list: newMembers });
    setMemberName("");
  };

  const handleSplitChange = (member, value) =>
    setSplits({ ...splits, [member]: Number(value) || 0 });

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplits({});
    setSplitType("equal");
    setSelectedMembers(members);
    setEditingExpense(null);
  };

  const isFormValid = () => {
    if (!amount || !paidBy || !description.trim()) return false;
    if (splitType === "equal" && selectedMembers.length === 0) return false;
    if (splitType === "unequal") {
      const totalSplit = Object.values(splits).reduce(
        (a, b) => a + (Number(b) || 0),
        0
      );
      return Math.abs(totalSplit - Number(amount)) < 0.001;
    }
    return true;
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "";
    const d = createdAt.seconds
      ? new Date(createdAt.seconds * 1000)
      : createdAt instanceof Date
      ? createdAt
      : new Date(createdAt);
    return d.toLocaleDateString();
  };

  const saveExpense = async () => {
    if (!isFormValid() || !user) return;

    let finalSplits = {};
    if (splitType === "equal") {
      const per = Number(amount) / selectedMembers.length;
      members.forEach((m) => (finalSplits[m] = selectedMembers.includes(m) ? per : 0));
    } else {
      finalSplits = members.reduce((acc, m) => ({ ...acc, [m]: Number(splits[m] || 0) }), {});
    }

    const expenseData = {
      description,
      amount: Number(amount),
      paidBy,
      splits: finalSplits,
      createdAt: new Date(),
    };

    if (editingExpense) {
      const ref = doc(db, "users", user.uid, "expenses", editingExpense.id);
      await updateDoc(ref, expenseData);
    } else {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const ref = doc(db, "users", user.uid, "expenses", id);
      await setDoc(ref, { id, ...expenseData });
    }

    resetForm();
  };

  const startEdit = (e) => {
    setEditingExpense(e);
    setDescription(e.description || "");
    setAmount(String(e.amount || ""));
    setPaidBy(e.paidBy || "");
    setSplits(e.splits || {});
    const positiveShares = Object.values(e.splits || {}).filter((v) => v > 0);
    setSplitType(
      positiveShares.length > 0 &&
        positiveShares.every((v) => Math.abs(v - positiveShares[0]) < 0.001)
        ? "equal"
        : "unequal"
    );
    setSelectedMembers(members.filter((m) => e.splits && e.splits[m] > 0));
  };

  const removeExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    const ref = doc(db, "users", user.uid, "expenses", id);
    await deleteDoc(ref);
  };

  const balances = useMemo(() => {
    const bal = {};
    members.forEach((m) => (bal[m] = 0));
    expenses.forEach((e) => {
      members.forEach((m) => {
        const share = (e.splits && (e.splits[m] || 0)) || 0;
        if (m === e.paidBy) bal[m] += e.amount - share;
        else bal[m] -= share;
      });
    });
    return bal;
  }, [members, expenses]);

  const settlements = useMemo(() => {
    const debtors = [],
      creditors = [];
    Object.entries(balances).forEach(([n, b]) => {
      if (b < -0.005) debtors.push({ name: n, amount: -b });
      if (b > 0.005) creditors.push({ name: n, amount: b });
    });
    const out = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      out.push(`${debtors[i].name} → ${creditors[j].name} ₹${pay.toFixed(2)}`);
      debtors[i].amount -= pay;
      creditors[j].amount -= pay;
      if (Math.abs(debtors[i].amount) < 0.01) i++;
      if (Math.abs(creditors[j].amount) < 0.01) j++;
    }
    return out;
  }, [balances]);

  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="container">
      <div className="card">
        <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          <option value="">Paid by</option>
          {members.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="toggle">
          <button className={splitType === "equal" ? "active" : ""} onClick={() => setSplitType("equal")}>
            Equal
          </button>
          <button className={splitType === "unequal" ? "active" : ""} onClick={() => setSplitType("unequal")}>
            Unequal
          </button>
        </div>

        {splitType === "equal" && (
          <div>
            <div className="muted">Split between:</div>
            {members.map((m) => (
              <label key={m} className="checkbox">
                <input type="checkbox" checked={selectedMembers.includes(m)} onChange={() => toggleMember(m)} /> {m}
              </label>
            ))}
          </div>
        )}

        {splitType === "unequal" && (
          <div>
            {members.map((m) => (
              <input key={m} type="number" placeholder={`${m}'s share`} value={splits[m] || ""} onChange={(e) => handleSplitChange(m, e.target.value)} />
            ))}
          </div>
        )}

        <div className="row">
          <button onClick={saveExpense} disabled={!isFormValid()}>
            {editingExpense ? "Update Expense" : "Add Expense"}
          </button>
          {editingExpense && (
            <button onClick={resetForm} className="muted-btn">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Expenses ({expenses.length}) • Total ₹{totalExpenses.toFixed(2)}</h3>
        {expenses.length === 0 ? (
          <p className="empty-state">No expenses yet.</p>
        ) : (
          <div className="expense-list">
            {expenses.map((e) => (
              <div key={e.id} className="expense-card">
                <div className="expense-header">
                  <strong>{e.description}</strong>
                  <span className="expense-amount">₹{Number(e.amount).toFixed(2)}</span>
                </div>
                <div className="expense-details">
                  <span className="muted">
                    Paid by <strong className="payer-highlight">{e.paidBy}</strong>
                  </span>
                  <span className="muted">{formatDate(e.createdAt)}</span>
                </div>
                <div className="split-chips">
                  {Object.entries(e.splits || {})
                    .filter(([_, v]) => v > 0)
                    .map(([m, v]) => (
                      <span key={m} className="chip">
                        {m}: ₹{v.toFixed(2)}
                      </span>
                    ))}
                </div>
                <div className="expense-actions">
                  <button onClick={() => startEdit(e)}>Edit</button>
                  <button onClick={() => removeExpense(e.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Balances</h3>
        {Object.entries(balances).map(([n, b]) => (
          <div key={n} className="row">
            <div>{n}</div>
            <div className={b >= 0 ? "positive" : "negative"}>₹{b.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Who pays whom</h3>
        {settlements.length === 0 ? <p>All settled 🎉</p> : settlements.map((s, i) => <p key={i}>{s}</p>)}
      </div>
    </div>
  );
}