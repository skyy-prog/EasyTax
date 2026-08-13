import { useEffect, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const initialForm = {
  name: "",
  category: "",
  costPrice: "",
  sellPrice: "",
  gstSlab: "",
  unit: "",
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function InlineConfirmButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button
        type="button"
        className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
        onClick={onConfirm}
      >
        Confirm?
      </button>
    );
  }

  return (
    <button
      type="button"
      className="border-2 border-primary bg-white px-2 py-1 text-xs font-bold"
      onClick={() => setConfirming(true)}
    >
      Delete
    </button>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products");
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      costPrice: String(product.costPrice || ""),
      sellPrice: String(product.sellPrice || ""),
      gstSlab: String(product.gstSlab || ""),
      unit: product.unit || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      gstSlab: Number(form.gstSlab),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setForm(initialForm);
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-3">
        <h2 className="font-quicksand text-2xl font-bold">Products</h2>
        <button
          type="button"
          className="border-2 border-primary bg-accent px-5 py-2 font-quicksand text-sm font-bold shadow-brutal transition hover:shadow-brutalSm"
          onClick={openAdd}
        >
          Add Product
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="overflow-x-auto border-2 border-primary bg-white shadow-brutal">
        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <p className="p-4 data-mono text-sm">No products yet. Add your first product to start billing.</p>
        ) : (
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-base">
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Name</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Category</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Cost Price</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Sell Price</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">GST Slab</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Unit</th>
                <th className="border border-primary px-3 py-2 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id} className={index % 2 ? "bg-base" : "bg-white"}>
                  <td className="border border-primary px-3 py-2 text-sm">{product.name}</td>
                  <td className="border border-primary px-3 py-2 text-sm">{product.category || "-"}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(product.costPrice)}</td>
                  <td className="data-mono border border-primary px-3 py-2 text-sm">{money(product.sellPrice)}</td>
                  <td className="border border-primary px-3 py-2 text-sm">
                    <span className="border border-primary bg-accent px-2 py-0.5 text-xs font-bold text-primary">
                      {product.gstSlab}%
                    </span>
                  </td>
                  <td className="border border-primary px-3 py-2 text-sm">{product.unit || "-"}</td>
                  <td className="border border-primary px-3 py-2 text-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </button>
                      <InlineConfirmButton onConfirm={() => handleDelete(product._id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid gap-3 border-2 border-primary bg-white p-4 shadow-brutal md:grid-cols-2">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            required
            className="border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <input
            name="costPrice"
            value={form.costPrice}
            onChange={handleChange}
            placeholder="Cost price"
            type="number"
            min="0"
            step="0.01"
            required
            className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <input
            name="sellPrice"
            value={form.sellPrice}
            onChange={handleChange}
            placeholder="Sell price"
            type="number"
            min="0"
            step="0.01"
            required
            className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <input
            name="gstSlab"
            value={form.gstSlab}
            onChange={handleChange}
            placeholder="GST slab %"
            type="number"
            min="0"
            step="0.01"
            required
            className="data-mono border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="Unit"
            className="border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
          />
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="border-2 border-primary bg-accent px-5 py-2 text-sm font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
            </button>
            <button
              type="button"
              className="border-2 border-primary bg-white px-5 py-2 text-sm font-bold"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
