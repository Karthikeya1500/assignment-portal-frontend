import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:5001/api/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, { name, email, password, role });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center bg-primary text-white rounded-xl p-3 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-3xl">school</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">
          Assignment Portal
        </h1>
      </div>

      <div className="w-full max-w-[460px] bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900">Create an Account</h2>
          <p className="text-slate-500 text-sm mt-1">
            Fill in the details below to get started
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
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
            <label className="text-sm font-medium text-slate-700" htmlFor="reg-password">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          {/* role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              {["student", "teacher"].map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer text-center px-4 py-3 border rounded-lg transition-all capitalize ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    className="hidden"
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg shadow-md shadow-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && (
              <span className="material-symbols-outlined text-lg">person_add</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?
            <Link className="text-primary font-semibold hover:underline ml-1" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
