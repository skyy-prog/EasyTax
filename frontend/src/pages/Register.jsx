import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

const businessTypes = ["Retailer", "Wholesaler", "Service Provider"];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    shopName: "",
    email: "",
    password: "",
    gstin: "",
    businessType: "Retailer",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.shopName.trim()) nextErrors.shopName = "Shop name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email format";
    }
    if (!form.password.trim()) nextErrors.password = "Password is required";
    if (form.password && form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-8">
      <div className="w-full max-w-lg border-2 border-primary bg-white p-6 shadow-brutal">
        <div className="mb-6 border-2 border-accent bg-primary p-4 text-center">
          <h1 className="font-quicksand text-4xl font-bold text-accent">EasyTax</h1>
        </div>

        <ErrorBanner message={apiError} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            />
            {errors.name && <p className="data-mono mt-1 text-xs">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">Shop Name</label>
            <input
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              className="w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            />
            {errors.shopName && <p className="data-mono mt-1 text-xs">{errors.shopName}</p>}
          </div>

          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="data-mono w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            />
            {errors.email && <p className="data-mono mt-1 text-xs">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="data-mono w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            />
            {errors.password && <p className="data-mono mt-1 text-xs">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">GSTIN (Optional)</label>
            <input
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
              className="data-mono w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-quicksand text-sm font-bold">Business Type</label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              className="w-full border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none"
            >
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-primary bg-accent px-5 py-2 font-quicksand text-sm font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
