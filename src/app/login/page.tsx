"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showRegister, setShowRegister] = useState(pathname === "/register");

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath =
        currentUser?.role === "instructor"
          ? "/instructor/dashboard"
          : "/learner/dashboard";
      router.push(redirectPath);
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSignUpClick = () => {
    setShowRegister(true);
    router.push("/register");
  };

  const handleLoginClick = () => {
    setShowRegister(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Back Arrow */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-40 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Link>

      {/* Centered Login/Sign Up Buttons */}
      <div className="hidden lg:flex absolute top-8 left-1/2 transform -translate-x-1/2 flex-col z-30">
        <button
          onClick={handleLoginClick}
          className={`relative text-xl font-semibold px-10 py-4 transition-all duration-300 ${
            pathname === "/login"
              ? "bg-white text-purple-700 shadow-2xl border-2 border-purple-200"
              : "bg-white/20 text-purple-700 border border-white/30 hover:bg-white/30 hover:text-purple-700"
          }`}
          style={{
            borderRadius: "32px 32px 0 0",
            minWidth: "160px",
          }}
        >
          Login
        </button>
        <button
          onClick={handleSignUpClick}
          className={`relative text-xl font-semibold px-10 py-4 transition-all duration-300 ${
            pathname === "/register"
              ? "bg-white text-purple-700 shadow-2xl border-2 border-purple-200"
              : "bg-white/20 text-purple-700 border border-white/30 hover:bg-white/30 hover:text-purple-700"
          }`}
          style={{
            borderRadius: "0 0 32px 32px",
            minWidth: "160px",
            marginTop: "-2px",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Left Half - Background Image with Content */}
      <div
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage: 'url("/landingpage/login-signup.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-cyan-500/80" />

        {/* Content on left side */}
        <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
          {/* Logo at top - much larger */}
          {/* Logo at top - much larger */}
          <Link
            href="/"
            className="flex items-center gap-4 mt-2 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          >
            <img
              src="/logo/logo.png"
              alt="AiQ Learning"
              className="h-24 w-auto object-contain brightness-0 invert drop-shadow-lg"
            />
          </Link>

          {/* Main content - much larger */}
          <div className="flex-1 flex flex-col justify-center mt-8">
            <h1 className="text-7xl font-extrabold mb-10 leading-tight drop-shadow-lg">
              Hello,
              <br />
              Welcome Learner!
            </h1>
            <p className="text-2xl opacity-95 max-w-xl font-medium">
              Log in to access your courses and track your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Right Half - Dynamic Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Back Arrow */}
          <div className="lg:hidden flex justify-start mb-4">
            <Link
              href="/"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-200"
            >
              <img
                src="/logo/logo.png"
                alt="AiQ Learning"
                className="h-16 w-auto object-contain"
              />
              <span className="text-3xl font-bold text-gray-800">LEARNING</span>
            </Link>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleLoginClick}
                className={`px-8 py-3 rounded-md font-semibold transition-all duration-300 ${
                  pathname === "/login"
                    ? "bg-white text-purple-700 shadow-lg border border-purple-200"
                    : "text-gray-500 opacity-60 hover:text-gray-600 hover:opacity-80"
                }`}
              >
                Login
              </button>
              <button
                onClick={handleSignUpClick}
                className={`px-8 py-3 rounded-md font-semibold transition-all duration-300 ${
                  pathname === "/register"
                    ? "bg-white text-purple-700 shadow-lg border border-purple-200"
                    : "text-gray-500 opacity-60 hover:text-gray-600 hover:opacity-80"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
          <div className="lg:hidden flex justify-center mb-4">
            <Link
              href="/login/instructor"
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              Are you an instructor? Login here
            </Link>
          </div>

          {/* Dynamic Form Content */}
          <div className="space-y-6">
            {pathname === "/login" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome Back Student!
                  </h2>
                  <p className="text-gray-600">
                    Please sign in to your student account
                  </p>
                </div>
                <LoginForm allowedRole="learner" />
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Are you an instructor?{" "}
                    <Link
                      href="/login/instructor"
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      Login here
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={handleSignUpClick}
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">Join us to start learning</p>
                </div>
                <RegisterForm />
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={handleLoginClick}
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">
                    Are you an instructor?{" "}
                    <Link
                      href="/login/instructor"
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
