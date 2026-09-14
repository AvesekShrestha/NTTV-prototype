import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User as UserIcon, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import type { User } from "@/types/user";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const user: User | null = login(username, password);

    if (user) {
      navigate(`/${user.role}`);
      return;
    }

    setError("Invalid username or password.");
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-900">
      <div className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-130">

        {/* LEFT COLUMN: Branding & Demo Info (5 cols) */}
        <div className="md:col-span-5 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200/80 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* NTC Logo & Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#003b7a] text-white font-bold text-lg rounded-2xl shadow-md shadow-[#003b7a]/20 shrink-0">
                NTC
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Nepal Telecom
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Ticket Distribution System
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Welcome to the internal support and ticketing portal. Sign in with your assigned employee credentials to manage and track tickets.
            </p>
          </div>

          {/* Prototype Admin Credentials Box */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#003b7a]" />
              <span>Prototype Credentials</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Username</span>
                <code className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 font-semibold">admin</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Password</span>
                <code className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 font-semibold">admin123</code>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Taller, Rounded Login Form (7 cols) */}
        <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-between my-auto">
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Username
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-12 text-sm border-slate-200 bg-white rounded-xl focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 text-sm border-slate-200 bg-white rounded-xl focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Taller Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#003b7a] hover:bg-[#002f61] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#003b7a]/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <p className="text-xs text-slate-500 text-center mt-8">
            Are you a customer?{" "}
            <Link to="/register" className="font-semibold text-[#003b7a] hover:underline">
              Create an account
            </Link>
          </p>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            © Nepal Telecom · Authorized Personnel Only
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
