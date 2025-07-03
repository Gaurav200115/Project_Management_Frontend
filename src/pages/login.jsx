"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Logo from "../assets/questlogo.png"
import background from "../assets/group.png"
import logo_1 from "../assets/main_icon.png"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authSuccess, setAuthSuccess] = useState(false)
  const navigate = useNavigate()

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    if (!isLogin) {
      // Name validation for signup
      if (!formData.name) {
        newErrors.name = "Name is required"
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters"
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const url = isLogin
        ? import.meta.env.VITE_REDIRECT_URL + "auth/login"
        : import.meta.env.VITE_REDIRECT_URL + "auth/register"

      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password }

      const response = await axios.post(url, payload)

      if (response.data.success) {
        if (formData.rememberMe) {
          Cookies.set("token", response.data.data.token, { expires: 7 })
        } else {
          Cookies.set("token", response.data.data.token)
        }

        setAuthSuccess(true)
        setTimeout(() => {
          navigate("/project")
        }, 1500) // Delay navigation to show success screen
      }
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || (isLogin ? "Login failed. Please try again." : "Registration failed. Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrors({})

    try {
      // Placeholder for Google OAuth implementation
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setAuthSuccess(true)
      setTimeout(() => {
        navigate("/project")
      }, 1500) // Delay navigation to show success screen
    } catch (error) {
      setErrors({ general: "Google sign in failed. Please try again." })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert("Forgot password functionality would be implemented here")
  }

  // Toggle between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setFormData({ name: "", email: "", password: "", rememberMe: false })
    setErrors({})
  }

  if (authSuccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-green-50">
        <Card className="p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">{isLogin ? "Login" : "Sign Up"} Successful!</h2>
          <p className="text-gray-600">Welcome to Quest AI</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left 70% */}
      <div className="w-[70%] h-full relative bg-purple-700 text-white">
        {/* Background Image */}
        <img
          src={background}
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
        />

        {/* Top-left Logo */}
        <div className="absolute top-6 left-6 z-10">
          {/* Logo + Text */}
          <div className="flex items-center gap-2 mb-10">
            <img src={Logo} alt="Quest AI Logo" className="mt-10 ml-10" />
          </div>

          {/* Text Block Below with Same Margin */}
          <div className="text-left max-w-xl ml-10">
            <h1 className="text-6xl font-bold leading-snug mb-4">Your podcast will no longer be just a hobby</h1>
            <p className="text-2xl font-medium">Supercharge Your Distribution using our AI assistant!</p>
          </div>
        </div>
      </div>

      {/* Right 30% */}
      <div className="w-[30%] h-full bg-white flex items-center justify-center">
        <Card className="w-full max-w-xs space-y-4 flex flex-col items-center p-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img upsrc={logo_1} alt="Quest AI Logo" className="h-12 w-12" />
          </div>

          {/* Centered Purple Heading */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-purple-600">Welcome to</h2>
            <h2 className="text-3xl font-bold text-purple-600 mb-15">Quest AI</h2>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div className="w-full border border-red-200 bg-red-50 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Name Field (for signup only) */}
            {!isLogin && (
              <div className="w-full">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Email Field */}
            <div className="w-full">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="w-full relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                disabled={isLoading}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me + Forgot Password (login only) */}
            <div className="w-full flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="accent-purple-600"
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-purple-600 hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Main Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 text-white hover:bg-purple-700 border-none shadow-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing In..." : "Signing Up..."}
                </>
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-2 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200"></div>
            or
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full border border-gray-300 shadow-none bg-transparent"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>

          {/* Toggle Auth Mode */}
          <div className="w-full text-center text-sm text-gray-600">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-purple-600 hover:underline ml-1"
                disabled={isLoading}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}