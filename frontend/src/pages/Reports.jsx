import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Download,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const pdfAmount = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  return formatLocalDate(date);
};

const getToday = () => formatLocalDate(new Date());
const percent = (value) => `${Math.abs(value).toFixed(1)}%`;
const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const getRowValue = (row, key) => Number(row?.[key] || 0);

export default function Reports() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState(getMonthStart);
  const [toDate, setToDate] = useState(getToday);
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

  const handleExport = async () => {
    if (!fromDate || !toDate || fromDate > toDate) {
      setError("Choose a valid date range for the export");
      return;
    }

    setExporting(true);
    setError("");
    try {
      const { data } = await api.get("/sales", {
        params: { from: fromDate, to: toDate },
      });
      const sales = Array.isArray(data) ? data : data?.sales || [];
      const totals = sales.reduce(
        (result, sale) => {
          result.baseAmount += Number(sale.baseAmount || 0);
          result.gstAmount += Number(sale.gstAmount ?? sale.gstCollected ?? 0);
          result.totalAmount += Number(sale.totalAmount || 0);
          result.quantity += Number(sale.quantity || 0);
          return result;
        },
        { baseAmount: 0, gstAmount: 0, totalAmount: 0, quantity: 0 }
      );

      const document = new jsPDF();
      const pageWidth = document.internal.pageSize.getWidth();
      const pageHeight = document.internal.pageSize.getHeight();
      const margin = 16;
      let y = 18;

      const drawHeader = () => {
        document.setFont("helvetica", "bold");
        document.setFontSize(18);
        document.text(user?.shopName || "EasyTax Business", margin, y);
        document.setFont("helvetica", "normal");
        document.setFontSize(9);
        y += 7;
        document.text("Sales and Tax Report", margin, y);
        y += 5;
        document.text(`Period: ${fromDate} to ${toDate}`, margin, y);
        if (user?.gstin) {
          document.text(`GSTIN: ${user.gstin}`, pageWidth - margin, y, { align: "right" });
        }
        y += 9;
        document.setDrawColor(180, 180, 180);
        document.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      const drawTableHeader = () => {
        document.setFillColor(242, 242, 242);
        document.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
        document.setFont("helvetica", "bold");
        document.setFontSize(8);
        document.text("Date", margin + 2, y);
        document.text("Product", margin + 25, y);
        document.text("Qty", margin + 91, y, { align: "right" });
        document.text("Taxable", margin + 123, y, { align: "right" });
        document.text("GST", margin + 153, y, { align: "right" });
        document.text("Total", pageWidth - margin - 2, y, { align: "right" });
        y += 8;
        document.setFont("helvetica", "normal");
      };

      drawHeader();
      drawTableHeader();

      sales.forEach((sale) => {
        if (y > pageHeight - 28) {
          document.addPage();
          y = 18;
          drawHeader();
          drawTableHeader();
        }

        const date = new Date(sale.date || sale.createdAt).toLocaleDateString("en-IN");
        const product = String(sale.productName || "Unknown").slice(0, 28);
        document.setFontSize(8);
        document.text(date, margin + 2, y);
        document.text(product, margin + 25, y);
        document.text(String(sale.quantity || 0), margin + 91, y, { align: "right" });
        document.text(pdfAmount(sale.baseAmount), margin + 123, y, { align: "right" });
        document.text(pdfAmount(sale.gstAmount ?? sale.gstCollected), margin + 153, y, { align: "right" });
        document.text(pdfAmount(sale.totalAmount), pageWidth - margin - 2, y, { align: "right" });
        y += 6;
      });

      if (y > pageHeight - 58) {
        document.addPage();
        y = 18;
      }

      y += 4;
      document.setDrawColor(120, 120, 120);
      document.line(margin, y, pageWidth - margin, y);
      y += 8;
      document.setFont("helvetica", "bold");
      document.setFontSize(10);
      document.text("Summary", margin, y);
      y += 7;
      document.setFont("helvetica", "normal");
      document.setFontSize(9);
      document.text(`Items sold: ${totals.quantity}`, margin, y);
      document.text(`Taxable sales: ${pdfAmount(totals.baseAmount)}`, pageWidth - margin, y, { align: "right" });
      y += 6;
      document.text("GST collected:", margin, y);
      document.text(pdfAmount(totals.gstAmount), pageWidth - margin, y, { align: "right" });
      y += 7;
      document.setFont("helvetica", "bold");
      document.text("Total sales:", margin, y);
      document.text(pdfAmount(totals.totalAmount), pageWidth - margin, y, { align: "right" });
      y += 12;
      document.setFont("helvetica", "italic");
      document.setFontSize(8);
      document.text("Generated by EasyTax", margin, y);

      document.save(`easytax-sales-report-${fromDate}-to-${toDate}.pdf`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to export the sales report");
    } finally {
      setExporting(false);
    }
  };

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

  const aiBriefing = useMemo(() => {
    const recent = rows.slice(0, 7);
    const previous = rows.slice(7, 14);
    const recentSales = average(recent.map((row) => getRowValue(row, "totalSales")));
    const previousSales = average(previous.map((row) => getRowValue(row, "totalSales")));
    const recentProfit = average(recent.map((row) => getRowValue(row, "netProfit")));
    const previousProfit = average(previous.map((row) => getRowValue(row, "netProfit")));
    const salesChange = previousSales ? ((recentSales - previousSales) / previousSales) * 100 : 0;
    const profitChange = previousProfit ? ((recentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;
    const totalSales = recent.reduce((sum, row) => sum + getRowValue(row, "totalSales"), 0);
    const totalGst = recent.reduce((sum, row) => sum + getRowValue(row, "gstCollected"), 0);
    const totalExpenses = recent.reduce((sum, row) => sum + getRowValue(row, "totalExpenses"), 0);
    const margin = totalSales ? ((totalSales - totalExpenses) / totalSales) * 100 : 0;
    const gstRate = totalSales ? (totalGst / totalSales) * 100 : 0;
    const lowestProfitRow = recent.reduce(
      (lowest, row) =>
        getRowValue(row, "netProfit") < getRowValue(lowest, "netProfit") ? row : lowest,
      recent[0]
    );
    const hasData = recent.length > 0;
    const isAtRisk = margin < 10 || profitChange < -15;
    const score = hasData
      ? Math.max(0, Math.min(100, Math.round(72 + Math.min(margin, 20) - (isAtRisk ? 16 : 0))))
      : 0;

    const actions = [];
    if (salesChange < -5) {
      actions.push({
        icon: TrendingDown,
        title: "Recover sales momentum",
        text: `Sales are down ${percent(salesChange)} versus the previous period. Review your top-selling products and follow up on repeat customers.`,
      });
    } else {
      actions.push({
        icon: TrendingUp,
        title: "Protect the growth trend",
        text: `Sales are ${salesChange >= 0 ? "up" : "steady"} ${percent(salesChange)} versus the previous period. Keep inventory ready for your strongest products.`,
      });
    }
    if (margin < 15) {
      actions.push({
        icon: Target,
        title: "Watch operating margin",
        text: `Your estimated margin is ${percent(margin)}. Compare supplier pricing and recurring expenses before the next restock.`,
      });
    } else {
      actions.push({
        icon: CheckCircle2,
        title: "Margin is in a healthy range",
        text: `Estimated margin is ${percent(margin)}. Keep monitoring expenses so the current buffer is maintained.`,
      });
    }
    actions.push({
      icon: Lightbulb,
      title: "Prepare the GST checkpoint",
      text: `Set aside ${amount(totalGst)} as the GST collected in the latest ${recent.length}-day window and reconcile it with your invoices.`,
    });

    return {
      hasData,
      score,
      salesChange,
      profitChange,
      margin,
      gstRate,
      forecast: recentProfit * 7,
      anomaly: lowestProfitRow
        ? {
            date: new Date(lowestProfitRow.date || lowestProfitRow.createdAt).toLocaleDateString("en-IN"),
            profit: getRowValue(lowestProfitRow, "netProfit"),
          }
        : null,
      actions,
    };
  }, [rows]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / REPORTS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Reports</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ash">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 block border border-fog bg-white px-2 py-2 text-xs font-mono text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="text-[10px] font-mono uppercase tracking-widest text-ash">
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 block border border-fog bg-white px-2 py-2 text-xs font-mono text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={15} />
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <section className="mb-8 overflow-hidden border border-ink bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-ink px-6 py-5 text-white">
          <div className="flex gap-3">
             
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-silver">AI-ASSISTED / EXPLAINABLE ANALYSIS</p>
              <h2 className="mt-1 text-xl font-quicksand font-bold">Your business briefing</h2>
              <p className="mt-1 max-w-2xl text-xs font-quicksand text-silver">
                A private, rule-based intelligence layer that turns your report history into decisions you can act on.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-silver">Health score</p>
              <p className="text-2xl font-mono font-bold">{aiBriefing.hasData ? `${aiBriefing.score}/100` : "—"}</p>
            </div>
            <ShieldCheck size={25} className={aiBriefing.score >= 70 ? "text-white" : "text-silver"} />
          </div>
        </div>

        {!aiBriefing.hasData ? (
          <div className="px-6 py-8 text-sm text-ash">Add summary records to generate your first AI briefing.</div>
        ) : (
          <>
            <div className="grid gap-px border-b border-fog bg-fog sm:grid-cols-3">
              <div className="bg-white px-6 py-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-ash">Sales momentum</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-mono font-bold text-ink">
                  {aiBriefing.salesChange >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
                  {aiBriefing.salesChange >= 0 ? "+" : "-"}{percent(aiBriefing.salesChange)}
                </p>
                <p className="mt-1 text-xs text-ash">vs previous 7 recorded days</p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-ash">Estimated margin</p>
                <p className="mt-2 text-lg font-mono font-bold text-ink">{percent(aiBriefing.margin)}</p>
                <p className="mt-1 text-xs text-ash">sales less recorded expenses</p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-ash">7-day profit outlook</p>
                <p className="mt-2 text-lg font-mono font-bold text-ink">{amount(aiBriefing.forecast)}</p>
                <p className="mt-1 text-xs text-ash">run-rate estimate, not a guarantee</p>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.25fr]">
              <div className="border border-fog bg-ghost p-5">
                <div className="mb-4 flex items-center gap-2">
                  {aiBriefing.anomaly && aiBriefing.anomaly.profit < 0 ? (
                    <AlertTriangle size={16} className="text-ash" />
                  ) : (
                    <CheckCircle2 size={16} className="text-ash" />
                  )}
                  <h3 className="text-sm font-quicksand font-bold text-ink">Risk signal</h3>
                </div>
                <p className="text-sm leading-relaxed text-ink">
                  {aiBriefing.anomaly && aiBriefing.anomaly.profit < 0
                    ? `A loss was detected on ${aiBriefing.anomaly.date}. Review the invoices and expenses for that day before filing.`
                    : `No loss-making day was detected in the latest ${Math.min(rows.length, 7)} recorded days.`}
                </p>
                <p className="mt-4 border-t border-fog pt-3 text-[10px] font-mono uppercase tracking-widest text-ash">
                  GST mix: {percent(aiBriefing.gstRate)} of sales
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-quicksand font-bold text-ink">Recommended next actions</h3>
                <div className="space-y-3">
                  {aiBriefing.actions.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3 border-b border-fog pb-3 last:border-0 last:pb-0">
                      <Icon size={16} className="mt-0.5 flex-none text-ash" />
                      <div>
                        <p className="text-sm font-quicksand font-semibold text-ink">{title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ash">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

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
