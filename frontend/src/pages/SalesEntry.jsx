import { Calculator, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

export default function SalesEntry() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = useMemo(
    () => products.find((item) => item._id === productId),
    [products, productId]
  );

  const gstSlab = Number(selectedProduct?.gstSlab || 0);
  const baseAmount = (Number(selectedProduct?.sellPrice || 0) || 0) * (Number(quantity) || 0);
  const gstAmount = (baseAmount * gstSlab) / 100;
  const totalAmount = baseAmount + gstAmount;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, salesRes] = await Promise.all([
        api.get("/products"),
        api.get("/sales/today"),
      ]);
      const list = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.products || [];
      const saleList = Array.isArray(salesRes.data)
        ? salesRes.data
        : salesRes.data?.sales || [];
      setProducts(list);
      setSales(saleList);
      if (list.length > 0) {
        setProductId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load sales data");
      setProducts([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productId) {
      setError("Please select a product");
      return;
    }
    if (!Number(quantity) || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/sales", { productId, quantity: Number(quantity) });
      setQuantity("1");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to record sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / SALES</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Sales Entry</h1>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="border border-fog bg-white p-8">
          <h2 className="mb-4 text-lg font-quicksand font-semibold text-ink">Add Sale</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Select Product</label>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="w-full appearance-none border border-fog bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-ink focus:outline-none"
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ₹ {Number(product.sellPrice || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Quantity</label>
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                type="number"
                min="1"
                className="w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Recording..." : "Record Sale ->"}
            </button>
          </div>
        </form>

        <div className="bg-ink p-8 text-white">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-quicksand font-semibold">
            <Calculator size={16} />
            Live Calculation
          </h2>

          <p className="text-[10px] font-mono uppercase tracking-widest text-silver">Base Amount</p>
          <p className="mt-1 text-3xl font-mono font-bold text-white">{amount(baseAmount)}</p>

          <div className="my-4 border-t border-smoke" />

          <p className="text-[10px] font-mono uppercase tracking-widest text-silver">GST ({gstSlab}%)</p>
          <p className="mt-1 text-3xl font-mono font-bold text-white">{amount(gstAmount)}</p>

          <div className="my-4 border-t border-smoke" />

          <p className="text-[10px] font-mono uppercase tracking-widest text-silver">Total Payable</p>
          <p className="mt-1 text-4xl font-mono font-bold text-white">{amount(totalAmount)}</p>
        </div>
      </div>

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
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Qty</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Base</th>
                  <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">GST</th>
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
