"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"

import Logo from "../assets/main_icon.png"
import Placeholder from "../assets/background.png"
import notification from "../assets/notifications.png"
import settings from "../assets/setting.png"

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4">{children}</div>
    </div>
  )
}

export default function ProjectPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const [total, setTotal] = useState(0)

  // Load projects on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Fetch projects from backend
  const loadProjects = useCallback(
    async ({ status, search } = {}) => {
      try {
        setIsLoading(true);
        setError(null);
        const token = Cookies.get('token');

        if (!token) {
          setError('Please log in to view projects');
          navigate('/');
          return null;
        }

        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const response = await axios.get(`${import.meta.env.VITE_REDIRECT_URL}projects`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
          timeout: 10000,
        });

        if (response.data.success) {
          console.log(response.data)
          setProjects(response.data.data || []);
          setTotal(response.data.total || 0);
          return response.data.total;
        } else {
          throw new Error(response.data.message || 'Failed to load projects');
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        let errorMessage = 'Failed to load projects';

        if (error.response?.status === 401) {
          errorMessage = 'Invalid or expired token. Please log in again.';
          Cookies.remove('token');
          navigate('/');
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (!error.response) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.response?.data?.message || errorMessage;
        }

        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );


  // Handle create project button click
  const handleCreateClick = () => {
    setIsModalOpen(true)
    setProjectName("")
    setError("")
  }

  // Handle modal close
  const handleCancel = () => {
    setIsModalOpen(false)
    setProjectName("")
    setError("")
  }

  // Validate project name
  const validateProjectName = (name) => {
    if (!name.trim()) {
      setError("Project Name Can't be empty")
      return false
    }
    setError("")
    return true
  }

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setProjectName(value)
    if (error && value.trim()) {
      setError("")
    }
  }

  // Create project API call
  const createProject = async (name) => {
    const token = Cookies.get("token")
    if (!token) {
      throw new Error("Please log in to create a project")
    }

    const owner = await fetchUserProfile()

    const response = await axios.post(
      `${import.meta.env.VITE_REDIRECT_URL}projects`,
      { name: name.trim(), owner: owner },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create project")
    }

    return response.data.data
  }


  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("User not logged in")

      const response = await axios.get(`${import.meta.env.VITE_REDIRECT_URL}auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        console.log("User data:", response.data.data)
        return response.data.data._id
      } else {
        throw new Error(response.data.message || "Failed to fetch user data")
      }
    } catch (error) {
      console.error("Get Me Error:", error)
      throw error
    }
  }

  // Handle create project submission
  const handleCreate = async () => {
    if (!validateProjectName(projectName)) {
      return
    }

    setIsCreating(true)

    try {
      const newProject = await createProject(projectName)
      setProjects((prev) => [newProject, ...prev])
      setIsModalOpen(false)
      setProjectName("")
      setError("")
    } catch (error) {
      console.error("Failed to create project:", error)
      setError(
        error.message ||
        error.response?.data?.message ||
        (error.response?.status === 401 ? "Invalid or expired token. Please log in again." : "Failed to create project")
      )
      if (error.response?.status === 401) {
        Cookies.remove("token")
        navigate("/")
      }
    } finally {
      setIsCreating(false)
    }
  }

  // Handle form submission with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreate()
    }
  }

  // Generate project initials
  const getProjectInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate random color for project avatar
  const getAvatarColor = (id) => {
    const colors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
    ]
    const index = Number.parseInt(id) % colors.length
    return colors[index]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex justify-center items-center gap-2">
            <img src={Logo} alt="Quest AI Logo" className="w-12 h-12" />
            <h1 className="text-5xl text-purple-600 text-center">
              <span className="font-extrabold">Quest</span>
              <span className="font-medium">.AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 mr-10">
            <img src={notification} alt="Notification" className="w-10 h-10" />
            <img src={settings} alt="Settings" className="w-10 h-10" />
          </div>
        </header>

        {/* Loading State */}
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="flex justify-center items-center gap-2">
          <img src={Logo} alt="Quest AI Logo" className="w-12 h-12" />
          <h1 className="text-5xl text-purple-600 text-center">
            <span className="font-extrabold">Quest</span>
            <span className="font-medium">.AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 mr-10">
          <img src={notification} alt="Notification" className="w-10 h-10" />
          <img src={settings} alt="Settings" className="w-10 h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        {error && (
          <div className="w-full max-w-7xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}


        {projects.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center px-6 py-6 max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-purple-600">Create a New Project</h1>

              <div className="flex justify-center">
                <img
                  src={Placeholder}
                  alt="Two people collaborating at a desk with laptops"
                  className="max-w-full h-auto w-[400px]"
                />
              </div>

              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleCreateClick}
                  className="justify-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Create New Project
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Projects List View
          <div className="max-w-7xl mx-auto">
            {/* Projects Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-purple-600">Projects</h1>
              <Button
                onClick={handleCreateClick}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Project
              </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.length === 0 ? (
            <div>No projects found</div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id} // Changed from project.id to project._id
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(`/main_project?id=${project._id}&name=${encodeURIComponent(project.name)}`)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 ${getAvatarColor(project._id)} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-xl">
                      {getProjectInitials(project.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-purple-600 mb-1">{project.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{project.fileCount || 0} Files</p>
                    <p className="text-gray-400 text-xs">Last edited {project.lastUpdated}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div>Total Projects: {total}</div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Create Project</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isCreating}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Input Field */}
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-3">Enter Project Name:</label>
                <Input
                  value={projectName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type here"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  disabled={isCreating}
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isCreating}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}