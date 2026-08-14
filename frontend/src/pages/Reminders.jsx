import { CalendarClock } from "lucide-react";

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

export default function Reminders() {
  const now = new Date();
  const label = now.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const year = now.getFullYear();

  const monthlyDeadlines = [
    { date: new Date(year, now.getMonth(), 11), title: "GSTR-1 Filing" },
    { date: new Date(year, now.getMonth(), 20), title: "GSTR-3B Filing" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / REMINDERS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Reminders</h1>
        </div>
      </div>

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
