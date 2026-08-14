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
    businessType: businessTypes[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ink">
      <section className="hidden w-2/5 flex-col justify-between p-16 text-white lg:flex">
        <div>
          <h1 className="text-4xl font-quicksand font-bold">EasyTax</h1>
          <p className="mt-4 text-lg font-quicksand leading-relaxed text-silver">
            Build confident filings
            <br />
            with structured records.
          </p>
        </div>
        <p className="text-xs font-mono text-ash">for small business owners in India</p>
      </section>

      <section className="flex w-full items-center justify-center bg-white p-10 lg:w-3/5 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-quicksand font-bold text-ink">Create your account</h2>
          <p className="mb-8 text-sm font-quicksand text-ash">Start tracking sales, taxes, and reports in one place</p>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border-b border-fog bg-transparent py-3 text-sm font-mono text-ink placeholder:text-silver transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Shop Name</label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                required
                className="w-full border-b border-fog bg-transparent py-3 text-sm font-mono text-ink placeholder:text-silver transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                className="w-full border-b border-fog bg-transparent py-3 text-sm font-mono text-ink placeholder:text-silver transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                required
                className="w-full border-b border-fog bg-transparent py-3 text-sm font-mono text-ink placeholder:text-silver transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">GST Number</label>
              <input
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                className="w-full border-b border-fog bg-transparent py-3 text-sm font-mono text-ink placeholder:text-silver transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-ash">Business Type</label>
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                className="w-full appearance-none border border-fog bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-ink focus:outline-none"
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
              className="mt-2 w-full bg-ink py-3.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account ->"}
            </button>
          </form>

          <p className="mt-6 text-sm font-quicksand text-ash">
            Already have one?{" "}
            <Link to="/login" className="text-ink underline underline-offset-2">
              Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
