import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download } from "lucide-react";
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
