"use client";

import { useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
  name: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  name?: string;
};

type NotificationType = {
  type: "success" | "error";
  message: string;
};

const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to check email");
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

const LoginForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(
    null
  );
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (isRegistering && !validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isRegistering && !formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const userExists = await checkUserExists(formData.email);
        if (userExists) {
          setNotification({
            type: "error",
            message:
              "An account with this email already exists. Please login instead.",
          });
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting...",
        });
        setIsRegistering(false);
        router.push("/interview");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setNotification({
          type: "success",
          message: "Login successful! Redirecting...",
        });
        () => router.push("/interview");
      }
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-sky-400/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg ${
              notification.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            } flex justify-between items-center`}
          >
            <span>{notification.message}</span>
            <button
              onClick={closeNotification}
              className="ml-2 text-lg font-bold"
              aria-label="Close notification"
            >
              &times;
            </button>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-2">
              AI Interview Coach
            </h1>
            <p className="text-slate-600 text-sm">
              "Your personal AI interviewer that helps you practice, improve,
              and{" "}
              <span className="text-sky-400 font-medium">
                land your dream job
              </span>
              "
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    } rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </motion.div>
            )}

            <div className="mb-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 bg-gray-50 border ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  } rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 bg-gray-50 border ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-sky-500/20 mb-4 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRegistering ? "Creating Account..." : "Signing In..."}
                </span>
              ) : isRegistering ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              {isRegistering ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setErrors({});
                    }}
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrors({});
                    }}
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Register
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          <p>
            Practice with our AI and get real-time feedback on your interviews
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
