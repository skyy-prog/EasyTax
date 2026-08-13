import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

const emptySummary = {
  totalSales: 0,
  gstCollected: 0,
  netProfit: 0,
  totalExpenses: 0,
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [generating, setGenerating] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }, []);

  const fetchSummary = async () => {
    setSummaryError("");
    try {
      const { data } = await api.get("/summary/today");
      setSummary({
        totalSales: data?.totalSales || 0,
        gstCollected: data?.gstCollected || 0,
        netProfit: data?.netProfit || 0,
        totalExpenses: data?.totalExpenses || 0,
      });
    } catch {
      setSummary(emptySummary);
      setSummaryError("Could not load today's summary. Showing placeholders.");
    }
  };

  const fetchSales = async () => {
    setLoadingSales(true);
    setSalesError("");
    try {
      const { data } = await api.get("/sales/today");
      const list = Array.isArray(data) ? data : data?.sales || [];
      setSales(list);
    } catch (error) {
      setSalesError(error.response?.data?.message || "Failed to load today's sales");
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchSales();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.post("/summary/generate");
      await fetchSummary();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-primary pb-4">
        <h2 className="font-quicksand text-2xl font-bold">
          Good {greeting}, {user?.shopName || "Shop"}
        </h2>
        <button
          type="button"
          disabled={generating}
          onClick={handleGenerate}
          className="border-2 border-primary bg-accent px-5 py-2 font-quicksand text-sm font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {generating ? "Generating..." : "Generate End-of-Day Summary"}
        </button>
      </div>

      <ErrorBanner message={summaryError} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Sales", value: money(summary.totalSales) },
          { title: "GST Collected", value: money(summary.gstCollected) },
          { title: "Net Profit", value: money(summary.netProfit) },
          { title: "Total Expenses", value: money(summary.totalExpenses) },
        ].map((item) => (
          <div key={item.title} className="border-2 border-primary bg-white p-4 shadow-brutal">
            <p className="font-quicksand text-sm font-bold">{item.title}</p>
            <p className="data-mono mt-3 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-quicksand text-xl font-bold">Today's Sales</h3>
        <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
          {loadingSales ? (
            <Loader />
          ) : salesError ? (
            <div className="p-4">
              <ErrorBanner message={salesError} />
            </div>
          ) : sales.length === 0 ? (
            <p className="p-4 data-mono text-sm">No sales recorded yet today.</p>
          ) : (
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-base">
                  <th className="border border-primary px-3 py-2 text-left font-quicksand text-sm">Product</th>
                  <th className="border border-primary px-3 py-2 text-left font-quicksand text-sm">Qty</th>
                  <th className="border border-primary px-3 py-2 text-left font-quicksand text-sm">Base</th>
                  <th className="border border-primary px-3 py-2 text-left font-quicksand text-sm">GST</th>
                  <th className="border border-primary px-3 py-2 text-left font-quicksand text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale._id || `${sale.productName}-${index}`} className={index % 2 ? "bg-base" : "bg-white"}>
                    <td className="border border-primary px-3 py-2 text-sm">{sale.productName || sale.product?.name || "-"}</td>
                    <td className="data-mono border border-primary px-3 py-2 text-sm">{sale.quantity || 0}</td>
                    <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.baseAmount)}</td>
                    <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.gstAmount)}</td>
                    <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
