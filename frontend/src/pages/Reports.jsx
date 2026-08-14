import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/summary/history?days=30");
        const list = Array.isArray(data) ? data : data?.summaries || [];
        setRows(
          [...list].sort(
            (a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load report history");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const chartRows = useMemo(
    () =>
      [...rows]
        .slice(0, 10)
        .reverse()
        .map((row) => ({
          day: new Date(row.date || row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          profit: Number(row.netProfit || 0),
          gst: Number(row.gstCollected || 0),
        })),
    [rows]
  );

  const highestProfit = useMemo(
    () => Math.max(...rows.map((item) => Number(item.netProfit || 0)), 0),
    [rows]
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / REPORTS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Reports</h1>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <section className="mb-8 border border-fog bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-quicksand font-semibold text-ink">
          <BarChart3 size={16} />
          Profit vs GST
        </h2>

        {chartRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 size={32} className="mb-4 text-silver" />
            <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No records found</p>
            <p className="text-xs font-quicksand text-ash">Generate summaries to build your report graph</p>
          </div>
        ) : (
          <>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={chartRows}>
                  <CartesianGrid vertical={false} stroke="#E8E8E8" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#6B6B6B", fontSize: 11, fontFamily: "Space Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6B6B6B", fontSize: 11, fontFamily: "Space Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E8E8E8", background: "#FFFFFF", borderRadius: 0 }}
                    labelStyle={{ fontFamily: "Space Mono, monospace", color: "#0A0A0A" }}
                  />
                  <Bar dataKey="profit" fill="#0A0A0A" />
                  <Bar dataKey="gst" fill="#B8B8B8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-2 text-ash">
                <span className="h-2 w-2 bg-ink" />
                Profit
              </div>
              <div className="flex items-center gap-2 text-ash">
                <span className="h-2 w-2 bg-silver" />
                GST
              </div>
            </div>
          </>
        )}
      </section>

      <section className="border border-fog bg-white overflow-hidden">
        <div className="border-b border-fog bg-ghost px-5 py-3">
          <h3 className="text-lg font-quicksand font-semibold text-ink">Summary History (30 Days)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-fog bg-ghost">
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Date</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Sales</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">GST</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Expenses</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const profit = Number(row.netProfit || 0);
                const isHighest = profit === highestProfit && highestProfit > 0;
                const isZero = profit === 0;
                return (
                  <tr
                    key={row._id || `${row.date}-${index}`}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-ghost/50"} transition-colors hover:bg-fog/60 ${
                      isHighest ? "font-bold" : ""
                    } ${isZero ? "text-ash" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-mono">{new Date(row.date || row.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-3.5 text-sm font-mono">{amount(row.totalSales)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono">{amount(row.gstCollected)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono">{amount(row.totalExpenses)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono">{amount(row.netProfit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
