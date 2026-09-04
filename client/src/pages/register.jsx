import { useState } from "react";
import {
  ArrowRight,
  LoaderCircle,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccess("");

    const fullName = formData.fullName.trim();
    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Validation
    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (fullName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    if (!username) {
      setError("Please enter a username.");
      return;
    }

    if (username.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(
        "Username can only contain letters, numbers, and underscores."
      );
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
        }),
      });

      const Data = await response.json();
      const user = Data.user
localStorage.setItem("user", JSON.stringify(user));
      
      console.log("Register status:", response.status);

      let data = {};

      if (responseText.trim()) {
        try {
        } catch {
          throw new Error("Server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Registration failed with status ${response.status}.`
        );
      }

      setSuccess(
        data.message || "Account created successfully!"
      );

      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Navigate after successful registration
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background */}
      <img
        src={assets.bgImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* Left Side */}
        <div className="flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">

          <img
            src={assets.logo}
            alt="Scrink Logo"
            className="h-12 object-contain"
          />

          <div className="mb-10">

            <div className="mb-4 flex items-center gap-3">

              <UserPlus className="size-10 rounded-full bg-white/80 p-2 text-indigo-700" />

              <p className="text-lg font-medium text-white">
                Your community is waiting
              </p>

            </div>

            <h1 className="bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              meet people who get you
            </h1>

            <p className="mt-2 max-w-md text-xl text-indigo-900 md:text-3xl">
              create your space on Scrink
            </p>

          </div>

          <span className="md:h-10" />
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md rounded-3xl bg-white/95 p-7 shadow-2xl shadow-indigo-950/20 backdrop-blur sm:p-10">

            {/* Header */}
            <div className="mb-7">

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Join Scrink
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-slate-500">
                A place for genuine conversations.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Full Name + Username */}
              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block text-sm font-medium text-slate-700">
                  Full name

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Warren"
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Username

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="john_warren"
                    autoComplete="username"
                    required
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                  />
                </label>

              </div>

              {/* Email */}
              <label className="block text-sm font-medium text-slate-700">
                Email address

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                />
              </label>

              {/* Passwords */}
              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block text-sm font-medium text-slate-700">
                  Password

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Confirm password

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                  />
                </label>

              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-5" />
                  </>
                )}

              </button>

            </form>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-slate-500">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Sign in
              </button>

            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;