import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const initialForm = {
  name: "",
  category: "",
  costPrice: "",
  sellPrice: "",
  gstSlab: "18",
  unit: "",
};

const numberInputClass =
  "w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors";

const textInputClass =
  "w-full bg-transparent border-b border-fog text-sm font-mono text-ink py-2.5 focus:outline-none focus:border-ink placeholder:text-silver transition-colors";

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState(initialForm);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : data?.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/products", {
        ...form,
        costPrice: Number(form.costPrice),
        sellPrice: Number(form.sellPrice),
        gstSlab: Number(form.gstSlab),
      });
      setForm(initialForm);
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditingForm({
      name: product.name || "",
      category: product.category || "",
      costPrice: String(product.costPrice || ""),
      sellPrice: String(product.sellPrice || ""),
      gstSlab: String(product.gstSlab || "18"),
      unit: product.unit || "",
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/products/${editingId}`, {
        ...editingForm,
        costPrice: Number(editingForm.costPrice),
        sellPrice: Number(editingForm.sellPrice),
        gstSlab: Number(editingForm.gstSlab),
      });
      setEditingId("");
      setEditingForm(initialForm);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product");
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / PRODUCTS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Products</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke"
        >
          {showForm ? "Close" : "Add Product"}
        </button>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <div
        className={`mb-6 overflow-hidden border border-fog bg-white transition-all duration-300 ${
          showForm ? "max-h-[500px] p-6" : "max-h-0 p-0"
        }`}
      >
        <form onSubmit={handleCreate}>
          <div className="mb-5 flex items-center justify-between border-b border-fog pb-3">
            <h2 className="flex items-center gap-2 text-lg font-quicksand font-semibold text-ink">
              <Plus size={16} />
              Add New Product
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className={`${textInputClass} md:col-span-2`}
              required
            />
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className={textInputClass}
            />
            <input
              name="costPrice"
              value={form.costPrice}
              onChange={handleChange}
              placeholder="Cost ₹"
              type="number"
              min="0"
              step="0.01"
              className={numberInputClass}
              required
            />
            <input
              name="sellPrice"
              value={form.sellPrice}
              onChange={handleChange}
              placeholder="Sell ₹"
              type="number"
              min="0"
              step="0.01"
              className={numberInputClass}
              required
            />
            <select
              name="gstSlab"
              value={form.gstSlab}
              onChange={handleChange}
              className="w-full appearance-none border border-fog bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-ink focus:outline-none"
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Unit"
              className={textInputClass}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-ink px-5 py-2.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto border border-fog bg-white">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={32} className="mb-4 text-silver" />
            <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No records found</p>
            <p className="text-xs font-quicksand text-ash">Add your first product to start recording sales</p>
          </div>
        ) : (
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-fog bg-ghost">
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">#</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Product Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Category</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Cost Price</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Sell Price</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">GST Slab</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Unit</th>
                <th className="px-5 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-ash">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const isEditing = editingId === product._id;
                return (
                  <tr
                    key={product._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-ghost/50"} transition-colors hover:bg-fog/60`}
                  >
                    <td className="px-5 py-3.5 text-sm font-mono text-ink">{index + 1}</td>
                    {isEditing ? (
                      <>
                        <td className="px-5 py-3.5"><input name="name" value={editingForm.name} onChange={handleEditChange} className={textInputClass} /></td>
                        <td className="px-5 py-3.5"><input name="category" value={editingForm.category} onChange={handleEditChange} className={textInputClass} /></td>
                        <td className="px-5 py-3.5"><input name="costPrice" value={editingForm.costPrice} onChange={handleEditChange} type="number" className={numberInputClass} /></td>
                        <td className="px-5 py-3.5"><input name="sellPrice" value={editingForm.sellPrice} onChange={handleEditChange} type="number" className={numberInputClass} /></td>
                        <td className="px-5 py-3.5"><input name="gstSlab" value={editingForm.gstSlab} onChange={handleEditChange} type="number" className={numberInputClass} /></td>
                        <td className="px-5 py-3.5"><input name="unit" value={editingForm.unit} onChange={handleEditChange} className={textInputClass} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={handleUpdate} className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink">Save</button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId("");
                                setEditingForm(initialForm);
                              }}
                              className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">{product.name}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">{product.category || "-"}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">{amount(product.costPrice)}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">{amount(product.sellPrice)}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">
                          <span className="border border-silver px-2 py-0.5 text-xs font-mono text-ink">
                            {Number(product.gstSlab || 0)}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">{product.unit || "-"}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-ink">
                          <div className="flex items-center gap-3 text-ash">
                            <button type="button" onClick={() => startEdit(product)} className="transition-colors hover:text-ink" aria-label="Edit product"><Pencil size={16} /></button>
                            <button type="button" onClick={() => handleDelete(product._id)} className="transition-colors hover:text-ink" aria-label="Delete product"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
