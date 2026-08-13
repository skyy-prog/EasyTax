const monthName = new Date().toLocaleString("en-IN", { month: "long" });

const rows = [
  { name: "GSTR-1", frequency: "Every month", due: "11th" },
  { name: "GSTR-3B", frequency: "Every month", due: "20th" },
  { name: "Advance Tax (Q1)", frequency: "Quarterly", due: "15 June" },
  { name: "Advance Tax (Q2)", frequency: "Quarterly", due: "15 September" },
  { name: "Advance Tax (Q3)", frequency: "Quarterly", due: "15 December" },
  { name: "Advance Tax (Q4)", frequency: "Quarterly", due: "15 March" },
  { name: "TDS Return (Q1)", frequency: "Quarterly", due: "31 July" },
  { name: "TDS Return (Q2)", frequency: "Quarterly", due: "31 October" },
  { name: "TDS Return (Q3)", frequency: "Quarterly", due: "31 January" },
  { name: "TDS Return (Q4)", frequency: "Quarterly", due: "31 May" },
];

export default function Reminders() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <h2 className="border-b-2 border-primary pb-3 font-quicksand text-2xl font-bold">Tax Reminders</h2>

      <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr className="bg-base">
              <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Filing</th>
              <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Frequency</th>
              <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Due Date</th>
              <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Current Month</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isMonthly = row.frequency === "Every month";
              return (
                <tr key={row.name} className={isMonthly ? "bg-accent" : index % 2 ? "bg-base" : "bg-white"}>
                  <td className="border border-primary px-3 py-2 text-sm font-bold">{row.name}</td>
                  <td className="border border-primary px-3 py-2 text-sm">{row.frequency}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{row.due}</td>
                  <td className="border border-primary px-3 py-2 text-sm">{isMonthly ? `Applies in ${monthName}` : "Check quarter"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
