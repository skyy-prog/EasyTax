import { CalendarClock, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const annualRows = [
  { month: "January", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "TDS Q3 (31st)", advanceTax: "-" },
  { month: "February", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "-" },
  { month: "March", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "Q4 (15th)" },
  { month: "April", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "-" },
  { month: "May", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "TDS Q4 (31st)", advanceTax: "-" },
  { month: "June", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "Q1 (15th)" },
  { month: "July", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "TDS Q1 (31st)", advanceTax: "-" },
  { month: "August", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "-" },
  { month: "September", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "Q2 (15th)" },
  { month: "October", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "TDS Q2 (31st)", advanceTax: "-" },
  { month: "November", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "-" },
  { month: "December", gst: "GSTR-1 (11th), GSTR-3B (20th)", tds: "-", advanceTax: "Q3 (15th)" },
];

const daysLeft = (targetDate) => {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((targetDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / oneDay);
};

const storageKey = "easytax-reminders";
const categories = ["GST", "TDS", "Advance Tax", "Income Tax", "Business", "Other"];

const todayValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getStoredReminders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Reminders() {
  const now = new Date();
  const label = now.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const year = now.getFullYear();
  const [reminders, setReminders] = useState(() => getStoredReminders());
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: todayValue(),
    category: categories[0],
    notes: "",
  });

  const monthlyDeadlines = [
    { date: new Date(year, now.getMonth(), 11), title: "GSTR-1 Filing" },
    { date: new Date(year, now.getMonth(), 20), title: "GSTR-3B Filing" },
  ];

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
      }),
    [reminders]
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reminders));
  }, [reminders]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Reminder title is required");
      return;
    }
    if (!form.date) {
      setError("Reminder date is required");
      return;
    }

    const nextReminder = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      date: form.date,
      category: form.category,
      notes: form.notes.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setReminders((prev) => [...prev, nextReminder]);
    setForm({ title: "", date: todayValue(), category: categories[0], notes: "" });
    setError("");
  };

  const toggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / REMINDERS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Reminders</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-fog bg-white p-3">
          <p className="text-sm font-quicksand italic text-ink">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 border border-fog bg-white p-6">
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_180px_180px]">
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border-b border-fog bg-transparent py-2.5 text-sm font-mono text-ink transition-colors placeholder:text-silver focus:border-ink focus:outline-none"
              placeholder="GST payment, client follow-up..."
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Due Date</label>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              type="date"
              className="w-full border-b border-fog bg-transparent py-2.5 text-sm font-mono text-ink transition-colors focus:border-ink focus:outline-none"
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
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full resize-none border border-fog bg-white px-3 py-2.5 text-sm font-mono text-ink transition-colors placeholder:text-silver focus:border-ink focus:outline-none"
            placeholder="Optional details"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </form>

      <section className="mb-8 border border-fog bg-white overflow-hidden">
        <div className="border-b border-fog bg-ghost px-5 py-3">
          <h3 className="text-lg font-quicksand font-semibold text-ink">My Reminders</h3>
        </div>

        {sortedReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarClock size={32} className="mb-4 text-silver" />
            <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No reminders added</p>
            <p className="text-xs font-quicksand text-ash">Add due dates you want to track here</p>
          </div>
        ) : (
          <div className="divide-y divide-fog">
            {sortedReminders.map((reminder) => {
              const left = daysLeft(new Date(`${reminder.date}T00:00:00`));
              const status = left < 0 ? `${Math.abs(left)} days overdue` : left === 0 ? "Due today" : `${left} days left`;
              return (
                <article
                  key={reminder.id}
                  className={`grid gap-4 px-5 py-4 transition-colors hover:bg-ghost/70 md:grid-cols-[150px_1fr_144px_88px] md:items-center ${
                    reminder.completed ? "bg-ghost/50 text-ash" : "bg-white text-ink"
                  }`}
                >
                  <div>
                    <p className="text-sm font-mono">{formatDate(reminder.date)}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-ash">{reminder.category}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-quicksand font-semibold ${reminder.completed ? "line-through" : ""}`}>
                      {reminder.title}
                    </p>
                    {reminder.notes && <p className="mt-1 text-xs font-quicksand text-ash">{reminder.notes}</p>}
                  </div>
                  <p className="text-sm font-mono text-ash md:text-right">{reminder.completed ? "Completed" : status}</p>
                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => toggleReminder(reminder.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-fog text-ash transition-colors hover:border-ink hover:text-ink"
                      aria-label={reminder.completed ? "Mark reminder active" : "Mark reminder complete"}
                      title={reminder.completed ? "Mark active" : "Mark complete"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReminder(reminder.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-fog text-ash transition-colors hover:border-ink hover:text-ink"
                      aria-label="Delete reminder"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8 border border-fog bg-white p-6">
        <h2 className="text-lg font-quicksand font-semibold text-ink">{label} - Upcoming Deadlines</h2>
        <div className="my-3 border-t border-fog" />
        <div className="space-y-3">
          {monthlyDeadlines.map((item) => {
            const left = daysLeft(new Date(item.date));
            const baseClass = left < 0 ? "line-through text-ash" : left <= 5 ? "font-bold text-ink" : "text-ash";
            return (
              <div key={item.title} className={`grid grid-cols-[96px_1fr_140px] items-center gap-4 ${baseClass}`}>
                <p className="text-sm font-mono">{item.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                <p className="text-sm font-quicksand">{item.title}</p>
                <p className="text-right text-sm font-mono">
                  {left < 0 ? `${Math.abs(left)} days overdue` : `${left} days left`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border border-fog bg-white overflow-hidden">
        <div className="border-b border-fog bg-ghost px-5 py-3">
          <h3 className="flex items-center gap-2 text-lg font-quicksand font-semibold text-ink">
            <CalendarClock size={16} />
            Annual Compliance Calendar
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-fog bg-ghost">
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Month</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">GST Deadlines</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">TDS Deadlines</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Advance Tax</th>
              </tr>
            </thead>
            <tbody>
              {annualRows.map((row, index) => (
                <tr
                  key={row.month}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-ghost/50"} transition-colors hover:bg-fog/60`}
                >
                  <td className="px-5 py-3.5 text-sm font-mono text-ink">{row.month}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-ink">{row.gst}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-ink">{row.tds}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-ink">{row.advanceTax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
