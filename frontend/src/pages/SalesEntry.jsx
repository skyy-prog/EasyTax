import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function SalesEntry() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === productId),
    [products, productId]
  );

  const preview = useMemo(() => {
    const qty = Number(quantity) || 0;
    const sellPrice = Number(selectedProduct?.sellPrice || 0);
    const gstSlab = Number(selectedProduct?.gstSlab || 0);
    const baseAmount = qty * sellPrice;
    const gstAmount = (baseAmount * gstSlab) / 100;
    const total = baseAmount + gstAmount;
    return { baseAmount, gstAmount, total };
  }, [quantity, selectedProduct]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, salesRes] = await Promise.all([
        api.get("/products"),
        api.get("/sales/today"),
      ]);
      const productsList = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.products || [];
      const salesList = Array.isArray(salesRes.data) ? salesRes.data : salesRes.data?.sales || [];
      setProducts(productsList);
      setSales(
        [...salesList].sort(
          (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        )
      );
      if (productsList.length > 0) {
        setProductId((prev) => prev || productsList[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sales page data");
      setProducts([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!productId) {
      setError("Please choose a product");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }

    try {
      setSaving(true);
      await api.post("/sales", { productId, quantity: Number(quantity) });
      setQuantity(1);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <h2 className="border-b-2 border-primary pb-3 font-quicksand text-2xl font-bold">Sales Entry</h2>

      <ErrorBanner message={error} />

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 border-2 border-primary bg-white p-4 shadow-brutal md:grid-cols-3"
      >
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        >
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} - ₹{product.sellPrice}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
        />

        <button
          type="submit"
          disabled={saving}
          className="border-2 border-primary bg-accent px-5 py-2 font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {saving ? "Saving..." : "Add Sale"}
        </button>

        <div className="md:col-span-3 border-t-2 border-primary pt-3">
          <h3 className="font-quicksand text-sm font-bold">Live Preview</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="border-2 border-primary bg-base p-2">
              <p className="text-xs font-bold">Base Amount</p>
              <p className="data-mono text-sm">{money(preview.baseAmount)}</p>
            </div>
            <div className="border-2 border-primary bg-base p-2">
              <p className="text-xs font-bold">GST Amount</p>
              <p className="data-mono text-sm">{money(preview.gstAmount)}</p>
            </div>
            <div className="border-2 border-primary bg-base p-2">
              <p className="text-xs font-bold">Total</p>
              <p className="data-mono text-sm">{money(preview.total)}</p>
            </div>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
        {loading ? (
          <Loader />
        ) : sales.length === 0 ? (
          <p className="p-4 data-mono text-sm">No sales yet for today.</p>
        ) : (
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-base">
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Product</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Qty</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Base</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">GST</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale._id || `${sale.productName}-${index}`} className={index % 2 ? "bg-base" : "bg-white"}>
                  <td className="border border-primary px-3 py-2 text-sm">{sale.productName || sale.product?.name || "-"}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{sale.quantity}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.baseAmount)}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.gstAmount)}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
