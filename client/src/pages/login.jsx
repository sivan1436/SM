import { useState } from "react";
import assets from "../assets/assets.js";
import { ArrowRight, LoaderCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login",
        {
        method : "POST",
        headers:{"Content-Type" : "application/json",},
        body : JSON.stringify({
          email : email,
          password : password

        })
        }

      );
      const data = await response.json()
      if( !data.success){
        setError(data.message)
        return
      }
     const user = JSON.stringify(data.user)
     localStorage.setItem("user",user)
      navigate("/feed", { replace: true });
    } catch 
    {
      setError("We could not sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <img
        src={assets.bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 50 / 50 Column Layout */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 md:grid-cols-2">

        {/* Left Side - 50% */}
        <div className="flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">

          {/* Logo */}
          <img
            src={assets.logo}
            alt="Logo"
            className="h-12 object-contain"
          />

          {/* Users / Rating */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <img
                src={assets.group_users}
                alt="Users"
                className="h-8 md:h-10"
              />

              <div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Star
                        key={index}
                        className="size-5 text-transparent fill-amber-500"
                      />
                    ))}
                </div>

                <p className="text-white">
                  Used by 12k+ users
                </p>
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl md:pb-2 font-bold
              bg-gradient-to-r from-indigo-950 to-indigo-800
              bg-clip-text text-transparent"
            >
              more than just friends truely connect
            </h1>

            <p
              className="text-xl md:text-3xl text-indigo-900
              max-w-72 md:max-w-md"
            >
              connect with global community on Scrink
            </p>
          </div>

          <span className="md:h-10"></span>
        </div>

        {/* Right Side - 50% */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl bg-white/95 p-7 shadow-2xl shadow-indigo-950/20 backdrop-blur sm:p-10">
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
              <h2 className="text-3xl font-bold text-slate-900">Sign in to Scrink</h2>
              <p className="mt-2 text-slate-500">Continue where your conversations left off.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <>
                  <label className="block text-sm font-medium text-slate-700">
                    Email address
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>
              </>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <>Sign in<ArrowRight className="size-5" /></>}
              </button>
            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account? <button type="button" onClick={() => navigate("/register")} className="font-semibold text-indigo-600 hover:text-indigo-800">Sign up</button>
            </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
