import { Check, Receipt, RefreshCw, ShieldAlert, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const emptySummary = {
  totalSales: 0,
  gstCollected: 0,
  netProfit: 0,
  totalExpenses: 0,
};

const emptyHealthCheck = {
  score: 0,
  verdict: "Generate today's summary to unlock AI insights.",
  risks: [],
  opportunities: [],
  nextActions: [],
  confidence: "low",
};

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [generating, setGenerating] = useState(false);
  const [healthCheck, setHealthCheck] = useState(emptyHealthCheck);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, salesRes] = await Promise.all([
        api.get("/summary/today"),
        api.get("/sales/today"),
      ]);
      const today = summaryRes.data || {};
      const saleList = Array.isArray(salesRes.data)
        ? salesRes.data
        : salesRes.data?.sales || [];
      setSummary({
        totalSales: today.totalSales || 0,
        gstCollected: today.gstCollected || 0,
        netProfit: today.netProfit || 0,
        totalExpenses: today.totalExpenses || 0,
      });
      setSales(saleList);
      await fetchHealthCheck(
        {
          totalSales: today.totalSales || 0,
          gstCollected: today.gstCollected || 0,
          netProfit: today.netProfit || 0,
          totalExpenses: today.totalExpenses || 0,
        },
        saleList
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard data");
      setSummary(emptySummary);
      setSales([]);
      setHealthCheck(emptyHealthCheck);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthCheck = async (summaryData = summary, salesData = sales) => {
    try {
      setCheckingHealth(true);
      const { data } = await api.post("/chat/health-check", {
        summary: summaryData,
        sales: salesData.map((sale) => ({
          productName: sale.productName || sale.product?.name || "Product",
          quantity: Number(sale.quantity || 0),
          baseAmount: Number(sale.baseAmount || 0),
          gstAmount: Number(sale.gstAmount || sale.gstCollected || 0),
          totalAmount: Number(sale.totalAmount || 0),
        })),
      });
      setHealthCheck({
        score: Number(data?.score || 0),
        verdict: data?.verdict || emptyHealthCheck.verdict,
        risks: Array.isArray(data?.risks) ? data.risks : [],
        opportunities: Array.isArray(data?.opportunities) ? data.opportunities : [],
        nextActions: Array.isArray(data?.nextActions) ? data.nextActions : [],
        confidence: data?.confidence || "medium",
      });
    } catch (err) {
      setHealthCheck({
        ...emptyHealthCheck,
        verdict: "AI health check is unavailable right now.",
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateSummary = async () => {
    try {
      setGenerating(true);
      setError("");
      setNotice("");
      await api.post("/summary/generate");
      await fetchData();
      setNotice("Summary generated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / DASHBOARD</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Dashboard</h1>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />
      {notice && (
        <div className="mb-4 border border-fog bg-white p-3">
          <p className="text-sm font-quicksand text-ink">{notice}</p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-fog pb-5">
        <div>
          <h2 className="text-2xl font-quicksand font-semibold text-ink">
            {greeting}, {user?.shopName || "Business"}
          </h2>
          <p className="text-sm font-mono text-ash">{dateLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleGenerateSummary}
          disabled={generating}
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? "Generating..." : "Generate Summary ->"}
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-fog bg-white p-6 transition-colors hover:border-silver">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ash">TOTAL SALES</p>
          <p className="mt-4 text-4xl font-mono font-bold text-ink">{amount(summary.totalSales)}</p>
          <p className="mt-3 text-xs font-quicksand text-ash">From recorded sales today</p>
        </article>

        <article className="border border-fog bg-white p-6 transition-colors hover:border-silver">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ash">GST COLLECTED</p>
          <p className="mt-4 text-4xl font-mono font-bold text-ink">{amount(summary.gstCollected)}</p>
          <p className="mt-3 text-xs font-quicksand text-ash">Collected across invoices</p>
        </article>

        <article className="border border-fog border-l-4 border-l-ink bg-white p-6 transition-colors hover:border-silver">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ash">NET PROFIT</p>
          <p className="mt-4 text-4xl font-mono font-bold text-ink">{amount(summary.netProfit)}</p>
          <p className="mt-3 flex items-center gap-1 text-xs font-quicksand text-ash">
            <Check size={12} />
            Profit after expenses
          </p>
        </article>

        <article className="border border-fog bg-white p-6 transition-colors hover:border-silver">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ash">TOTAL EXPENSES</p>
          <p className="mt-4 text-4xl font-mono font-bold text-ink">{amount(summary.totalExpenses)}</p>
          <p className="mt-3 text-xs font-quicksand text-ash">Operating costs for today</p>
        </article>
      </div>

      <section className="mb-8 border border-ink bg-white">
        <div className="grid gap-0 lg:grid-cols-[minmax(240px,0.8fr)_1.2fr]">
          <div className="border-b border-fog bg-ink p-6 text-white lg:border-b-0 lg:border-r lg:border-r-smoke">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                 
                <p className="text-[11px] font-mono uppercase tracking-widest text-white/70"> Tax Health</p>
              </div>
              <button
                type="button"
                onClick={() => fetchHealthCheck()}
                disabled={checkingHealth}
                className="grid h-9 w-9 place-items-center rounded-sm border border-white/20 text-white transition-colors hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh AI health check"
              >
                <RefreshCw size={15} className={checkingHealth ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex items-end gap-3">
              <p className="font-mono text-6xl font-bold leading-none">{Math.round(healthCheck.score)}</p>
              <p className="mb-2 font-mono text-sm uppercase tracking-widest text-white/60">/ 100</p>
            </div>
            <p className="mt-4 text-lg font-quicksand font-semibold leading-snug">{healthCheck.verdict}</p>
            <p className="mt-5 inline-flex border border-white/20 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-white/70">
              {healthCheck.confidence} confidence
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            <div className="border-b border-fog p-5 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-ink">
                <ShieldAlert size={16} />
                <h3 className="text-sm font-quicksand font-bold">Risks</h3>
              </div>
              <ul className="space-y-3">
                {(healthCheck.risks.length ? healthCheck.risks : ["No risks detected yet."]).map((item) => (
                  <li key={item} className="text-sm font-quicksand leading-relaxed text-ash">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-b border-fog p-5 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-ink">
               
                <h3 className="text-sm font-quicksand font-bold">Opportunities</h3>
              </div>
              <ul className="space-y-3">
                {(healthCheck.opportunities.length ? healthCheck.opportunities : ["Add sales and expenses for sharper insights."]).map((item) => (
                  <li key={item} className="text-sm font-quicksand leading-relaxed text-ash">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center gap-2 text-ink">
                <Target size={16} />
                <h3 className="text-sm font-quicksand font-bold">Next Actions</h3>
              </div>
              <ul className="space-y-3">
                {(healthCheck.nextActions.length ? healthCheck.nextActions : ["Generate a summary after today's entries."]).map((item) => (
                  <li key={item} className="text-sm font-quicksand leading-relaxed text-ash">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-fog bg-white overflow-hidden">
        <div className="border-b border-fog bg-ghost px-5 py-3">
          <h3 className="text-lg font-quicksand font-semibold text-ink">Today&apos;s Sales</h3>
        </div>

        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt size={32} className="mb-4 text-silver" />
            <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No records found</p>
            <p className="text-xs font-quicksand text-ash">No sales recorded today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-fog bg-ghost">
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Product</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Quantity</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Base Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">GST Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr
                    key={sale._id || `${sale.productName}-${index}`}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-ghost/50"} transition-colors hover:bg-fog/60`}
                  >
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{sale.productName || sale.product?.name || "-"}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{Number(sale.quantity || 0)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{amount(sale.baseAmount)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono font-bold text-ink">{amount(sale.gstAmount)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{amount(sale.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
