import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URL = `${BACKEND_URL}/api/auth`;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/login`, { email, password });
      login({ token: data.token, role: data.role, name: data.name });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      {/* logo */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center bg-primary text-white rounded-xl p-3 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-3xl">school</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">
          Assignment Portal
        </h1>
      </div>

      {/* card */}
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">
            Enter your credentials to sign in
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg shadow-md shadow-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && (
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?
            <Link className="text-primary font-semibold hover:underline ml-1" to="/register">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
