import { Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const categories = ["Rent", "Electricity", "Labour", "Transport", "Utilities", "Other"];
const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    category: categories[0],
    amount: "",
  });

  const totalAmount = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

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
      setError(err.response?.data?.message || "Unable to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!Number(form.amount) || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/expenses", { ...form, amount: Number(form.amount) });
      setForm((prev) => ({ ...prev, description: "", amount: "" }));
      await fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / EXPENSES</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Expenses</h1>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="mb-6 border border-fog bg-white p-6">
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Date</label>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              type="date"
              className="w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors"
              placeholder="Expense note"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full appearance-none border border-fog bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-ink focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Amount</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Expense"}
        </button>
      </form>

      <section className="border border-fog bg-white overflow-hidden">
        <div className="border-b border-fog bg-ghost px-5 py-3">
          <h3 className="text-lg font-quicksand font-semibold text-ink">Expense Register</h3>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt size={32} className="mb-4 text-silver" />
            <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No records found</p>
            <p className="text-xs font-quicksand text-ash">No expenses recorded for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-fog bg-ghost">
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Description</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr
                    key={expense._id || `${expense.description}-${index}`}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-ghost/50"} transition-colors hover:bg-fog/60`}
                  >
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">
                      {new Date(expense.date || expense.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{expense.description}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">
                      <span className="border border-fog px-2 py-0.5 text-xs font-quicksand text-ash">
                        {expense.category || "Other"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{amount(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink bg-white">
                  <td className="px-5 py-3.5 text-sm font-quicksand font-bold text-ink" colSpan={3}>Total</td>
                  <td className="px-5 py-3.5 text-sm font-mono font-bold text-ink">{amount(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
