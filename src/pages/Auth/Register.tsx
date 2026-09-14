import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Lock,
    User as UserIcon,
    Mail,
    Phone,
    AlertCircle,
    UserPlus,
    ArrowRight,
} from "lucide-react";

import { register } from "@/lib/auth";

const Register = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        const result = register({ fullName, email, phone, username, password });

        if (result.user) {
            navigate("/login");
            return;
        }

        setError(result.error);
    };

    return (
        <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-900">
            <div className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-130">

                {/* LEFT COLUMN: Branding */}
                <div className="md:col-span-5 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200/80 p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-[#003b7a] text-white font-bold text-lg rounded-2xl shadow-md shadow-[#003b7a]/20 shrink-0">
                                NTC
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                    Nepal Telecom
                                </h1>
                                <p className="text-xs font-medium text-slate-500">
                                    Customer Support Portal
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            Create a customer account to raise complaints about your IPTV, NTTV, SIM,
                            FTTH, or other services, track their progress, and request a technician
                            visit when needed.
                        </p>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-8">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-[#003b7a] hover:underline">
                            Sign in instead
                        </Link>
                    </p>
                </div>

                {/* RIGHT COLUMN: Register Form */}
                <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-between my-auto">
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Register as a customer to submit and track service complaints.
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            placeholder="98XXXXXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-1.5">
                                <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Username
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 h-11 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-[#003b7a] focus:ring-2 focus:ring-[#003b7a]/10"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full h-12 bg-[#003b7a] hover:bg-[#002f61] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#003b7a]/20 transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center mt-8 md:hidden">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-[#003b7a] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;