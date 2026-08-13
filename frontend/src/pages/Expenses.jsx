import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const categories = ["Rent", "Electricity", "Labour", "Other"];
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function InlineConfirmButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <button
        type="button"
        onClick={onConfirm}
        className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
      >
        Confirm?
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="border-2 border-primary bg-white px-2 py-1 text-xs font-bold"
    >
      Delete
    </button>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Rent",
    date: new Date().toISOString().slice(0, 10),
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/expenses");
      const list = Array.isArray(data) ? data : data?.expenses || [];
      setExpenses(
        [...list].sort(
          (a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totals = useMemo(() => {
    const count = expenses.length;
    const sum = expenses.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    return { count, sum };
  }, [expenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    try {
      setSaving(true);
      await api.post("/expenses", { ...form, amount: Number(form.amount) });
      setForm((prev) => ({ ...prev, description: "", amount: "" }));
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete expense");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="border-b-2 border-primary pb-3">
        <h2 className="font-quicksand text-2xl font-bold">Expenses</h2>
        <p className="mt-2 data-mono text-sm">
          Total Entries: {totals.count} | Total Amount: {money(totals.sum)}
        </p>
      </div>

      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="grid gap-3 border-2 border-primary bg-white p-4 shadow-brutal md:grid-cols-4">
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="md:col-span-2 border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        />
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="border-2 border-primary bg-accent px-5 py-2 font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {saving ? "Saving..." : "Add Expense"}
        </button>
      </form>

      <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
        {loading ? (
          <Loader />
        ) : expenses.length === 0 ? (
          <p className="p-4 data-mono text-sm">No expenses recorded yet.</p>
        ) : (
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-base">
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Description</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Amount</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Category</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Date</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense._id} className={index % 2 ? "bg-base" : "bg-white"}>
                  <td className="border border-primary px-3 py-2 text-sm">{expense.description}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(expense.amount)}</td>
                  <td className="border border-primary px-3 py-2 text-sm">{expense.category}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">
                    {new Date(expense.date || expense.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="border border-primary px-3 py-2 text-sm">
                    <InlineConfirmButton onConfirm={() => handleDelete(expense._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
