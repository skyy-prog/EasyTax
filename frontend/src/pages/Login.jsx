import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
            Manage your taxes,
            <br />
            not your stress.
          </p>
        </div>
        <p className="text-xs font-mono text-ash">for small business owners in India</p>
      </section>

      <section className="flex w-full items-center justify-center bg-white p-10 lg:w-3/5 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-quicksand font-bold text-ink">Welcome back</h2>
          <p className="mb-8 text-sm font-quicksand text-ash">Login to continue to your workspace</p>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-ink py-3.5 text-sm font-quicksand font-semibold text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login ->"}
            </button>
          </form>

          <p className="mt-6 text-sm font-quicksand text-ash">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-ink underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
