import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
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
        setError(err.response?.data?.message || "Failed to load reports");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const chartData = useMemo(() => {
    return [...rows]
      .slice(0, 7)
      .reverse()
      .map((item) => ({
        date: new Date(item.date || item.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        profit: Number(item.netProfit || 0),
        gst: Number(item.gstCollected || 0),
      }));
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <h2 className="border-b-2 border-primary pb-3 font-quicksand text-2xl font-bold">Reports</h2>

      <ErrorBanner message={error} />

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="border-2 border-primary bg-white p-4 shadow-brutal">
            <h3 className="mb-3 font-quicksand text-lg font-bold">Last 7 Days: Profit vs GST</h3>
            {chartData.length === 0 ? (
              <p className="data-mono text-sm">No summary data available yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#1a1a1a" strokeDasharray="2 2" />
                    <XAxis dataKey="date" stroke="#1a1a1a" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#1a1a1a" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#1a1a1a" name="Profit" />
                    <Bar dataKey="gst" fill="#F5C518" name="GST" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
            {rows.length === 0 ? (
              <p className="p-4 data-mono text-sm">No daily summaries in the last 30 days.</p>
            ) : (
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-base">
                    <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Date</th>
                    <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Total Sales</th>
                    <th className="border border-primary px-3 py-2 text-left text-sm font-bold">GST Collected</th>
                    <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Net Profit</th>
                    <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, index) => (
                    <tr key={item._id || index} className={index % 2 ? "bg-base" : "bg-white"}>
                      <td className="data-mono border border-primary px-3 py-2 text-sm">
                        {new Date(item.date || item.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="data-mono border border-primary px-3 py-2 text-sm">{money(item.totalSales)}</td>
                      <td className="data-mono border border-primary px-3 py-2 text-sm">{money(item.gstCollected)}</td>
                      <td className="data-mono border border-primary px-3 py-2 text-sm">{money(item.netProfit)}</td>
                      <td className="data-mono border border-primary px-3 py-2 text-sm">{money(item.totalExpenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
